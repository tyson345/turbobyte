// One-off idempotent seed: copies the original hardcoded case study into the DB.
// Run with: pnpm --filter @workspace/db exec tsx src/seed-case-studies.ts
import { db, pool } from "./index";
import { caseStudiesTable } from "./schema";

const seed = [
  {
    slug: "logistics-invoice-automation",
    title: "AI Invoice Processing for a Regional Logistics Firm",
    tagline:
      "Replaced a manual three-person invoicing workflow with an AI-powered pipeline that processes 2,000+ documents a month at 99 % accuracy.",
    category: "AI Automation",
    tags: ["AI / LLM", "Document Extraction", "ERP Integration", "Process Automation"],
    metricLabel: "Reduction in processing time",
    metricValue: "94 %",
    secondaryMetricLabel: "Extraction accuracy",
    secondaryMetricValue: "99.2 %",
    completedAt: "June 2026",
    client: "A regional freight & logistics operator (South-East US, ~120 employees)",
    summary:
      "A regional logistics firm was spending more than 300 person-hours every month manually keying supplier invoices into their ERP. TurboByte designed and shipped an AI extraction pipeline that cut processing time by 94 %, paid back its cost inside six weeks, and freed the finance team to focus on exception-handling rather than data entry.",
    challenge: `The client's accounts-payable team was manually processing over 2,000 supplier invoices every month — a mix of PDFs, scanned paper documents, and email attachments in at least a dozen different layouts. Three full-time staff members spent roughly 60 % of their working hours on data entry alone, and the error rate was high enough that month-end reconciliation routinely ran two to three days over budget.

The real blocker was scale: headcount couldn't keep up with invoice volume growth, yet hiring more data-entry staff wasn't economically viable. Leadership needed the process to become self-sustaining before the next fiscal year.`,
    solution: `We designed a fully automated document-processing pipeline anchored on a fine-tuned extraction layer built around GPT-4o's vision capabilities, sitting in front of a lightweight validation engine we wrote from scratch.

**Document ingestion** — Invoices arrive via three channels (email attachment, supplier portal upload, and a shared network folder). A set of lightweight listeners normalise each source into a single internal queue.

**AI extraction** — Each document is passed to the extraction model with a vendor-specific schema prompt that we built and iterated against the client's real invoice corpus. The model returns structured JSON covering line items, totals, tax codes, purchase-order references, and payment terms.

**Confidence scoring & routing** — Every extracted field carries a confidence score. High-confidence documents (>95 % across all fields) are pushed straight to the ERP via REST webhook. Lower-confidence documents surface in a lightweight review UI where a single staff member can confirm or correct a flagged field in under thirty seconds.

**ERP integration** — We integrated directly with the client's existing NetSuite instance using a stateless webhook adapter, so there was no database to maintain on our side.

**Observability** — A simple dashboard tracks daily throughput, per-vendor accuracy trends, and the proportion of documents requiring human review — giving the finance manager a live pulse on the pipeline without needing to open a ticket.

The entire build took eight weeks from kickoff to production, including a two-week parallel-run period where AI output was verified against the manual process before the team cut over fully.`,
    outcomes: [
      "94 % reduction in time spent on invoice data entry — from ~300 hrs/month to under 18 hrs/month",
      "99.2 % field-extraction accuracy across all document types in the first 60 days of production",
      "Full return on investment achieved within 6 weeks of go-live",
      "Finance team headcount requirement reduced by 1.5 FTEs through natural attrition (no redundancies)",
      "Month-end close shortened by 2 days on average due to cleaner, real-time AP data",
      "Pipeline handling 2,400+ invoices/month at launch with headroom to 10× before needing infrastructure changes",
    ],
    techStack: [
      "OpenAI GPT-4o (vision + structured outputs)",
      "Python (FastAPI)",
      "PostgreSQL",
      "React + TypeScript (review UI)",
      "NetSuite REST API",
      "AWS Lambda + S3",
      "Resend (notification emails)",
    ],
    engagementType: "Fixed-scope delivery + 3-month support retainer",
    duration: "8 weeks to production",
  },
];

async function main() {
  for (const cs of seed) {
    await db.insert(caseStudiesTable).values(cs).onConflictDoNothing();
  }
  console.log("Seeded case studies:", seed.length);
  await pool.end();
}

main();
