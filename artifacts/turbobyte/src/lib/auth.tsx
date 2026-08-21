/**
 * Supabase Auth React context.
 *
 * Provides:
 *  - useAuth()     — session, user, loading state, sign-in/out helpers
 *  - AuthProvider  — wrap the app with this to provide admin auth state
 *
 * Also registers setAuthTokenGetter so every generated API hook automatically
 * attaches a Bearer token to its requests.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import {
  loadStoredSession,
  storeSession,
  signInWithPassword as supabaseSignIn,
  signOut as supabaseSignOut,
  refreshSession,
  type SupabaseSession,
  type SupabaseUser,
} from './supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthContextValue {
  /** Current Supabase session, or null when signed out. */
  session: SupabaseSession | null;
  /** Shortcut to session.user; null when signed out. */
  user: SupabaseUser | null;
  /** True while the initial stored-session check is in progress. */
  loading: boolean;
  /** Sign in with email + password. Throws on failure. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Sign out and clear the session. */
  signOut: () => Promise<void>;
  /** Raw access token, or null when signed out. */
  getToken: () => Promise<string | null>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

// Refresh the token 60 s before it expires so requests never hit a stale token.
const REFRESH_BUFFER_SECONDS = 60;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qc = useQueryClient();

  // ------------------------------------------------------------------
  // Schedule a proactive token refresh
  // ------------------------------------------------------------------
  const scheduleRefresh = useCallback((sess: SupabaseSession) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    const expiresAt = sess.expires_at; // unix seconds
    if (!expiresAt) return;

    const msUntilRefresh = Math.max(
      0,
      (expiresAt - REFRESH_BUFFER_SECONDS) * 1000 - Date.now(),
    );

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const newSession = await refreshSession(sess.refresh_token);
        storeSession(newSession);
        setSession(newSession);
        scheduleRefresh(newSession);
      } catch {
        // Refresh failed — treat as signed out.
        storeSession(null);
        setSession(null);
        qc.clear();
      }
    }, msUntilRefresh);
  }, [qc]);

  // ------------------------------------------------------------------
  // On mount: load persisted session
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = loadStoredSession();
      if (!stored) {
        if (!cancelled) setLoading(false);
        return;
      }

      // If the token hasn't expired yet, use it directly.
      const expiresAt = stored.expires_at;
      const isValid = !expiresAt || expiresAt * 1000 > Date.now();

      if (isValid) {
        if (!cancelled) {
          setSession(stored);
          scheduleRefresh(stored);
          setLoading(false);
        }
        return;
      }

      // Token is expired — try to refresh silently.
      try {
        const refreshed = await refreshSession(stored.refresh_token);
        storeSession(refreshed);
        if (!cancelled) {
          setSession(refreshed);
          scheduleRefresh(refreshed);
        }
      } catch {
        storeSession(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [scheduleRefresh]);

  // ------------------------------------------------------------------
  // Register the token getter so generated API hooks attach Bearer tokens
  // ------------------------------------------------------------------
  useEffect(() => {
    setAuthTokenGetter(async () => {
      if (!session) return null;

      // Proactively refresh if close to expiry (belt-and-suspenders).
      const expiresAt = session.expires_at;
      if (expiresAt && expiresAt * 1000 < Date.now() + REFRESH_BUFFER_SECONDS * 1000) {
        try {
          const refreshed = await refreshSession(session.refresh_token);
          storeSession(refreshed);
          setSession(refreshed);
          scheduleRefresh(refreshed);
          return refreshed.access_token;
        } catch {
          return session.access_token; // best-effort fallback
        }
      }

      return session.access_token;
    });

    return () => {
      setAuthTokenGetter(null);
    };
  }, [session, scheduleRefresh]);

  // ------------------------------------------------------------------
  // Auth actions
  // ------------------------------------------------------------------
  const signIn = useCallback(
    async (email: string, password: string) => {
      const newSession = await supabaseSignIn(email, password);
      storeSession(newSession);
      setSession(newSession);
      scheduleRefresh(newSession);
      qc.clear();
    },
    [scheduleRefresh, qc],
  );

  const handleSignOut = useCallback(async () => {
    if (session) {
      try {
        await supabaseSignOut(session.access_token);
      } catch {
        // Best-effort — clear locally regardless.
      }
    }
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    storeSession(null);
    setSession(null);
    qc.clear();
  }, [session, qc]);

  const getToken = useCallback(async (): Promise<string | null> => {
    return session?.access_token ?? null;
  }, [session]);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    signIn,
    signOut: handleSignOut,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
