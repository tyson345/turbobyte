/**
 * Express middleware that provides a request-scoped database.
 *
 * Under Node/Replit there is no Worker bridge active, so this is a no-op and
 * handlers resolve `getDb()` to the long-lived module-global pool — existing
 * behavior is preserved exactly.
 *
 * Inside a Cloudflare Worker, `httpServerHandler` forwards each request into
 * the singleton Express server while `runWithWorkerBridge` (in the Worker
 * `fetch` handler) exposes that request's `env.HYPERDRIVE` and
 * `ctx.waitUntil`. This middleware:
 *   1. Opens a fresh `pg.Client` over `env.HYPERDRIVE.connectionString`
 *      (one connection per request, per Cloudflare's guidance).
 *   2. Runs the rest of the request inside a request context carrying that
 *      client's Drizzle DB, so every handler/service sees the right database.
 *   3. Collects any background work registered after the response (e.g.
 *      fire-and-forget email delivery) and, once the response is fully sent,
 *      waits for that work to settle before closing the client — the whole
 *      drain is handed to `ctx.waitUntil` so the Worker stays alive for it.
 *
 * If the Worker is running but the HYPERDRIVE binding is missing, the request
 * fails explicitly with a clear, non-secret error rather than silently
 * falling back to a raw DATABASE_URL.
 */
import type { Request, Response, NextFunction } from "express";
import pg from "pg";
import { createDatabase } from "@workspace/db";
import { runWithRequestContext } from "../lib/context";
import { getWorkerBridge } from "../lib/workerContext";
import { logger } from "../lib/logger";

const { Client } = pg;

export function injectDatabase(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const bridge = getWorkerBridge();

  // Node/Replit (or any non-Worker runtime): keep the default module-global
  // database. Nothing to inject or clean up.
  if (!bridge) {
    next();
    return;
  }

  // The health check performs no database work; keep it available (and cheap)
  // even when HYPERDRIVE is absent by never opening a connection for it.
  if (req.path === "/healthz") {
    next();
    return;
  }

  if (!bridge.hyperdrive?.connectionString) {
    logger.error(
      { path: req.originalUrl.split("?")[0] },
      "HYPERDRIVE binding is not configured; cannot open a database for this request",
    );
    res
      .status(503)
      .json({ error: "Database is not configured for this deployment" });
    return;
  }

  const client = new Client({
    connectionString: bridge.hyperdrive.connectionString,
    // Hyperdrive terminates TLS to the origin for us.
    ssl: false,
  });

  const backgroundWork: Promise<unknown>[] = [];
  let cleanupStarted = false;

  const cleanup = (): void => {
    // finish and close can both fire; only tear down once.
    if (cleanupStarted) return;
    cleanupStarted = true;

    const drain = (async () => {
      // Work may register more work while it settles (for example, persisting
      // an email queue row can then start its first delivery attempt). Drain
      // batches until no newly registered promises remain before closing the
      // request-scoped client.
      let drained = 0;
      while (drained < backgroundWork.length) {
        const batch = backgroundWork.slice(drained);
        drained = backgroundWork.length;
        await Promise.allSettled(batch);
      }
      await client.end().catch((err: unknown) => {
        logger.error({ err }, "Failed to close request database client");
      });
    })();

    bridge.ctx.waitUntil(drain);
  };

  res.once("finish", cleanup);
  res.once("close", cleanup);

  client.connect().then(
    () => {
      // If the request already ended before we finished connecting, cleanup
      // has run (or is running) and owns closing this client; don't dispatch
      // the request onto a connection that is being torn down.
      if (cleanupStarted) return;
      const db = createDatabase(client);
      runWithRequestContext(
        {
          db,
          registerBackgroundWork(promise) {
            backgroundWork.push(promise);
          },
        },
        next,
      );
    },
    (err: unknown) => {
      logger.error({ err }, "Failed to connect request database client");
      // Dispose the client here and disarm the finish/close cleanup so we
      // never call end() twice.
      cleanupStarted = true;
      void client.end().catch(() => undefined);
      if (!res.headersSent) {
        res.status(503).json({ error: "Database connection failed" });
      }
    },
  );
}
