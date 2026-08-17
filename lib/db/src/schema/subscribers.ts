import { sql } from "drizzle-orm";
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscribersTable = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  unsubscribeToken: text("unsubscribe_token")
    .notNull()
    .unique()
    .default(sql`gen_random_uuid()::text`),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const insertSubscriberSchema = createInsertSchema(subscribersTable, {
  email: z.email(),
}).omit({ id: true, createdAt: true, unsubscribeToken: true, unsubscribedAt: true });

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribersTable.$inferSelect;
