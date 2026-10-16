/**
 * Seed localized fertilizer names (FertilizerTranslation).
 *
 * Source: prisma/data/fertilizer-names.json — common farmer/shop names for
 * 10 fertilizers x 18 locales, supplied by Ahmed (2026-10-16). Authoritative
 * user data: upserts on (fertilizerId, locale), updating the name on conflict
 * so Ahmed's corrections always win.
 *
 * SAFETY:
 * - Idempotent: upserts on (fertilizerId, locale).
 * - Matches fertilizers by slug; slugs missing from the DB are reported,
 *   not created.
 * - NEVER touches the Fertilizer.urdu column (admin-editable) — the ur
 *   locale lives in this translation table alongside the other 17.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

export async function seedFertilizerNames(db: PrismaClient) {
  const file = path.join(__dirname, "data", "fertilizer-names.json");
  if (!fs.existsSync(file)) {
    console.log("fertilizer names: data file missing, skipping");
    return;
  }
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
    string,
    Record<string, string> | { note: string; source: string }
  >;

  let upserted = 0;
  let missingFertilizer = 0;
  let skippedEmpty = 0;

  for (const [slug, perLocale] of Object.entries(raw)) {
    if (slug.startsWith("_")) continue;
    const fertilizer = await db.fertilizer.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!fertilizer) {
      console.log(`fertilizer names: slug "${slug}" not in DB, skipping`);
      missingFertilizer++;
      continue;
    }
    for (const [locale, name] of Object.entries(
      perLocale as Record<string, string>,
    )) {
      const clean = (name ?? "").trim();
      if (!clean) {
        skippedEmpty++;
        continue;
      }
      await db.fertilizerTranslation.upsert({
        where: {
          fertilizerId_locale: { fertilizerId: fertilizer.id, locale },
        },
        update: { name: clean },
        create: { fertilizerId: fertilizer.id, locale, name: clean },
      });
      upserted++;
    }
  }
  console.log(
    `fertilizer names: ${upserted} upserted, ${missingFertilizer} missing slugs, ${skippedEmpty} empty skipped`,
  );
}
