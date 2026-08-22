/**
 * Request-scoped dependency injection.
 *
 * These tests pin the behavior the Cloudflare Worker relies on:
 *   - inside a request context, getDb() returns the injected request DB;
 *   - outside any context, getDb() falls back to the module-global default;
 *   - contexts do not leak across concurrent async request scopes;
 *   - registerBackgroundWork routes to the active context, and is a safe
 *     no-op when none is active.
 */
import { describe, it, expect, vi } from "vitest";

// The default export of @workspace/db is a lazy Proxy that only touches
// DATABASE_URL when a property is accessed. We give it a sentinel object so we
// can assert the fallback without opening a real connection.
const DEFAULT_DB = { __marker: "default" };
vi.mock("@workspace/db", () => ({ db: DEFAULT_DB }));

const {
  getDb,
  getRequestContext,
  registerBackgroundWork,
  runWithRequestContext,
} = await import("../lib/context");

function makeContext(db: unknown) {
  const work: Promise<unknown>[] = [];
  return {
    context: {
      db: db as never,
      registerBackgroundWork(p: Promise<unknown>) {
        work.push(p);
      },
    },
    work,
  };
}

describe("request-scoped DI", () => {
  it("falls back to the default db outside a request context", () => {
    expect(getDb()).toBe(DEFAULT_DB);
    expect(getRequestContext()).toBeUndefined();
  });

  it("returns the injected db inside a request context", () => {
    const requestDb = { __marker: "request" };
    const { context } = makeContext(requestDb);

    runWithRequestContext(context, () => {
      expect(getDb()).toBe(requestDb);
      expect(getRequestContext()).toBe(context);
    });

    // Restored to the default once the scope exits.
    expect(getDb()).toBe(DEFAULT_DB);
  });

  it("keeps concurrent request scopes isolated", async () => {
    const dbA = { __marker: "A" };
    const dbB = { __marker: "B" };

    const seen = await Promise.all([
      runWithRequestContext(makeContext(dbA).context, async () => {
        await new Promise((r) => setTimeout(r, 5));
        return getDb();
      }),
      runWithRequestContext(makeContext(dbB).context, async () => {
        await new Promise((r) => setTimeout(r, 1));
        return getDb();
      }),
    ]);

    expect(seen).toEqual([dbA, dbB]);
  });

  it("registerBackgroundWork routes to the active context", () => {
    const { context, work } = makeContext({});
    const p = Promise.resolve("done");

    runWithRequestContext(context, () => {
      registerBackgroundWork(p);
    });

    expect(work).toEqual([p]);
  });

  it("registerBackgroundWork is a no-op with no active context", () => {
    // Must not throw when called outside a request scope (Node/Replit path).
    expect(() => registerBackgroundWork(Promise.resolve())).not.toThrow();
  });
});
