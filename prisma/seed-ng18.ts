/**
 * Nigeria 17-crop NPK dose population — Ahmed supplied 2026-10-13.
 * User-provided data with authentic Nigerian research sources
 * (IITA Ibadan, IAR Samaru Zaria, NRCRI Umudike, NCRI Badeggi,
 * NIFOR Benin City, CRIN Ibadan, NIHORT Ibadan, LCRI Maiduguri).
 *
 * SCOPE: Nigeria (NG) ONLY — new country. FertilizerRecommendation rows
 * + 4 missing GrowingItems (yam, cowpea, pepper, okra) + Source records.
 * No other countries.
 *
 * CONVERSIONS: user gave per-HECTARE values → no conversion needed.
 * Per-palm oil-palm dose converted with standard density (~143 palms/ha);
 * the source-faithful per-palm dose is always stated first in
 * applicationMethod.
 *
 * RANGES: nMin/nMax, p2o5Min/p2o5Max, k2oMin/k2oMax store source-faithful
 * ranges; n/p2o5/k2o store the point value only when min == max.
 *
 * VARIANTS: maize → soilContext (Southern Guinea Savanna / Rainforest);
 * rice → irrigationContext (Lowland/Fadama / Upland).
 *
 * STATUS: 'verified' — user supplied with named authentic institutions.
 *
 * IDEMPOTENT: insert-if-missing on (item, country, variety, soilContext,
 * irrigationContext, source); re-running never overwrites admin CMS edits.
 * Safe to run on every deploy.
 *
 * Data lives in prisma/data/ng18/ng18-data.json.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── JSON shapes ──────────────────────────────────────────────────────────

interface NewItem {
  slug: string;
  name: string;
  urdu: string;
  scientificName: string;
  category?: string; // "crop" (default) | "vegetable"
}

interface Ng18Record {
  crop: string;
  variety: string | null;
  soilContext: string | null;
  irrigationContext: string | null;
  n_min: number | null;
  n_max: number | null;
  p2o5_min: number | null;
  p2o5_max: number | null;
  k2o_min: number | null;
  k2o_max: number | null;
  micronutrients: string | null;
  applicationTiming: string | null;
  applicationMethod: string;
  notes: string;
  source_org: string;
  source_org_2: string | null;
  source_title: string;
  newItem?: NewItem;
}

interface Ng18File {
  records: Ng18Record[];
}

function loadFile(): Ng18File {
  const p = join(process.cwd(), "prisma", "data", "ng18", "ng18-data.json");
  return JSON.parse(readFileSync(p, "utf8")) as Ng18File;
}

/** Point value only when min == max; ranges stay null (never midpoints). */
function point(min: number | null, max: number | null): number | null {
  if (min == null || max == null) return null;
  return min === max ? min : null;
}

// ── Main entry ───────────────────────────────────────────────────────────

