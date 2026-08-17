---
name: Vitest picks up stale dist tests
description: api-server vitest ran compiled tests from dist/, causing phantom suite failures
---
The api-server's `tsc --build` emits compiled test JS into `dist/`, and vitest without an include pattern picks those up — a stale `dist/__tests__/*.js` can fail on missing-module imports even when the real `src` tests pass.

**Why:** After route refactors, the stale compiled copy references old module paths and fails at import time, looking like a real regression.

**How to apply:** Keep `vitest.config.ts` with `include: ["src/**/*.test.ts"]` (already added); if a suite fails only under `dist/`, delete the stale dir instead of chasing the "error".
