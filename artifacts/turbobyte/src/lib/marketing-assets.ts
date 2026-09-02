import { basePath } from '@/lib/paths';

const MARKETING_ASSET_VERSION = '2026-09-02-1';

export function marketingAssetUrl(src: string) {
  const resolvedSrc = src.startsWith('/') ? `${basePath}${src}` : src;

  if (!resolvedSrc.includes('/images/marketing/')) {
    return resolvedSrc;
  }

  const separator = resolvedSrc.includes('?') ? '&' : '?';
  return `${resolvedSrc}${separator}v=${MARKETING_ASSET_VERSION}`;
}