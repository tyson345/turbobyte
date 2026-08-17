import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * Outbox of email notifications for inquiries. Each inquiry gets one row;
 * failed sends are retried with back-off up to a max attempt count so a
 * temporary Resend outage never silently drops an alert. Rows stuck in
 * 'pending' or ended in 'failed' surface missed alerts for later recovery.
 */
export const emailNotificationsTable = pgTable("email_notifications", {
  id: serial("id").primaryKey(),
  // Set for inquiry alert emails; null for other kinds (e.g. blog announcements).
  inquiryId: integer("inquiry_id"),
  // Destination address. Null means the admin notification address
  // (resolved from NOTIFY_EMAIL at send time), preserving pre-existing rows.
  recipient: text("recipient"),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  // Optional JSON array of { filename, content } attachments (content is
  // the raw text of the file, e.g. a demo prototype HTML document).
  attachments: text("attachments"),
  // 'pending' | 'sent' | 'failed'
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  nextAttemptAt: timestamp("next_attempt_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const EMAIL_NOTIFICATION_STATUSES = [
  "pending",
  "sent",
  "failed",
] as const;
export type EmailNotificationStatus =
  (typeof EMAIL_NOTIFICATION_STATUSES)[number];

export type EmailNotification = typeof emailNotificationsTable.$inferSelect;
