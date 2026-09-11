---
name: TurboByte dual database migrations
description: TurboByte local previews and Cloudflare production use separate PostgreSQL databases that must stay schema-compatible.
---

Apply every TurboByte schema migration and required seed/content change to both the Replit development database and the Supabase production project.

**Why:** The local API preview connects to Replit development Postgres, while the Cloudflare Worker reaches Supabase through Hyperdrive. Updating only Supabase leaves local previews failing on missing columns; updating only development leaves production broken.

**How to apply:** Use the development database tooling for local schema/data changes and the Supabase migration/SQL tooling for production, then verify both the local API and Worker endpoint.