import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, request as requestHttp } from "node:http";
import path from "node:path";

const staticDirectory = path.resolve(
  process.env.STATIC_DIR ?? "artifacts/turbobyte/dist/public",
);
const apiHost = process.env.API_HOST ?? "127.0.0.1";
const apiPort = readPort("API_PORT", "8080");
const webPort = readPort("WEB_PORT", process.env.PORT ?? "5173");
const host = process.env.HOST ?? "0.0.0.0";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

if (!existsSync(path.join(staticDirectory, "index.html"))) {
  throw new Error(
    `Static frontend index.html not found in ${staticDirectory}. Run "pnpm run build" first.`,
  );
}

function readPort(name, fallback) {
  const rawValue = process.env[name] ?? fallback;
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(
      `Invalid ${name} value "${rawValue}". Use a TCP port from 1 to 65535.`,
    );
  }

  return value;
}

function isApiRequest(requestUrl) {
  try {
    const url = new URL(requestUrl ?? "/", "http://localhost");
    return url.pathname === "/api" || url.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

function proxyApi(request, response) {
  const headers = { ...request.headers, host: `${apiHost}:${apiPort}` };
  const upstream = requestHttp(
    {
      hostname: apiHost,
      port: apiPort,
      method: request.method,
      path: request.url ?? "/",
      headers,
    },
    (upstreamResponse) => {
      response.writeHead(
        upstreamResponse.statusCode ?? 502,
        upstreamResponse.headers,
      );
      upstreamResponse.pipe(response);
    },
  );

  upstream.once("error", (error) => {
    if (response.headersSent) {
      response.destroy(error);
      return;
    }

    response.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    response.end(
      JSON.stringify({
        error: "API server unavailable",
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
  });

  request.once("aborted", () => {
    upstream.destroy();
  });
  request.pipe(upstream);
}

function decodePathname(requestUrl) {
  const url = new URL(requestUrl ?? "/", "http://localhost");
  return decodeURIComponent(url.pathname);
}

function resolveStaticFile(pathname) {
  const relativePath = pathname.replace(/^\/+/, "");
  const candidate = path.resolve(staticDirectory, relativePath);
  const rootPrefix = `${staticDirectory}${path.sep}`;

  if (candidate !== staticDirectory && !candidate.startsWith(rootPrefix)) {
    return null;
  }

  try {
    const stats = statSync(candidate);
    if (stats.isDirectory()) {
      const directoryIndex = path.join(candidate, "index.html");
      return existsSync(directoryIndex) ? directoryIndex : null;
    }
    return stats.isFile() ? candidate : null;
  } catch {
    // A client-side route is expected not to have a corresponding file.
    if (!path.extname(pathname)) {
      return path.join(staticDirectory, "index.html");
    }
    return null;
  }
}

function serveStatic(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { allow: "GET, HEAD" });
    response.end("Method Not Allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodePathname(request.url);
  } catch {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("Bad Request");
    return;
  }

  const filePath = resolveStaticFile(pathname);
  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  let stats;
  try {
    stats = statSync(filePath);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    "cache-control":
      filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
    "content-length": stats.size,
    "content-type": contentTypes[extension] ?? "application/octet-stream",
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).on("error", () => {
    if (!response.headersSent) response.writeHead(404);
    response.end();
  }).pipe(response);
}

const server = createServer((request, response) => {
  if (isApiRequest(request.url)) {
    proxyApi(request, response);
    return;
  }

  serveStatic(request, response);
});

server.on("error", (error) => {
  console.error(`Static web server failed: ${error.message}`);
  process.exitCode = 1;
});

server.listen(webPort, host, () => {
  console.error(
    `Static web server listening on http://${host === "0.0.0.0" ? "localhost" : host}:${webPort} (API proxy: ${apiHost}:${apiPort})`,
  );
});