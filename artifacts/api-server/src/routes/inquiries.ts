import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { inquiriesTable, type Database } from "@workspace/db";
import {
  SubmitContactInquiryBody,
  SubmitProjectInquiryBody,
  UpdateInquiryBody,
  UpdateInquiryStatusBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  buildContactInquiryEmail,
  buildLeadAutoReplyEmail,
  buildProjectInquiryEmail,
} from "../lib/emailNotifications";
import { enqueueInquiryNotification } from "../lib/emailQueue";
import { getDb, registerBackgroundWork } from "../lib/context";
import {
  generateReferenceNumber,
  getClientIp,
  parseUserAgent,
  checkRateLimit,
  findRecentDuplicate,
  rememberSubmission,
} from "../lib/leadTracking";

function serializeInquiry(r: typeof inquiriesTable.$inferSelect) {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

/**
 * Insert a lead, regenerating the reference number on the (rare) unique
 * collision so a duplicate suffix never surfaces as a 500 to the visitor.
 */
async function insertLead(
  db: Database,
  values: Omit<typeof inquiriesTable.$inferInsert, "referenceNumber">,
): Promise<{ id: number; referenceNumber: string }> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const referenceNumber = generateReferenceNumber();
    try {
      const [inserted] = await db
        .insert(inquiriesTable)
        .values({ ...values, referenceNumber })
        .returning({ id: inquiriesTable.id });
      if (!inserted) throw new Error("Insert returned no row");
      return { id: inserted.id, referenceNumber };
    } catch (err) {
      lastErr = err;
      if (!isUniqueViolation(err)) throw err;
    }
  }
  throw lastErr;
}

const inquiriesRouter: IRouter = Router();

inquiriesRouter.get(
  "/inquiries",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const db = getDb();
    const rows = await db
      .select()
      .from(inquiriesTable)
      .orderBy(desc(inquiriesTable.createdAt), desc(inquiriesTable.id));
    res.json(rows.map(serializeInquiry));
  },
);

inquiriesRouter.patch(
  "/inquiries/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const db = getDb();
    const id = Number.parseInt(String(req.params.id), 10);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const parsed = UpdateInquiryBody.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      res.status(400).json({ error: "Invalid update" });
      return;
    }

    const [updated] = await db
      .update(inquiriesTable)
      .set(parsed.data)
      .where(eq(inquiriesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json(serializeInquiry(updated));
  },
);

