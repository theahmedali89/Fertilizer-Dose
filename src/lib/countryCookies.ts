/**
 * Cookie names for the globally selected country/region.
 * Client-safe: no server imports — used by both server components
 * (next/headers) and client components (document.cookie).
 */
export const COUNTRY_COOKIE = "FD_COUNTRY";
export const REGION_COOKIE = "FD_REGION";

/** 1 year, in seconds. */
export const COUNTRY_COOKIE_MAX_AGE = 31536000;