export async function seedNg18(db: PrismaClient): Promise<void> {
  const f = loadFile();
  const records = f.records ?? [];
  console.log(`ng18: ${records.length} records in file`);

  // ── 1. Nigeria country (upsert guard) ──
  const ng = await db.country.upsert({
    where: { code: "NG" },
    update: {},
    create: {
      code: "NG",
      name: "Nigeria",
      slug: "nigeria",
      defaultUnit: "hectare",
      status: "active",
    },
  });
  const countryId = ng.id;
  console.log(`ng18: country NG ensured (${ng.name})`);

  // ── 2. Missing GrowingItems (insert-if-missing by slug) ──
  const itemIdBySlug = new Map<string, string>(
    (await db.growingItem.findMany({ select: { id: true, slug: true } })).map(
      (i) => [i.slug, i.id] as const,
    ),
  );
  let itemsCreated = 0;
  for (const r of records) {
    const ni = r.newItem;
    if (!ni || itemIdBySlug.has(ni.slug)) continue;
    const created = await db.growingItem.create({
      data: {
        slug: ni.slug,
        name: ni.name,
        urdu: ni.urdu,
        scientificName: ni.scientificName,
        category: ni.category ?? "crop",
        regions: [],
        verificationStatus: "under_review" as VerificationStatus,
        indexable: false,
        published: true,
      },
    });
    itemIdBySlug.set(ni.slug, created.id);
    itemsCreated++;
    console.log(`ng18: created GrowingItem ${ni.slug}`);
  }
  console.log(`ng18: growing items created: ${itemsCreated}`);

  // ── 3. Sources (dedupe by organization+title) ──
  const sourceIdByKey = new Map<string, string>();
  let sourcesCreated = 0;
  const sourceOrgs = (r: Ng18Record): string[] =>
    [r.source_org, r.source_org_2].filter((s): s is string => !!s);
  for (const r of records) {
    for (const org of sourceOrgs(r)) {
      const key = `${org}||${r.source_title}`;
      if (sourceIdByKey.has(key)) continue;
      const existing = await db.source.findFirst({
        where: { organization: org, title: r.source_title },
        select: { id: true },
      });
      if (existing) {
        sourceIdByKey.set(key, existing.id);
        continue;
      }
      const rec = await db.source.create({
        data: {
          organization: org,
          title: r.source_title,
          country: "Nigeria",
          sourceType: "research",
          verificationStatus: "verified" as VerificationStatus,
          notes: `Nigeria NPK dose source (user-supplied 2026-10-13). ${r.notes}`,
        },
      });
      sourceIdByKey.set(key, rec.id);
      sourcesCreated++;
    }
  }
  console.log(`ng18: sources created: ${sourcesCreated}`);

  // ── 4. Fertilizer recommendations (insert-if-missing) ──
  let created = 0;
  let skipped = 0;
  for (const r of records) {
    const itemId = itemIdBySlug.get(r.crop);
    if (!itemId) {
      console.warn(`ng18: skipped (unknown item): ${r.crop}`);
      skipped++;
      continue;
    }
    // Primary source = source_org; source_org_2 is recorded as a second source row
    // but the recommendation links to the primary.
    const sourceId = sourceIdByKey.get(`${r.source_org}||${r.source_title}`);
    if (!sourceId) {
      console.warn(`ng18: skipped (missing source): ${r.crop}`);
      skipped++;
      continue;
    }

    const existing = await db.fertilizerRecommendation.findFirst({
      where: {
        growingItemId: itemId,
        countryId,
        regionId: null,
        variety: r.variety,
        growthStage: null,
        soilContext: r.soilContext,
        irrigationContext: r.irrigationContext,
      },
      select: { id: true },
    });
    if (existing) {
      skipped++;
      continue;
    }

    await db.fertilizerRecommendation.create({
      data: {
        growingItemId: itemId,
        countryId,
        regionId: null,
        variety: r.variety,
        soilContext: r.soilContext,
        irrigationContext: r.irrigationContext,
        growthStage: null,
        n: point(r.n_min, r.n_max),
        p2o5: point(r.p2o5_min, r.p2o5_max),
        k2o: point(r.k2o_min, r.k2o_max),
        nMin: r.n_min,
        nMax: r.n_max,
        p2o5Min: r.p2o5_min,
        p2o5Max: r.p2o5_max,
        k2oMin: r.k2o_min,
        k2oMax: r.k2o_max,
        nutrientBasis: "P2O5_K2O",
        micronutrients: r.micronutrients,
        applicationTiming: r.applicationTiming,
        applicationMethod: `${r.applicationMethod}\n\nSource notes: ${r.notes}\n\nCountry context: Nigeria (per-hectare source values, no conversion).`,
        sourceId,
        verificationStatus: "verified" as VerificationStatus,
        isPrimary: true,
      },
    });
    created++;
  }
  console.log(`ng18: recommendations created: ${created}, skipped (already present): ${skipped}`);
}
