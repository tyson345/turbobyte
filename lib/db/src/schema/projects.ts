import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectCategoriesTable = pgTable("project_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  shortDescription: text("short_description").notNull(),
  overview: text("overview").notNull(),
  clientIndustry: text("client_industry"),
  challenge: text("challenge").notNull(),
  solution: text("solution").notNull(),
  techStack: text("tech_stack").array().notNull(),
  processNotes: text("process_notes"),
  results: text("results"),
  lessonsLearned: text("lessons_learned"),
  thumbnailPath: text("thumbnail_path"),
  completedAt: text("completed_at"),
  published: boolean("published").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const projectImagesTable = pgTable("project_images", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  imagePath: text("image_path").notNull(),
  kind: text("kind").notNull().default("feature"), // desktop | mobile | dashboard | feature
  altText: text("alt_text"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;

export const insertProjectCategorySchema = createInsertSchema(projectCategoriesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProjectCategory = z.infer<typeof insertProjectCategorySchema>;
export type ProjectCategory = typeof projectCategoriesTable.$inferSelect;

export const insertProjectImageSchema = createInsertSchema(projectImagesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProjectImage = z.infer<typeof insertProjectImageSchema>;
export type ProjectImage = typeof projectImagesTable.$inferSelect;
