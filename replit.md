# TurboByte Tech Solutions Website

Marketing website for TurboByte Tech Solutions Private Limited — an AI-first technology company (Bengaluru, founded 2026) — showcasing its 19-service catalog, company info, and contact channels.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env (email notifications, defaults in parentheses): `NOTIFY_EMAIL` — alert recipient (`aae@turbobytetech.com`); `NOTIFY_FROM` — sender address (`TurboByte Inquiries <inquiries@turbobytetech.com>`); `PUBLIC_SITE_URL` — public site URL used in email links (`https://turbobytetechsolutions.com`); `RESEND_API_KEY` — Resend key (emails skipped/queued if missing)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/turbobyte/` — the website (Vite + React + wouter + Tailwind/shadcn, dark theme)
- `artifacts/turbobyte/src/config/site.ts` — single source of truth for company identity: name, tagline, email/phone/address, hours, response time, mission/vision/values/highlights, social URLs (empty by default → icons hidden)
- `artifacts/turbobyte/src/config/services.ts` — official 19-service catalog grouped into 6 categories; drives services page, home cards, navbar dropdown, footer links, and form selectors
- `artifacts/turbobyte/src/assets/` — brand logo images; `public/` — favicon, icons, OG image, web manifest

## Architecture decisions

- Company info must never be hard-coded in components — always read from `src/config/site.ts`
- Service category pages are one dynamic route (`/services/:category`) rendering a shared template; legacy slugs (ai-ml, cloud, software, cybersecurity, data, devops) redirect to the closest official category
- Social icons render only when a URL is set in `socialLinks` (all empty by default)
- Forms are front-end only (local success state); no backend submission exists yet

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
