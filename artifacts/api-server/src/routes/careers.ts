import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, jobsTable, jobApplicationsTable } from "@workspace/db";
import {
  AdminCreateJobBody,
  AdminUpdateJobBody,
  AdminUpdateApplicationBody,
  RequestResumeUploadUrlBody,
  SubmitJobApplicationBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  ObjectNotFoundError,
  ObjectStorageService,
} from "../lib/objectStorage";
import {
  buildApplicationAutoReplyEmail,
  buildJobApplicationEmail,
} from "../lib/emailNotifications";
import { enqueueInquiryNotification } from "../lib/emailQueue";
import {
  generateReferenceNumber,
  getClientIp,
  checkRateLimit,
  findRecentDuplicate,
  rememberSubmission,
} from "../lib/leadTracking";

const careersRouter: IRouter = Router();
const objectStorageService = new ObjectStorageService();

const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_RESUME_CONTENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Server-side verification of an uploaded resume: the object must actually
 * exist under our uploads prefix and its REAL stored size/content-type must
 * satisfy policy — the declared values at URL-request time are not trusted.
 * Returns an error message, or null when the upload is acceptable.
 */
async function verifyUploadedResume(resumePath: string): Promise<string | null> {
  if (!resumePath.startsWith("/objects/uploads/")) {
    return "Invalid resume upload";
  }
  let metadata: { size?: unknown; contentType?: unknown };
  try {
    const file = await objectStorageService.getObjectEntityFile(resumePath);
    [metadata] = await file.getMetadata();
  } catch (err) {
    if (err instanceof ObjectNotFoundError) return "Resume file not found";
    throw err;
  }
  const size = Number(metadata.size ?? 0);
  if (!size || size > MAX_RESUME_BYTES) {
    return "File too large. Maximum size is 10 MB.";
  }
  const contentType = String(metadata.contentType ?? "").toLowerCase();
  if (
    !ALLOWED_RESUME_CONTENT_TYPES.includes(contentType) &&
    contentType !== "application/octet-stream"
  ) {
    return "Unsupported file type. Upload PDF, DOC, or DOCX.";
  }
  return null;
}

function serializeJob(r: typeof jobsTable.$inferSelect) {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function serializeApplication(r: typeof jobApplicationsTable.$inferSelect) {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function parseId(raw: unknown): number | null {
  const id = Number.parseInt(String(raw), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// ---------------------------------------------------------------------------
// Jobs — public
// ---------------------------------------------------------------------------

careersRouter.get("/jobs", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.status, "open"))
    .orderBy(desc(jobsTable.createdAt), desc(jobsTable.id));
  res.json(rows.map(serializeJob));
});

// ---------------------------------------------------------------------------
// Jobs — admin CRUD
// ---------------------------------------------------------------------------

careersRouter.get(
  "/admin/jobs",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const rows = await db
      .select()
      .from(jobsTable)
      .orderBy(desc(jobsTable.createdAt), desc(jobsTable.id));
    res.json(rows.map(serializeJob));
  },
);

careersRouter.post(
  "/admin/jobs",
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = AdminCreateJobBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid job" });
      return;
    }
    const [created] = await db
      .insert(jobsTable)
      .values(parsed.data)
      .returning();
    if (!created) {
      res.status(500).json({ error: "Failed to create job" });
      return;
    }
    req.log.info({ jobId: created.id }, "Job posting created");
    res.status(201).json(serializeJob(created));
  },
);

careersRouter.patch(
  "/admin/jobs/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const parsed = AdminUpdateJobBody.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      res.status(400).json({ error: "Invalid update" });
      return;
    }
    const [updated] = await db
      .update(jobsTable)
      .set(parsed.data)
      .where(eq(jobsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serializeJob(updated));
  },
);

careersRouter.delete(
  "/admin/jobs/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const [deleted] = await db
      .delete(jobsTable)
      .where(eq(jobsTable.id, id))
      .returning({ id: jobsTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
  },
);

// ---------------------------------------------------------------------------
// Resume upload — public but rate limited and extension/size checked.
// Resumes are stored as private object entities; the storage route only
// serves them to admins (they are never referenced by published projects).
// ---------------------------------------------------------------------------

careersRouter.post(
  "/careers/resume-upload-url",
  async (req, res): Promise<void> => {
    const ip = getClientIp(req);
    // Separate bucket from form submissions so retried uploads don't
    // starve the application submit itself.
    if (!checkRateLimit(ip ? `upload:${ip}` : null)) {
      res
        .status(429)
        .json({ error: "Too many requests. Please try again later." });
      return;
    }

    const parsed = RequestResumeUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Missing or invalid fields" });
      return;
    }

    const { fileName, fileSize } = parsed.data;
    const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_RESUME_EXTENSIONS.includes(ext)) {
      res
        .status(400)
        .json({ error: "Unsupported file type. Upload PDF, DOC, or DOCX." });
      return;
    }
    if (fileSize > MAX_RESUME_BYTES) {
      res.status(400).json({ error: "File too large. Maximum size is 10 MB." });
      return;
    }

    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath =
        objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json({ uploadURL, objectPath });
    } catch (error) {
      req.log.error({ err: error }, "Error generating resume upload URL");
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  },
);

