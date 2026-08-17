import { Router } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { UnsubscribeNewsletterBody } from "@workspace/api-zod";
import { db, subscribersTable, insertSubscriberSchema } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAdmin";

const newsletterRouter: Router = Router();

newsletterRouter.get(
  "/newsletter/subscribers",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const rows = await db
      .select()
      .from(subscribersTable)
      .orderBy(desc(subscribersTable.createdAt), desc(subscribersTable.id));
    res.json(
      rows.map((r) => ({
        id: r.id,
        email: r.email,
        createdAt: r.createdAt.toISOString(),
        unsubscribedAt: r.unsubscribedAt ? r.unsubscribedAt.toISOString() : null,
      })),
    );
  },
);

const subscribeBodySchema = insertSubscriberSchema;

newsletterRouter.post("/newsletter/subscribe", async (req, res) => {
  const parsed = subscribeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid email address" });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();

  // Insert, or — if the address already exists — clear any previous
  // unsubscribe so re-subscribing works. `xmax = 0` distinguishes a fresh
  // insert from a conflict-update on the existing row.
  const [row] = await db
    .insert(subscribersTable)
    .values({ email })
    .onConflictDoUpdate({
      target: subscribersTable.email,
      set: { unsubscribedAt: null },
    })
    .returning({
      isNew: sql<boolean>`(xmax = 0)`,
    });

  res.json({ status: row?.isNew ? "subscribed" : "already_subscribed" });
});

const unsubscribeBodySchema = UnsubscribeNewsletterBody;

newsletterRouter.post("/newsletter/unsubscribe", async (req, res) => {
  const parsed = unsubscribeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Missing unsubscribe token" });
    return;
  }

  const [subscriber] = await db
    .select({
      id: subscribersTable.id,
      unsubscribedAt: subscribersTable.unsubscribedAt,
    })
    .from(subscribersTable)
    .where(eq(subscribersTable.unsubscribeToken, parsed.data.token))
    .limit(1);

  if (!subscriber) {
    res.status(404).json({ message: "Invalid unsubscribe link" });
    return;
  }

  if (subscriber.unsubscribedAt) {
    res.json({ status: "already_unsubscribed" });
    return;
  }

  await db
    .update(subscribersTable)
    .set({ unsubscribedAt: new Date() })
    .where(eq(subscribersTable.id, subscriber.id));

  res.json({ status: "unsubscribed" });
});

export default newsletterRouter;
