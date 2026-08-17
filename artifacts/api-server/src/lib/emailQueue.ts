import { and, eq, lte } from "drizzle-orm";
import { db, emailNotificationsTable } from "@workspace/db";
import { logger } from "./logger";
import {
  deliverNotificationEmail,
  type NotificationEmail,
} from "./emailNotifications";

/**
 * Persistent retry queue for inquiry email notifications.
 *
 * Every inquiry gets a row in email_notifications ('pending'). Delivery is
 * attempted immediately in the background (never blocking the visitor's
 * response); on failure the row stays 'pending' with an increasing back-off
 * until MAX_ATTEMPTS is reached, at which point it is marked 'failed' so
 * missed alerts remain detectable. A periodic sweep picks up due retries and
 * any rows left over from a previous process (e.g. after a restart or a
 * prolonged Resend outage).
 */

export const MAX_ATTEMPTS = 3;

// Back-off before attempt N+1, indexed by attempts already made (1 → 2nd try).
const BACKOFF_MS = [60_000, 5 * 60_000];

const SWEEP_INTERVAL_MS = 60_000;

function backoffMs(attemptsMade: number): number {
  return BACKOFF_MS[Math.min(attemptsMade - 1, BACKOFF_MS.length - 1)]!;
}

/**
 * Persist a notification for an inquiry, then kick off delivery in the
 * background. Returns once the row is safely stored — the actual send never
 * delays the caller.
 */
export async function enqueueInquiryNotification(
  inquiryId: number | null,
  email: NotificationEmail,
  recipient?: string,
): Promise<void> {
  const [inserted] = await db
    .insert(emailNotificationsTable)
    .values({
      inquiryId,
      subject: email.subject,
      html: email.html,
      ...(email.attachments && email.attachments.length > 0
        ? { attachments: JSON.stringify(email.attachments) }
        : {}),
      ...(recipient ? { recipient } : {}),
    })
    .returning({ id: emailNotificationsTable.id });

  if (inserted) {
    // Fire-and-forget: first attempt happens off the request path.
    void attemptDelivery(inserted.id).catch((err) => {
      logger.error({ err, notificationId: inserted.id },
        "Unexpected error attempting email notification delivery");
    });
  }
}

/**
 * Persist one notification per recipient (already inserted by the caller,
 * e.g. inside a transaction) and kick off delivery in the background.
 */
export function kickOffDeliveries(notificationIds: number[]): void {
  for (const id of notificationIds) {
    void attemptDelivery(id).catch((err) => {
      logger.error(
        { err, notificationId: id },
        "Unexpected error attempting email notification delivery",
      );
    });
  }
}

/**
 * Try to deliver one queued notification. Updates the row's status:
 * 'sent' on success, 'pending' with a back-off on retryable failure,
 * 'failed' once MAX_ATTEMPTS is exhausted.
 */
export async function attemptDelivery(notificationId: number): Promise<void> {
  const [notification] = await db
    .select()
    .from(emailNotificationsTable)
    .where(eq(emailNotificationsTable.id, notificationId));

  if (!notification || notification.status !== "pending") return;

  const attempts = notification.attempts + 1;

  try {
    let attachments;
    if (notification.attachments) {
      try {
        attachments = JSON.parse(notification.attachments);
      } catch {
        attachments = undefined;
      }
    }
    await deliverNotificationEmail(
      {
        subject: notification.subject,
        html: notification.html,
        attachments,
      },
      notification.recipient ?? undefined,
    );

    await db
      .update(emailNotificationsTable)
      .set({ status: "sent", attempts, sentAt: new Date(), lastError: null })
      .where(eq(emailNotificationsTable.id, notificationId));

    logger.info(
      { notificationId, inquiryId: notification.inquiryId, attempts },
      "Inquiry email notification sent",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (attempts >= MAX_ATTEMPTS) {
      await db
        .update(emailNotificationsTable)
        .set({ status: "failed", attempts, lastError: message })
        .where(eq(emailNotificationsTable.id, notificationId));

      logger.error(
        { notificationId, inquiryId: notification.inquiryId, attempts, err },
        "Inquiry email notification permanently failed after max attempts",
      );
    } else {
      const delay = backoffMs(attempts);
      await db
        .update(emailNotificationsTable)
        .set({
          attempts,
          lastError: message,
          nextAttemptAt: new Date(Date.now() + delay),
        })
        .where(eq(emailNotificationsTable.id, notificationId));

      logger.warn(
        {
          notificationId,
          inquiryId: notification.inquiryId,
          attempts,
          retryInMs: delay,
          err,
        },
        "Inquiry email notification failed; will retry",
      );
    }
  }
}

/** Deliver every pending notification whose retry time has arrived. */
export async function processDueNotifications(): Promise<void> {
  const due = await db
    .select({ id: emailNotificationsTable.id })
    .from(emailNotificationsTable)
    .where(
      and(
        eq(emailNotificationsTable.status, "pending"),
        lte(emailNotificationsTable.nextAttemptAt, new Date()),
      ),
    );

  for (const { id } of due) {
    await attemptDelivery(id);
  }
}

let sweepTimer: NodeJS.Timeout | null = null;

/**
 * Start the periodic sweep that retries due notifications, including any
 * left pending by a previous process. Safe to call once at server startup.
 */
export function startEmailQueueWorker(): void {
  if (sweepTimer) return;

  const sweep = (): void => {
    processDueNotifications().catch((err) => {
      logger.error({ err }, "Email notification sweep failed");
    });
  };

  // Recover anything pending from before this process started.
  sweep();
  sweepTimer = setInterval(sweep, SWEEP_INTERVAL_MS);
  sweepTimer.unref();
}

/** Stop the periodic sweep (used by tests). */
export function stopEmailQueueWorker(): void {
  if (sweepTimer) {
    clearInterval(sweepTimer);
    sweepTimer = null;
  }
}