inquiriesRouter.patch(
  "/inquiries/:id/status",
  requireAdmin,
  async (req, res): Promise<void> => {
    const db = getDb();
    const id = Number.parseInt(String(req.params.id), 10);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const parsed = UpdateInquiryStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const [updated] = await db
      .update(inquiriesTable)
      .set({ status: parsed.data.status })
      .where(eq(inquiriesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    req.log.info({ id, status: parsed.data.status }, "Inquiry status updated");
    res.json(serializeInquiry(updated));
  },
);

inquiriesRouter.post("/inquiries/contact", async (req, res): Promise<void> => {
  const db = getDb();
  const parsed = SubmitContactInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid contact inquiry");
    res.status(400).json({ error: "Invalid inquiry" });
    return;
  }

  // Honeypot: bots fill hidden fields — pretend success, store nothing.
  if (parsed.data.website) {
    res.status(201).json({
      status: "received",
      referenceNumber: generateReferenceNumber(),
    });
    return;
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  const { name, email, company, phone, service, budget, message } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  // Duplicate guard: identical submission within a short window returns the
  // original reference instead of storing (and emailing) a second lead.
  const dupKey = `contact:${normalizedEmail}:${message}`;
  const existingRef = findRecentDuplicate(dupKey);
  if (existingRef) {
    res.status(201).json({ status: "received", referenceNumber: existingRef });
    return;
  }

  const { browser, device } = parseUserAgent(req.headers["user-agent"]);
  const submittedAt = new Date();

  const inquiry = await insertLead(db, {
    type: "contact",
    name,
    email: normalizedEmail,
    company: company || null,
    phone,
    service,
    budget,
    message,
    ipAddress: ip,
    browser,
    device,
  });
  const { referenceNumber } = inquiry;

  rememberSubmission(dupKey, referenceNumber);
  req.log.info({ email, referenceNumber }, "Contact inquiry received");
  res.status(201).json({ status: "received", referenceNumber });

  // Queue the notifications after the response — persisted first, then
  // delivered/retried in the background so the visitor is never delayed.
  if (inquiry) {
    registerBackgroundWork(
      enqueueInquiryNotification(
        db,
        inquiry.id,
        buildContactInquiryEmail(
          { name, email, company, phone, service, budget, message },
          { referenceNumber, submittedAt },
        ),
      ).catch((err) => {
        req.log.error({ err }, "Failed to queue contact inquiry notification");
      }),
    );
    registerBackgroundWork(
      enqueueInquiryNotification(
        db,
        inquiry.id,
        buildLeadAutoReplyEmail(name, referenceNumber),
        normalizedEmail,
      ).catch((err) => {
        req.log.error({ err }, "Failed to queue contact auto-reply");
      }),
    );
  }
});

inquiriesRouter.post("/inquiries/project", async (req, res): Promise<void> => {
  const db = getDb();
  const parsed = SubmitProjectInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid project inquiry");
    res.status(400).json({ error: "Invalid inquiry" });
    return;
  }

  if (parsed.data.website) {
    res.status(201).json({
      status: "received",
      referenceNumber: generateReferenceNumber(),
    });
    return;
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  const {
    projectName,
    description,
    industry,
    services,
    budget,
    timeline,
    name,
    company,
    email,
    phone,
  } = parsed.data;

  // Reject junk required values the schema's min-lengths let through:
  // whitespace-only names and phone numbers without real digits.
  if (!name.trim() || phone.replace(/\D/g, "").length < 7) {
    res.status(400).json({ error: "Invalid inquiry" });
    return;
  }

  const servicesStr =
    services && services.length > 0 ? services.join(", ") : null;
  const normalizedEmail = email.trim().toLowerCase();

  const dupKey = `project:${normalizedEmail}:${projectName}:${description}`;
  const existingRef = findRecentDuplicate(dupKey);
  if (existingRef) {
    res.status(201).json({ status: "received", referenceNumber: existingRef });
    return;
  }

  const { browser, device } = parseUserAgent(req.headers["user-agent"]);
  const submittedAt = new Date();

  const inquiry = await insertLead(db, {
    type: "project",
    name,
    email: normalizedEmail,
    company,
    phone,
    budget: budget || null,
    projectName,
    description,
    industry,
    services: servicesStr,
    timeline,
    ipAddress: ip,
    browser,
    device,
  });
  const { referenceNumber } = inquiry;

  rememberSubmission(dupKey, referenceNumber);
  req.log.info({ email, referenceNumber }, "Project inquiry received");
  res.status(201).json({ status: "received", referenceNumber });

  // Queue the notifications after the response — persisted first, then
  // delivered/retried in the background so the visitor is never delayed.
  if (inquiry) {
    registerBackgroundWork(
      enqueueInquiryNotification(
        db,
        inquiry.id,
        buildProjectInquiryEmail(
          {
            name,
            email,
            company,
            phone,
            projectName,
            description,
            industry,
            services: servicesStr,
            budget,
            timeline,
          },
          { referenceNumber, submittedAt },
        ),
      ).catch((err) => {
        req.log.error({ err }, "Failed to queue project inquiry notification");
      }),
    );
    registerBackgroundWork(
      enqueueInquiryNotification(
        db,
        inquiry.id,
        buildLeadAutoReplyEmail(name, referenceNumber),
        normalizedEmail,
      ).catch((err) => {
        req.log.error({ err }, "Failed to queue project auto-reply");
      }),
    );
  }
});

export default inquiriesRouter;
