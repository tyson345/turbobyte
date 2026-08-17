import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Visitor inquiries from the contact form and the "Start Your Project"
 * wizard. `type` distinguishes the source form; wizard-only fields are
 * nullable for plain contact messages.
 */
export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'contact' | 'project'
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  // Contact form fields
  service: text("service"),
  budget: text("budget"),
  message: text("message"),
  // Project wizard fields
  projectName: text("project_name"),
  description: text("description"),
  industry: text("industry"),
  services: text("services"), // comma-separated list
  timeline: text("timeline"),
  // Lead pipeline status: 'new' | 'contacted' | 'closed'
  status: text("status").notNull().default("new"),
  // Lead tracking
  referenceNumber: text("reference_number").unique(),
  ipAddress: text("ip_address"),
  browser: text("browser"),
  device: text("device"),
  assignedTo: text("assigned_to"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const INQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const insertInquirySchema = createInsertSchema(inquiriesTable, {
  email: z.email(),
}).omit({ id: true, createdAt: true, status: true });

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiriesTable.$inferSelect;
