/**
 * Cloudflare Workers entrypoint.
 *
 * Uses the `nodejs_compat` compatibility flag so Express runs unchanged via
 * the `cloudflare:node` httpServerHandler bridge. The existing `index.ts` and
 * `app.ts` files are untouched; this file is compiled separately by Wrangler.
 *
 * Scheduled handler fires on the configured cron trigger and runs the same
 * periodic tasks that the Node/Replit process runs on its sweep interval:
 *  - processDueNotifications  – retry queued email notifications
 *  - announceNewBlogPosts     – email subscribers about new blog posts
 */

import { httpServerHandler } from "cloudflare:node";
import app from "./app";
import { logger } from "./lib/logger";
import { processDueNotifications } from "./lib/emailQueue";
import { announceNewBlogPosts } from "./lib/blogAnnouncements";

// Bind Express to an internal loopback port. The port number is arbitrary;
// only httpServerHandler needs it — no external traffic reaches this port.
const INTERNAL_PORT = 3001;

const server = app.listen(INTERNAL_PORT);
const httpHandler = httpServerHandler(server);

export interface Env {
  // Environment variables injected by Wrangler / Cloudflare dashboard.
  // All process.env accesses inside app.ts / lib/* continue to work because
  // nodejs_compat maps CF bindings → process.env automatically.
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
   * forwarded to the Express app via the httpServerHandler bridge.
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return httpHandler.fetch(request, env, ctx);
  },

  /**
   * Scheduled handler — invoked by the Cloudflare Cron Trigger.
   * Runs the email-queue sweep and blog-post announcer, mirroring what
   * startEmailQueueWorker() + announceNewBlogPosts() do in the Node process.
   */
  async scheduled(
    _controller: ScheduledController,
    _env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      (async () => {
        await processDueNotifications().catch((err: unknown) => {
          logger.error({ err }, "Scheduled: processDueNotifications failed");
        });

        await announceNewBlogPosts().catch((err: unknown) => {
          logger.error({ err }, "Scheduled: announceNewBlogPosts failed");
        });
      })(),
    );
  },
};
