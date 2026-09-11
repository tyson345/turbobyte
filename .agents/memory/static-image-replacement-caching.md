---
name: Static image replacement caching
description: How to make replaced public images reliably appear after publishing.
---

When replacing a public image that previously used a stable URL, give the replacement a new filename rather than relying only on query-string versioning.

**Why:** A browser can keep an already-loaded SPA route bundle and its old bare image URL across a publish. Query versioning in the new bundle does not help that still-running old bundle, while a new filename guarantees a fresh request once the new route loads.

**How to apply:** Verify both the published image bytes and any lazy-loaded route chunk that references the asset. Do not infer route freshness only from the main entry bundle.