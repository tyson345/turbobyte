/**
 * Bridge between the Cloudflare Worker `fetch` handler and the singleton
 * Express app.
 *
 * `httpServerHandler` forwards every inbound request into one long-lived
 * Express server, so the per-request `env` (which carries the `HYPERDRIVE`
 * binding) and `ExecutionContext` are not visible to Express middleware by
 * default. We stash them in an `AsyncLocalStorage` for the duration of the
 * Worker `fetch` call; the Express DB-injection middleware (see `app.ts`)
 * reads them back out synchronously at the top of each request.
 *
 * This module is imported by both the Worker entrypoint and `app.ts`, but the
 * bridge only ever holds a value when running inside the Worker `fetch`
 * handler — under Node/Replit the store is always empty and the middleware
 * falls through to the default module-global database.
 */
import { AsyncLocalStorage } from "node:async_hooks";

/** Minimal shape of a Cloudflare Hyperdrive binding. */
export interface HyperdriveBinding {
  connectionString: string;
}

/** The subset of the Worker `ExecutionContext` we rely on. */
export interface WaitUntilContext {
  waitUntil(promise: Promise<unknown>): void;
}

export interface WorkerRequestBridge {
  hyperdrive?: HyperdriveBinding;
  ctx: WaitUntilContext;
}

const bridgeStorage = new AsyncLocalStorage<WorkerRequestBridge>();

/**
 * Run `fn` (the httpServerHandler fetch) with the Worker request bridge
 * active so the Express middleware can recover `env.HYPERDRIVE` and
 * `ctx.waitUntil` for this request.
 */
export function runWithWorkerBridge<T>(
  bridge: WorkerRequestBridge,
  fn: () => T,
): T {
  return bridgeStorage.run(bridge, fn);
}

/** The active Worker request bridge, or `undefined` under Node/Replit. */
export function getWorkerBridge(): WorkerRequestBridge | undefined {
  return bridgeStorage.getStore();
}
