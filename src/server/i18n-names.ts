import { db, isDbConfigured } from "@/lib/db";

/**
 * Translated growing-item names for a locale.
 *
 * - "en" (or missing locale) → empty map; English names are canonical.
 * - Draft translations ARE included: the machine-translation disclaimer
 *   banner on non-English locales discloses machine-assisted content
 *   (Ahmed directive 2026-10-08).
 * - Callers fall back to the English `GrowingItem.name` for missing slugs.
 * - Never throws: on DB failure the UI silently stays English.
 */
export async function getTranslatedItemNames(
  slugs: string[],
  locale: string
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (!locale || locale === "en" || slugs.length === 0 || !isDbConfigured()) return out;
  try {
    const rows = await db.growingItemTranslation.findMany({
      where: { locale, item: { slug: { in: slugs } } },
      include: { item: { select: { slug: true } } },
    });
    for (const r of rows) {
      const name = r.name?.trim();
      if (name) out.set(r.item.slug, name);
    }
  } catch (e) {
    console.error("[i18n-names] translation lookup failed:", (e as Error).message);
  }
  return out;
}
