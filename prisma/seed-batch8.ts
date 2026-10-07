/**
 * Batch 8 agricultural data population — Ahmed approved 2026-10-07
 * ("yes populate kro 8 bach"). Do NOT add other crops here.
 *
 * ITEM — batch-8 crops × PK/IN (from research-batch8/batch8-data.json):
 *   citrus 7 (PK kinnow 2 under_review; IN Nagpur mandarin C-IN-1 verified
 *   primary + C-IN-2 under_review urea-conflict + C-IN-5 verified non-bearing
 *   + TNAU Palani/Shervaroyan 2 under_review), grape 3 (IN: G-IN-1 verified
 *   primary + G-IN-12 verified DERIVED annual total; PK: G-PK-1 under_review
 *   only — PK grape stays an effective gap), olive 1 (O-PK-1 under_review
 *   only — elemental-vs-product ambiguity, 267 N suspicious).
 *
 * HELD (not populated): C-PK-3 (low, review paper, no primary attribution);
 *   G-IN-2…G-IN-11 (10 NRCG fertigation stage rows — calculator has no stage
 *   handling; populating stages AND the annual total would double-count).
 * REFUSED: C-PK-4 + C-IN-6 (trial rates, not recommendations); G-IN-13/14
 *   (K2O 1000 anomaly — needs agronomist); O-PK-2 (1-yr sapling trial).
 *   Rye: confirmed gap in both countries (2nd pass) — nothing populated.
 *
 * IDEMPOTENT: every write is insert-if-missing, so re-running the seed
 * never duplicates rows and never overwrites admin CMS edits. Safe to run
 * on every deploy.
 *
 * Data lives in prisma/data/batch8/batch8-data.json.
 * No planting windows (perennial precedent: coffee/rubber/oil-palm batch 6/7).
 * No new regions (in-mh, in-tn, pk-kpk, pk-punjab all exist).
 *
 * Schema note (batch-6/7 precedent): caveats mapped to growthStage
 * (non-bearing vs bearing; mature olive), applicationMethod (oxide
 * ambiguity, elemental-vs-product ambiguity, conflicts, derived-total
 * warnings, taxonomy notes), applicationTiming (perennial kg/ha/YEAR),
 * Source.notes (provenance caveats). isPrimary marks official institution
 * schedules only (CCRI PoP quote, ICAR-NRCG) — advisory/trial/derived
 * records stay non-primary.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── Extractor JSON shapes (same as batch7) ─────────────────────────────

interface BatchSource {
  key: string;
  organization: string;
  title: string;
  url?: string | null;
  country?: string | null;
  sourceType?: string | null;
  notes?: string | null;
}
interface BatchRecommendation {
  itemSlug: string;
  countryCode: string;
  regionSlug: string | null;
  variety?: string | null;
  growthStage?: string | null;
  n: number | null;
  p2o5: number | null;
  k2o: number | null;
  micronutrients?: string | null;
  applicationTiming?: string | null;
  applicationMethod?: string | null;
  soilContext?: string | null;
  irrigationContext?: string | null;
  sourceKey: string;
  verificationStatus: string;
  isPrimary?: boolean | null;
}
interface BatchFile {
  sources: BatchSource[];
  recommendations?: BatchRecommendation[];
}

function loadBatchFile(name: string): BatchFile {
  const p = join(process.cwd(), "prisma", "data", "batch8", name);
  return JSON.parse(readFileSync(p, "utf8")) as BatchFile;
}

function vs(s: string): VerificationStatus {
  return (s === "verified" ? "verified" : s === "under_review" ? "under_review" : "draft") as VerificationStatus;
}

// ── Main entry ─────────────────────────────────────────────────────────

export async function seedBatch8(db: PrismaClient): Promise<void> {
  const f = loadBatchFile("batch8-data.json");

  // ── 1. Countries (IN + PK) ──
  const countryIdByCode = new Map<string, string>();
  for (const code of ["IN", "PK"]) {
    const c = await db.country.findUnique({ where: { code }, select: { id: true } });
    if (c) countryIdByCode.set(code, c.id);
    else console.warn(`batch8: country ${code} not found`);
  }
  if (!countryIdByCode.get("IN") || !countryIdByCode.get("PK")) {
    console.warn("batch8: IN/PK country missing, skipped");
    return;
  }

  // ── 2. Sources (dedupe by organization+title) ──
  const sourceIdByKey = new Map<string, string>();
  let sourceCount = 0;
  for (const s of f.sources) {
    if (sourceIdByKey.has(s.key)) continue;
    const existing = await db.source.findFirst({
      where: { organization: s.organization, title: s.title },
      select: { id: true },
    });
    if (existing) {
      sourceIdByKey.set(s.key, existing.id);
      continue;
    }
    const rec = await db.source.create({
      data: {
        organization: s.organization,
        title: s.title,
        url: s.url ?? null,
        country: s.country ?? null,
        sourceType: s.sourceType ?? null,
        verificationStatus: "under_review",
        notes: s.notes ?? null,
      },
    });
    sourceIdByKey.set(s.key, rec.id);
    sourceCount++;
  }
  console.log(`batch8: sources created: ${sourceCount}`);

  // ── 3. Lookup maps ──
  const itemIdBySlug = new Map(
    (await db.growingItem.findMany({ select: { id: true, slug: true } })).map((i) => [i.slug, i.id] as const)
  );
  const regionIdBySlug = new Map(
    (await db.region.findMany({ select: { id: true, slug: true } })).map((r) => [r.slug, r.id] as const)
  );

  // ── 4. Fertilizer recommendations (insert-if-missing) ──
  let recCount = 0, recSkipped = 0;
  for (const r of f.recommendations ?? []) {
    const itemId = itemIdBySlug.get(r.itemSlug);
    const regionId = r.regionSlug ? regionIdBySlug.get(r.regionSlug) ?? null : null;
    const sourceId = sourceIdByKey.get(r.sourceKey);
    const recCountryId = countryIdByCode.get(r.countryCode) ?? null;
    if (!itemId || !sourceId || !recCountryId) {
      console.warn(`batch8: recommendation skipped (missing ref): ${r.itemSlug}/${r.countryCode}/${r.sourceKey}`);
      recSkipped++;
      continue;
    }
    if (r.regionSlug && !regionId) {
      console.warn(`batch8: recommendation skipped (unknown region): ${r.regionSlug}`);
      recSkipped++;
      continue;
    }
    const growthStage = r.growthStage ?? null;
    const variety = r.variety ?? null;
    const soilContext = r.soilContext ?? null;
    const existing = await db.fertilizerRecommendation.findFirst({
      where: { growingItemId: itemId, countryId: recCountryId, regionId, growthStage, variety, soilContext, sourceId },
      select: { id: true },
    });
    if (existing) {
      // Existing row: refresh verificationStatus (batch-6/7 pattern).
      // isPrimary is only ever promoted to true here — never reset — so an
      // admin marking a different record primary in the CMS is not clobbered
      // by a re-run of this seed.
      await db.fertilizerRecommendation.update({
        where: { id: existing.id },
        data: {
          verificationStatus: vs(r.verificationStatus),
          ...(r.isPrimary === true ? { isPrimary: true } : {}),
        },
      });
      recSkipped++;
      continue;
    }
    await db.fertilizerRecommendation.create({
      data: {
        growingItemId: itemId,
        countryId: recCountryId,
        regionId,
        variety,
        soilContext,
        irrigationContext: r.irrigationContext ?? null,
        growthStage,
        n: r.n, p2o5: r.p2o5, k2o: r.k2o,
        nutrientBasis: "P2O5_K2O",
        micronutrients: r.micronutrients ?? null,
        applicationTiming: r.applicationTiming ?? null,
        applicationMethod: r.applicationMethod ?? null,
        sourceId,
        verificationStatus: vs(r.verificationStatus),
        isPrimary: r.isPrimary === true,
      },
    });
    recCount++;
  }
  console.log(`batch8: recommendations created: ${recCount} (skipped/dupes: ${recSkipped})`);
}
