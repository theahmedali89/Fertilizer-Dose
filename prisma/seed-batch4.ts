/**
 * Batch 4 agricultural data population — Spain, France, Germany, Italy, Poland, Russia.
 * Approved 2026-10-05. Do NOT add Batch 1/2/3 (or later batches) countries here.
 *
 * IDEMPOTENT: every write is insert-if-missing, so re-running the seed never
 * duplicates rows and never overwrites admin CMS edits. Safe to run on every deploy.
 *
 * Data lives in prisma/data/batch4/*.json (extracted 2026-10-05 from
 * research-report-batch4.md + ws-batch4-*.md files). All imported records are
 * draft/under_review — NEVER verified/published on import.
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
  notes?: string | null;
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
  country?: { code: string; name: string; slug: string; defaultUnit: string };
  sources: BatchSource[];
  newRegions?: BatchRegion[];
  recommendations?: BatchRecommendation[];
  windows?: BatchWindow[];
}

function loadBatchFile(name: string): BatchFile {
  const p = join(process.cwd(), "prisma", "data", "batch4", name);
  return JSON.parse(readFileSync(p, "utf8")) as BatchFile;
}

function vs(s: string): VerificationStatus {
  // Allow verified/under_review (verification passes set these in JSON); anything else falls back to draft.
  return (s === "verified" ? "verified" : s === "under_review" ? "under_review" : "draft") as VerificationStatus;
}

// ── Main entry ─────────────────────────────────────────────────────────

export async function seedBatch4(db: PrismaClient): Promise<void> {
  // ── 1. Load batch files ──
  const files = ["es.json", "fr.json", "de.json", "it.json", "pl.json", "ru.json"].map(loadBatchFile);

  // ── 2. Countries (ES, FR, DE, IT, PL, RU — all new) ──
  const countryIdByCode = new Map<string, string>();
  for (const f of files) {
    if (!f.country) continue;
    const c = f.country;
    const rec = await db.country.upsert({
      where: { code: c.code },
      update: {},
      create: { code: c.code, name: c.name, slug: c.slug, defaultUnit: c.defaultUnit, status: "active" },
    });
    countryIdByCode.set(c.code, rec.id);
  }
  console.log(`batch4: countries ensured: ${[...countryIdByCode.keys()].join(",")}`);

  // ── 3. New regions ──
  const legacyCountryName: Record<string, string> = {
    ES: "spain",
    FR: "france",
    DE: "germany",
    IT: "italy",
    PL: "poland",
    RU: "russia",
  };
  let regionCount = 0;
  for (const f of files) {
    for (const r of f.newRegions ?? []) {
      const countryId = countryIdByCode.get(r.countryCode);
      if (!countryId) { console.warn(`batch4: no country for region ${r.slug}, skipped`); continue; }
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
  }
  console.log(`batch4: regions created: ${regionCount}`);

  // ── 4. Sources (dedupe by organization+title across files) ──
  const sourceIdByKey = new Map<string, string>();
  let sourceCount = 0;
  for (const f of files) {
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
  }
  console.log(`batch4: sources created: ${sourceCount}`);

  // ── 5. Lookup maps ──
  const itemIdBySlug = new Map(
    (await db.growingItem.findMany({ select: { id: true, slug: true } })).map((i) => [i.slug, i.id] as const)
  );
  const regionIdBySlug = new Map(
    (await db.region.findMany({ select: { id: true, slug: true } })).map((r) => [r.slug, r.id] as const)
  );

  // ── 6. Fertilizer recommendations ──
  let recCount = 0, recSkipped = 0;
  for (const f of files) {
    for (const r of f.recommendations ?? []) {
      const itemId = itemIdBySlug.get(r.itemSlug);
      const countryId = countryIdByCode.get(r.countryCode);
      const regionId = r.regionSlug ? regionIdBySlug.get(r.regionSlug) ?? null : null;
      const sourceId = sourceIdByKey.get(r.sourceKey);
      if (!itemId || !countryId || !sourceId) {
        console.warn(`batch4: recommendation skipped (missing ref): ${r.itemSlug}/${r.countryCode}/${r.sourceKey}`);
        recSkipped++;
        continue;
      }
      if (r.regionSlug && !regionId) {
        console.warn(`batch4: recommendation skipped (unknown region): ${r.regionSlug}`);
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
        // Update verification status for existing records (verification pass)
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
  }
  console.log(`batch4: recommendations created: ${recCount} (skipped/dupes: ${recSkipped})`);

  // ── 7. Planting windows + source links ──
  let winCount = 0, winSkipped = 0;
  for (const f of files) {
    for (const w of f.windows ?? []) {
      const itemId = itemIdBySlug.get(w.itemSlug);
      const regionId = regionIdBySlug.get(w.regionSlug);
      const sourceId = sourceIdByKey.get(w.sourceKey);
      if (!itemId || !regionId || !sourceId) {
        console.warn(`batch4: window skipped (missing ref): ${w.itemSlug}/${w.regionSlug}/${w.sourceKey}`);
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
        // Update verification status for existing records (verification pass)
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
  }
  console.log(`batch4: windows created: ${winCount} (skipped/dupes: ${winSkipped})`);
}
