import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";

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

/**
 * Non-middleware variant: returns true when the request carries a signed-in
 * Clerk session whose verified email is on the admin allowlist. Never throws.
 */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) return false;
  try {
    const user = await clerkClient.users.getUser(userId);
    const verifiedEmails = user.emailAddresses
      .filter((e) => e.verification?.status === "verified")
      .map((e) => e.emailAddress.trim().toLowerCase());
    return verifiedEmails.some((e) => ADMIN_EMAILS.has(e));
  } catch {
    return false;
  }
}

/**
 * Requires a signed-in Clerk session AND that the user's email is on the
 * admin allowlist. Inquiries contain visitor PII, so a mere account is not
 * enough — sign-up is open to anyone.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    // Only verified emails count — an attacker can add (but not verify)
    // someone else's address to their account.
    const verifiedEmails = user.emailAddresses
      .filter((e) => e.verification?.status === "verified")
      .map((e) => e.emailAddress.trim().toLowerCase());
    if (!verifiedEmails.some((e) => ADMIN_EMAILS.has(e))) {
      req.log.warn({ userId }, "Non-admin attempted admin endpoint");
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch (err) {
    req.log.error({ err }, "Admin check failed");
    res.status(500).json({ error: "Internal error" });
  }
}
