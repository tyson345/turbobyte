/**
 * Object storage backed by Supabase Storage (S3-compatible API).
 *
 * Environment variables:
 *   OBJECT_STORAGE_ENDPOINT       – Supabase S3 endpoint
 *                                   e.g. https://<project>.supabase.co/storage/v1/s3
 *   OBJECT_STORAGE_REGION         – AWS/Supabase region (e.g. ap-south-1)
 *   OBJECT_STORAGE_BUCKET         – private bucket name
 *   OBJECT_STORAGE_PUBLIC_BUCKET  – (optional) public bucket name; falls back to
 *                                   OBJECT_STORAGE_BUCKET if not set
 *   OBJECT_STORAGE_ACCESS_KEY_ID  – service-role access key id
 *   OBJECT_STORAGE_SECRET_ACCESS_KEY – service-role secret key
 *
 * Path convention:
 *   All upload slots are placed at:  uploads/<uuid>
 *   The API surface uses:            /objects/uploads/<uuid>
 *
 * The public-objects search-paths feature is not applicable in this S3 backend;
 * use the GET /storage/objects/* route (which gates on DB references) instead.
 */

import { randomUUID } from 'crypto';
import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type HeadObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ---------------------------------------------------------------------------
// Configuration helpers
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Configure Supabase S3 credentials in environment variables.`,
    );
  }
  return value;
}

function getConfig() {
  return {
    endpoint: requireEnv('OBJECT_STORAGE_ENDPOINT'),
    region: requireEnv('OBJECT_STORAGE_REGION'),
    bucket: requireEnv('OBJECT_STORAGE_BUCKET'),
    publicBucket:
      process.env.OBJECT_STORAGE_PUBLIC_BUCKET ||
      requireEnv('OBJECT_STORAGE_BUCKET'),
    accessKeyId: requireEnv('OBJECT_STORAGE_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('OBJECT_STORAGE_SECRET_ACCESS_KEY'),
  };
}

function buildS3Client(): S3Client {
  const cfg = getConfig();
  return new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
    // Required for path-style S3-compatible APIs (Supabase, MinIO, etc.)
    forcePathStyle: true,
  });
}

// Lazily constructed singleton — avoids config errors at module load time.
let _s3Client: S3Client | null = null;
function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = buildS3Client();
  }
  return _s3Client;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ObjectNotFoundError extends Error {
  constructor() {
    super('Object not found');
    this.name = 'ObjectNotFoundError';
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Internal metadata type (mirrors what the old GCS File metadata looked like)
// ---------------------------------------------------------------------------

export interface ObjectMetadata {
  size?: number;
  contentType?: string;
  /** raw HeadObject output for advanced use */
  raw: HeadObjectCommandOutput;
}

// ---------------------------------------------------------------------------
// Internal object handle (replaces GCS File)
// ---------------------------------------------------------------------------

export interface ObjectHandle {
  bucket: string;
  key: string;
  /** Lazily fetched and cached head metadata */
  _meta?: HeadObjectCommandOutput;
}

async function headObject(
  handle: ObjectHandle,
): Promise<HeadObjectCommandOutput> {
  if (handle._meta) return handle._meta;
  const s3 = getS3Client();
  const result = await s3.send(
    new HeadObjectCommand({ Bucket: handle.bucket, Key: handle.key }),
  );
  handle._meta = result;
  return result;
}

async function getObjectStream(handle: ObjectHandle): Promise<ReadableStream> {
  const s3 = getS3Client();
  const result = await s3.send(
    new GetObjectCommand({ Bucket: handle.bucket, Key: handle.key }),
  );
  if (!result.Body) {
    throw new ObjectNotFoundError();
  }
  // AWS SDK v3 Body is a web ReadableStream in Node >= 18
  return result.Body.transformToWebStream();
}

// ---------------------------------------------------------------------------
// The main service class (preserves public API surface)
// ---------------------------------------------------------------------------

export class ObjectStorageService {
  /**
   * Returns a presigned PUT URL for a fresh upload slot and the canonical
   * `/objects/uploads/<uuid>` path the caller must retain.
   *
   * TTL: 15 minutes.
   */
  async getObjectEntityUploadURL(): Promise<string> {
    const cfg = getConfig();
    const s3 = getS3Client();

    const objectId = randomUUID();
    const key = `uploads/${objectId}`;

    const putCommand = new PutObjectCommand({ Bucket: cfg.bucket, Key: key });
    const signedUrl = await getSignedUrl(s3, putCommand, { expiresIn: 900 });
    return signedUrl;
  }

  /**
   * Converts a raw signed PUT URL back to the canonical `/objects/…` path.
   * For S3-compatible storage (Supabase) the URL path may include endpoint
   * prefix segments, e.g.:
   *   https://<host>/storage/v1/s3/<bucket>/uploads/<uuid>?X-Amz-…
   *
   * Strategy: locate the bucket name in the URL path segments, take everything
   * after it as the object key.
   */
  normalizeObjectEntityPath(rawUrl: string): string {
    // If it's already a canonical path, return as-is.
    if (rawUrl.startsWith('/objects/')) {
      return rawUrl;
    }

    try {
      const cfg = getConfig();
      const url = new URL(rawUrl);
      const segments = url.pathname.split('/').filter(Boolean);
      // Find the bucket name segment and take everything after it as the key.
      const bucketIdx = segments.indexOf(cfg.bucket);
      if (bucketIdx !== -1 && bucketIdx < segments.length - 1) {
        const key = segments.slice(bucketIdx + 1).join('/');
        return `/objects/${key}`;
      }
      // Fallback: first segment is bucket, rest is key (simple path-style)
      if (segments.length >= 2) {
        const key = segments.slice(1).join('/');
        return `/objects/${key}`;
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  }

  /**
   * Resolves a canonical `/objects/…` path to an ObjectHandle and verifies
   * the object exists.  Throws ObjectNotFoundError if missing.
   *
   * Accepted path format: /objects/uploads/<uuid>
   */
  async getObjectEntityFile(objectPath: string): Promise<ObjectHandle> {
    if (!objectPath.startsWith('/objects/')) {
      throw new ObjectNotFoundError();
    }

    const key = objectPath.slice('/objects/'.length); // e.g. "uploads/<uuid>"
    if (!key) {
      throw new ObjectNotFoundError();
    }

    const cfg = getConfig();
    const s3 = getS3Client();

    try {
      const meta = await s3.send(
        new HeadObjectCommand({ Bucket: cfg.bucket, Key: key }),
      );
      const handle: ObjectHandle = { bucket: cfg.bucket, key, _meta: meta };
      return handle;
    } catch (err: unknown) {
      const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (
        e.name === 'NotFound' ||
        e.name === 'NoSuchKey' ||
        e.$metadata?.httpStatusCode === 404
      ) {
        throw new ObjectNotFoundError();
      }
      throw err;
    }
  }

  /**
   * Returns the metadata for an object handle.
   */
  async getObjectMetadata(handle: ObjectHandle): Promise<ObjectMetadata> {
    const meta = await headObject(handle);
    return {
      size: meta.ContentLength,
      contentType: meta.ContentType,
      raw: meta,
    };
  }

  /**
   * Streams the object body as a Fetch-compatible Response.
   * Used by the storage route to proxy object bytes to the client.
   */
  async downloadObject(
    handle: ObjectHandle,
    cacheTtlSec: number = 3600,
  ): Promise<Response> {
    const meta = await headObject(handle);
    const stream = await getObjectStream(handle);

    const headers: Record<string, string> = {
      'Content-Type': meta.ContentType ?? 'application/octet-stream',
      'Cache-Control': `private, max-age=${cacheTtlSec}`,
    };
    if (meta.ContentLength !== undefined) {
      headers['Content-Length'] = String(meta.ContentLength);
    }

    return new Response(stream, { headers });
  }

  // -------------------------------------------------------------------------
  // Legacy / compatibility stubs — these were used by old GCS objectAcl flow.
  // They are no-ops in the S3 backend; access control is handled at the route
  // layer via DB references and the requireAdmin middleware.
  // -------------------------------------------------------------------------

  /** @deprecated No-op in S3 backend. */
  async trySetObjectEntityAclPolicy(rawPath: string): Promise<string> {
    return this.normalizeObjectEntityPath(rawPath);
  }
}
