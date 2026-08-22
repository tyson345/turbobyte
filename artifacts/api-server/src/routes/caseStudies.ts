import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { caseStudiesTable } from "@workspace/db";
import { ListCaseStudiesResponse, GetCaseStudyResponse } from "@workspace/api-zod";
import { getDb } from "../lib/context";

const router: IRouter = Router();

router.get("/case-studies", async (_req, res): Promise<void> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(caseStudiesTable)
    .orderBy(desc(caseStudiesTable.createdAt));
  res.json(ListCaseStudiesResponse.parse(rows));
});

router.get("/case-studies/:slug", async (req, res): Promise<void> => {
  const db = getDb();
  const raw = req.params.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  const [row] = await db
    .select()
    .from(caseStudiesTable)
    .where(eq(caseStudiesTable.slug, slug));
  if (!row) {
    res.status(404).json({ error: "Case study not found" });
    return;
  }
  res.json(GetCaseStudyResponse.parse(row));
});

export default router;
