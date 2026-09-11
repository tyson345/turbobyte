# TurboByte Tech Solutions

The TurboByte Tech Solutions website is a Vite/React single-page marketing
site backed by an Express API, PostgreSQL/Drizzle data access, Supabase
authentication and storage, and optional Resend and Anthropic integrations.
The repository is a pnpm workspace containing the website, API, and reusable
libraries.

## Prerequisites

- Node.js 22 or newer (Node 24 is used by the Replit configuration). The root
  launcher uses the built-in `process.loadEnvFile`, so Node 22+ is required.
- pnpm 10 (the repository pins `pnpm@10.26.1`).
- A PostgreSQL database for API features and schema pushes. Supabase Postgres
  is the supported hosted option.

## Clone and install

```sh
git clone <repository-url> turbobyte
cd turbobyte
pnpm install --frozen-lockfile
cp .env.example .env
```

Fill in `.env` for the services you intend to use. `.env` and other `.env*`
files are ignored by git; `.env.example` contains placeholders and is safe to
commit. Never put a database password, service-role key, S3 secret, Resend
secret, or Anthropic secret in source control.

## Database schema

The Drizzle schema lives in `lib/db/src/schema/` and is exported through
`lib/db/src/schema/index.ts`. The root command loads the repository `.env` and
then runs Drizzle Kit against `DATABASE_URL`:

```sh
pnpm run db:push
```

Use `db:push` for development schema synchronization. Review the Drizzle
schema and use an appropriately reviewed migration process before changing a
production database. The database URL must be a PostgreSQL connection string;
Supabase's transaction pooler URL with `sslmode=require` is suitable for
hosted deployments.

## Development

Run both local services from the repository root:

```sh
pnpm run dev
```

The dependency-free Node launcher loads `.env`, builds the API bundle, and
starts:

| Service | Port | Role |
| --- | ---: | --- |
| Express API | `8080` | `/api/*` routes and background email/blog jobs |
| Vite web app | `5173` | React development server |

Open <http://localhost:5173>. The launcher gives Vite an explicit
`API_PROXY_TARGET=http://127.0.0.1:8080`, so local `/api/*` requests are
proxied to Express. The Vite configuration intentionally has no proxy unless
`API_PROXY_TARGET` is set: direct Replit artifact workflows continue to use
Replit's shared `/api` service routing.

The launcher passes the complete root environment to Vite. Vite exposes only
variables prefixed with `VITE_` to browser code, so values such as
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` work from the root `.env`
without copying an environment file into the web artifact.

To run an individual workspace in the same way as the existing Replit
workflows, use for example:

```sh
pnpm --filter @workspace/turbobyte run dev
pnpm --filter @workspace/api-server run dev
```

## Typecheck and build

```sh
pnpm run typecheck
pnpm run build
```

`build` is handled by the root Node launcher, which loads `.env` before
starting the inner `build:workspace` task. This ensures root `VITE_*` values
are available while Vite embeds the frontend configuration. The inner task
runs the full typecheck first, then builds workspace packages; it is split out
so the launcher does not recurse into `build`.

The production outputs used by the portable launcher are:

- `artifacts/api-server/dist/index.mjs` — bundled Express API
- `artifacts/turbobyte/dist/public/` — built SPA assets and `index.html`

## Production-style local start

Build once, then start the API and a small Node static SPA server:

```sh
pnpm run build
pnpm start
```

`start` loads `.env`, starts the API on port `8080`, and serves the built
frontend on port `5173`. The static server forwards `/api` and `/api/*` to the
API while serving all other paths from the SPA, including client-side route
fallbacks. It uses only Node built-ins and does not add a runtime dependency.

Override the two ports independently when needed:

```sh
API_PORT=8088 WEB_PORT=4173 pnpm start
```

The legacy `PORT` variable is accepted as the API-port fallback. `API_PORT`
and `WEB_PORT` are preferred because the API and frontend are separate
processes. `pnpm start` expects the build outputs to exist and reports a
specific error if `pnpm run build` has not been run.

## Environment reference

Copy `.env.example` to `.env` and set only the integrations you need.

| Variable | Used by | Notes |
| --- | --- | --- |
| `DATABASE_URL` | API, `db:push` | PostgreSQL connection string; required for database-backed routes |
| `API_PORT` / `WEB_PORT` | launcher | Separate local API and web ports; defaults are `8080` / `5173` |
| `PORT` | API compatibility | Legacy API-port fallback when `API_PORT` is absent |
| `VITE_SUPABASE_URL` | browser | Public Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | browser | Public/publishable Supabase key; never use `service_role` here |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | API | Worker/API auth verification settings |
| `OBJECT_STORAGE_*` | API/browser upload flow | Supabase S3-compatible storage settings |
| `RESEND_API_KEY` | API | Secret for email notifications; queued/skipped when absent |
| `NOTIFY_EMAIL` / `NOTIFY_FROM` | API | Notification recipient and sender |
| `PUBLIC_SITE_URL` | API | Canonical URL used in email links |
| `ADMIN_EMAILS` | API | Comma-separated admin email allowlist |
| `ALLOWED_ORIGINS` | API | Comma-separated browser origins for CORS |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_BASE_URL` | API | Optional AI demo integration |
| `NODE_ENV` / `LOG_LEVEL` | API | Runtime mode and Pino log level |
| `BASE_PATH` | Vite | Asset base path; `/` for the root website |

Only `VITE_*` variables are bundled into frontend JavaScript. All other
secrets remain server-side. Replit shared environment values and Cloudflare
Worker secrets are configured by their respective platforms rather than
committed to this repository.

## Features

- Responsive TurboByte marketing site with the official 19-service catalog,
  category pages, company information, contact and careers flows.
- Searchable/filterable portfolio and project/case-study pages, including
  published content and related work.
- Blog and newsletter subscription experiences, including unsubscribe links
  and background announcement processing.
- Admin-only lead, project, case-study, recruitment, and content operations
  protected by Supabase authentication and API authorization.
- API-backed object-storage uploads and private/public media proxying.
- Optional AI prototype and transactional email integrations.

## Replit and Cloudflare compatibility

The root launcher is an additional portable local/Node entry point; it does
not replace the existing Replit artifact manifests or workflows. Replit's
artifact services continue to run on their configured ports and shared proxy.
The Cloudflare Worker remains `artifacts/api-server/src/worker.ts`, with its
deployment settings in `artifacts/api-server/wrangler.toml`:

```sh
pnpm --filter @workspace/api-server run deploy:worker
```

Keep Cloudflare secrets in Wrangler/Cloudflare environment settings. The
portable Node launcher is for local development and a conventional Node host;
it does not alter Worker bindings, routes, cron triggers, or compatibility
flags.