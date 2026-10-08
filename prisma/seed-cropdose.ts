/**
 * Global crop NPK dose population — Ahmed approved 2026-10-08
 * ("jese e research ho ap populate b kr dena" — auto-populate when research
 * completes; no separate per-batch approval for THIS scope).
 * Research: ~/workspace/khaadguide/research-cropdose/ (153 records, 19 gaps).
 *
 * SCOPE: FertilizerRecommendation rows ONLY.
 * - No planting windows (sowing months null by design; the veg-planting
 *   calendar track owns sowing data).
 * - No new regions (all 31 region slugs already exist from batches 1-4).
 * - New GrowingItems (beans, sweet-potato, cassava, sesame, buckwheat,
 *   coconut, oats, millet, sorghum) come from src/lib/growing.ts via the
 *   base seed's insert-if-missing — identity only, no invented agronomics.
 *
 * RANGES: the FertilizerRecommendation model stores point values only.
 * Records whose source gives a RANGE keep the numeric fields NULL and carry
 * the source-faithful "min–max" in applicationMethod — never collapsed to
 * midpoints. Point records (min == max) store the number. FR formula-N
 * records: N null + formula text in the notes.
 *
 * STATUS: high-confidence + direct official (no flags, real N value) →
 * verified. Everything else (medium/low, derived, mirror-source, conflicted,
 * regulatory-cap, formula/method-based N, partial or variant-only records)
 * → under_review. Conflicts import as SEPARATE under_review records with
 * conflict notes — never averaged.
 *
 * HELD (not imported, documented in the population report): AU cotton,
 * AU sugarcane ×2 (source_below_bar), ES wheat, ES barley (industry-origin,
 * ANFFE-authored MAPA table). The 19 documented research gaps stay gaps —
 * nothing invented.
 *
 * IDEMPOTENT: insert-if-missing on (item, country, region, variety,
 * growthStage, soilContext, irrigationContext, source); re-running refreshes
 * verificationStatus only (batch-8 pattern) and never overwrites admin CMS
 * edits. Safe to run on every deploy.
 *
 * Data lives in prisma/data/cropdose/cropdose-data.json.
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── Extractor JSON shapes ────────────────────────────────────────────────

interface CropDoseRecord {
  country: string; // lowercase code, e.g. "us"
  crop: string; // growing-item slug
  region: string | null; // region slug or null = national
  region_note?: string | null;
  n_min: number | null;
  n_max: number | null;
  p2o5_min: number | null;
  p2o5_max: number | null;
  k2o_min: number | null;
  k2o_max: number | null;
  notes: string;
  confidence: string;
  confidence_note?: string | null;
  flags: string[];
  source_org: string;
  source_title: string;
  source_url?: string | null;
  source_year?: string | null;
  sowing_months?: number[] | null;
}

interface CropDoseFile {
  records: CropDoseRecord[];
}

function loadCropDoseFile(): CropDoseFile {
  const p = join(process.cwd(), "prisma", "data", "cropdose", "cropdose-data.json");
  return JSON.parse(readFileSync(p, "utf8")) as CropDoseFile;
}

function vs(s: string): VerificationStatus {
  return (s === "verified" ? "verified" : "under_review") as VerificationStatus;
}

// ── Status mapping (report "Population concerns" §3, binding) ───────────
// verified: high-confidence + direct official records only (no flags, and a
// real N value — formula/method-based N records are never verified).
// Everything else (medium/low, derived, mirror-source, conflicted,
// regulatory-cap, formula-based, partial/variant-only) → under_review.
function isHeld(r: CropDoseRecord): boolean {
  const f = r.flags.join(" ");
  return f.includes("below_bar") || f.includes("industry-origin");
}

function isLegumeNoN(r: CropDoseRecord): boolean {
  return (
    r.crop === "soybean" &&
    r.n_min == null &&
    r.n_max == null &&
    /(?:no nitrogen fertilizer recommended|n not recommended for soybean)/i.test(r.notes)
  );
}

function statusFor(r: CropDoseRecord): VerificationStatus {
  if (r.confidence === "high" && r.flags.length === 0 && (r.n_min != null || isLegumeNoN(r))) {
    return "verified";
  }
  return "under_review";
}

// ── Numeric mapping: point values only; ranges stay null ─────────────────
function pointValue(min: number | null, max: number | null): number | null {
  if (min == null || max == null) return null;
  return min === max ? min : null; // range → null, never a midpoint
}

// ── Per-record dose context text (goes to applicationMethod) ─────────────
function doseContext(r: CropDoseRecord): string {
  const parts: string[] = [];
  const rangeBits: string[] = [];
  const addRange = (lo: number | null, hi: number | null, label: string) => {
    if (lo != null && hi != null && lo !== hi) rangeBits.push(`${label} ${lo}–${hi}`);
  };
  addRange(r.n_min, r.n_max, "N");
  addRange(r.p2o5_min, r.p2o5_max, "P₂O₅");
  addRange(r.k2o_min, r.k2o_max, "K₂O");
  if (rangeBits.length > 0) {
    parts.push(
      `Official dose range (kg/ha, source-faithful — numeric fields left null for ranged nutrients, never collapsed to midpoints): ${rangeBits.join("; ")}.`
    );
  }
  if (r.n_min == null && !isLegumeNoN(r)) {
    parts.push(
      "N is method/formula-based (no fixed dose in source) — N field left null; see research notes for the formula."
    );
  }
  if (isLegumeNoN(r)) {
    parts.push("N: 0 — no nitrogen fertilizer recommended for soybean (legume, fixes own N).");
  }
  if (r.flags.length > 0) parts.push(`Flags: ${r.flags.join("; ")}.`);
  if (r.region_note) parts.push(`Region note: ${r.region_note}`);
  if (r.confidence_note) parts.push(`Confidence (${r.confidence}): ${r.confidence_note}`);
  if (r.sowing_months && r.sowing_months.length > 0) {
    parts.push(
      `Sowing months per source: ${r.sowing_months.join(", ")} (no planting windows created — the calendar track owns sowing data).`
    );
  }
  parts.push(`Research notes: ${r.notes}`);
  return parts.join("\n\n");
}

// ── Variant disambiguation for same-item/same-country/same-region pairs ──
// (kept explicit + documented; markers verified against the research JSON)
function variantFields(r: CropDoseRecord): {
  variety: string | null;
  soilContext: string | null;
  irrigationContext: string | null;
} {
  // ES sugar-beet: irrigated (Regadío) vs rainfed (Secano), same MAPA source
  if (r.country === "es" && r.crop === "sugar-beet") {
    return {
      variety: null,
      soilContext: null,
      irrigationContext: /regadío/i.test(r.notes) ? "Irrigated" : "Rainfed",
    };
  }
  // TR barley (Gaziantep): dryland (Kuru) vs irrigated (Sulu)
  if (r.country === "tr" && r.crop === "barley") {
    return {
      variety: null,
      soilContext: null,
      irrigationContext: /^\s*kuru|kuru koşullarda/i.test(r.notes) ? "Dryland" : "Irrigated",
    };
  }
  // KR barley (Jeju): unhulled (겉보리) vs polished/malting (쌀보리/맥주보리)
  if (r.country === "kr" && r.crop === "barley" && !r.region) {
    return {
      variety: /겉보리/.test(r.notes) ? "Unhulled barley (겉보리)" : "Polished/malting barley (쌀보리/맥주보리)",
      soilContext: null,
      irrigationContext: null,
    };
  }
  // PL potato (IUNG): without manure vs on 30 t/ha manure
  if (r.country === "pl" && r.crop === "potato" && /uprawy nawożenia/i.test(r.source_org)) {
    return {
      variety: null,
      soilContext: r.flags.some((f) => f.includes("manure-based variant:"))
        ? "On 30 t/ha manure"
        : "No manure",
      irrigationContext: null,
    };
  }
  // US maize (Iowa State): corn-after-soybean vs corn-after-corn rotation.
  // (Both notes mention both rotations — the "…are for the soybean-corn
  // rotation only" sentence is the unique marker.)
  if (r.country === "us" && r.crop === "maize") {
    return {
      variety: null,
      soilContext: /for the soybean-corn rotation only/i.test(r.notes)
        ? "Rotation: corn after soybean"
        : "Rotation: corn after corn",
      irrigationContext: null,
    };
  }
  return { variety: null, soilContext: null, irrigationContext: null };
}

function sourceNotesFor(r: CropDoseRecord, countryName: string): string | null {
  const bits: string[] = [];
  if (r.flags.includes("mirror-source")) {
    bits.push("Text via third-party mirror of the official standard (not the publisher's own site).");
  }
  if (r.country === "bd") {
    bits.push(
      "Cited via attributed secondary literature; official gov.bd PDFs were unfetchable (HTTP 500) at research time."
    );
  }
  if (r.flags.some((f) => f.includes("secondary-press"))) {
    bits.push("Reported via press coverage of the official guidance.");
  }
  bits.push(`Country: ${countryName}.`);
  if (r.source_year) bits.push(`Source year: ${r.source_year}.`);
  return bits.join(" ");
}

const COUNTRIES: { code: string; name: string; slug: string; defaultUnit: string }[] = [
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

// ── Main entry ───────────────────────────────────────────────────────────

export async function seedCropdose(db: PrismaClient): Promise<void> {
  const f = loadCropDoseFile();
  const records = f.records ?? [];
  console.log(`cropdose: ${records.length} records in file`);

  // ── 1. Countries (upsert by code; batches 1-4 created these, this is a guard) ──
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
  console.log(`cropdose: countries ensured: ${COUNTRIES.length}`);

  // ── 2. Sources (dedupe by organization+title, batch-8 pattern) ──
  const sourceIdByKey = new Map<string, string>();
  let sourceCount = 0;
  for (const r of records) {
    if (isHeld(r)) continue;
    const key = `${r.source_org}||${r.source_title}`;
    if (sourceIdByKey.has(key)) continue;
    const existing = await db.source.findFirst({
      where: { organization: r.source_org, title: r.source_title },
      select: { id: true },
    });
    if (existing) {
      sourceIdByKey.set(key, existing.id);
      continue;
    }
    const code = r.country.toUpperCase();
    const rec = await db.source.create({
      data: {
        organization: r.source_org,
        title: r.source_title,
        url: r.source_url ?? null,
        country: countryNameByCode.get(code) ?? null,
        verificationStatus: "under_review",
        notes: sourceNotesFor(r, countryNameByCode.get(code) ?? code),
      },
    });
    sourceIdByKey.set(key, rec.id);
    sourceCount++;
  }
  console.log(`cropdose: sources created: ${sourceCount}`);

  // ── 3. Lookup maps ──
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

  // ── 4. Fertilizer recommendations (insert-if-missing) ──
  let created = 0, verifiedCount = 0, reviewCount = 0, heldCount = 0, skipped = 0;
  const held: string[] = [];
  for (const r of records) {
    if (isHeld(r)) {
      heldCount++;
      held.push(`${r.country}/${r.crop} (${r.flags.join("; ")})`);
      continue;
    }
    const itemId = itemIdBySlug.get(r.crop);
    const code = r.country.toUpperCase();
    const countryId = countryIdByCode.get(code);
    const regionId = r.region ? (regionIdBySlug.get(r.region) ?? null) : null;
    const sourceId = sourceIdByKey.get(`${r.source_org}||${r.source_title}`);

    if (!itemId) {
      console.warn(`cropdose: skipped (unknown item): ${r.crop}`);
      skipped++;
      continue;
    }
    if (!countryId) {
      console.warn(`cropdose: skipped (unknown country): ${r.country}`);
      skipped++;
      continue;
    }
    if (r.region && !regionId) {
      console.warn(`cropdose: skipped (unknown region): ${r.region}`);
      skipped++;
      continue;
    }
    if (!sourceId) {
      console.warn(`cropdose: skipped (missing source): ${r.crop}/${r.country}`);
      skipped++;
      continue;
    }

    const v = variantFields(r);
    const status = statusFor(r);
    const n = isLegumeNoN(r) ? 0 : pointValue(r.n_min, r.n_max);

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
      // Refresh verificationStatus only (batch-8 pattern) — never clobber admin edits.
      await db.fertilizerRecommendation.update({
        where: { id: existing.id },
        data: { verificationStatus: vs(status) },
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
        n,
        p2o5: pointValue(r.p2o5_min, r.p2o5_max),
        k2o: pointValue(r.k2o_min, r.k2o_max),
        nutrientBasis: "P2O5_K2O",
        micronutrients: null,
        applicationTiming: null,
        applicationMethod: doseContext(r),
        sourceId,
        verificationStatus: vs(status),
        isPrimary: false,
      },
    });
    created++;
    if (status === "verified") verifiedCount++;
    else reviewCount++;
  }
  console.log(
    `cropdose: recommendations created: ${created} (verified: ${verifiedCount}, under_review: ${reviewCount}), held: ${heldCount}, skipped/dupes: ${skipped}`
  );
  for (const h of held) console.log(`cropdose: HELD (not imported): ${h}`);
}
