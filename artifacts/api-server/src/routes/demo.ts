import { Router, type IRouter } from "express";
import { and, eq, isNull, lt } from "drizzle-orm";
import { db, demoPrototypesTable, inquiriesTable } from "@workspace/db";
import {
  GenerateDemoPrototypeBody,
  SubmitDemoInquiryBody,
} from "@workspace/api-zod";
import { getAnthropicClient } from "@workspace/integrations-anthropic-ai";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  buildProjectInquiryEmail,
  buildLeadAutoReplyEmail,
} from "../lib/emailNotifications";
import { enqueueInquiryNotification } from "../lib/emailQueue";
import {
  generateReferenceNumber,
  getClientIp,
  parseUserAgent,
  checkRateLimit,
  findRecentDuplicate,
  rememberSubmission,
} from "../lib/leadTracking";

export const demoRouter: IRouter = Router();

const SYSTEM_PROMPT = `You are a senior product designer at TurboByte Tech Solutions, an AI-first technology company. A potential client describes their project idea in one short line, optionally with reference images (their logo, a sketch, or design inspiration). Produce a polished, single-file HTML landing/app prototype that shows them how their project could look. If reference images are provided, draw the color palette, mood and branding cues from them (do not embed the images themselves).

Rules:
- Return ONLY the HTML document, starting with <!DOCTYPE html>. No markdown fences, no commentary.
- Single self-contained file: inline <style> and (minimal) inline <script>. No external requests except Google Fonts.
- Modern, premium design: sensible color palette matched to the idea, good typography, hero section, 2-4 supporting sections with realistic placeholder content, responsive layout.
- Keep it under ~350 lines. Static prototype only — links may be href="#".
- Never include forms that submit anywhere, tracking, or external scripts.`;

function stripFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/);
  return match?.[1] ?? trimmed;
}

const CSP_META =
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data:; script-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; frame-src 'none'">`;

/** Inject a restrictive CSP into the generated prototype so it cannot make network requests or submit forms, even under prompt injection. */
function injectCsp(html: string): string {
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (m) => `${m}\n${CSP_META}`);
  }
  return html.replace(/<html[^>]*>/i, (m) => `${m}\n<head>${CSP_META}</head>`);
}

// Global cost guard for the public AI generation endpoint: cap total
// generations per hour across all IPs (best-effort, in-memory).
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
const GLOBAL_MAX_GENERATIONS = 40;
const MAX_CONCURRENT_GENERATIONS = 3;
let globalWindowStart = Date.now();
let globalCount = 0;
let inFlight = 0;

function checkGlobalBudget(): boolean {
  const now = Date.now();
  if (now - globalWindowStart > GLOBAL_WINDOW_MS) {
    globalWindowStart = now;
    globalCount = 0;
  }
  return globalCount < GLOBAL_MAX_GENERATIONS && inFlight < MAX_CONCURRENT_GENERATIONS;
}

demoRouter.post("/demo/prototype", async (req, res): Promise<void> => {
  const parsed = GenerateDemoPrototypeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid prompt" });
    return;
  }

  // Honeypot — pretend success for bots
  if (parsed.data.website) {
    res.status(201).json({ prototypeId: 0, html: "" });
    return;
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(`demo:${ip}`) || !checkGlobalBudget()) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  globalCount++;
  inFlight++;
  try {
    const images = parsed.data.images ?? [];
    // Validate untrusted image payloads before spending an AI call: base64
    // must decode, real byte size must be within limits, and the magic bytes
    // must match the declared media type.
    const MAGIC: Record<string, (b: Buffer) => boolean> = {
      "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8,
      "image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      "image/webp": (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
      "image/gif": (b) => b.subarray(0, 3).toString("ascii") === "GIF",
    };
    const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
    for (const img of images) {
      let bytes: Buffer;
      try {
        bytes = Buffer.from(img.data, "base64");
      } catch {
        res.status(400).json({ error: "Invalid image data" });
        return;
      }
      const check = MAGIC[img.mediaType];
      if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES || !check || bytes.length < 12 || !check(bytes)) {
        res.status(400).json({ error: "Invalid or unsupported image" });
        return;
      }
    }
    const content: Array<
      | { type: "image"; source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; data: string } }
      | { type: "text"; text: string }
    > = [
      ...images.map((img) => ({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: img.mediaType,
          data: img.data,
        },
      })),
      { type: "text" as const, text: parsed.data.prompt },
    ];
    const message = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });
    const block = message.content[0];
    const html =
      block && block.type === "text" ? injectCsp(stripFences(block.text)) : "";
    if (!html.toLowerCase().includes("<!doctype html")) {
      req.log.error({ prompt: parsed.data.prompt }, "Demo generation returned no HTML");
      res.status(502).json({ error: "Prototype generation failed. Please try again." });
      return;
    }

    // Opportunistic cleanup: the leave-page beacon is best-effort, so also
    // erase any unsubmitted prototypes older than a day.
    await db
      .delete(demoPrototypesTable)
      .where(
        and(
          isNull(demoPrototypesTable.referenceNumber),
          lt(
            demoPrototypesTable.createdAt,
            new Date(Date.now() - 24 * 60 * 60 * 1000),
          ),
        ),
      )
      .catch(() => undefined);

    const [row] = await db
      .insert(demoPrototypesTable)
      .values({ prompt: parsed.data.prompt, html })
      .returning({ id: demoPrototypesTable.id });
    if (!row) throw new Error("Insert returned no row");

    res.status(201).json({ prototypeId: row.id, html });
  } catch (err) {
    req.log.error({ err }, "Demo prototype generation failed");
    res.status(502).json({ error: "Prototype generation failed. Please try again." });
  } finally {
    inFlight--;
  }
});