// ---------------------------------------------------------------------------
// Applications — public submit
// ---------------------------------------------------------------------------

careersRouter.post(
  "/careers/applications",
  async (req, res): Promise<void> => {
    const parsed = SubmitJobApplicationBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Missing or invalid required fields" });
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
      res
        .status(429)
        .json({ error: "Too many requests. Please try again later." });
      return;
    }

    const data = parsed.data;
    const normalizedEmail = data.email.trim().toLowerCase();

    // Resume paths must be internal object-entity paths from our own
    // upload endpoint — never arbitrary URLs — and the stored object's
    // actual size/type must satisfy policy.
    const resumeError = await verifyUploadedResume(data.resumePath);
    if (resumeError) {
      res.status(400).json({ error: resumeError });
      return;
    }

    const dupKey = `application:${normalizedEmail}:${data.preferredRole}`;
    const existingRef = findRecentDuplicate(dupKey);
    if (existingRef) {
      res
        .status(201)
        .json({ status: "received", referenceNumber: existingRef });
      return;
    }

    const submittedAt = new Date();
    let inserted: { id: number; referenceNumber: string } | undefined;
    for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
      const referenceNumber = generateReferenceNumber();
      try {
        const [row] = await db
          .insert(jobApplicationsTable)
          .values({
            referenceNumber,
            jobId: data.jobId ?? null,
            fullName: data.fullName,
            email: normalizedEmail,
            phone: data.phone,
            city: data.city,
            qualification: data.qualification,
            college: data.college || null,
            graduationYear: data.graduationYear || null,
            experience: data.experience || null,
            skills: data.skills,
            linkedin: data.linkedin || null,
            github: data.github || null,
            portfolio: data.portfolio || null,
            preferredRole: data.preferredRole,
            expectedSalary: data.expectedSalary || null,
            joiningAvailability: data.joiningAvailability || null,
            resumePath: data.resumePath,
            coverLetter: data.coverLetter || null,
            ipAddress: ip,
          })
          .returning({
            id: jobApplicationsTable.id,
            referenceNumber: jobApplicationsTable.referenceNumber,
          });
        inserted = row;
      } catch (err) {
        const isUnique =
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code?: string }).code === "23505";
        if (!isUnique || attempt === 2) throw err;
      }
    }
    if (!inserted) {
      res.status(500).json({ error: "Failed to store application" });
      return;
    }

    rememberSubmission(dupKey, inserted.referenceNumber);
    req.log.info(
      { email: normalizedEmail, referenceNumber: inserted.referenceNumber },
      "Job application received",
    );
    res
      .status(201)
      .json({ status: "received", referenceNumber: inserted.referenceNumber });

    enqueueInquiryNotification(
      null,
      buildJobApplicationEmail(
        {
          fullName: data.fullName,
          email: normalizedEmail,
          phone: data.phone,
          city: data.city,
          qualification: data.qualification,
          experience: data.experience,
          preferredRole: data.preferredRole,
          skills: data.skills,
          resumePath: data.resumePath,
        },
        { referenceNumber: inserted.referenceNumber, submittedAt },
      ),
    ).catch((err) => {
      req.log.error({ err }, "Failed to queue application notification");
    });
    enqueueInquiryNotification(
      null,
      buildApplicationAutoReplyEmail(
        data.fullName,
        inserted.referenceNumber,
      ),
      normalizedEmail,
    ).catch((err) => {
      req.log.error({ err }, "Failed to queue application auto-reply");
    });
  },
);

// ---------------------------------------------------------------------------
// Applications — admin management
// ---------------------------------------------------------------------------

careersRouter.get(
  "/admin/applications",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const rows = await db
      .select()
      .from(jobApplicationsTable)
      .orderBy(
        desc(jobApplicationsTable.createdAt),
        desc(jobApplicationsTable.id),
      );
    res.json(rows.map(serializeApplication));
  },
);

careersRouter.patch(
  "/admin/applications/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const parsed = AdminUpdateApplicationBody.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      res.status(400).json({ error: "Invalid update" });
      return;
    }
    const [updated] = await db
      .update(jobApplicationsTable)
      .set(parsed.data)
      .where(eq(jobApplicationsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serializeApplication(updated));
  },
);

careersRouter.delete(
  "/admin/applications/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const [deleted] = await db
      .delete(jobApplicationsTable)
      .where(eq(jobApplicationsTable.id, id))
      .returning({ id: jobApplicationsTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
  },
);

export default careersRouter;
