# TurboByte — Cloudflare + Supabase Deployment Guide

> **Scope** — This guide covers everything needed to take the monorepo from
> Replit to a production stack on **Cloudflare Pages** (SPA) + **Cloudflare
> Workers** (API server) + **Supabase** (Postgres, Auth, S3-compatible
> Storage). It does **not** alter any package files, application code, Wrangler
> config, or Replit instructions.

---

## Table of Contents

1. [Architecture overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Supabase project setup](#3-supabase-project-setup)
4. [Environment variables — non-secret vs secret](#4-environment-variables)
5. [Database migration (pg_dump / pg_restore)](#5-database-migration)
6. [Storage migration (object key-preserving copy)](#6-storage-migration)
7. [pnpm monorepo build & output settings](#7-pnpm-monorepo-build--output-settings)
8. [Cloudflare Workers deploy (API server)](#8-cloudflare-workers-deploy-api-server)
9. [Cloudflare Pages deploy (SPA)](#9-cloudflare-pages-deploy-spa)
10. [SPA routing — `_redirects`](#10-spa-routing--_redirects)
11. [DNS — apex + www](#11-dns--apex--www)
12. [Resend email configuration](#12-resend-email-configuration)
13. [Anthropic AI (optional external key)](#13-anthropic-ai-optional-external-key)
14. [Backups](#14-backups)
15. [Rollback](#15-rollback)
16. [Free-tier caveats](#16-free-tier-caveats)
17. [Post-deploy validation](#17-post-deploy-validation)

---

## 1. Architecture overview

```
Browser
  │
  ├─ GET /api/*  ──────────────► Cloudflare Worker  (turbobyte-api-server)
  │                                    │
  │                                    ├── Postgres   → Supabase DB
  │                                    ├── Auth JWTs  → Supabase Auth (verified by the API)
  │                                    └── S3 uploads → Supabase Storage (S3-compat endpoint)
  │
  └─ GET /* ────────────────────► Cloudflare Pages  (turbobyte SPA)
                                       └── index.html (_redirects catch-all)
```

Routes are split at the Cloudflare level by pattern:

| Pattern | Served by |
|---|---|
| `turbobytetechsolutions.com/api/*` | Cloudflare Worker |
| `www.turbobytetechsolutions.com/api/*` | Cloudflare Worker |
| `turbobytetechsolutions.com/*` | Cloudflare Pages |
| `www.turbobytetechsolutions.com/*` | Cloudflare Pages |

---

## 2. Prerequisites

| Tool | Minimum version | Notes |
|---|---|---|
| Node.js | 24 | Match Replit runtime |
| pnpm | 9+ | Workspace manager |
| Wrangler CLI | 4+ | Installed in the API workspace; run with `pnpm` |
| Supabase CLI | Current | Optional; dashboard setup also works |
| PostgreSQL client | 15+ | `pg_dump` / `pg_restore` / `psql` |
| AWS CLI v2 | 2.x | S3-compat object copy |

Accounts required:

- Cloudflare (the free tier may be enough for low traffic; verify current limits)
- Supabase (verify the current free-tier database and storage limits)
- Resend (verify the current sending and domain limits)
- Anthropic (optional; only needed for the AI demo feature)

---

## 3. Supabase project setup

### 3.1 Create the project

1. Log in at <https://supabase.com/dashboard>.
2. **New project** → name `turbobyte` → region **Asia South (Mumbai)** →
   generate a strong database password and save it.
3. Wait for provisioning (~2 minutes).

### 3.2 Collect credentials

From **Project Settings → API**:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | "Project URL" |
| `VITE_SUPABASE_ANON_KEY` | "Project API keys → anon / public" |

From **Project Settings → Database → Connection string (URI)**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Full `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` |

> **Tip — connection pooling.** For Workers (many short-lived connections) use
> the **Transaction** pooler string on port 6543 instead of port 5432. Find it
> in *Project Settings → Database → Connection pooling*.

### 3.3 Enable Supabase Auth

1. **Authentication → Providers** — enable Email/Password.
2. **Authentication → URL Configuration** — add allowed redirect URLs:
   - `https://turbobytetechsolutions.com/**`
   - `https://www.turbobytetechsolutions.com/**`
3. Optionally enable social providers (Google, GitHub) from the same panel.

The frontend reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at
runtime. The lightweight native-fetch client in
`artifacts/turbobyte/src/lib/supabase.ts` handles sign-in, session refresh,
and sign-out without the full `@supabase/supabase-js` package.

### 3.4 Configure Supabase Storage (S3-compatible)

1. **Storage → Create bucket** — create `turbobyte-private` as a private bucket.
   The API proxies published project media after checking database references;
   resumes, drafts, and orphaned uploads remain private.
2. **Project Settings → S3 Connection** (or Storage → Credentials):
   - Copy **Access Key ID** → `OBJECT_STORAGE_ACCESS_KEY_ID`
   - Copy **Secret Access Key** → `OBJECT_STORAGE_SECRET_ACCESS_KEY`
   - The S3 endpoint is always
     `https://[PROJECT-REF].supabase.co/storage/v1/s3`
3. The uppy `@uppy/aws-s3` plugin in `lib/object-storage-web` uses these
   credentials to generate presigned PUT URLs through the API server.

### 3.5 Configure Storage CORS for direct browser uploads

Project images and resumes are uploaded directly from the browser to the
private Supabase bucket with short-lived presigned `PUT` URLs. Configure the
bucket to accept those cross-origin requests from the production domains.

Create a local file named `storage-cors.json`:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://turbobytetechsolutions.com",
        "https://www.turbobytetechsolutions.com"
      ],
      "AllowedMethods": ["PUT"],
      "AllowedHeaders": ["Content-Type"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

Apply it with the Supabase S3 credentials collected in §3.4:

```bash
aws s3api put-bucket-cors \
  --bucket turbobyte-private \
  --cors-configuration file://storage-cors.json \
  --endpoint-url https://[PROJECT-REF].supabase.co/storage/v1/s3 \
  --region ap-south-1
```

If Cloudflare Pages preview deployments also need uploads, add only the exact
preview origins used for authorized testing; do not use `*` for this private
bucket. The API's own CORS setting is separate and is controlled by
`ALLOWED_ORIGINS`.

---

## 4. Environment variables

### 4.1 Classification

| Variable | Kind | Set where |
|---|---|---|
| `NODE_ENV` | public | `wrangler.toml [vars]` / Pages env |
| `PORT` | public | `wrangler.toml [vars]` (Workers ignore it; Pages don't need it) |
| `VITE_SUPABASE_URL` | public | Pages build env |
| `VITE_SUPABASE_ANON_KEY` | public | Pages build env |
| `SUPABASE_URL` | public | Worker variable |
| `SUPABASE_ANON_KEY` | public | Worker variable |
| `ALLOWED_ORIGINS` | public | Worker variable |
| `NOTIFY_EMAIL` | public | `wrangler.toml [vars]` |
| `NOTIFY_FROM` | public | `wrangler.toml [vars]` |
| `PUBLIC_SITE_URL` | public | `wrangler.toml [vars]` |
| `ADMIN_EMAILS` | public | `wrangler.toml [vars]` |
| `LOG_LEVEL` | public | `wrangler.toml [vars]` |
| `ANTHROPIC_BASE_URL` | public | Optional Worker variable |
| `OBJECT_STORAGE_ENDPOINT` | public | Worker variable |
| `OBJECT_STORAGE_REGION` | public | Worker variable |
| `OBJECT_STORAGE_BUCKET` | public | Worker variable |
| `OBJECT_STORAGE_PUBLIC_BUCKET` | public | Optional Worker variable |
| `DATABASE_URL` | **secret** | `wrangler secret put DATABASE_URL` |
| `RESEND_API_KEY` | **secret** | `wrangler secret put RESEND_API_KEY` |
| `OBJECT_STORAGE_ACCESS_KEY_ID` | **secret** | `wrangler secret put OBJECT_STORAGE_ACCESS_KEY_ID` |
| `OBJECT_STORAGE_SECRET_ACCESS_KEY` | **secret** | `wrangler secret put OBJECT_STORAGE_SECRET_ACCESS_KEY` |
| `ANTHROPIC_API_KEY` | **secret** | `wrangler secret put ANTHROPIC_API_KEY` |

> **Rule of thumb** — any value you'd rotate if leaked = secret.
> Public values may appear in `wrangler.toml [vars]` or be baked into the
> Vite bundle. Secrets live only in Cloudflare's encrypted secret store.

### 4.2 Setting secrets (Workers)

```bash
# Run once per secret from the repo root (requires `wrangler login` first).
cd artifacts/api-server

wrangler secret put DATABASE_URL
wrangler secret put RESEND_API_KEY
wrangler secret put OBJECT_STORAGE_ACCESS_KEY_ID
wrangler secret put OBJECT_STORAGE_SECRET_ACCESS_KEY
# Optional — only if AI demo is enabled:
wrangler secret put ANTHROPIC_API_KEY
```

Each command prompts for the value interactively — it is never echoed or
stored in shell history.

### 4.3 Setting build-time env (Pages)

In the Cloudflare dashboard → **Pages → turbobyte → Settings →
Environment variables → Build-time**:

```
VITE_SUPABASE_URL          = https://[PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY     = eyJ...
BASE_PATH                  = /
```

`VITE_*` and `BASE_PATH` are consumed by Vite at build time and baked into
`dist/public/assets/*.js`. They are safe to expose in the browser bundle.

---

## 5. Database migration

### 5.1 Dump from source (Replit / any Postgres)

```bash
# Replace <SOURCE_DSN> with the Replit DATABASE_URL.
pg_dump \
  --no-owner \
  --no-privileges \
  --format=custom \
  --file=turbobyte_$(date +%Y%m%d).pgdump \
  "<SOURCE_DSN>"
```

Flags explained:
- `--no-owner` — strips `ALTER TABLE … OWNER TO replit_user` statements that
  won't exist in Supabase.
- `--no-privileges` — strips GRANT/REVOKE; Supabase RLS handles access.
- `--format=custom` — compressed, supports selective restore.

### 5.2 Restore to Supabase

```bash
# Replace <SUPABASE_DSN> with the Supabase DATABASE_URL (port 5432).
pg_restore \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --dbname="<SUPABASE_DSN>" \
  turbobyte_$(date +%Y%m%d).pgdump
```

`--clean --if-exists` drops and recreates objects, making the restore
idempotent on re-runs.

### 5.3 Apply Drizzle schema (first deploy or schema-only)

If migrating schema only (no data), or after restore to ensure
Drizzle's shadow tables are current:

```bash
# From repo root:
DATABASE_URL="<SUPABASE_DSN>" pnpm --filter @workspace/db run push
```

> **Never run `drizzle-kit push` against a production DB with live traffic.**
> Use it only for the initial schema setup or during a maintenance window.

### 5.4 Verify

```bash
psql "<SUPABASE_DSN>" -c "\dt"
# Expect: inquiries, subscribers, email_notifications, case_studies,
#         blog_announcements, projects, careers, demo_requests, project_images
```

---

## 6. Storage migration

The goal is to copy all objects from the source bucket (Replit GCS or any S3)
to Supabase Storage **preserving the exact object key (path)** so that all
database `thumbnail_path` and `image_path` references remain valid.

### 6.1 Configure AWS CLI for Supabase S3

```bash
aws configure set aws_access_key_id     "$OBJECT_STORAGE_ACCESS_KEY_ID"
aws configure set aws_secret_access_key "$OBJECT_STORAGE_SECRET_ACCESS_KEY"
aws configure set default.region        ap-south-1
```

### 6.2 Sync the private bucket

```bash
# From your local machine or a CI runner with access to the source objects.
aws s3 sync \
  s3://<SOURCE_PRIVATE_BUCKET>/ \
  s3://turbobyte-private/ \
  --endpoint-url https://[PROJECT-REF].supabase.co/storage/v1/s3 \
  --no-guess-mime-type \
  --exact-timestamps
```

`--exact-timestamps` ensures that objects already copied on a second run are
skipped, making the sync idempotent. `--no-guess-mime-type` preserves
`Content-Type` metadata stored on the source objects.

### 6.3 Verify object count

```bash
# Count objects in source:
aws s3 ls --recursive s3://<SOURCE_BUCKET>/ | wc -l

# Count objects in Supabase:
aws s3 ls --recursive s3://turbobyte-private/ \
  --endpoint-url https://[PROJECT-REF].supabase.co/storage/v1/s3 | wc -l
```

### 6.4 GCS → Supabase S3 (legacy source)

Replit uses GCS under the hood. Export from GCS first:

```bash
# Install gcloud CLI and authenticate, then:
gsutil -m cp -r gs://<REPLIT_BUCKET>/* ./local-export/

# Then sync to Supabase S3:
aws s3 sync ./local-export/ s3://turbobyte-private/ \
  --endpoint-url https://[PROJECT-REF].supabase.co/storage/v1/s3
```

---

## 7. pnpm monorepo build & output settings

### 7.1 Monorepo structure

```
/                          ← workspace root (package.json)
├── artifacts/
│   ├── turbobyte/         ← SPA (Vite + React)
│   │   ├── vite.config.ts
│   │   ├── public/        ← static assets copied verbatim (incl. _redirects)
│   │   └── dist/public/   ← build output (deploy this directory to Pages)
│   └── api-server/        ← Express API (esbuild bundle)
│       ├── wrangler.toml
│       ├── src/worker.ts   ← Cloudflare Worker entry point
│       └── dist/index.mjs  ← portable Node server build
├── lib/                   ← shared workspace packages
└── pnpm-workspace.yaml
```

### 7.2 Build commands

**Full workspace build** (typecheck + all packages):

```bash
pnpm run build
```

**SPA only** (fastest for Pages CI):

```bash
BASE_PATH=/ pnpm --filter @workspace/turbobyte run build
```

Output: `artifacts/turbobyte/dist/public/`

**API server only** (portable Node build):

```bash
pnpm --filter @workspace/api-server run build
```

Output: `artifacts/api-server/dist/index.mjs`. Wrangler bundles
`src/worker.ts` and its imports directly for the Worker deployment.

### 7.3 Cloudflare Pages build settings

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `BASE_PATH=/ pnpm --filter @workspace/turbobyte run build` |
| Build output directory | `artifacts/turbobyte/dist/public` |
| Root directory | `/` (repo root) |
| Node.js version | 24 |
| pnpm version | Set via `COREPACK_ENABLE_STRICT=0` + `engines.pnpm` or the Pages preset |

`PORT` and `BASE_PATH` both have portable local defaults. Set `BASE_PATH=/`
explicitly in Pages so the production asset path is unambiguous.

### 7.4 Key Vite settings (do not change)

| Config key | Value | Reason |
|---|---|---|
| `base` | `process.env.BASE_PATH` | Prefix for all asset URLs; must be `/` for Pages |
| `build.outDir` | `dist/public` (relative to artifact root) | Pages deploy target |
| `build.emptyOutDir` | `true` | Clean stale files between builds |

The Vite config contains no host-specific plugins or required platform
variables.

---

## 8. Cloudflare Workers deploy (API server)

### 8.1 Login

```bash
wrangler login
```

### 8.2 First deploy

```bash
cd artifacts/api-server

# Wrangler bundles src/worker.ts and all workspace imports:
pnpm run deploy:worker
```

The Worker name (`turbobyte-api-server`) and routes are already defined in
`artifacts/api-server/wrangler.toml`.

### 8.3 Subsequent deploys

```bash
pnpm --filter @workspace/api-server run deploy:worker
```

### 8.4 Verify the Worker is live

```bash
curl -si https://turbobytetechsolutions.com/api/healthz | head -5
# Expect: HTTP/2 200
```

### 8.5 Cron trigger

The `wrangler.toml` registers a `* * * * *` cron that fires
`processDueNotifications` (email-queue sweep) and `announceNewBlogPosts`. No
further configuration is needed — Cloudflare schedules it automatically after
deploy.

---

## 9. Cloudflare Pages deploy (SPA)

### 9.1 Connect the repository

1. Cloudflare dashboard → **Workers & Pages → Create application → Pages →
   Connect to Git**.
2. Select the repo, set **Production branch** to `main`.
3. Apply the build settings from §7.3.
4. Add all `VITE_*` environment variables from §4.3.
5. Click **Save and Deploy**.

### 9.2 CLI deploy (optional)

```bash
# Build first:
BASE_PATH=/ pnpm --filter @workspace/turbobyte run build

# Deploy the pre-built output:
wrangler pages deploy artifacts/turbobyte/dist/public \
  --project-name turbobyte \
  --branch main
```

### 9.3 Custom domain

In Pages → **Custom domains → Set up a custom domain**:

- Add `turbobytetechsolutions.com`
- Add `www.turbobytetechsolutions.com`

Cloudflare issues TLS certificates automatically.

---

## 10. SPA routing — `_redirects`

The file `artifacts/turbobyte/public/_redirects` contains:

```
/api/* /api-not-found.json 200
/* /index.html 200
```

Vite copies everything in `public/` verbatim to `dist/public/`. Cloudflare
Pages reads `_redirects` at serve time. The first rule prevents `/api/*` from
ever returning the SPA shell on a Pages preview domain. On the production
custom domain the more-specific Worker route intercepts `/api/*` before Pages.
The second rule returns `index.html` for client-side application routes.

> **Do not add an HTML 404 rule** — a 200 is required so the browser receives
> the SPA shell and the router can display its own not-found page.

---

## 11. DNS — apex + www

### 11.1 Add the domain to Cloudflare

1. Cloudflare dashboard → **Add a Site** → enter `turbobytetechsolutions.com`.
2. Choose the **Free** plan.
3. Cloudflare will show the nameservers to set at your registrar (e.g.
   `alice.ns.cloudflare.com`, `bob.ns.cloudflare.com`).
4. Update nameservers at your domain registrar and wait for propagation
   (usually < 24 hours).

### 11.2 DNS records

After nameservers propagate, Cloudflare manages DNS. Pages and Workers add
their own records automatically when you attach a custom domain.
Verify these records exist (or add them manually):

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `@` (apex) | `turbobyte.pages.dev` | ✅ Proxied |
| CNAME | `www` | `turbobyte.pages.dev` | ✅ Proxied |

> **Apex CNAME** — Cloudflare supports CNAME flattening at the apex, so a
> CNAME for `@` is valid on Cloudflare even though it is non-standard DNS.

### 11.3 Redirect www → apex (or vice versa)

In **Cloudflare → Rules → Redirect Rules**, create a rule:

- **When** incoming request matches `www.turbobytetechsolutions.com/*`
- **Then** redirect to `https://turbobytetechsolutions.com/${path}` — 301

Or redirect apex to www — whichever is the canonical form.

### 11.4 Worker routes

Worker routes defined in `wrangler.toml` take effect automatically once:

1. The domain is active in Cloudflare.
2. `wrangler deploy` has been run at least once.

Cloudflare evaluates routes before Pages, so `/api/*` requests are intercepted
by the Worker and never reach Pages.

---

## 12. Resend email configuration

1. Create a **Resend** account at <https://resend.com>.
2. **Domains → Add Domain** — add `turbobytetechsolutions.com`.
3. Add the DNS records Resend provides (SPF, DKIM, DMARC) in Cloudflare DNS.
4. Generate an **API Key** with *Send* permission.
5. Set the secret on the Worker:
   ```bash
   cd artifacts/api-server
   wrangler secret put RESEND_API_KEY
   ```
6. Set public vars in `wrangler.toml [vars]` or via the dashboard:
   ```toml
   [vars]
   NOTIFY_EMAIL  = "aae@turbobytetech.com"
   NOTIFY_FROM   = "TurboByte Inquiries <inquiries@turbobytetechsolutions.com>"
   PUBLIC_SITE_URL = "https://turbobytetechsolutions.com"
   ```

If `RESEND_API_KEY` is absent, the email notification system queues messages
and retries on the next cron tick. No emails are silently dropped — they are
stored in the `email_notifications` table until a key is set.

---

## 13. Anthropic AI (optional external key)

The AI demo feature uses `lib/integrations-anthropic-ai`, which reads
`ANTHROPIC_API_KEY` and an optional `ANTHROPIC_BASE_URL`.

On Cloudflare Workers you have two options:

**Option A — Direct Anthropic key (recommended for production)**

```bash
cd artifacts/api-server
pnpm exec wrangler secret put ANTHROPIC_API_KEY
# Enter your sk-ant-... key when prompted
```

No base URL is needed for the official Anthropic API. Only set
`ANTHROPIC_BASE_URL` when intentionally using a compatible custom endpoint:

```toml
ANTHROPIC_BASE_URL = "https://api.anthropic.com"
```

**Option B — Leave the AI demo disabled**

Do not set `ANTHROPIC_API_KEY`. The Worker still starts; requests to the AI
prototype endpoint fail without consuming external AI usage.

---

## 14. Backups

### 14.1 Automated Supabase backups

Supabase Pro plan includes daily automated backups with a 7-day retention
window and point-in-time recovery (PITR). The Free tier does **not** include
automated backups — set up manual backups (see below).

### 14.2 Manual database backup (free tier)

Create a cron job (e.g. GitHub Actions scheduled workflow, local crontab, or
a Cloudflare Worker cron):

```bash
#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="turbobyte_${TIMESTAMP}.pgdump"

pg_dump \
  --no-owner \
  --no-privileges \
  --format=custom \
  --file="/backups/${FILENAME}" \
  "${DATABASE_URL}"

# Upload to a separate S3 bucket or object store:
aws s3 cp "/backups/${FILENAME}" "s3://turbobyte-backups/${FILENAME}"

# Prune backups older than 30 days:
find /backups -name "*.pgdump" -mtime +30 -delete
```

Recommended schedule: daily at 02:00 UTC.

### 14.3 Storage backup

```bash
# Mirror Supabase storage to a separate backup bucket:
aws s3 sync \
  s3://turbobyte-private/ \
  s3://turbobyte-backups/storage/private/ \
  --endpoint-url https://[PROJECT-REF].supabase.co/storage/v1/s3
```

---

## 15. Rollback

### 15.1 Cloudflare Pages rollback

Pages retains all previous deployments.

1. Dashboard → **Pages → turbobyte → Deployments**.
2. Find the last known-good deployment.
3. Click **⋮ → Rollback to this deployment**.

Or via CLI:

```bash
# List recent deployments:
wrangler pages deployment list --project-name turbobyte

# Roll back to a specific deployment ID:
wrangler pages deployment rollback <DEPLOYMENT_ID> \
  --project-name turbobyte
```

### 15.2 Cloudflare Workers rollback

```bash
# List Worker versions:
wrangler deployments list --name turbobyte-api-server

# Roll back to a previous version:
wrangler rollback --name turbobyte-api-server
# (Interactive: choose a version from the list)
```

### 15.3 Database rollback

If a schema migration was applied and needs to be reverted:

1. Restore from the most recent backup (§14.2).
2. If only data was changed, write a compensating SQL script and run it via
   `psql`.

> **There is no automatic Drizzle migration rollback.** Plan schema changes
> carefully; always take a backup immediately before applying a migration.

---

## 16. Free-tier caveats

| Service | Free-tier item to verify | Impact |
|---|---|---|
| Cloudflare Pages | Current build quota | Deploy frequency consumes this quota |
| Cloudflare Workers | Current requests, CPU, and subrequest limits | AI and database-heavy routes need monitoring |
| Supabase Postgres | Current database size and egress limits | Monitor data and connection-pool usage |
| Supabase Auth | Current monthly-active-user limits | Only internal admin accounts are expected |
| Supabase Storage | Current storage and egress limits | Project media and resumes consume this quota |
| Resend | Current sending and domain limits | Newsletter volume can outgrow the free tier |

**Workers CPU limit** — The AI demo feature calls Anthropic synchronously.
External request wait time and local CPU time are measured differently, but
the current Worker limits should still be checked before enabling public AI
traffic.

**Supabase free project availability** — Pause and inactivity policies can
change. Review the current Supabase policy before cutover and do not rely on
artificial keep-alive traffic as a substitute for an appropriate production
plan.

---

## 17. Post-deploy validation

Run these checks immediately after each deploy:

### 17.1 Health check

```bash
curl -si https://turbobytetechsolutions.com/api/healthz
# Expect: HTTP/2 200, {"status":"ok"} or similar
```

### 17.2 SPA routing

```bash
# Deep-link should return 200 with index.html content:
curl -si https://turbobytetechsolutions.com/services/cloud-infrastructure | head -5
# Expect: HTTP/2 200
```

### 17.3 Auth flow

1. Open `https://turbobytetechsolutions.com/admin` in a browser.
2. Confirm the Supabase sign-in form renders.
3. Sign in with a valid admin account.
4. Confirm you reach the admin dashboard.

### 17.4 Contact form → email

1. Submit the contact form with a test email address.
2. Check the inbox specified in `NOTIFY_EMAIL`.
3. Check the Resend dashboard for delivery confirmation.
4. Inspect the `email_notifications` table for a `sent` status:
   ```sql
   SELECT id, status, created_at FROM email_notifications ORDER BY id DESC LIMIT 5;
   ```

### 17.5 Object storage upload

1. Sign in as admin.
2. Navigate to a project upload form.
3. Upload a small test image.
4. Confirm the image appears in the Supabase Storage dashboard under
   `turbobyte-private/uploads/`.
5. In browser developer tools, confirm:
   - the API request to `/api/storage/uploads/request-url` carries
     `Authorization: Bearer …` and succeeds;
   - the presigned Supabase request uses `PUT` and succeeds without a CORS
     error.
6. Repeat with a resume application and confirm the uploaded resume remains
   inaccessible without an authenticated admin request.

### 17.6 Database connectivity

```bash
psql "$DATABASE_URL" -c "SELECT count(*) FROM inquiries;"
# Expect: a number ≥ 0 with no error
```

### 17.7 DNS + TLS

```bash
# Both should return 200 and HSTS header:
curl -sI https://turbobytetechsolutions.com | grep -E "HTTP|strict-transport"
curl -sI https://www.turbobytetechsolutions.com | grep -E "HTTP|strict-transport"
```

### 17.8 Cron trigger

Wait 2 minutes after Worker deploy, then check Cloudflare dashboard →
**Workers & Pages → turbobyte-api-server → Logs** for a cron invocation entry.

---

*Last updated: 2026. Maintainer: TurboByte Tech Solutions engineering team.*
