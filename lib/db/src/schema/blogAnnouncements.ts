import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

/**
 * One row per blog post that has been announced (or intentionally skipped)
 * for the subscriber mailing list. The unique slug guarantees a post is
 * never emailed to subscribers twice, even across restarts.
 */
export const blogAnnouncementsTable = pgTable("blog_announcements", {
  id: serial("id").primaryKey(),
  postSlug: text("post_slug").notNull().unique(),
  // 'announced' — subscriber emails were enqueued
  // 'skipped'   — post existed before announcements were enabled (bootstrap)
  status: text("status").notNull().default("announced"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type BlogAnnouncement = typeof blogAnnouncementsTable.$inferSelect;
