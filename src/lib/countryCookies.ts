/**
 * Cookie names for the globally selected country/region.
 * Client-safe: no server imports — used by both server components
 * (next/headers) and client components (document.cookie).
 */
export const COUNTRY_COOKIE = "FD_COUNTRY";
export const REGION_COOKIE = "FD_REGION";

/** 1 year, in seconds. */
export const COUNTRY_COOKIE_MAX_AGE = 31536000;

/**
 * Client-side cookie readers (document.cookie). These exist so client
 * components can resolve the visitor's saved country/region WITHOUT the
 * server calling cookies() from next/headers — a dynamic API that forces
 * every route using it into per-request SSR (and crashed the static
 * country×crop pages with DYNAMIC_SERVER_USAGE). Returns null when the
 * cookie is absent; the country reader uppercases, the region reader
 * returns the raw slug.
 */
export function readDocumentCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function readCountryCookie(): string | null {
  return readDocumentCookie(COUNTRY_COOKIE)?.toUpperCase() ?? null;
}

export function readRegionCookie(): string | null {
  return readDocumentCookie(REGION_COOKIE);
}
