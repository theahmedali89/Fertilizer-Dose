import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { hreflangAlternates, localizePath } from "./i18n-utils";

const OG_LOCALE_FALLBACK = (code: string) => `${code}_${code.toUpperCase()}`;

/**
 * Per-page metadata with localized canonical + full hreflang set.
 * Every indexable page should use this (pass its own base path, e.g. "/calculator").
 */
export function localizedMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  /** Base path WITHOUT locale prefix, e.g. "/calculator" or "/crops/wheat" */
  path: string;
  title: string;
  description: string;
}): Metadata {
  const canonical = `${siteConfig.url}${localizePath(path, locale)}`;
  // 17 of 18 dictionaries are English-fallback scaffolds. Until real
  // translations land, keep non-English variants out of the index to avoid
  // mass duplicate content. Revisit per-locale when translations ship.
  const indexable = locale === "en";
  return {
    // Absolute title: includes the brand suffix here because a child string
    // title would otherwise discard the layout's template on merge.
    title: { absolute: `${title} · ${siteConfig.name}` },
    description,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: {
      canonical,
      languages: hreflangAlternates(siteConfig.url, path),
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url: canonical,
      locale: OG_LOCALE_FALLBACK(locale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
