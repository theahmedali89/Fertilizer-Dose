"use client";

import type { FertilizerInfo } from "@/lib/agronomy";

/**
 * Secondary (localized) fertilizer name shown next to the English name.
 * Uses `localName` (FertilizerTranslation for the current locale, falling back
 * to the legacy `urdu` column), rendered only when it is non-empty and
 * differs from the English name (avoids "Urea urea" redundancy).
 * `lang` reflects the actual language of the shown name.
 */
export function FertilizerLocalName({
  f,
  locale,
  className,
}: {
  f: FertilizerInfo;
  locale: string;
  className?: string;
}) {
  const name = (f.localName ?? f.urdu ?? "").trim();
  if (!name || name.toLowerCase() === f.name.toLowerCase()) return null;
  return (
    <span className={className} lang={locale === "en" ? "ur" : locale}>
      {name}
    </span>
  );
}