demoRouter.post("/demo/submissions", async (req, res): Promise<void> => {
  const parsed = SubmitDemoInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid submission" });
    return;
  }

  if (parsed.data.website) {
    res.status(201).json({ status: "received", referenceNumber: generateReferenceNumber() });
    return;
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  const { prototypeId, prompt, name, email, company, phone, budget, timeline, details } =
    parsed.data;

  const dup = findRecentDuplicate(`demo:${email}`);
  if (dup) {
    res.status(201).json({ status: "received", referenceNumber: dup });
    return;
  }

  // Integrity: the prototype must exist, match the submitted prompt, and
  // not already be linked to another inquiry.
  const [proto] = await db
    .select({
      id: demoPrototypesTable.id,
      prompt: demoPrototypesTable.prompt,
      referenceNumber: demoPrototypesTable.referenceNumber,
      html: demoPrototypesTable.html,
    })
    .from(demoPrototypesTable)
    .where(eq(demoPrototypesTable.id, prototypeId))
    .limit(1);
  if (!proto || proto.prompt !== prompt || proto.referenceNumber) {
    res.status(400).json({ error: "Invalid submission" });
    return;
  }

  const agent = parseUserAgent(req.headers["user-agent"]);

  let inserted: { id: number; referenceNumber: string } | null = null;
  for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
    const referenceNumber = generateReferenceNumber();
    try {
      const [row] = await db
        .insert(inquiriesTable)
        .values({
          type: "project",
          name,
          email,
          company: company ?? null,
          phone,
          projectName: `AI Demo Request: ${prompt.slice(0, 60)}`,
          description: `Demo prompt: "${prompt}"${details ? `\n\nAdditional details: ${details}` : ""}\n\n(Client liked prototype #${prototypeId} generated on the demo page.)`,
          industry: "Demo Page Lead",
          budget: budget ?? null,
          timeline: timeline ?? null,
          referenceNumber,
          ipAddress: ip,
          browser: agent.browser,
          device: agent.device,
        })
        .returning({ id: inquiriesTable.id });
      if (row) inserted = { id: row.id, referenceNumber };
    } catch (err) {
      const isUnique =
        typeof err === "object" && err !== null && "code" in err &&
        (err as { code?: string }).code === "23505";
      if (!isUnique) throw err;
    }
  }
  if (!inserted) {
    res.status(500).json({ error: "Could not save your request. Please try again." });
    return;
  }

  // Link the prototype to the inquiry so the team can see what the client saw
  await db
    .update(demoPrototypesTable)
    .set({ referenceNumber: inserted.referenceNumber })
    .where(eq(demoPrototypesTable.id, prototypeId))
    .catch(() => undefined);

  rememberSubmission(`demo:${email}`, inserted.referenceNumber);

  const meta = { referenceNumber: inserted.referenceNumber, submittedAt: new Date() };
  const adminEmail = buildProjectInquiryEmail(
    {
      name,
      email,
      company: company ?? undefined,
      phone,
      projectName: `AI Demo Request: ${prompt}`,
      industry: "Demo Page Lead",
      services: null,
      budget: budget ?? null,
      timeline: timeline ?? "Not specified",
      description: `Demo prompt: "${prompt}"${details ? ` — ${details}` : ""} (prototype #${prototypeId})`,
    },
    meta,
  );
  // Attach the exact prototype the client saw so the team can open it
  // directly from the email, even after the prototype is cleaned up.
  adminEmail.attachments = [
    {
      filename: `demo-prototype-${inserted.referenceNumber}.html`,
      content: proto.html,
    },
  ];
  await enqueueInquiryNotification(inserted.id, adminEmail);

  const autoReply = buildLeadAutoReplyEmail(name, meta.referenceNumber);
  await enqueueInquiryNotification(inserted.id, autoReply, email);

  res.status(201).json({ status: "received", referenceNumber: inserted.referenceNumber });
});

// Called via navigator.sendBeacon when a visitor leaves the demo page:
// erase their prototype unless it was submitted as an inquiry.
demoRouter.post("/demo/prototypes/:id/discard", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db
    .delete(demoPrototypesTable)
    .where(
      and(
        eq(demoPrototypesTable.id, id),
        isNull(demoPrototypesTable.referenceNumber),
      ),
    );
  res.status(204).end();
});

// Admin: view the prototype a client liked (raw HTML)
demoRouter.get(
  "/demo/prototypes/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [row] = await db
      .select()
      .from(demoPrototypesTable)
      .where(eq(demoPrototypesTable.id, id))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Security-Policy", "sandbox allow-scripts");
    res.send(row.html);
  },
);
