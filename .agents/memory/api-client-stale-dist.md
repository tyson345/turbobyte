---
name: Stale composite dist for workspace API client
description: TS2305 "no exported member" from @workspace/* packages despite the export existing in src
---
Rule: When an app's `tsc --noEmit` reports missing exports from a workspace lib whose src clearly has them, rebuild the referenced project (`pnpm exec tsc -b` in the lib) before touching app code.

**Why:** Apps use TS project references; the lib is `composite` with `emitDeclarationOnly` into `dist/`. tsc resolves types from stale `dist/*.d.ts`, not `src`, so newly generated (orval) hooks appear "missing" until the lib is rebuilt.

**How to apply:** After regenerating API clients from the OpenAPI spec, always rebuild the client packages' declarations, or the consuming artifacts fail typecheck.
