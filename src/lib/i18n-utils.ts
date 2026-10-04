import { LOCALE_CODES, routing } from "@/i18n/routing";

/** Recursive merge: `over` wins; missing keys fall back to `base` (English). */
export function deepMerge(
  base: Record<string, unknown>,
  over: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (
      v !== null &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      typeof out[k] === "object" &&
      out[k] !== null &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMerge(
        out[k] as Record<string, unknown>,
        v as Record<string, unknown>
      );
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Remove a locale prefix (/hi/calculator -> /calculator). */
export function stripLocalePrefix(pathname: string): string {
  const seg = pathname.split("/")[1];
  if (LOCALE_CODES.includes(seg) && seg !== routing.defaultLocale) {
    const rest = pathname.slice(seg.length + 1);
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

/**
 * Build the equivalent path in another locale.
 * en is unprefixed; all others are prefixed.
 */
export function localizePath(pathname: string, locale: string): string {
  const base = stripLocalePrefix(pathname);
  if (locale === routing.defaultLocale) return base;
  return base === "/" ? `/${locale}` : `/${locale}${base}`;
}

/** hreflang alternates for a base path (used in metadata + sitemap). */
export function hreflangAlternates(
  siteUrl: string,
  basePath: string
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const code of LOCALE_CODES) {
    out[code] = `${siteUrl}${localizePath(basePath, code)}`;
  }
  out["x-default"] = `${siteUrl}${basePath}`;
  return out;
}
