/**
 * Seed AI-authored translations of growing-item names.
 *
 * Source: prisma/data/translations.json (45 items x 18 locales = 810 rows).
 * Every record is created with status "draft" — AI translations, NOT native-reviewed.
 * A disclaimer is shown in the UI wherever these names are used.
 *
 * INSERT-IF-MISSING semantics: existing records are NEVER overwritten,
 * so admin CMS edits always survive re-seeding. Safe to run on every deploy.
 */
import { PrismaClient } from "@prisma/client";
import translations from "./data/translations.json";

type TranslationRow = {
  itemSlug: string;
  locale: string;
  name: string;
  localName?: string;
};

export async function seedTranslations(db: PrismaClient) {
  const rows = translations as TranslationRow[];
  const items = await db.growingItem.findMany({
    select: { id: true, slug: true },
  });
  const bySlug = new Map(items.map((i) => [i.slug, i.id]));

  let created = 0;
  let missing = 0;
  for (const t of rows) {
    const growingItemId = bySlug.get(t.itemSlug);
    if (!growingItemId) {
      missing++;
      continue;
    }
    const existing = await db.growingItemTranslation.findUnique({
      where: { growingItemId_locale: { growingItemId, locale: t.locale } },
      select: { id: true },
    });
    if (existing) continue; // never overwrite admin edits
    await db.growingItemTranslation.create({
      data: {
        growingItemId,
        locale: t.locale,
        name: t.name,
        localName: t.localName ?? null,
        status: "draft",
      },
    });
    created++;
  }
  console.log(
    `translations: created ${created} draft records` +
      (missing ? `, skipped ${missing} rows with unknown slug` : "")
  );
}
