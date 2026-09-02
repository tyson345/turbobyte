import app from "./app";
import { logger } from "./lib/logger";
import { startEmailQueueWorker } from "./lib/emailQueue";
import { announceNewBlogPosts } from "./lib/blogAnnouncements";
import { ensurePublishedPortfolioContent } from "./lib/publishedContent";

const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function startServer() {
  const insertedPortfolioContent = await ensurePublishedPortfolioContent();

  if (insertedPortfolioContent) {
    logger.info("Inserted required published portfolio content");
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");

    // Retry queued email notifications (survives restarts and Resend outages).
    startEmailQueueWorker();

    // Email subscribers about any blog posts published since the last run.
    announceNewBlogPosts().catch((err) => {
      logger.error({ err }, "Failed to announce new blog posts");
    });
  });
}

startServer().catch((err) => {
  logger.error({ err }, "Failed to initialize published content");
  process.exit(1);
});
