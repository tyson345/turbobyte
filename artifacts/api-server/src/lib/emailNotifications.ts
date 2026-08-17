import { Resend } from "resend";

const NOTIFY_TO = process.env.NOTIFY_EMAIL || "aae@turbobytetech.com";
const FROM =
  process.env.NOTIFY_FROM ||
  "TurboByte Inquiries <inquiries@turbobytetechsolutions.com>";
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://turbobytetechsolutions.com";
const ADMIN_INQUIRIES_URL = `${SITE_URL}/admin/leads`;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export interface ContactInquiryData {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  service: string;
  budget?: string | null;
  message: string;
}

export interface ProjectInquiryData {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  projectName: string;
  description: string;
  industry: string;
  services?: string | null;
  budget?: string | null;
  timeline: string;
}

export interface EmailAttachment {
  filename: string;
  /** Raw text content of the attached file. */
  content: string;
}

export interface NotificationEmail {
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `<tr><td style="padding:6px 12px;font-weight:600;color:#6b7280;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:6px 12px;color:#111827;">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function actionButtons(replyTo: string, replySubject: string): string {
  const mailto = `mailto:${encodeURIComponent(replyTo)}?subject=${encodeURIComponent(replySubject)}`;
  return `<div style="padding:8px 32px 24px;text-align:center;">
      <a href="${escapeHtml(mailto)}" style="display:inline-block;margin:4px 6px;padding:10px 20px;background:#0f172a;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">Reply to ${escapeHtml(replyTo)}</a>
      <a href="${escapeHtml(ADMIN_INQUIRIES_URL)}" style="display:inline-block;margin:4px 6px;padding:10px 20px;background:#ffffff;color:#0f172a;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;border:1px solid #cbd5e1;">View in Admin</a>
    </div>`;
}

function emailWrapper(
  title: string,
  tableRows: string,
  buttons: string,
): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <div style="background:#0f172a;padding:24px 32px;">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;">TurboByte Tech Solutions</p>
      <h1 style="margin:8px 0 0;font-size:20px;color:#ffffff;">${title}</h1>
    </div>
    <div style="padding:24px 32px;">
      <table style="width:100%;border-collapse:collapse;">
        ${tableRows}
      </table>
    </div>
    ${buttons}
    <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">This notification was sent automatically when a visitor submitted the inquiry form on turbobytetechsolutions.com.</p>
    </div>
  </div>
</body>
</html>`;
}

export interface LeadMeta {
  referenceNumber: string;
  submittedAt: Date;
}

function formatSubmissionTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

/**
 * Visitor-facing acknowledgement, sent automatically after a submission.
 * Copy follows the approved content brief verbatim.
 */
export function buildLeadAutoReplyEmail(
  name: string,
  referenceNumber: string,
): NotificationEmail {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <div style="background:#0f172a;padding:24px 32px;">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;">TurboByte Tech Solutions</p>
      <h1 style="margin:8px 0 0;font-size:20px;color:#ffffff;">Thank You for Contacting Us</h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#111827;">Hello ${escapeHtml(name)},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Thank you for contacting TurboByte Tech Solutions.</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">We have received your enquiry successfully.</p>
      <div style="margin:0 0 16px;padding:14px 18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
        <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Reference Number</p>
        <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#111827;">${escapeHtml(referenceNumber)}</p>
      </div>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">Our team will contact you within one business day.</p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#111827;">Regards,<br>TurboByte Tech Solutions Private Limited</p>
    </div>
  </div>
</body>
</html>`;

  return {
    subject: "Thank You for Contacting TurboByte Tech Solutions",
    html,
  };
}

export interface JobApplicationEmailData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  qualification: string;
  experience?: string | null;
  preferredRole: string;
  skills: string;
  resumePath: string;
}

/** Staff-facing alert for a new job application. */
export function buildJobApplicationEmail(
  data: JobApplicationEmailData,
  meta: LeadMeta,
): NotificationEmail {
  const resumeUrl = `${SITE_URL}/api/storage${data.resumePath}`;
  const tableRows = [
    row("Application Reference", meta.referenceNumber),
    row("Candidate Name", data.fullName),
    row("Email", data.email),
    row("Phone", data.phone),
    row("City", data.city),
    row("Qualification", data.qualification),
    row("Experience", data.experience),
    row("Preferred Role", data.preferredRole),
    row("Skills", data.skills),
    row("Submission Time", formatSubmissionTime(meta.submittedAt)),
  ]
    .filter(Boolean)
    .join("\n");

  const buttons = `<div style="padding:8px 32px 24px;text-align:center;">
      <a href="${escapeHtml(resumeUrl)}" style="display:inline-block;margin:4px 6px;padding:10px 20px;background:#0f172a;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">Download Resume</a>
      <a href="${escapeHtml(`${SITE_URL}/admin/recruitment`)}" style="display:inline-block;margin:4px 6px;padding:10px 20px;background:#ffffff;color:#0f172a;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;border:1px solid #cbd5e1;">View in Admin</a>
    </div>`;

  return {
    subject: `📄 New Job Application - ${data.fullName}`,
    html: emailWrapper("New Job Application", tableRows, buttons),
  };
}

/** Candidate-facing acknowledgement; copy follows the approved brief. */
export function buildApplicationAutoReplyEmail(
  fullName: string,
  referenceNumber: string,
): NotificationEmail {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <div style="background:#0f172a;padding:24px 32px;">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;">TurboByte Tech Solutions</p>
      <h1 style="margin:8px 0 0;font-size:20px;color:#ffffff;">Application Received</h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#111827;">Hello ${escapeHtml(fullName)},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Thank you for your interest in joining TurboByte Tech Solutions.</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Your application has been received successfully.</p>
      <div style="margin:0 0 16px;padding:14px 18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
        <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Reference Number</p>
        <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#111827;">${escapeHtml(referenceNumber)}</p>
      </div>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">Our recruitment team will review your profile and contact you if your qualifications match our current or future opportunities.</p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#111827;">Regards,<br>TurboByte Tech Solutions Recruitment Team</p>
    </div>
  </div>
</body>
</html>`;

  return {
    subject: "Application Received - TurboByte Tech Solutions",
    html,
  };
}

