import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsletterRouter from "./newsletter";
import inquiriesRouter from "./inquiries";
import caseStudiesRouter from "./caseStudies";
import projectsRouter from "./projects";
import storageRouter from "./storage";
import careersRouter from "./careers";
import { demoRouter } from "./demo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(newsletterRouter);
router.use(inquiriesRouter);
router.use(caseStudiesRouter);
router.use(projectsRouter);
router.use(storageRouter);
router.use(careersRouter);
router.use(demoRouter);

export default router;
