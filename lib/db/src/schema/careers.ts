import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * Job postings managed by admins and shown on the public Careers page
 * (only 'open' postings are public).
 */
export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  experience: text("experience").notNull(),
  employmentType: text("employment_type").notNull(),
  location: text("location").notNull(),
  workMode: text("work_mode").notNull(),
  salary: text("salary"),
  description: text("description").notNull(),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  skills: text("skills"),
  // 'open' | 'closed' | 'archived'
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const JOB_STATUSES = ["open", "closed", "archived"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];
export type Job = typeof jobsTable.$inferSelect;

/**
 * Candidate applications from the Careers page. Resume files live in
 * private object storage; `resumePath` is the internal object path served
 * to admins only through the storage route.
 */
export const jobApplicationsTable = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  referenceNumber: text("reference_number").unique().notNull(),
  jobId: integer("job_id"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  qualification: text("qualification").notNull(),
  college: text("college"),
  graduationYear: text("graduation_year"),
  experience: text("experience"),
  skills: text("skills").notNull(),
  linkedin: text("linkedin"),
  github: text("github"),
  portfolio: text("portfolio"),
  preferredRole: text("preferred_role").notNull(),
  expectedSalary: text("expected_salary"),
  joiningAvailability: text("joining_availability"),
  resumePath: text("resume_path").notNull(),
  coverLetter: text("cover_letter"),
  // 'new' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected'
  status: text("status").notNull().default("new"),
  assignedRecruiter: text("assigned_recruiter"),
  internalNotes: text("internal_notes"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const APPLICATION_STATUSES = [
  "new",
  "shortlisted",
  "interview_scheduled",
  "selected",
  "rejected",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type JobApplication = typeof jobApplicationsTable.$inferSelect;
