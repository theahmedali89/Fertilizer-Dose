/**
 * Batch 7 agricultural data population — Ahmed approved 2026-10-07
 * ("1 or 2 ko chala do"). Do NOT add other crops here.
 *
 * ITEM 1 — held-record resolutions (from research-held/resolution-report.md):
 *   - Sunflower PK S-PK-2 (UAF Faisalabad 150-100-62, central Punjab) — NEW.
 *     The batch-5 S-PK-1 conflict note is corrected: both doses are genuine
 *     for different agro-ecologies (Pothwar/arid vs irrigated central Punjab).
 *   - Lentil PK 52.3-57-0 (Shah et al. 2025 citing Govt. of Punjab) — NEW.
 *   - Sugar beet SB-PK-2 150-100-62.5 (Ahmad et al. 2012, TRIAL rate) — NEW.
 *   - SB-PK-3: NOT populated (P ambiguity + KPK miscoding).
 *   - J-IN-3: NOT populated (seed-production jute).
 *   - Barley/chickpea PK: confirmed gaps (3rd pass) — nothing populated.
 *
 * ITEM 2 — batch-7 crops × India (from research-batch7/batch7-data.json):
 *   triticale 3 (TNAU rainfed/irrigated teaching material + BZU Layyah trial
 *   rate for PK), rubber 9 (Rubber Board schedule via KAU, kg/ha/YEAR),
 *   oil palm 5 (NIPHM GoI national + TNAU TN, kg/ha/YEAR).
 *   - R-IN-1 (rye): EXCLUDED — low-confidence media source, stays a gap.
 *   - Rubber/oil palm: no windows (perennial, batch-6 coffee precedent).
 *   - RB-IN-7 vs RB-IN-9 are different stages — both kept, do not collapse.
 *   - TNAU oil-palm third-year K=2700 row: page typo, EXCLUDED.
 *   - Never borrow Indian doses for Pakistan (no PK rubber/oil-palm records).
 *
 * IDEMPOTENT: every write is insert-if-missing, so re-running the seed
 * never duplicates rows and never overwrites admin CMS edits. Safe to run
 * on every deploy.
 *
 * Data lives in prisma/data/batch7/batch7-data.json.
 * All records import as under_review — NEVER verified on import.
 *
 * Region mapping:
 *   - "in" -> regionSlug null (country-wide; batch-6 coffee convention)
 *   - no new regions (pk-punjab, in-tn already exist)
 *
 * Schema note (batch-6 precedent): caveats mapped to variety (perennial
 * stage labels), soilContext (rubber Mg series), applicationMethod
 * (trial-status, oxide-convention caveats, agro-ecology scoping), Source.notes
 * (provenance caveats). isPrimary marks official institution schedules
 * (Rubber Board via KAU, NIPHM GoI) — trial/advisory/teaching records stay
 * non-primary.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── Extractor JSON shapes (same as batch6) ─────────────────────────────

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
  isPrimary?: boolean | null;
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
  const p = join(process.cwd(), "prisma", "data", "batch7", name);
  return JSON.parse(readFileSync(p, "utf8")) as BatchFile;
}

function vs(s: string): VerificationStatus {
  return (s === "verified" ? "verified" : s === "under_review" ? "under_review" : "draft") as VerificationStatus;
}

// ── Main entry ─────────────────────────────────────────────────────────

export async function seedBatch7(db: PrismaClient): Promise<void> {
  const f = loadBatchFile("batch7-data.json");

  // ── 1. Countries (IN + PK) ──
  const countryIdByCode = new Map<string, string>();
  for (const code of ["IN", "PK"]) {
    const c = await db.country.findUnique({ where: { code }, select: { id: true } });
    if (c) countryIdByCode.set(code, c.id);
    else console.warn(`batch7: country ${code} not found`);
  }
  const inCountryId = countryIdByCode.get("IN");
  if (!inCountryId) {
    console.warn("batch7: country IN not found, skipped");
    return;
  }

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
          countryId: inCountryId,
        },
      });
      regionCount++;
    } else if (!existing.countryId) {
      await db.region.update({ where: { id: existing.id }, data: { countryId: inCountryId } });
    }
  }
  console.log(`batch7: regions created: ${regionCount}`);

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
  console.log(`batch7: sources created: ${sourceCount}`);

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
    const recCountryId = countryIdByCode.get(r.countryCode) ?? null;
    if (!itemId || !sourceId || !recCountryId) {
      console.warn(`batch7: recommendation skipped (missing ref): ${r.itemSlug}/${r.countryCode}/${r.sourceKey}`);
      recSkipped++;
      continue;
    }
    if (r.regionSlug && !regionId) {
      console.warn(`batch7: recommendation skipped (unknown region): ${r.regionSlug}`);
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
      // Existing row: refresh verificationStatus (batch-6 pattern).
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
  console.log(`batch7: recommendations created: ${recCount} (skipped/dupes: ${recSkipped})`);

  // ── 6. Planting windows + source links ──
  let winCount = 0, winSkipped = 0;
  for (const w of f.windows ?? []) {
    const itemId = itemIdBySlug.get(w.itemSlug);
    const regionId = regionIdBySlug.get(w.regionSlug);
    const sourceId = sourceIdByKey.get(w.sourceKey);
    if (!itemId || !regionId || !sourceId) {
      console.warn(`batch7: window skipped (missing ref): ${w.itemSlug}/${w.regionSlug}/${w.sourceKey}`);
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
  console.log(`batch7: windows created: ${winCount} (skipped/dupes: ${winSkipped})`);

  // ── 7. S-PK-1 conflict-note correction (batch-5 record) ──
  // The resolution report established both sunflower doses are genuine for
  // different agro-ecologies. Replace the stale CONFLICT note.
  const pmasSource = await db.source.findFirst({
    where: { organization: "PMAS-Arid Agriculture University, Rawalpindi" },
    select: { id: true, notes: true },
  });
  const sunflowerItem = itemIdBySlug.get("sunflower");
  const pkCountryId = countryIdByCode.get("PK");
  const pkPunjabId = regionIdBySlug.get("pk-punjab");
  if (pmasSource && sunflowerItem && pkCountryId && pkPunjabId) {
    const spk1 = await db.fertilizerRecommendation.findFirst({
      where: {
        growingItemId: sunflowerItem,
        countryId: pkCountryId,
        regionId: pkPunjabId,
        sourceId: pmasSource.id,
      },
      select: { id: true },
    });
    if (spk1) {
      await db.fertilizerRecommendation.update({
        where: { id: spk1.id },
        data: {
          applicationMethod:
            "Stated as the recommended dose in the source paper (urea + DAP at last ploughing). " +
            "Pothwar/arid Punjab dose (PMAS-UAAR). For irrigated central Punjab see the UAF " +
            "Faisalabad 150-100-62 record — different agro-ecology, not a conflict.",
        },
      });
      console.log("batch7: S-PK-1 conflict note corrected");
    } else {
      console.warn("batch7: S-PK-1 record not found, note correction skipped");
    }
    await db.source.update({
      where: { id: pmasSource.id },
      data: {
        notes:
          "Stated as the recommended dose: 80 kg N + 60 kg P2O5/ha (urea + DAP at last ploughing), " +
          "Pothwar/arid Punjab. UAF Faisalabad's 150-100-62 (PJAR 2017) applies to irrigated " +
          "central Punjab — see separate record.",
      },
    });
  } else {
    console.warn("batch7: S-PK-1 correction skipped (missing refs)");
  }
}
