/**
 * Unit tests for the S3-backed ObjectStorageService.
 *
 * Tests cover:
 *  1. getObjectEntityUploadURL  – produces a signed PUT URL and the path is
 *     normalised to /objects/uploads/<uuid>
 *  2. normalizeObjectEntityPath – various URL shapes → canonical path
 *  3. getObjectEntityFile       – resolves to an ObjectHandle; throws
 *     ObjectNotFoundError for missing keys / bad paths
 *  4. getObjectMetadata         – maps HeadObject output to { size, contentType }
 *  5. downloadObject            – streams body + correct headers
 *  6. verifyUploadedResume (via careers route) – rejects bad paths, missing
 *     objects, oversized files, and wrong content types
 *  7. verifyUploadedObjectPath (via projects route) – same guard for images
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import express, { type Express } from "express";
import request from "supertest";

// ---------------------------------------------------------------------------
// Mock AWS SDK before any module under test is imported
// ---------------------------------------------------------------------------

const mockSend = vi.fn();
const mockGetSignedUrl = vi.fn();

vi.mock("@aws-sdk/client-s3", () => {
  class S3Client {
    send = mockSend;
  }
  class HeadObjectCommand {
    constructor(public input: Record<string, unknown>) {}
  }
  class GetObjectCommand {
    constructor(public input: Record<string, unknown>) {}
  }
  class PutObjectCommand {
    constructor(public input: Record<string, unknown>) {}
  }
  return { S3Client, HeadObjectCommand, GetObjectCommand, PutObjectCommand };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
}));

// Mock environment config
const ENV: Record<string, string> = {
  OBJECT_STORAGE_ENDPOINT: "https://xyz.supabase.co/storage/v1/s3",
  OBJECT_STORAGE_REGION: "ap-south-1",
  OBJECT_STORAGE_BUCKET: "private-bucket",
  OBJECT_STORAGE_ACCESS_KEY_ID: "key-id",
  OBJECT_STORAGE_SECRET_ACCESS_KEY: "secret-key",
};
beforeEach(() => {
  for (const [k, v] of Object.entries(ENV)) {
    process.env[k] = v;
  }
  mockSend.mockReset();
  mockGetSignedUrl.mockReset();
});

// Lazy imports (after mocks are registered)
const { ObjectStorageService, ObjectNotFoundError } = await import(
  "../lib/objectStorage"
);

// ---------------------------------------------------------------------------
// Helper: build a fake HeadObject 404 error
// ---------------------------------------------------------------------------
function notFoundError() {
  const err = Object.assign(new Error("Not Found"), {
    name: "NotFound",
    $metadata: { httpStatusCode: 404 },
  });
  return err;
}

// ---------------------------------------------------------------------------
// 1. getObjectEntityUploadURL
// ---------------------------------------------------------------------------

describe("ObjectStorageService.getObjectEntityUploadURL", () => {
  it("returns a signed PUT URL", async () => {
    mockGetSignedUrl.mockResolvedValue(
      "https://xyz.supabase.co/storage/v1/s3/private-bucket/uploads/abc-123?X-Amz-Signature=sig",
    );
    const svc = new ObjectStorageService();
    const url = await svc.getObjectEntityUploadURL();
    expect(url).toContain("uploads/");
    expect(url).toContain("X-Amz-Signature");
  });
});

// ---------------------------------------------------------------------------
// 2. normalizeObjectEntityPath
// ---------------------------------------------------------------------------

describe("ObjectStorageService.normalizeObjectEntityPath", () => {
  it("extracts /objects/uploads/<uuid> from a path-style S3 URL", () => {
    const svc = new ObjectStorageService();
    const url =
      "https://xyz.supabase.co/storage/v1/s3/private-bucket/uploads/abc-123?X-Amz-Credential=x";
    expect(svc.normalizeObjectEntityPath(url)).toBe("/objects/uploads/abc-123");
  });

  it("passes through canonical paths unchanged", () => {
    const svc = new ObjectStorageService();
    const path = "/objects/uploads/def-456";
    expect(svc.normalizeObjectEntityPath(path)).toBe(path);
  });

  it("handles URLs that are not valid without throwing", () => {
    const svc = new ObjectStorageService();
    // not a URL, not a canonical path — returned as-is
    const raw = "not-a-url";
    expect(svc.normalizeObjectEntityPath(raw)).toBe("not-a-url");
  });
});

// ---------------------------------------------------------------------------
// 3. getObjectEntityFile
// ---------------------------------------------------------------------------

describe("ObjectStorageService.getObjectEntityFile", () => {
  it("returns an ObjectHandle when the object exists", async () => {
    mockSend.mockResolvedValue({ ContentLength: 1024, ContentType: "image/png" });
    const svc = new ObjectStorageService();
    const handle = await svc.getObjectEntityFile("/objects/uploads/abc-123");
    expect(handle.bucket).toBe("private-bucket");
    expect(handle.key).toBe("uploads/abc-123");
  });

  it("throws ObjectNotFoundError for a 404 from S3", async () => {
    mockSend.mockRejectedValue(notFoundError());
    const svc = new ObjectStorageService();
    await expect(
      svc.getObjectEntityFile("/objects/uploads/missing"),
    ).rejects.toBeInstanceOf(ObjectNotFoundError);
  });

  it("throws ObjectNotFoundError for paths that don't start with /objects/", async () => {
    const svc = new ObjectStorageService();
    await expect(
      svc.getObjectEntityFile("/other/path"),
    ).rejects.toBeInstanceOf(ObjectNotFoundError);
  });

  it("throws ObjectNotFoundError for an empty key after /objects/", async () => {
    const svc = new ObjectStorageService();
    await expect(svc.getObjectEntityFile("/objects/")).rejects.toBeInstanceOf(
      ObjectNotFoundError,
    );
  });
});

// ---------------------------------------------------------------------------
// 4. getObjectMetadata
// ---------------------------------------------------------------------------

describe("ObjectStorageService.getObjectMetadata", () => {
  it("maps ContentLength and ContentType from HeadObject", async () => {
    const headResult = { ContentLength: 2048, ContentType: "application/pdf" };
    mockSend.mockResolvedValue(headResult);
    const svc = new ObjectStorageService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = { bucket: "private-bucket", key: "uploads/x", _meta: headResult } as any;
    const meta = await svc.getObjectMetadata(handle);
    expect(meta.size).toBe(2048);
    expect(meta.contentType).toBe("application/pdf");
  });
});

// ---------------------------------------------------------------------------
// 5. downloadObject
// ---------------------------------------------------------------------------

describe("ObjectStorageService.downloadObject", () => {
  it("builds a Response with correct headers", async () => {
    const headResult = {
      ContentLength: 512,
      ContentType: "image/jpeg",
    };
    // First call: headObject (cached in handle); second call: GetObject body stream
    const fakeStream = new ReadableStream();
    mockSend
      .mockResolvedValueOnce({ Body: { transformToWebStream: () => fakeStream } });

    const svc = new ObjectStorageService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = {
      bucket: "private-bucket",
      key: "uploads/img",
      _meta: headResult,
    } as any;
    const resp = await svc.downloadObject(handle);
    expect(resp.headers.get("Content-Type")).toBe("image/jpeg");
    expect(resp.headers.get("Content-Length")).toBe("512");
    expect(resp.headers.get("Cache-Control")).toContain("private");
  });
});

// ---------------------------------------------------------------------------
// Helper: Mocked route apps
// ---------------------------------------------------------------------------

// Shared S3 mock used by route-level tests.
const mockHeadSend = mockSend; // shared mock

vi.mock("@workspace/db", () => {
  const selectChain = {
    from: () => selectChain,
    where: () => selectChain,
    innerJoin: () => selectChain,
    limit: async () => [],
    orderBy: async () => [],
  };
  const insertChain = {
    values: () => insertChain,
    returning: async () => [
      {
        id: 1,
        referenceNumber: "REF-001",
        jobId: null,
        fullName: "Test",
        email: "test@test.com",
        phone: "1234",
        city: "City",
        qualification: "grad",
        college: null,
        graduationYear: null,
        experience: null,
        skills: "js",
        linkedin: null,
        github: null,
        portfolio: null,
        preferredRole: "dev",
        expectedSalary: null,
        joiningAvailability: null,
        resumePath: "/objects/uploads/resume-uuid",
        coverLetter: null,
        ipAddress: "127.0.0.1",
        status: "new",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };
  return {
    db: {
      select: () => selectChain,
      insert: () => insertChain,
    },
    projectsTable: {
      id: "id",
      published: "published",
      thumbnailPath: "thumbnailPath",
      slug: "slug",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    projectImagesTable: {
      id: "id",
      projectId: "projectId",
      imagePath: "imagePath",
    },
    jobsTable: { id: "id", status: "status", createdAt: "createdAt" },
    jobApplicationsTable: {
      id: "id",
      referenceNumber: "referenceNumber",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  };
});

vi.mock("../lib/emailQueue", () => ({
  enqueueInquiryNotification: vi.fn(async () => {}),
}));

vi.mock("../lib/emailNotifications", () => ({
  buildJobApplicationEmail: vi.fn(() => ({})),
  buildApplicationAutoReplyEmail: vi.fn(() => ({})),
}));

vi.mock("../lib/leadTracking", () => ({
  generateReferenceNumber: vi.fn(() => "REF-001"),
  getClientIp: vi.fn(() => "127.0.0.1"),
  checkRateLimit: vi.fn(() => true),
  findRecentDuplicate: vi.fn(() => null),
  rememberSubmission: vi.fn(),
}));

// ---------------------------------------------------------------------------
// 6. verifyUploadedResume (careers route integration)
// ---------------------------------------------------------------------------

const { default: careersRouter } = await import("../routes/careers");

function makeCareersApp(): Express {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as unknown as { log: Record<string, Mock> }).log = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    next();
  });
  app.use(careersRouter);
  return app;
}

const VALID_APPLICATION = {
  fullName: "Alice Smith",
  email: "alice@example.com",
  phone: "+15551234567",
  city: "New York",
  qualification: "bachelor",
  skills: "TypeScript, Node.js",
  preferredRole: "Backend Engineer",
  resumePath: "/objects/uploads/resume-uuid",
};

describe("POST /careers/applications – resume verification", () => {
  it("rejects a resumePath that does not start with /objects/uploads/", async () => {
    const app = makeCareersApp();
    const res = await request(app)
      .post("/careers/applications")
      .send({ ...VALID_APPLICATION, resumePath: "/other/path/resume.pdf" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid resume upload/i);
  });

  it("rejects when the object does not exist in storage (404)", async () => {
    mockSend.mockRejectedValue(notFoundError());
    const app = makeCareersApp();
    const res = await request(app)
      .post("/careers/applications")
      .send(VALID_APPLICATION);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("rejects a file that is too large", async () => {
    const oversize = 11 * 1024 * 1024;
    mockSend.mockResolvedValue({
      ContentLength: oversize,
      ContentType: "application/pdf",
    });
    const app = makeCareersApp();
    const res = await request(app)
      .post("/careers/applications")
      .send(VALID_APPLICATION);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/too large/i);
  });

  it("rejects an unsupported content type (e.g. image/png)", async () => {
    mockSend.mockResolvedValue({
      ContentLength: 500_000,
      ContentType: "image/png",
    });
    const app = makeCareersApp();
    const res = await request(app)
      .post("/careers/applications")
      .send(VALID_APPLICATION);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/unsupported file type/i);
  });

  it("accepts a valid PDF resume", async () => {
    mockSend.mockResolvedValue({
      ContentLength: 500_000,
      ContentType: "application/pdf",
    });
    const app = makeCareersApp();
    const res = await request(app)
      .post("/careers/applications")
      .send(VALID_APPLICATION);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("received");
  });

  it("accepts application/octet-stream (browser fallback)", async () => {
    mockSend.mockResolvedValue({
      ContentLength: 300_000,
      ContentType: "application/octet-stream",
    });
    const app = makeCareersApp();
    const res = await request(app)
      .post("/careers/applications")
      .send(VALID_APPLICATION);
    expect(res.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// 7. verifyUploadedObjectPath (storage route – request-url)
// ---------------------------------------------------------------------------

describe("POST /storage/uploads/request-url", () => {
  it("returns 401/403 without admin auth (isAdminRequest returns false)", async () => {
    // requireAdmin rejects unauthenticated requests
    const { default: storageRouter } = await import("../routes/storage");
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      (req as unknown as { log: Record<string, Mock> }).log = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      next();
    });
    app.use(storageRouter);
    const res = await request(app)
      .post("/storage/uploads/request-url")
      .send({ name: "test.png", size: 1024, contentType: "image/png" });
    // Without a Supabase bearer token → 401 or 403
    expect([401, 403]).toContain(res.status);
  });
});
