import { randomInt } from "node:crypto";
import type { Request } from "express";

/**
 * Lead-tracking helpers for public inquiry submissions: reference numbers,
 * client metadata capture (IP / browser / device), a per-IP rate limiter,
 * and a short-window duplicate-submission guard.
 */

/** e.g. TBT-20260725-4831 */
export function generateReferenceNumber(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `TBT-${y}${m}${d}-${randomInt(1000, 10000)}`;
}

/**
 * Client IP, honoring the Replit proxy's X-Forwarded-For chain.
 * Uses the LAST hop in the chain — the value appended by our trusted
 * proxy — so clients cannot spoof a fresh IP per request by prepending
 * arbitrary X-Forwarded-For values (rate-limit bypass).
 */
export function getClientIp(req: Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(fwd) ? fwd.join(",") : fwd;
  if (raw) {
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }
  return req.socket?.remoteAddress ?? null;
}

export interface ClientAgent {
  browser: string | null;
  device: string | null;
}

/** Lightweight user-agent classification — no dependency needed. */
export function parseUserAgent(ua: string | undefined): ClientAgent {
  if (!ua) return { browser: null, device: null };

  let browser: string;
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/chrome\/|crios\//i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua)) browser = "Safari";
  else if (/bot|crawl|spider/i.test(ua)) browser = "Bot";
  else browser = "Other";

  let device: string;
  if (/ipad|tablet/i.test(ua)) device = "Tablet";
  else if (/mobi|iphone|android.*mobile/i.test(ua)) device = "Mobile";
  else if (/android/i.test(ua)) device = "Tablet";
  else device = "Desktop";

  return { browser, device };
}

// ---------------------------------------------------------------------------
// Rate limiting — fixed window per IP, in-memory (single-process server).
// ---------------------------------------------------------------------------

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;

const hits = new Map<string, { count: number; windowStart: number }>();

/** Returns true when the request should be allowed. */
export function checkRateLimit(ip: string | null, now = Date.now()): boolean {
  if (!ip) return true;
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  if (hits.size > 10_000) {
    // Prevent unbounded growth: drop expired windows.
    for (const [key, value] of hits) {
      if (now - value.windowStart >= WINDOW_MS) hits.delete(key);
    }
  }
  return entry.count <= MAX_PER_WINDOW;
}

// ---------------------------------------------------------------------------
// Duplicate-submission guard — same email + same content within a short
// window returns the original reference instead of storing a second lead.
// ---------------------------------------------------------------------------

const DUP_WINDOW_MS = 2 * 60_000;

const recentSubmissions = new Map<
  string,
  { referenceNumber: string; at: number }
>();

export function findRecentDuplicate(
  key: string,
  now = Date.now(),
): string | null {
  const entry = recentSubmissions.get(key);
  if (entry && now - entry.at < DUP_WINDOW_MS) return entry.referenceNumber;
  return null;
}

export function rememberSubmission(
  key: string,
  referenceNumber: string,
  now = Date.now(),
): void {
  recentSubmissions.set(key, { referenceNumber, at: now });
  if (recentSubmissions.size > 5_000) {
    for (const [k, v] of recentSubmissions) {
      if (now - v.at >= DUP_WINDOW_MS) recentSubmissions.delete(k);
    }
  }
}
