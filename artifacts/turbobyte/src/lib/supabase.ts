/**
 * Lightweight Supabase auth client using native fetch.
 * Does NOT depend on @supabase/supabase-js so no package changes are needed.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Defer throw until first use so tree-shaking still works in builds that
  // don't call auth functions.
  console.warn('[auth] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set.');
}

export interface SupabaseUser {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: SupabaseUser;
}

function authHeaders(extraHeaders?: Record<string, string>) {
  return {
    'apikey': SUPABASE_ANON_KEY ?? '',
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
}

function authUrl(path: string) {
  return `${SUPABASE_URL}/auth/v1${path}`;
}

/**
 * Sign in with email + password.
 * Returns the session or throws an error with a human-readable message.
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SupabaseSession> {
  const res = await fetch(authUrl('/token?grant_type=password'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error_description ?? data?.msg ?? 'Sign in failed');
  }

  return data as SupabaseSession;
}

/**
 * Refresh the session using the stored refresh token.
 */
export async function refreshSession(
  refreshToken: string,
): Promise<SupabaseSession> {
  const res = await fetch(authUrl('/token?grant_type=refresh_token'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error_description ?? data?.msg ?? 'Session refresh failed');
  }

  return data as SupabaseSession;
}

/**
 * Sign out by revoking the session server-side.
 */
export async function signOut(accessToken: string): Promise<void> {
  await fetch(authUrl('/logout'), {
    method: 'POST',
    headers: authHeaders({ Authorization: `Bearer ${accessToken}` }),
  });
}

/**
 * Retrieve the current user from Supabase using an access token.
 * Returns null on any error (expired token, network failure, etc.).
 */
export async function getUser(accessToken: string): Promise<SupabaseUser | null> {
  try {
    const res = await fetch(authUrl('/user'), {
      headers: authHeaders({ Authorization: `Bearer ${accessToken}` }),
    });
    if (!res.ok) return null;
    return (await res.json()) as SupabaseUser;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Session persistence (localStorage)
// ---------------------------------------------------------------------------

const SESSION_KEY = 'tb_supabase_session';

export function loadStoredSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    return null;
  }
}

export function storeSession(session: SupabaseSession | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Private browsing or storage full — silently ignore.
  }
}
