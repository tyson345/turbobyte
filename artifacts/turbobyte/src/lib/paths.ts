/**
 * Base-path helpers shared across the app.
 * Shared base-path helpers for local previews and root-hosted production builds.
 */

/** The Vite base URL (empty string or a sub-path like "/app"). */
export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * Strips the Vite base path prefix from an absolute path so it can be
 * passed to wouter's setLocation without doubling the prefix.
 */
export function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}
