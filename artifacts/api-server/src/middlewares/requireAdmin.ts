import type { Request, Response, NextFunction } from "express";

/**
 * Emails allowed to access admin endpoints. Override with a comma-separated
 * ADMIN_EMAILS env var; defaults to the company inbox.
 */
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "aae@turbobytetech.com,sourabh@turbobytetech.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

interface SupabaseUser {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
}

/**
 * Verify a Supabase bearer token by calling the Supabase /auth/v1/user endpoint.
 * Returns the user object if the token is valid, null otherwise.
 */
async function verifySupabaseToken(token: string): Promise<SupabaseUser | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  }

  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as SupabaseUser;
  return data;
}

/**
 * Extract the bearer token from the Authorization header.
 * Returns null if the header is absent or malformed.
 */
function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

/**
 * Non-middleware variant: returns true when the request carries a valid
 * Supabase JWT whose verified email is on the admin allowlist. Never throws.
 */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const token = extractBearerToken(req);
  if (!token) return false;
  try {
    const user = await verifySupabaseToken(token);
    if (!user) return false;
    // Only allow verified emails (email_confirmed_at is non-null).
    if (!user.email_confirmed_at) return false;
    const email = user.email?.trim().toLowerCase() ?? "";
    return ADMIN_EMAILS.has(email);
  } catch {
    return false;
  }
}

/**
 * Requires a valid Supabase JWT AND that the user's verified email is on the
 * admin allowlist. Inquiries contain visitor PII so a mere account is not
 * enough — accounts are created by admin invitation only.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await verifySupabaseToken(token);

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Only verified emails count — email_confirmed_at must be non-null.
    if (!user.email_confirmed_at) {
      req.log.warn({ userId: user.id }, "Unverified email attempted admin endpoint");
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const email = user.email?.trim().toLowerCase() ?? "";
    if (!ADMIN_EMAILS.has(email)) {
      req.log.warn({ userId: user.id, email }, "Non-admin attempted admin endpoint");
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  } catch (err) {
    req.log.error({ err }, "Admin check failed");
    res.status(500).json({ error: "Internal error" });
  }
}
