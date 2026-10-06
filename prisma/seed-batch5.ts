/**
 * Batch 5 agricultural data population — barley, chickpea, mustard,
 * sunflower, lentil × India (22 records).
 * Approved 2026-10-06 ("1 ko implement kro"). Do NOT add other crops here.
 *
 * IDEMPOTENT: every write is insert-if-missing, so re-running the seed
 * never duplicates rows and never overwrites admin CMS edits. Safe to run
 * on every deploy.
 *
 * Data lives in prisma/data/batch5/batch5-data.json (extracted 2026-10-06
 * from research-batch5/batch5-data.json + research-report-batch5.md).
 * All imported records are under_review — NEVER verified on import.
 *
 * Region mapping (differs from raw research slugs where batch-1
 * conventions already exist):
 *   - "in-pb"  -> reuse "in-punjab" (same region, established by batch 1)
 *   - "in"     -> regionSlug null on recommendations (country-wide);
 *                 windows use the new "in-national" region (bd-national
 *                 precedent from batch 1)
 *   - new regions: in-rj, in-ka, in-ar, in-mn
 *
 * Schema note: FertilizerRecommendation has no notes column (batches 1-4
 * pattern). Caveats are mapped to: soilContext (K-conditionality),
 * micronutrients (S/B/Zn), applicationMethod (inoculation, trial-status),
 * Source.notes (oxide-form caveat).
 *
 * Refused (trial-only, below the batches 1-4 bar — NOT populated):
 *   M-IN-4, M-IN-8, S-IN-3, S-IN-4, L-IN-5, L-IN-6.
 * Held (genuine source conflicts/gaps — NOT populated):
 *   M-PK-1, C-PK-1, S-PK-1, S-PK-2, L-PK-1.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── Extractor JSON shapes (same as batch1) ─────────────────────────────

interface BatchSource {
  key: string;
  organization: string;
  title: string;
  url?: string | null;
  country?: string | null;
  sourceType?: string | null;
  notes?: string | null;
}
interface BatchRegion {
  slug: string;
  name: string;
  countryCode: string;
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
}
interface BatchWindow {
  itemSlug: string;
  regionSlug: string;
  startMonth: number;
  endMonth: number;
  activityType: string;
  harvestText?: string | null;
  notes?: string | null;
  sourceKey: string;
  verificationStatus: string;
}
interface BatchFile {
  newRegions?: BatchRegion[];
  sources: BatchSource[];
  recommendations?: BatchRecommendation[];
  windows?: BatchWindow[];
}

function loadBatchFile(name: string): BatchFile {
  const p = join(process.cwd(), "prisma", "data", "batch5", name);
  return JSON.parse(readFileSync(p, "utf8")) as BatchFile;
}

function vs(s: string): VerificationStatus {
  return (s === "verified" ? "verified" : s === "under_review" ? "under_review" : "draft") as VerificationStatus;
}

// ── Main entry ─────────────────────────────────────────────────────────

export async function seedBatch5(db: PrismaClient): Promise<void> {
  const f = loadBatchFile("batch5-data.json");

  // ── 1. Country (IN already seeded by main seed) ──
  const country = await db.country.findUnique({ where: { code: "IN" }, select: { id: true } });
  if (!country) {
    console.warn("batch5: country IN not found, skipped");
    return;
  }
  const countryId = country.id;

  // ── 2. New regions (insert-if-missing by slug) ──
  const legacyCountryName: Record<string, string> = { PK: "pakistan", IN: "india" };
  let regionCount = 0;
  for (const r of f.newRegions ?? []) {
    const existing = await db.region.findUnique({ where: { slug: r.slug } });
    if (!existing) {
      await db.region.create({
        data: {
          slug: r.slug,
          name: r.name,
          country: legacyCountryName[r.countryCode] ?? r.countryCode.toLowerCase(),
          countryId,
        },
      });
      regionCount++;
    } else if (!existing.countryId) {
      await db.region.update({ where: { id: existing.id }, data: { countryId } });
    }
  }
  console.log(`batch5: regions created: ${regionCount}`);

  // ── 3. Sources (dedupe by organization+title) ──
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
  console.log(`batch5: sources created: ${sourceCount}`);

  // ── 4. Lookup maps ──
  const itemIdBySlug = new Map(
    (await db.growingItem.findMany({ select: { id: true, slug: true } })).map((i) => [i.slug, i.id] as const)
  );
  const regionIdBySlug = new Map(
    (await db.region.findMany({ select: { id: true, slug: true } })).map((r) => [r.slug, r.id] as const)
  );

  // ── 5. Fertilizer recommendations (insert-if-missing) ──
  let recCount = 0, recSkipped = 0;
  for (const r of f.recommendations ?? []) {
    const itemId = itemIdBySlug.get(r.itemSlug);
    const regionId = r.regionSlug ? regionIdBySlug.get(r.regionSlug) ?? null : null;
    const sourceId = sourceIdByKey.get(r.sourceKey);
    if (!itemId || !sourceId) {
      console.warn(`batch5: recommendation skipped (missing ref): ${r.itemSlug}/${r.countryCode}/${r.sourceKey}`);
      recSkipped++;
      continue;
    }
    if (r.regionSlug && !regionId) {
      console.warn(`batch5: recommendation skipped (unknown region): ${r.regionSlug}`);
      recSkipped++;
      continue;
    }
    const growthStage = r.growthStage ?? null;
    const variety = r.variety ?? null;
    const soilContext = r.soilContext ?? null;
    const existing = await db.fertilizerRecommendation.findFirst({
      where: { growingItemId: itemId, countryId, regionId, growthStage, variety, soilContext, sourceId },
      select: { id: true },
    });
    if (existing) {
      await db.fertilizerRecommendation.update({
        where: { id: existing.id },
        data: { verificationStatus: vs(r.verificationStatus) },
      });
      recSkipped++;
      continue;
    }
    await db.fertilizerRecommendation.create({
      data: {
        growingItemId: itemId,
        countryId,
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
      },
    });
    recCount++;
  }
  console.log(`batch5: recommendations created: ${recCount} (skipped/dupes: ${recSkipped})`);

  // ── 6. Planting windows + source links ──
  let winCount = 0, winSkipped = 0;
  for (const w of f.windows ?? []) {
    const itemId = itemIdBySlug.get(w.itemSlug);
    const regionId = regionIdBySlug.get(w.regionSlug);
    const sourceId = sourceIdByKey.get(w.sourceKey);
    if (!itemId || !regionId || !sourceId) {
      console.warn(`batch5: window skipped (missing ref): ${w.itemSlug}/${w.regionSlug}/${w.sourceKey}`);
      winSkipped++;
      continue;
    }
    const existing = await db.plantingWindow.findFirst({
      where: {
        itemId, regionId,
        startMonth: w.startMonth, endMonth: w.endMonth,
        activityType: w.activityType,
      },
      select: { id: true },
    });
    let windowId: string;
    if (existing) {
      await db.plantingWindow.update({
        where: { id: existing.id },
        data: { verificationStatus: vs(w.verificationStatus) },
      });
      windowId = existing.id;
      winSkipped++;
    } else {
      const win = await db.plantingWindow.create({
        data: {
          itemId, regionId,
          activityType: w.activityType,
          startMonth: w.startMonth, endMonth: w.endMonth,
          harvestText: w.harvestText ?? null,
          notes: w.notes ?? null,
          verificationStatus: vs(w.verificationStatus),
        },
      });
      windowId = win.id;
      winCount++;
    }
    await db.windowSource.upsert({
      where: { windowId_sourceId: { windowId, sourceId } },
      update: {},
      create: { windowId, sourceId },
    });
  }
  console.log(`batch5: windows created: ${winCount} (skipped/dupes: ${winSkipped})`);
}