export function buildContactInquiryEmail(
  data: ContactInquiryData,
  meta?: LeadMeta,
): NotificationEmail {
  const tableRows = [
    row("Reference Number", meta?.referenceNumber),
    row("Name", data.name),
    row("Email", data.email),
    row("Company", data.company),
    row("Phone", data.phone),
    row("Service", data.service),
    row("Budget", data.budget),
    row("Message", data.message),
    row(
      "Submission Time",
      meta ? formatSubmissionTime(meta.submittedAt) : undefined,
    ),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `🚀 New Lead - ${data.name}`,
    html: emailWrapper(
      "New Contact Inquiry",
      tableRows,
      actionButtons(data.email, `Re: Your inquiry to TurboByte Tech Solutions`),
    ),
  };
}

export function buildProjectInquiryEmail(
  data: ProjectInquiryData,
  meta?: LeadMeta,
): NotificationEmail {
  const tableRows = [
    row("Reference Number", meta?.referenceNumber),
    row("Contact Name", data.name),
    row("Email", data.email),
    row("Company", data.company),
    row("Phone", data.phone),
    row("Project Name", data.projectName),
    row("Industry", data.industry),
    row("Services", data.services),
    row("Budget", data.budget),
    row("Timeline", data.timeline),
    row("Description", data.description),
    row(
      "Submission Time",
      meta ? formatSubmissionTime(meta.submittedAt) : undefined,
    ),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `🚀 New Lead - ${data.name}`,
    html: emailWrapper(
      "New Project Inquiry",
      tableRows,
      actionButtons(data.email, `Re: ${data.projectName} — TurboByte Tech Solutions`),
    ),
  };
}

/** Public one-click unsubscribe page URL for a subscriber's token. */
export function buildUnsubscribeUrl(token: string): string {
  return `${SITE_URL}/unsubscribe?token=${encodeURIComponent(token)}`;
}

export interface NewBlogPostData {
  slug: string;
  title: string;
  summary: string;
}

/**
 * Subscriber-facing announcement for a newly published blog post,
 * containing the title, summary, and a link to the article.
 */
export function buildNewBlogPostEmail(
  post: NewBlogPostData,
  unsubscribeToken: string,
): NotificationEmail {
  const articleUrl = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
  const unsubscribeUrl = buildUnsubscribeUrl(unsubscribeToken);
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <div style="background:#0f172a;padding:24px 32px;">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;">TurboByte Tech Solutions</p>
      <h1 style="margin:8px 0 0;font-size:20px;color:#ffffff;">New on the blog</h1>
    </div>
    <div style="padding:28px 32px 8px;">
      <h2 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#111827;">${escapeHtml(post.title)}</h2>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(post.summary)}</p>
    </div>
    <div style="padding:24px 32px 32px;text-align:center;">
      <a href="${escapeHtml(articleUrl)}" style="display:inline-block;padding:12px 28px;background:#0f172a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;">Read the article</a>
    </div>
    <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">You are receiving this because you subscribed to updates from TurboByte Tech Solutions. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

  return { subject: `New post: ${post.title}`, html };
}

/**
 * Attempt a single email delivery through Resend.
 * Throws on failure so callers (the retry queue) can decide what to do.
 *
 * `to` defaults to the admin notification address.
 */
export async function deliverNotificationEmail(
  email: NotificationEmail,
  to: string = NOTIFY_TO,
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    throw new Error("RESEND_API_KEY not set");
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: email.subject,
    html: email.html,
    ...(email.attachments && email.attachments.length > 0
      ? {
          attachments: email.attachments.map((a) => ({
            filename: a.filename,
            content: Buffer.from(a.content, "utf8"),
          })),
        }
      : {}),
  });

  if (error) {
    throw new Error(`Resend error: ${error.name}: ${error.message}`);
  }
}
