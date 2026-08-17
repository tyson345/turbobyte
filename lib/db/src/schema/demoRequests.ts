import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

/**
 * AI demo prototypes generated on the public /demo page. When a visitor
 * likes a prototype and submits their details, the row is linked to the
 * created inquiry via `referenceNumber` so the team can view the exact
 * prototype the client saw.
 */
export const demoPrototypesTable = pgTable("demo_prototypes", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  html: text("html").notNull(),
  // Set when the visitor submits the prototype as a project inquiry
  referenceNumber: text("reference_number").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DemoPrototype = typeof demoPrototypesTable.$inferSelect;
