import {
  db,
  projectCategoriesTable,
  projectsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

export async function ensurePublishedPortfolioContent(): Promise<boolean> {
  await db
    .insert(projectCategoriesTable)
    .values({
      slug: "web-development",
      name: "Web Development",
    })
    .onConflictDoNothing();

  const [existingProject] = await db
    .select({ id: projectsTable.id })
    .from(projectsTable)
    .where(eq(projectsTable.slug, "ora-care-dental"))
    .limit(1);

  if (existingProject) {
    return false;
  }

  const insertedProjects = await db
    .insert(projectsTable)
    .values({
      slug: "ora-care-dental",
      title: "Ora-Care Dental & Root Canal Centre",
      category: "Web Development",
      liveUrl: "https://oracare.health/",
      shortDescription:
        "A responsive dental clinic website designed to make treatments easy to explore and appointment enquiries simple to start.",
      overview:
        "TurboByte created Ora-Care's public website for its dental and root canal centre in Bengaluru. The experience presents the clinic, treatments, facilities, contact details, and appointment paths in a clear, professional interface that works across desktop and mobile screens.",
      clientIndustry: "Healthcare — Dental Clinic",
      challenge:
        "The clinic needed a modern digital presence that could communicate its range of dental services, establish trust quickly, and help prospective patients find treatment and appointment information without navigating a complex interface.",
      solution:
        "We delivered a responsive website with clear treatment discovery, prominent appointment calls to action, clinic information, contact and location details, visual service presentation, and a focused mobile experience. The design balances a professional healthcare tone with approachable content and direct navigation.",
      techStack: ["React", "TypeScript", "HTML", "CSS"],
      processNotes:
        "The site was structured around the patient journey: understand the clinic, explore services and treatments, review practical information, and start an appointment enquiry. Reusable frontend sections keep the experience consistent across the site.",
      results: null,
      lessonsLearned: null,
      thumbnailPath: null,
      completedAt: "2026-08-01T00:00:00.000Z",
      published: true,
      seoTitle: "Ora-Care Dental Website Project | TurboByte Portfolio",
      seoDescription:
        "See how TurboByte designed and developed the responsive Ora-Care Dental & Root Canal Centre website in React and TypeScript.",
    })
    .onConflictDoNothing({ target: projectsTable.slug })
    .returning({ id: projectsTable.id });

  return insertedProjects.length > 0;
}