/**
 * Request-scoped dependency injection for the API.
 *
 * The Cloudflare Worker bridges a *singleton* Express server through
 * `httpServerHandler`, so there is no per-request module state we can safely
 * mutate. Instead, each inbound Worker request opens its own database (a
 * `pg.Client` connected to `env.HYPERDRIVE.connectionString`) and runs the
 * rest of the request inside an `AsyncLocalStorage` store carrying that DB.
 *
 * Routers and services never import the module-global `db` directly; they call
 * `getDb()`, which returns:
 *   - the request-scoped DB when one is active (Cloudflare Worker), or
 *   - the lazy module-global `db` otherwise (Node/Replit), preserving the
 *     existing single-pool behavior for the long-lived Node process.
 *
 * Because handlers resolve `getDb()` synchronously while still inside the
 * async context established for the request, this is safe under concurrent
 * requests — each request sees only its own store.
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { db as defaultDb, type Database } from "@workspace/db";

export interface RequestContext {
  /** The database all handlers/services should use for this request. */
  db: Database;
  /**
   * Register background work that must settle before the request-scoped
   * connection is torn down (e.g. fire-and-forget email delivery kicked off
   * after the HTTP response). In the Worker this is drained via
   * `ctx.waitUntil`; in Node it is unused (the pool is long-lived).
   */
  registerBackgroundWork(promise: Promise<unknown>): void;
}

const storage = new AsyncLocalStorage<RequestContext>();

/**
 * Run `fn` with the given request context active. Everything awaited inside
 * `fn` (including Express middleware/handlers) can reach it via `getDb()` /
 * `getRequestContext()`.
 */
export function runWithRequestContext<T>(
  context: RequestContext,
  fn: () => T,
): T {
  return storage.run(context, fn);
}

/** The active request context, or `undefined` outside a request scope. */
export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

/**
 * The database for the current request. Falls back to the module-global
 * default when no request-scoped context is active (Node/Replit, tests).
 */
export function getDb(): Database {
  return storage.getStore()?.db ?? defaultDb;
}

/**
 * Register background work with the active request context, if any. When no
 * context is active (Node/Replit), this is a no-op: the work runs on the
 * long-lived pool and does not need to hold a per-request connection open.
 */
export function registerBackgroundWork(promise: Promise<unknown>): void {
  storage.getStore()?.registerBackgroundWork(promise);
}
