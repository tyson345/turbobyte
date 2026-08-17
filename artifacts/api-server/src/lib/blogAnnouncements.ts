import { eq, isNull } from "drizzle-orm";
import {
  db,
  blogAnnouncementsTable,
  emailNotificationsTable,
  subscribersTable,
} from "@workspace/db";
import { blogPosts } from "@workspace/blog";
import { logger } from "./logger";
import { buildNewBlogPostEmail } from "./emailNotifications";
import { kickOffDeliveries } from "./emailQueue";

/**
 * Announce newly published blog posts to subscribers.
 *
 * Posts are static (added to @workspace/blog and deployed), so "published"
 * is detected at startup: any post without a blog_announcements row is new.
 * For each new post, one email_notifications row is enqueued per subscriber
 * inside the same transaction that records the announcement — the unique
 * post_slug guarantees a post is never emailed twice, and a crash between
 * insert and delivery is recovered by the queue's retry sweep.
 *
 * Bootstrap: on the very first run (empty announcements table), existing
 * posts are recorded as 'skipped' without emailing anyone, so enabling this
 * feature doesn't blast subscribers with old articles.
 */
export async function announceNewBlogPosts(): Promise<void> {
  const isBootstrap =
    (await db.select({ id: blogAnnouncementsTable.id }).from(blogAnnouncementsTable).limit(1))
      .length === 0;

  for (const post of blogPosts) {
    if (isBootstrap) {
      await db
        .insert(blogAnnouncementsTable)
        .values({ postSlug: post.slug, status: "skipped" })
        .onConflictDoNothing();
      continue;
    }

    const subscribers = await db
      .select({
        email: subscribersTable.email,
        unsubscribeToken: subscribersTable.unsubscribeToken,
      })
      .from(subscribersTable)
      .where(isNull(subscribersTable.unsubscribedAt));

    const notificationIds = await db.transaction(async (tx) => {
      const [claimed] = await tx
        .insert(blogAnnouncementsTable)
        .values({ postSlug: post.slug, status: "announced" })
        .onConflictDoNothing()
        .returning({ id: blogAnnouncementsTable.id });

      // Already announced (or claimed by a concurrent process) — never resend.
      if (!claimed) return [];
      if (subscribers.length === 0) return [];

      const inserted = await tx
        .insert(emailNotificationsTable)
        .values(
          subscribers.map((s) => {
            const email = buildNewBlogPostEmail(post, s.unsubscribeToken);
            return {
              recipient: s.email,
              subject: email.subject,
              html: email.html,
            };
          }),
        )
        .returning({ id: emailNotificationsTable.id });

      return inserted.map((r) => r.id);
    });

    if (notificationIds.length > 0) {
      logger.info(
        { postSlug: post.slug, subscriberCount: notificationIds.length },
        "Enqueued new blog post announcement emails",
      );
      kickOffDeliveries(notificationIds);
    }
  }

  if (isBootstrap && blogPosts.length > 0) {
    logger.info(
      { postCount: blogPosts.length },
      "Blog announcements bootstrapped; pre-existing posts marked as skipped and will not be emailed",
    );
  }
}

/** Whether a post has already been announced (used by tests/diagnostics). */
export async function isPostAnnounced(slug: string): Promise<boolean> {
  const rows = await db
    .select({ id: blogAnnouncementsTable.id })
    .from(blogAnnouncementsTable)
    .where(eq(blogAnnouncementsTable.postSlug, slug))
    .limit(1);
  return rows.length > 0;
}
