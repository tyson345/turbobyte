/**
 * Auth matrix for GET /api/inquiries — the endpoint returns visitor PII
 * (names, emails, phone numbers), so access must be locked to admins:
 *
 *   1. Unauthenticated (no Bearer token)             -> 401
 *   2. Signed-in, but not an allowlisted admin        -> 403
 *   3. Signed-in admin w/ verified allowlisted email -> 200
 *
 * These tests are written to fail if the verified-email check in
 * requireAdmin is weakened (e.g. accepting unverified emails, or accepting
 * any signed-in user).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// --- Mocks (must be declared before importing the router) -----------------

// Mock global fetch to intercept Supabase /auth/v1/user calls.
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

// Keep tests hermetic: no real database connection. GET /inquiries only
// needs select().from().orderBy() to resolve to rows.
const DB_ROWS = [
  {
    id: 1,
    type: "contact",
    name: "Jane Visitor",
    email: "jane@example.com",
    company: null,
    phone: "+15551234567",
    service: "web",
    budget: null,
    message: "hi",
    status: "new",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
];
const updateWhereMock = vi.fn();
vi.mock("@workspace/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        orderBy: async () => DB_ROWS,
      }),
    }),
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: () => ({
          returning: async () => updateWhereMock(values),
        }),
      }),
    }),
  },
  inquiriesTable: { createdAt: "createdAt", id: "id" },
}));

vi.mock("../lib/emailNotifications", () => ({
  sendContactInquiryNotification: vi.fn(async () => {}),
  sendProjectInquiryNotification: vi.fn(async () => {}),
}));

// Set required env vars before the middleware module loads.
process.env.SUPABASE_URL = "https://fake.supabase.co";
process.env.SUPABASE_ANON_KEY = "fake-anon-key";

const { default: inquiriesRouter } = await import("../routes/inquiries");

// --- Test app --------------------------------------------------------------

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    // pino-http normally provides req.log
    (req as unknown as { log: unknown }).log = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    next();
  });
  app.use("/api", inquiriesRouter);
  return app;
}

/**
 * Build a mock Response that fetch() will return.
 */
function mockSupabaseUser(user: {
  id: string;
  email: string;
  emailConfirmed: boolean;
} | null): void {
  if (!user) {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "invalid_token" }),
    });
    return;
  }

  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      id: user.id,
      email: user.email,
      email_confirmed_at: user.emailConfirmed
        ? "2024-01-01T00:00:00Z"
        : null,
    }),
  });
}

// Default allowlist (no ADMIN_EMAILS override in test env)
const ADMIN_EMAIL = "aae@turbobytetech.com";

beforeEach(() => {
  fetchMock.mockReset();
  updateWhereMock.mockReset();
});

describe("GET /api/inquiries auth matrix", () => {
  it("401 when unauthenticated (no Bearer token)", async () => {
    const res = await request(makeApp()).get("/api/inquiries");

    expect(res.status).toBe(401);
    expect(JSON.stringify(res.body)).not.toContain("jane@example.com");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("401 when the Bearer token is rejected by Supabase", async () => {
    mockSupabaseUser(null);

    const res = await request(makeApp())
      .get("/api/inquiries")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(JSON.stringify(res.body)).not.toContain("jane@example.com");
  });

  it("403 for a signed-in user with no allowlisted email", async () => {
    mockSupabaseUser({ id: "user_nonadmin", email: "attacker@evil.com", emailConfirmed: true });

    const res = await request(makeApp())
      .get("/api/inquiries")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
    expect(JSON.stringify(res.body)).not.toContain("jane@example.com");
  });

  it("403 when the allowlisted email is present but UNVERIFIED", async () => {
    mockSupabaseUser({ id: "user_spoofer", email: ADMIN_EMAIL, emailConfirmed: false });

    const res = await request(makeApp())
      .get("/api/inquiries")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
    expect(JSON.stringify(res.body)).not.toContain("jane@example.com");
  });

  it("403 when the user has no email", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "user_noemail",
        email: undefined,
        email_confirmed_at: null,
      }),
    });

    const res = await request(makeApp())
      .get("/api/inquiries")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
  });

  it("200 for an admin with a verified allowlisted email", async () => {
    mockSupabaseUser({ id: "user_admin", email: ADMIN_EMAIL, emailConfirmed: true });

    const res = await request(makeApp())
      .get("/api/inquiries")
      .set("Authorization", "Bearer valid-admin-token");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].email).toBe("jane@example.com");
    expect(res.body[0].createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("200 for an admin whose verified email differs only in case/whitespace", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "user_admin_case",
        email: ` ${ADMIN_EMAIL.toUpperCase()} `,
        email_confirmed_at: "2024-01-01T00:00:00Z",
      }),
    });

    const res = await request(makeApp())
      .get("/api/inquiries")
      .set("Authorization", "Bearer valid-admin-token");

    expect(res.status).toBe(200);
  });

  it("500 (not 200) when the Supabase user lookup fails — never fail open", async () => {
    fetchMock.mockRejectedValue(new Error("supabase down"));

    const res = await request(makeApp())
      .get("/api/inquiries")
      .set("Authorization", "Bearer valid-admin-token");

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("jane@example.com");
  });
});

describe("PATCH /api/inquiries/:id/status is admin-gated too", () => {
  it("401 when unauthenticated", async () => {
    const res = await request(makeApp())
      .patch("/api/inquiries/1/status")
      .send({ status: "contacted" });

    expect(res.status).toBe(401);
  });

  it("403 for a signed-in non-admin", async () => {
    mockSupabaseUser({ id: "user_nonadmin", email: "someone@else.com", emailConfirmed: true });

    const res = await request(makeApp())
      .patch("/api/inquiries/1/status")
      .send({ status: "contacted" })
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
    expect(updateWhereMock).not.toHaveBeenCalled();
  });

  it("200 for a verified allowlisted admin — update goes through", async () => {
    mockSupabaseUser({ id: "user_admin", email: ADMIN_EMAIL, emailConfirmed: true });
    updateWhereMock.mockImplementation((values) => [
      { ...DB_ROWS[0], ...values },
    ]);

    const res = await request(makeApp())
      .patch("/api/inquiries/1/status")
      .send({ status: "contacted" })
      .set("Authorization", "Bearer valid-admin-token");

    expect(res.status).toBe(200);
    expect(updateWhereMock).toHaveBeenCalledWith({ status: "contacted" });
    expect(res.body.status).toBe("contacted");
    expect(res.body.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });
});
