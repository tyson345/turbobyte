import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { logger } from "./lib/logger";
import { injectDatabase } from "./middlewares/injectDatabase";

const app: Express = express();

app.use((req, res, next) => {
  const startedAt = Date.now();
  (req as unknown as { log: typeof logger }).log = logger;

  res.once("finish", () => {
    logger.info(
      {
        method: req.method,
        url: req.originalUrl.split("?")[0],
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      },
      "HTTP request completed",
    );
  });

  next();
});

// Secure response headers for all API responses.
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

// Build the allowed-origin set from ALLOWED_ORIGINS (comma-separated full
// origins, e.g. "https://turbobytetechsolutions.com,https://www.turbobytetechsolutions.com").
// Localhost is always allowed for portable local development.
const allowedOrigins = new Set<string>(
  (process.env.ALLOWED_ORIGINS?.split(",") ?? [])
    .filter((o): o is string => Boolean(o))
    .map((o) => o.trim()),
);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) return callback(null, true); // same-origin / curl
      try {
        const { hostname } = new URL(origin);
        if (hostname === "localhost" || hostname === "127.0.0.1") {
          return callback(null, true);
        }
        callback(null, allowedOrigins.has(origin));
      } catch {
        callback(null, false);
      }
    },
  }),
);

// The demo prototype endpoint accepts small base64 reference images, so it
// needs a larger JSON body limit than the rest of the API.
app.use("/api/demo/prototype", express.json({ limit: "8mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Provide a request-scoped database. Under Node/Replit this is a no-op and
// handlers use the default module-global pool; inside a Cloudflare Worker it
// opens a per-request Hyperdrive-backed pg.Client and exposes its Drizzle DB
// to all downstream handlers/services via the request context.
app.use("/api", injectDatabase);

app.use("/api", router);

export default app;
