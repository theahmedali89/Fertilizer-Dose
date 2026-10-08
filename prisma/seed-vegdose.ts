/**
 * Vegetable NPK dose population — Ahmed approved 2026-10-08 ("yes kro").
 * Research: ~/workspace/khaadguide/research-vegdose/ (171 records, 38 gaps).
 *
 * SCOPE: FertilizerRecommendation rows ONLY.
 * - No planting windows (sowing months were not researched; the veg-planting
 *   calendar track owns sowing data).
 * - New `-national` regions (au/de/es/fr/id/kr/pl) are created — the research
 *   is country-level and attaching it to a sub-region would misattribute it.
 * - All 14 vegetable items resolve in the DB (potato resolves to the single
 *   crop-category item per the 2026-10-08 taxonomy fix; cabbage-chinese from
 *   the veg-planting batch; rest pre-existing).
 *
 * NO-POPULATE (report "Population concerns" §7, binding) — 5 records stay
 * out, documented: BD cauliflower (P/K basis unresolved), DE peas (P/K
 * group proxy), FR garlic (teneur ambiguity — re-verify first), KR tomato
 * (secondhand RDA citation), ID chili (thirdhand citation).
 * NOTE: the task brief mentioned 7, but the binding research report lists
 * exactly these 5. The 5 are excluded; nothing else was held back.
 *
 * RANGES: `ranges` values are "min-max" strings (or a single number string).
 * Numeric n/p2o5/k2o fields store point values only (null when ranged);
 * min/max columns carry the source-faithful range — never midpoints.
 * Formula records: formula text goes to applicationMethod, N stays null.
 *
 * STATUS: JSON `suggestedStatus` verified → verified; everything else →
 * under_review. Never upgraded on import.
 *
 * CONFLICTS/VARIANTS: kept as SEPARATE records, disambiguated via
 * variety/soilContext (never averaged, never merged).
 *
 * isPrimary: never set on import (earlier batch calculator slots preserved).
 *
 * IDEMPOTENT: insert-if-missing on (item, country, region, variety,
 * growthStage, soilContext, irrigationContext, source); re-running refreshes
 * verificationStatus + range columns only (batch-8/cropdose pattern) and
 * never overwrites admin CMS edits. Safe to run on every deploy.
 *
 * Data lives in prisma/data/vegdose/vegdose-data.json.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── Extractor JSON shapes ────────────────────────────────────────────────

interface VegDoseRecord {
  country: string; // "IN" etc.
  itemSlug: string;
  regionSlug: string;
  n: number | null;
  p2o5: number | null;
  k2o: number | null;
  ranges: Record<string, string>; // e.g. { n: "120-140" } or { k2o: "180.7" }
  formula: string | null;
  notes: string;
  confidence: string;
  flags: string[];
  suggestedStatus: string; // "verified" | "under_review"
  source: {
    organization: string;
    title: string;
    url: string | null;
    year: string | null;
  };
}

interface VegDoseFile {
  records: VegDoseRecord[];
}

function loadFile(): VegDoseFile {
  const p = join(process.cwd(), "prisma", "data", "vegdose", "vegdose-data.json");
  return JSON.parse(readFileSync(p, "utf8")) as VegDoseFile;
}

// ── No-populate records (report §7, binding) ─────────────────────────────

const NO_POPULATE = new Set([
  "BD|cauliflower|bd-national", // P/K basis unresolved (elemental vs oxide)
  "DE|peas|de-national", // P/K group proxy ("Leguminosen" row)
  "FR|garlic|fr-national", // teneur ambiguity — re-verify first
  "KR|tomato|kr-national", // secondhand RDA citation
  "ID|chili|id-national", // thirdhand citation
]);

function isNoPopulate(r: VegDoseRecord): boolean {
  return NO_POPULATE.has(`${r.country}|${r.itemSlug}|${r.regionSlug}`);
}

// ── Status mapping ──────────────────────────────────────────────────────

function vs(s: string): VerificationStatus {
  return (s === "verified" ? "verified" : "under_review") as VerificationStatus;
}

// ── Range parsing: "120-140" → [120,140]; "180.7" → [180.7,180.7] ─────────

function parseRange(s: string): [number, number] | null {
  const m = /^(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?$/.exec(s.trim());
  if (!m) return null;
  const lo = parseFloat(m[1]);
  const hi = m[2] != null ? parseFloat(m[2]) : lo;
  return [lo, hi];
}

interface NutrientTriple {
  point: number | null;
  min: number | null;
  max: number | null;
}

function nutrient(
  numeric: number | null,
  rangeStr: string | undefined,
  label: string,
  warnings: string[]
): NutrientTriple {
  if (rangeStr != null) {
    const parsed = parseRange(rangeStr);
    if (!parsed) {
      warnings.push(`unparseable range for ${label}: "${rangeStr}" — left null`);
      return { point: null, min: null, max: null };
    }
    const [lo, hi] = parsed;
    if (numeric != null && !(numeric === lo && lo === hi)) {
      warnings.push(
        `${label}: numeric ${numeric} disagrees with range ${rangeStr} — range wins, point nulled`
      );
    }
    return { point: lo === hi ? lo : null, min: lo, max: hi };
  }
  if (numeric != null) {
    return { point: numeric, min: numeric, max: numeric };
  }
  return { point: null, min: null, max: null };
}

// ── Per-record dose context text (goes to applicationMethod) ─────────────

function doseContext(r: VegDoseRecord): string {
  const parts: string[] = [];
  const rangeBits: string[] = [];
  const labels: Record<string, string> = { n: "N", p2o5: "P₂O₅", k2o: "K₂O" };
  for (const [k, v] of Object.entries(r.ranges ?? {})) {
    const parsed = parseRange(v);
    if (parsed && parsed[0] !== parsed[1]) {
      rangeBits.push(`${labels[k] ?? k} ${parsed[0]}–${parsed[1]}`);
    }
  }
  if (rangeBits.length > 0) {
    parts.push(
      `Official dose range (kg/ha, source-faithful — numeric fields left null for ranged nutrients, never collapsed to midpoints): ${rangeBits.join("; ")}.`
    );
  }
  if (r.formula) {
    parts.push(`Method/formula-based dose (no fixed point value in source): ${r.formula}`);
  }
  if (r.flags.length > 0) parts.push(`Flags: ${r.flags.join("; ")}.`);
  parts.push(`Confidence: ${r.confidence}.`);
  parts.push(`Research notes: ${r.notes}`);
  return parts.join("\n\n");
}

// ── Variant disambiguation for same-item/same-country/same-region pairs ──
// (report §9: variants kept separate, never averaged)

function variantFields(r: VegDoseRecord): {
  variety: string | null;
  soilContext: string | null;
  irrigationContext: string | null;
} {
  const key = `${r.country}|${r.itemSlug}|${r.regionSlug}`;
  const flags = r.flags;
  const notes = r.notes;
  switch (key) {
    case "IN|chili|in-punjab":
      return {
        variety: flags.includes("variant-ambiguous") ? "Hybrid (ambiguous wording)" : "Standard",
        soilContext: null,
        irrigationContext: null,
      };
    case "IN|tomato|in-tn":
      return {
        variety: flags.includes("variant-hybrid") ? "Hybrid" : "Varieties (open-pollinated)",
        soilContext: null,
        irrigationContext: null,
      };
    case "IN|brinjal|in-tn":
      return {
        variety: flags.includes("variant-hybrid") ? "Hybrid" : "Varieties (open-pollinated)",
        soilContext: null,
        irrigationContext: null,
      };
    case "IN|chili|in-tn":
      return {
        variety: flags.includes("variant-ambiguous") ? "Hybrid (context suggests)" : "Standard",
        soilContext: null,
        irrigationContext: null,
      };
    case "IN|onion|in-tn":
      return {
        variety: /small\/multiplier/i.test(notes) ? "Small/multiplier onion" : "Big/Bellary onion",
        soilContext: null,
        irrigationContext: null,
      };
    case "IN|cabbage|in-tn":
      return {
        variety: /hills/i.test(notes) ? "Hills" : /plains/i.test(notes) ? "Plains" : null,
        soilContext: null,
        irrigationContext: null,
      };
    case "IN|cauliflower|in-tn":
      return {
        variety: flags.includes("variant-ambiguous") ? "Alt entry (variety unclear)" : "Standard",
        soilContext: null,
        irrigationContext: null,
      };
    case "BR|tomato|br-southeast":
      return {
        variety: /tutorado|staked/i.test(notes)
          ? "Staked fresh (tutorado)"
          : "Processing (rasteiro)",
        soilContext: null,
        irrigationContext: null,
      };
    case "ID|onion|id-national":
      return {
        variety: /UGM/i.test(notes) ? "Balitsa via UGM" : "Journal (Sumarni & Hidayat)",
        soilContext: null,
        irrigationContext: null,
      };
    case "PL|cabbage|pl-national":
      return {
        variety: flags.includes("regulatory-cap") ? "Regulatory cap" : "InHort 2020 trial",
        soilContext: null,
        irrigationContext: null,
      };
    default:
      // Generic fallback for any other same-key pair discovered later.
      if (flags.includes("variant-hybrid")) {
        return { variety: "Hybrid", soilContext: null, irrigationContext: null };
      }
      return { variety: null, soilContext: null, irrigationContext: null };
  }
}

function sourceNotesFor(r: VegDoseRecord, countryName: string): string | null {
  const bits: string[] = [];
  if (r.flags.includes("secondhand")) {
    bits.push("Cited via secondary literature; primary document not directly accessed at research time.");
  }
  if (r.flags.includes("thirdhand")) {
    bits.push("Thirdhand citation — verify against the primary source before use.");
  }
  if (r.flags.includes("regulatory-cap")) {
    bits.push("N figure is a regulatory cap (legal maximum), not a trial-optimal recommendation.");
  }
  if (r.flags.includes("greenhouse")) {
    bits.push("Protected-cultivation (greenhouse) data — not open-field.");
  }
  bits.push(`Country: ${countryName}.`);
  if (r.source.year) bits.push(`Source year: ${r.source.year}.`);
  return bits.join(" ");
}

const COUNTRIES: { code: string; name: string; slug: string; defaultUnit: string }[] = [
  { code: "IN", name: "India", slug: "india", defaultUnit: "acre" },
  { code: "US", name: "United States", slug: "united-states", defaultUnit: "acre" },
  { code: "BR", name: "Brazil", slug: "brazil", defaultUnit: "hectare" },
  { code: "AU", name: "Australia", slug: "australia", defaultUnit: "hectare" },
  { code: "BD", name: "Bangladesh", slug: "bangladesh", defaultUnit: "acre" },
  { code: "ID", name: "Indonesia", slug: "indonesia", defaultUnit: "hectare" },
  { code: "MY", name: "Malaysia", slug: "malaysia", defaultUnit: "hectare" },
  { code: "DE", name: "Germany", slug: "germany", defaultUnit: "hectare" },
  { code: "FR", name: "France", slug: "france", defaultUnit: "hectare" },
  { code: "ES", name: "Spain", slug: "spain", defaultUnit: "hectare" },
  { code: "IT", name: "Italy", slug: "italy", defaultUnit: "hectare" },
  { code: "PL", name: "Poland", slug: "poland", defaultUnit: "hectare" },
  { code: "CN", name: "China", slug: "china", defaultUnit: "hectare" },
  { code: "JP", name: "Japan", slug: "japan", defaultUnit: "hectare" },
  { code: "KR", name: "South Korea", slug: "south-korea", defaultUnit: "hectare" },
  { code: "TR", name: "Türkiye", slug: "turkiye", defaultUnit: "hectare" },
];

// National regions missing from earlier seeds — created here (country-level
// research must not be misattributed to a sub-region).
const NATIONAL_REGIONS: { slug: string; name: string; countryCode: string; legacy: string }[] = [
  { slug: "au-national", name: "Australia (national)", countryCode: "AU", legacy: "australia" },
  { slug: "de-national", name: "Germany (national)", countryCode: "DE", legacy: "germany" },
  { slug: "es-national", name: "Spain (national)", countryCode: "ES", legacy: "spain" },
  { slug: "fr-national", name: "France (national)", countryCode: "FR", legacy: "france" },
  { slug: "id-national", name: "Indonesia (national)", countryCode: "ID", legacy: "indonesia" },
  { slug: "kr-national", name: "South Korea (national)", countryCode: "KR", legacy: "south-korea" },
  { slug: "pl-national", name: "Poland (national)", countryCode: "PL", legacy: "poland" },
];

// ── Main entry ───────────────────────────────────────────────────────────

export async function seedVegdose(db: PrismaClient): Promise<void> {
  const f = loadFile();
  const records = f.records ?? [];
  console.log(`vegdose: ${records.length} records in file`);

  // ── 1. Countries (upsert by code; earlier seeds created these, guard) ──
  const countryIdByCode = new Map<string, string>();
  const countryNameByCode = new Map<string, string>();
  for (const c of COUNTRIES) {
    const rec = await db.country.upsert({
      where: { code: c.code },
      update: {},
      create: { code: c.code, name: c.name, slug: c.slug, defaultUnit: c.defaultUnit, status: "active" },
    });
    countryIdByCode.set(c.code, rec.id);
    countryNameByCode.set(c.code, c.name);
  }

  // ── 2. National regions (insert-if-missing) ──
  let regionCount = 0;
  for (const r of NATIONAL_REGIONS) {
    const countryId = countryIdByCode.get(r.countryCode);
    if (!countryId) {
      console.warn(`vegdose: no country for region ${r.slug}, skipped`);
      continue;
    }
    const existing = await db.region.findUnique({ where: { slug: r.slug } });
    if (!existing) {
      await db.region.create({
        data: { slug: r.slug, name: r.name, country: r.legacy, countryId },
      });
      regionCount++;
    } else if (!existing.countryId) {
      await db.region.update({ where: { id: existing.id }, data: { countryId } });
    }
  }
  console.log(`vegdose: national regions created: ${regionCount}`);

  // ── 3. Sources (dedupe by organization+title, batch-8/cropdose pattern) ──
  const sourceIdByKey = new Map<string, string>();
  let sourceCount = 0;
  for (const r of records) {
    if (isNoPopulate(r)) continue;
    const key = `${r.source.organization}||${r.source.title}`;
    if (sourceIdByKey.has(key)) continue;
    const existing = await db.source.findFirst({
      where: { organization: r.source.organization, title: r.source.title },
      select: { id: true },
    });
    if (existing) {
      sourceIdByKey.set(key, existing.id);
      continue;
    }
    const rec = await db.source.create({
      data: {
        organization: r.source.organization,
        title: r.source.title,
        url: r.source.url ?? null,
        country: countryNameByCode.get(r.country) ?? null,
        verificationStatus: "under_review",
        notes: sourceNotesFor(r, countryNameByCode.get(r.country) ?? r.country),
      },
    });
    sourceIdByKey.set(key, rec.id);
    sourceCount++;
  }
  console.log(`vegdose: sources created: ${sourceCount}`);

  // ── 4. Lookup maps ──
  const itemIdBySlug = new Map(
    (await db.growingItem.findMany({ select: { id: true, slug: true } })).map(
      (i) => [i.slug, i.id] as const
    )
  );
  const regionIdBySlug = new Map(
    (await db.region.findMany({ select: { id: true, slug: true } })).map(
      (r) => [r.slug, r.id] as const
    )
  );

  // ── 5. Fertilizer recommendations (insert-if-missing) ──
  let created = 0,
    verifiedCount = 0,
    reviewCount = 0,
    excludedCount = 0,
    skipped = 0;
  const warnings: string[] = [];
  const excluded: string[] = [];
  for (const r of records) {
    if (isNoPopulate(r)) {
      excludedCount++;
      excluded.push(`${r.country}/${r.itemSlug} (${r.regionSlug})`);
      continue;
    }
    const itemId = itemIdBySlug.get(r.itemSlug);
    const countryId = countryIdByCode.get(r.country);
    const regionId = regionIdBySlug.get(r.regionSlug) ?? null;
    const sourceId = sourceIdByKey.get(`${r.source.organization}||${r.source.title}`);

    if (!itemId) {
      warnings.push(`skipped (unknown item): ${r.itemSlug}`);
      skipped++;
      continue;
    }
    if (!countryId) {
      warnings.push(`skipped (unknown country): ${r.country}`);
      skipped++;
      continue;
    }
    if (!regionId) {
      warnings.push(`skipped (unknown region): ${r.regionSlug}`);
      skipped++;
      continue;
    }
    if (!sourceId) {
      warnings.push(`skipped (missing source): ${r.itemSlug}/${r.country}`);
      skipped++;
      continue;
    }

    const v = variantFields(r);
    const status = vs(r.suggestedStatus);
    const nT = nutrient(r.n, r.ranges?.n, "N", warnings);
    const pT = nutrient(r.p2o5, r.ranges?.p2o5, "P₂O₅", warnings);
    const kT = nutrient(r.k2o, r.ranges?.k2o, "K₂O", warnings);

    const existing = await db.fertilizerRecommendation.findFirst({
      where: {
        growingItemId: itemId,
        countryId,
        regionId,
        variety: v.variety,
        growthStage: null,
        soilContext: v.soilContext,
        irrigationContext: v.irrigationContext,
        sourceId,
      },
      select: { id: true },
    });
    if (existing) {
      // Refresh verificationStatus + range columns — never clobber admin edits.
      await db.fertilizerRecommendation.update({
        where: { id: existing.id },
        data: {
          verificationStatus: status,
          nMin: nT.min,
          nMax: nT.max,
          p2o5Min: pT.min,
          p2o5Max: pT.max,
          k2oMin: kT.min,
          k2oMax: kT.max,
        },
      });
      skipped++;
      continue;
    }

    await db.fertilizerRecommendation.create({
      data: {
        growingItemId: itemId,
        countryId,
        regionId,
        variety: v.variety,
        soilContext: v.soilContext,
        irrigationContext: v.irrigationContext,
        growthStage: null,
        n: nT.point,
        p2o5: pT.point,
        k2o: kT.point,
        nMin: nT.min,
        nMax: nT.max,
        p2o5Min: pT.min,
        p2o5Max: pT.max,
        k2oMin: kT.min,
        k2oMax: kT.max,
        nutrientBasis: "P2O5_K2O",
        micronutrients: null,
        applicationTiming: null,
        applicationMethod: doseContext(r),
        sourceId,
        verificationStatus: status,
        isPrimary: false,
      },
    });
    created++;
    if (status === "verified") verifiedCount++;
    else reviewCount++;
  }
  console.log(
    `vegdose: recommendations created: ${created} (verified: ${verifiedCount}, under_review: ${reviewCount}), excluded: ${excludedCount}, skipped/dupes: ${skipped}`
  );
  for (const e of excluded) console.log(`vegdose: EXCLUDED (report §7, not imported): ${e}`);
  const warnSeen = new Set<string>();
  for (const w of warnings) {
    if (!warnSeen.has(w)) {
      warnSeen.add(w);
      console.warn(`vegdose: ${w}`);
    }
  }
}
