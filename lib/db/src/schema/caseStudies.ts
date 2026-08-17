import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const caseStudiesTable = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  tagline: text("tagline").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull(),
  metricLabel: text("metric_label").notNull(),
  metricValue: text("metric_value").notNull(),
  secondaryMetricLabel: text("secondary_metric_label"),
  secondaryMetricValue: text("secondary_metric_value"),
  completedAt: text("completed_at").notNull(),
  client: text("client").notNull(),
  summary: text("summary").notNull(),
  challenge: text("challenge").notNull(),
  solution: text("solution").notNull(),
  outcomes: text("outcomes").array().notNull(),
  techStack: text("tech_stack").array().notNull(),
  engagementType: text("engagement_type").notNull(),
  duration: text("duration").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertCaseStudySchema = createInsertSchema(caseStudiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;
export type CaseStudy = typeof caseStudiesTable.$inferSelect;
