/**
 * The request-scoped DB middleware used inside the Cloudflare Worker.
 *
 * Verifies:
 *   - Node/Replit (no Worker bridge): pure passthrough, no connection opened.
 *   - Worker with a missing HYPERDRIVE binding: explicit 503, no fallback to a
 *     raw DATABASE_URL, and no secret leaked in the response.
 *   - Worker with HYPERDRIVE: one pg.Client per request, request DB exposed to
 *     downstream, and the client closed (via ctx.waitUntil) after the response
 *     plus any registered background work settles.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// --- Mocks (declared before importing the middleware) ---------------------

const connectMock = vi.fn(async () => {});
const endMock = vi.fn(async () => {});
class FakeClient {
  connectionString: string;
  constructor(cfg: { connectionString: string }) {
    this.connectionString = cfg.connectionString;
  }
  connect = connectMock;
  end = endMock;
}
vi.mock("pg", () => ({ default: { Client: FakeClient } }));

const REQUEST_DB = { __marker: "request-db" };
vi.mock("@workspace/db", () => ({
  db: { __marker: "default-db" },
  createDatabase: vi.fn(() => REQUEST_DB),
}));

let bridge:
  | { hyperdrive?: { connectionString: string }; ctx: { waitUntil: (p: Promise<unknown>) => void } }
  | undefined;
vi.mock("../lib/workerContext", () => ({
  getWorkerBridge: () => bridge,
}));

const { injectDatabase } = await import("../middlewares/injectDatabase");
const { getDb, registerBackgroundWork } = await import("../lib/context");

function makeApp() {
  const app = express();
  app.use((req, _res, next) => {
    (req as unknown as { log: unknown }).log = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    next();
  });
  app.use("/api", injectDatabase);
  app.get("/api/probe", (_req, res) => {
    res.json({ marker: (getDb() as unknown as { __marker: string }).__marker });
  });
  app.get("/api/healthz", (_req, res) => {
    res.json({
      status: "ok",
      marker: (getDb() as unknown as { __marker: string }).__marker,
    });
  });
  return app;
}

function waitUntilCollector() {
  const promises: Promise<unknown>[] = [];
  return {
    ctx: { waitUntil: (p: Promise<unknown>) => promises.push(p) },
    settle: () => Promise.allSettled(promises),
  };
}

beforeEach(() => {
  connectMock.mockClear();
  endMock.mockClear();
  bridge = undefined;
});

describe("injectDatabase middleware", () => {
  it("is a passthrough under Node (no Worker bridge)", async () => {
    const res = await request(makeApp()).get("/api/probe");
    expect(res.status).toBe(200);
    expect(res.body.marker).toBe("default-db");
    expect(connectMock).not.toHaveBeenCalled();
  });

  it("fails explicitly when HYPERDRIVE is absent in the Worker", async () => {
    const { ctx } = waitUntilCollector();
    bridge = { ctx };

    const res = await request(makeApp()).get("/api/probe");
    expect(res.status).toBe(503);
    expect(connectMock).not.toHaveBeenCalled();
    expect(JSON.stringify(res.body)).not.toContain("DATABASE_URL");
    expect(JSON.stringify(res.body)).not.toContain("connectionString");
  });

  it("keeps /healthz available without a connection even without HYPERDRIVE", async () => {
    const { ctx } = waitUntilCollector();
    bridge = { ctx };

    const res = await request(makeApp()).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.marker).toBe("default-db");
    expect(connectMock).not.toHaveBeenCalled();
  });

  it("opens one client per request and closes it after the response", async () => {
    const collector = waitUntilCollector();
    bridge = {
      hyperdrive: { connectionString: "postgres://hyperdrive/local" },
      ctx: collector.ctx,
    };

    const res = await request(makeApp()).get("/api/probe");
    expect(res.status).toBe(200);
    expect(res.body.marker).toBe("request-db");
    expect(connectMock).toHaveBeenCalledTimes(1);

    // Cleanup runs via ctx.waitUntil after the response finishes.
    await collector.settle();
    expect(endMock).toHaveBeenCalledTimes(1);
  });

  it("does not close the client until registered background work settles", async () => {
    const collector = waitUntilCollector();
    bridge = {
      hyperdrive: { connectionString: "postgres://hyperdrive/local" },
      ctx: collector.ctx,
    };

    let releaseWork: () => void = () => {};
    const work = new Promise<void>((resolve) => {
      releaseWork = resolve;
    });

    const app = express();
    app.use((req, _res, next) => {
      (req as unknown as { log: unknown }).log = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      next();
    });
    app.use("/api", injectDatabase);
    app.get("/api/bg", (_req, res) => {
      registerBackgroundWork(work);
      res.json({ ok: true });
    });

    const res = await request(app).get("/api/bg");
    expect(res.status).toBe(200);

    // Response is done, but background work is still pending → client stays open.
    await Promise.resolve();
    expect(endMock).not.toHaveBeenCalled();

    releaseWork();
    await collector.settle();
    expect(endMock).toHaveBeenCalledTimes(1);
  });

  it("drains work registered by work that is already settling", async () => {
    const collector = waitUntilCollector();
    bridge = {
      hyperdrive: { connectionString: "postgres://hyperdrive/local" },
      ctx: collector.ctx,
    };

    let releaseFirst: () => void = () => {};
    let releaseNested: () => void = () => {};
    let firstWork: Promise<void> = Promise.resolve();

    const app = express();
    app.use((req, _res, next) => {
      (req as unknown as { log: unknown }).log = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      next();
    });
    app.use("/api", injectDatabase);
    app.get("/api/nested-bg", (_req, res) => {
      const nestedWork = new Promise<void>((resolve) => {
        releaseNested = resolve;
      });
      firstWork = new Promise<void>((resolve) => {
        releaseFirst = resolve;
      }).then(() => {
        registerBackgroundWork(nestedWork);
      });
      registerBackgroundWork(firstWork);
      res.json({ ok: true });
    });

    const res = await request(app).get("/api/nested-bg");
    expect(res.status).toBe(200);

    releaseFirst();
    await firstWork;
    await Promise.resolve();
    expect(endMock).not.toHaveBeenCalled();

    releaseNested();
    await collector.settle();
    expect(endMock).toHaveBeenCalledTimes(1);
  });
});
