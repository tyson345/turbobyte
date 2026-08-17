/**
 * Auth matrix for GET /api/inquiries — the endpoint returns visitor PII
 * (names, emails, phone numbers), so access must be locked to admins:
 *
 *   1. Unauthenticated                          -> 401
 *   2. Signed-in, but not an allowlisted admin   -> 403
 *   3. Signed-in admin w/ VERIFIED allowlisted email -> 200
 *
 * These tests are written to fail if the verified-email check in
 * requireAdmin is weakened (e.g. accepting unverified emails, or accepting
 * any signed-in user).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// --- Mocks (must be declared before importing the router) -----------------

const getAuthMock = vi.fn();
const getUserMock = vi.fn();

vi.mock("@clerk/express", () => ({
  getAuth: (...args: unknown[]) => getAuthMock(...args),
  clerkClient: { users: { getUser: (...args: unknown[]) => getUserMock(...args) } },
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

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

function clerkUser(
  emails: Array<{ email: string; verified: boolean }>,
) {
  return {
    emailAddresses: emails.map((e) => ({
      emailAddress: e.email,
      verification: { status: e.verified ? "verified" : "unverified" },
    })),
  };
}

// Default allowlist (no ADMIN_EMAILS override in test env)
const ADMIN_EMAIL = "aae@turbobytetech.com";

beforeEach(() => {
  getAuthMock.mockReset();
  getUserMock.mockReset();
  updateWhereMock.mockReset();
});

describe("GET /api/inquiries auth matrix", () => {
  it("401 when unauthenticated (no Clerk session)", async () => {
    getAuthMock.mockReturnValue({ userId: null });

    const res = await request(makeApp()).get("/api/inquiries");

    expect(res.status).toBe(401);
    expect(JSON.stringify(res.body)).not.toContain("jane@example.com");
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it("401 when getAuth returns undefined", async () => {
    getAuthMock.mockReturnValue(undefined);

    const res = await request(makeApp()).get("/api/inquiries");

    expect(res.status).toBe(401);
  });

  it("403 for a signed-in user with no allowlisted email", async () => {
    getAuthMock.mockReturnValue({ userId: "user_nonadmin" });
    getUserMock.mockResolvedValue(
      clerkUser([{ email: "attacker@evil.com", verified: true }]),
    );

    const res = await request(makeApp()).get("/api/inquiries");

    expect(res.status).toBe(403);
    expect(JSON.stringify(res.body)).not.toContain("jane@example.com");
  });

  it("403 when the allowlisted email is present but UNVERIFIED — anyone can add (not verify) someone else's address", async () => {
    getAuthMock.mockReturnValue({ userId: "user_spoofer" });
    getUserMock.mockResolvedValue(
      clerkUser([
        { email: ADMIN_EMAIL, verified: false },
        { email: "attacker@evil.com", verified: true },
      ]),
    );

    const res = await request(makeApp()).get("/api/inquiries");

    expect(res.status).toBe(403);
    expect(JSON.stringify(res.body)).not.toContain("jane@example.com");
  });

  it("403 when the user has no email addresses at all", async () => {
    getAuthMock.mockReturnValue({ userId: "user_noemail" });
    getUserMock.mockResolvedValue(clerkUser([]));

    const res = await request(makeApp()).get("/api/inquiries");

    expect(res.status).toBe(403);
  });

  it("200 for an admin with a verified allowlisted email", async () => {
    getAuthMock.mockReturnValue({ userId: "user_admin" });
    getUserMock.mockResolvedValue(
      clerkUser([{ email: ADMIN_EMAIL, verified: true }]),
    );

    const res = await request(makeApp()).get("/api/inquiries");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].email).toBe("jane@example.com");
    expect(res.body[0].createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("200 for an admin whose verified email differs only in case/whitespace", async () => {
    getAuthMock.mockReturnValue({ userId: "user_admin_case" });
    getUserMock.mockResolvedValue(
      clerkUser([{ email: ` ${ADMIN_EMAIL.toUpperCase()} `, verified: true }]),
    );

    const res = await request(makeApp()).get("/api/inquiries");

    expect(res.status).toBe(200);
  });

  it("500 (not 200) when the Clerk user lookup fails — never fail open", async () => {
    getAuthMock.mockReturnValue({ userId: "user_admin" });
    getUserMock.mockRejectedValue(new Error("clerk down"));

    const res = await request(makeApp()).get("/api/inquiries");

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("jane@example.com");
  });
});

describe("PATCH /api/inquiries/:id/status is admin-gated too", () => {
  it("401 when unauthenticated", async () => {
    getAuthMock.mockReturnValue({ userId: null });

    const res = await request(makeApp())
      .patch("/api/inquiries/1/status")
      .send({ status: "contacted" });

    expect(res.status).toBe(401);
  });

  it("403 for a signed-in non-admin", async () => {
    getAuthMock.mockReturnValue({ userId: "user_nonadmin" });
    getUserMock.mockResolvedValue(
      clerkUser([{ email: "someone@else.com", verified: true }]),
    );

    const res = await request(makeApp())
      .patch("/api/inquiries/1/status")
      .send({ status: "contacted" });

    expect(res.status).toBe(403);
    expect(updateWhereMock).not.toHaveBeenCalled();
  });

  it("200 for a verified allowlisted admin — update goes through", async () => {
    getAuthMock.mockReturnValue({ userId: "user_admin" });
    getUserMock.mockResolvedValue(
      clerkUser([{ email: ADMIN_EMAIL, verified: true }]),
    );
    updateWhereMock.mockImplementation((values) => [
      { ...DB_ROWS[0], ...values },
    ]);

    const res = await request(makeApp())
      .patch("/api/inquiries/1/status")
      .send({ status: "contacted" });

    expect(res.status).toBe(200);
    expect(updateWhereMock).toHaveBeenCalledWith({ status: "contacted" });
    expect(res.body.status).toBe("contacted");
    expect(res.body.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });
});
