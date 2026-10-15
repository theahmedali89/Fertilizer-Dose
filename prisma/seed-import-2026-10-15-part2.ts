/**
 * Import 2026-10-15 Part 2 — FR/Okra/Grand Est (Ahmed-approved single record).
 *
 * SCOPE: 1 new FertilizerRecommendation (dedup report 2026-10-15-part2:
 * 127/128 records already imported; only FR/okra/Grand Est is genuinely new).
 *
 * IDEMPOTENT: insert-if-missing on (item, country, region). Safe to re-run.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";

const SOURCE_TITLE = "NPK fertilizer dose recommendation (institutional)";

export async function seedImport20261015Part2(db: PrismaClient): Promise<void> {
  // ── Growing item ──
  const item = await db.growingItem.findUnique({
    where: { slug: "okra" },
    select: { id: true },
  });
  if (!item) {
    console.warn("import-2026-10-15-part2: skipped (unknown item): okra");
    return;
  }

  // ── Country (upsert guard by code) ──
  const country = await db.country.upsert({
    where: { code: "FR" },
    update: {},
    create: { code: "FR", name: "France", slug: "france", defaultUnit: "hectare", status: "active" },
  });

  // ── Region (must already exist — confirmed in seed data) ──
  const region = await db.region.findUnique({
    where: { slug: "fr-grand-est" },
    select: { id: true },
  });
  if (!region) {
    console.warn("import-2026-10-15-part2: skipped (unknown region): fr-grand-est");
    return;
  }

  // ── Source (dedupe by organization+title, same pattern as part 1) ──
  const org = "CTIFL";
  let source = await db.source.findFirst({
    where: { organization: org, title: SOURCE_TITLE },
    select: { id: true },
  });
  if (!source) {
    source = await db.source.create({
      data: {
        organization: org,
        title: SOURCE_TITLE,
        country: "France",
        sourceType: "research",
        verificationStatus: "verified" as VerificationStatus,
        notes: "Institutional NPK source (Ahmed-supplied 2026-10-15, with sources).",
      },
      select: { id: true },
    });
    console.log("import-2026-10-15-part2: source created: CTIFL");
  }

  // ── Fertilizer recommendation (insert-if-missing) ──
  const existing = await db.fertilizerRecommendation.findFirst({
    where: { growingItemId: item.id, countryId: country.id, regionId: region.id },
    select: { id: true },
  });
  if (existing) {
    console.log("import-2026-10-15-part2: FR/okra/fr-grand-est already present, skipped");
    return;
  }

  await db.fertilizerRecommendation.create({
    data: {
      growingItemId: item.id,
      countryId: country.id,
      regionId: region.id,
      n: null, // ranges are source-faithful; point fields stay null (never midpoint)
      p2o5: null,
      k2o: null,
      nMin: 70,
      nMax: 90,
      p2o5Min: 40,
      p2o5Max: 60,
      k2oMin: 60,
      k2oMax: 90,
      nutrientBasis: "P2O5_K2O",
      applicationMethod: "Tunnel cultivation dose — sow May under tunnel / plastic (CTIFL).",
      sourceId: source.id,
      verificationStatus: "verified" as VerificationStatus,
      isPrimary: false, // do not override existing primary
    },
  });
  console.log("import-2026-10-15-part2: inserted FR/okra/fr-grand-est");
}
