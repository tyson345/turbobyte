/**
 * Cloudflare Workers entrypoint.
 *
 * Uses the `nodejs_compat` compatibility flag so Express runs unchanged via
 * the `cloudflare:node` httpServerHandler bridge. The existing `index.ts` and
 * `app.ts` files are untouched except for the request-scoped DB middleware;
 * this file is compiled separately by Wrangler.
 *
 * Database access in Workers is request-scoped: `httpServerHandler` forwards
 * every request into one singleton Express server, so we cannot rely on a
 * module-global pool. Instead each `fetch` runs inside `runWithWorkerBridge`,
 * exposing this request's `env.HYPERDRIVE` connection string and
 * `ctx.waitUntil` to the `injectDatabase` middleware, which opens one
 * `pg.Client` per request and hands its Drizzle DB to every handler/service.
 *
 * Scheduled handler fires on the configured cron trigger and runs the same
 * periodic tasks that the Node/Replit process runs on its sweep interval,
 * using a single Hyperdrive-backed client for both jobs:
 *  - processDueNotifications  – retry queued email notifications
 *  - announceNewBlogPosts     – email subscribers about new blog posts
 */

import { httpServerHandler } from "cloudflare:node";
import pg from "pg";
import { createDatabase } from "@workspace/db";
import app from "./app";
import { logger } from "./lib/logger";
import { processDueNotifications } from "./lib/emailQueue";
import { announceNewBlogPosts } from "./lib/blogAnnouncements";
import {
  runWithWorkerBridge,
  type HyperdriveBinding,
} from "./lib/workerContext";

const { Client } = pg;

// Bind Express to an internal loopback port. The port number is arbitrary;
// only httpServerHandler needs it — no external traffic reaches this port.
const INTERNAL_PORT = 3001;

const server = app.listen(INTERNAL_PORT);
const httpHandler = httpServerHandler(server);

export interface Env {
  // Environment variables injected by Wrangler / Cloudflare dashboard.
  // All process.env accesses inside app.ts / lib/* continue to work because
  // nodejs_compat maps CF bindings → process.env automatically.
  //
  // HYPERDRIVE is created and bound in the Cloudflare dashboard (never in
  // wrangler.toml). When present it exposes a pooled connection string that
  // points at the origin Postgres (Supabase).
  HYPERDRIVE?: HyperdriveBinding;
  [key: string]: unknown;
}

export interface ScheduledController {
  scheduledTime: number;
  cron: string;
  noRetry(): void;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export default {
  /**
   * HTTP fetch handler — every inbound request to the Worker route is
   * forwarded to the Express app via the httpServerHandler bridge. The bridge
   * exposes this request's HYPERDRIVE binding + waitUntil to the Express
   * `injectDatabase` middleware for per-request database provisioning.
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return runWithWorkerBridge(
      { hyperdrive: env.HYPERDRIVE, ctx },
      () => httpHandler.fetch(request, env, ctx),
    );
  },

  /**
   * Scheduled handler — invoked by the Cloudflare Cron Trigger.
   * Runs the email-queue sweep and blog-post announcer, mirroring what
   * startEmailQueueWorker() + announceNewBlogPosts() do in the Node process.
   * Uses one Hyperdrive-backed client (one Drizzle DB) for both jobs and
   * closes it in `finally`.
   */
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    const connectionString = env.HYPERDRIVE?.connectionString;
    if (!connectionString) {
      logger.error(
        {},
        "Scheduled: HYPERDRIVE binding is not configured; skipping periodic jobs",
      );
      return;
    }

    ctx.waitUntil(
      (async () => {
        const client = new Client({ connectionString, ssl: false });
        try {
          await client.connect();
          const db = createDatabase(client);

          await processDueNotifications(db).catch((err: unknown) => {
            logger.error({ err }, "Scheduled: processDueNotifications failed");
          });

          await announceNewBlogPosts(db).catch((err: unknown) => {
            logger.error({ err }, "Scheduled: announceNewBlogPosts failed");
          });
        } catch (err: unknown) {
          logger.error({ err }, "Scheduled: database setup failed");
        } finally {
          await client.end().catch((err: unknown) => {
            logger.error({ err }, "Scheduled: failed to close database client");
          });
        }
      })(),
    );
  },
};
