import { Router, type IRouter } from "express";
import { eq, desc, asc, inArray } from "drizzle-orm";
import {
  db,
  projectsTable,
  projectImagesTable,
  projectCategoriesTable,
  type Project,
  type ProjectImage,
} from "@workspace/db";
import {
  ListProjectsResponse,
  GetProjectResponse,
  AdminListProjectsResponse,
  AdminCreateProjectBody,
  AdminCreateProjectResponse,
  AdminUpdateProjectBody,
  AdminUpdateProjectResponse,
  AdminAddProjectImageBody,
  AdminAddProjectImageResponse,
  ListProjectCategoriesResponse,
  AdminCreateProjectCategoryBody,
  AdminCreateProjectCategoryResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function serialize(project: Project, images: ProjectImage[]) {
  return {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    images: images
      .filter((img) => img.projectId === project.id)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
      .map(({ createdAt: _createdAt, ...img }) => img),
  };
}

async function loadImages(projectIds: number[]): Promise<ProjectImage[]> {
  if (projectIds.length === 0) return [];
  return db
    .select()
    .from(projectImagesTable)
    .where(inArray(projectImagesTable.projectId, projectIds));
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

// ---------- Public ----------

router.get("/projects", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.published, true))
    .orderBy(desc(projectsTable.createdAt));
  const images = await loadImages(rows.map((r) => r.id));
  res.json(ListProjectsResponse.parse(rows.map((r) => serialize(r, images))));
});

router.get("/projects/:slug", async (req, res): Promise<void> => {
  const raw = req.params.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  const [row] = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug));
  if (!row || !row.published) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const images = await loadImages([row.id]);
  res.json(GetProjectResponse.parse(serialize(row, images)));
});

router.get("/project-categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(projectCategoriesTable)
    .orderBy(asc(projectCategoriesTable.name));
  res.json(
    ListProjectCategoriesResponse.parse(rows.map(({ createdAt: _c, ...rest }) => rest)),
  );
});

// ---------- Admin ----------

router.get("/admin/projects", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt));
  const images = await loadImages(rows.map((r) => r.id));
  res.json(AdminListProjectsResponse.parse(rows.map((r) => serialize(r, images))));
});

router.post("/admin/projects", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid project", details: parsed.error.issues });
    return;
  }
  const data = parsed.data;
  try {
    const [row] = await db
      .insert(projectsTable)
      .values({ ...data, slug: slugify(data.slug) })
      .returning();
    res.status(201).json(AdminCreateProjectResponse.parse(serialize(row, [])));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "A project with this slug already exists" });
      return;
    }
    throw error;
  }
});

router.patch("/admin/projects/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = AdminUpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid update", details: parsed.error.issues });
    return;
  }
  const data = { ...parsed.data };
  if (data.slug) data.slug = slugify(data.slug);
  try {
    const [row] = await db
      .update(projectsTable)
      .set(data)
      .where(eq(projectsTable.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const images = await loadImages([row.id]);
    res.json(AdminUpdateProjectResponse.parse(serialize(row, images)));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "A project with this slug already exists" });
      return;
    }
    throw error;
  }
});

router.delete("/admin/projects/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await db.delete(projectsTable).where(eq(projectsTable.id, id)).returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.status(204).end();
});

router.post("/admin/projects/:id/images", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = AdminAddProjectImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid image", details: parsed.error.issues });
    return;
  }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const [row] = await db
    .insert(projectImagesTable)
    .values({ projectId: id, ...parsed.data })
    .returning();
  const { createdAt: _c, ...img } = row;
  res.status(201).json(AdminAddProjectImageResponse.parse(img));
});

router.delete("/admin/project-images/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await db
    .delete(projectImagesTable)
    .where(eq(projectImagesTable.id, id))
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  res.status(204).end();
});

router.post("/admin/project-categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateProjectCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }
  const name = parsed.data.name.trim();
  if (!name) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }
  try {
    const [row] = await db
      .insert(projectCategoriesTable)
      .values({ name, slug: slugify(name) })
      .returning();
    const { createdAt: _c, ...cat } = row;
    res.status(201).json(AdminCreateProjectCategoryResponse.parse(cat));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "Category already exists" });
      return;
    }
    throw error;
  }
});

router.delete("/admin/project-categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await db
    .delete(projectCategoriesTable)
    .where(eq(projectCategoriesTable.id, id))
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.status(204).end();
});

export default router;
