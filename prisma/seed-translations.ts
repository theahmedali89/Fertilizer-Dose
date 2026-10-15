/**
 * Seed translations of growing-item names.
 *
 * Source: prisma/data/translations.json.
 * Rows WITHOUT "status" (or status "draft") are AI-authored: created with status
 * "draft" and NEVER overwritten, so admin CMS edits survive re-seeding.
 * Rows WITH "status": "reviewed" are human-vetted (Ahmed's dictionary batches):
 * they UPSERT by the @@unique([growingItemId, locale]) key, so the JSON stays
 * the source of truth for reviewed names. A disclaimer is shown in the UI
 * wherever draft names are used.
 *
 * Safe to run on every deploy.
 */
import { PrismaClient } from "@prisma/client";
import translations from "./data/translations.json";

type TranslationRow = {
  itemSlug: string;
  locale: string;
  name: string;
  localName?: string;
  status?: string; // "reviewed" => human-vetted, upsert; otherwise insert-if-missing
};

export async function seedTranslations(db: PrismaClient) {
  const rows = translations as TranslationRow[];
  const items = await db.growingItem.findMany({
    select: { id: true, slug: true },
  });
  const bySlug = new Map(items.map((i) => [i.slug, i.id]));

  let created = 0;
  let upserted = 0;
  let missing = 0;
  for (const t of rows) {
    const growingItemId = bySlug.get(t.itemSlug);
    if (!growingItemId) {
      missing++;
      continue;
    }
    const key = { growingItemId_locale: { growingItemId, locale: t.locale } };
    if (t.status === "reviewed") {
      // Human-vetted: JSON is source of truth — upsert.
      await db.growingItemTranslation.upsert({
        where: key,
        update: { name: t.name, localName: t.localName ?? null, status: "reviewed" },
        create: {
          growingItemId,
          locale: t.locale,
          name: t.name,
          localName: t.localName ?? null,
          status: "reviewed",
        },
      });
      upserted++;
      continue;
    }
    const existing = await db.growingItemTranslation.findUnique({
      where: key,
      select: { id: true },
    });
    if (existing) continue; // never overwrite admin edits on draft rows
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
    `translations: created ${created} draft records, upserted ${upserted} reviewed records` +
      (missing ? `, skipped ${missing} rows with unknown slug` : "")
  );
}
