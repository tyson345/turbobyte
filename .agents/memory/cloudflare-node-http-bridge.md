---
name: Cloudflare Node HTTP bridge
description: Cloudflare Workers configuration requirement and typing lag for Express-compatible Node HTTP servers.
---

Use Cloudflare's documented `cloudflare:node` `httpServerHandler` bridge for
Express, and enable `enable_nodejs_http_server_modules` in addition to Node
compatibility. Treat a Wrangler dry-run bundle and the official current docs as
the compatibility check when the separately published Workers TypeScript types
have not yet caught up with the runtime API.

**Why:** The current official Cloudflare documentation exposes the bridge, but
the installed Workers type package does not declare it. Type declarations alone
can therefore incorrectly reject a supported API, while omitting the HTTP
server compatibility flag can still break it at runtime.

**How to apply:** For Workers that run Express or `node:http`, check the current
Cloudflare docs for the bridge pattern, include the dedicated HTTP-server flag,
run the Worker-specific typecheck, and run `wrangler deploy --dry-run` before a
real deploy.