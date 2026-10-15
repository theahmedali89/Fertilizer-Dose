/**
 * Import 2026-10-15 — Ahmed's institutional NPK research (197 parsed records).
 *
 * SCOPE: 16 countries (TR, PL, ES, FR, DE, IT, KR, JP, CN, MY, ID, AU, BR, US, BD, IN, PK).
 * Ahmed-supplied data with named institutional sources (TAGEM, InHort, MAPA, COMIFER,
 * DüV/LfL, RDA, MAFF, CAAS, MARDI, GRDC, Embrapa, UF/IFAS, BARI, ICAR, AARI, etc.).
 *
 * ACTIONS (per Ahmed's 2026-10-15 decisions):
 * - 77 INSERTS: 59 brand-new country+crop+region combos + 18 combos needing new Region rows
 * - 91 UPDATES: existing records OVERWRITTEN with Ahmed's sourced values
 *                (Ahmed: "pehly wali chahy tu khtm kr do q k yeh with sources ha")
 * - 29 same-value duplicates: EXCLUDED from final-data.json (true no-ops)
 *
 * IDEMPOTENT: inserts are insert-if-missing on (item, country, region);
 * updates are idempotent (re-running sets the same values). Safe to re-run.
 *
 * Data lives in prisma/data/import-2026-10-15/final-data.json (168 records).
 */
import { PrismaClient, VerificationStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── JSON shapes ──────────────────────────────────────────────────────────

interface FinalRecord {
  country: string; // ISO code
  crop: string; // growing item slug
  region: string | null; // Ahmed's region label
  n_min: number | null;
  n_max: number | null;
  p2o5_min: number | null;
  p2o5_max: number | null;
  k2o_min: number | null;
  k2o_max: number | null;
  application: string | null;
  source: string;
  _action: "insert" | "update";
  _rslug: string | null; // existing region slug (null = national or new region)
  _new_region?: boolean;
  _note?: string | null;
}

interface FinalFile {
  records: FinalRecord[];
}

// New regions to create (slug, name, countryCode, legacy)
const NEW_REGIONS: { slug: string; name: string; countryCode: string; legacy: string }[] = [
  { slug: "tr-southeast-anatolia", name: "Southeast Anatolia", countryCode: "TR", legacy: "turkiye" },
  { slug: "es-andalucia", name: "Andalucía", countryCode: "ES", legacy: "spain" },
  { slug: "de-niedersachsen-bayern", name: "Niedersachsen & Bayern", countryCode: "DE", legacy: "germany" },
  { slug: "de-bayern", name: "Bayern", countryCode: "DE", legacy: "germany" },
  { slug: "kr-chungcheong", name: "Chungcheong", countryCode: "KR", legacy: "south-korea" },
  { slug: "kr-gyeongsang", name: "Gyeongsang", countryCode: "KR", legacy: "south-korea" },
  { slug: "jp-kanto", name: "Kanto", countryCode: "JP", legacy: "japan" },
  { slug: "cn-yangtze-southwest", name: "Yangtze & Southwest", countryCode: "CN", legacy: "china" },
  { slug: "us-georgia", name: "Georgia", countryCode: "US", legacy: "united-states" },
  { slug: "us-texas", name: "Texas", countryCode: "US", legacy: "united-states" },
  { slug: "us-great-plains", name: "Great Plains", countryCode: "US", legacy: "united-states" },
  { slug: "pk-kpk", name: "Khyber Pakhtunkhwa (KPK)", countryCode: "PK", legacy: "pakistan" },
];

// Map Ahmed's region labels to region slugs
function regionSlugFor(country: string, region: string | null): string | null {
  if (!region) return null;
  const found = NEW_REGIONS.find(
    (r) => r.countryCode === country && r.name.toLowerCase() === region.toLowerCase()
  );
  if (found) return found.slug;
  // Fallthrough: shouldn't happen for new-region records, but guard anyway
  return null;
}

function loadFile(): FinalFile {
  const p = join(process.cwd(), "prisma", "data", "import-2026-10-15", "final-data.json");
  return JSON.parse(readFileSync(p, "utf8")) as FinalFile;
}

/** Point value only when min == max; ranges stay null (never midpoints). */
function point(min: number | null, max: number | null): number | null {
  if (min == null || max == null) return null;
  return min === max ? min : null;
}

// ── Main entry ───────────────────────────────────────────────────────────

export async function seedImport20261015(db: PrismaClient): Promise<void> {
  const f = loadFile();
  const records = f.records ?? [];
  console.log(`import-2026-10-15: ${records.length} records in file`);

  // ── 1. Countries (upsert guard by code) ──
  const countryIdByCode = new Map<string, string>();
  const countryNameByCode = new Map<string, string>();
  const codes = [...new Set(records.map((r) => r.country))];
  for (const code of codes) {
    const rec = await db.country.upsert({
      where: { code },
      update: {},
      create: { code, name: code, slug: code.toLowerCase(), defaultUnit: "hectare", status: "active" },
    });
    countryIdByCode.set(code, rec.id);
    countryNameByCode.set(code, rec.name);
  }
  console.log(`import-2026-10-15: countries ensured: ${codes.length}`);

  // ── 2. New regions (insert-if-missing by slug) ──
  let regionsCreated = 0;
  const regionIdBySlug = new Map<string, string>(
    (await db.region.findMany({ select: { id: true, slug: true } })).map((r) => [r.slug, r.id] as const)
  );
  for (const nr of NEW_REGIONS) {
    if (regionIdBySlug.has(nr.slug)) continue;
    const countryId = countryIdByCode.get(nr.countryCode);
    if (!countryId) {
      console.warn(`import-2026-10-15: no country for new region ${nr.slug}, skipped`);
      continue;
    }
    const created = await db.region.create({
      data: { slug: nr.slug, name: nr.name, country: nr.legacy, countryId },
    });
    regionIdBySlug.set(nr.slug, created.id);
    regionsCreated++;
    console.log(`import-2026-10-15: created region ${nr.slug}`);
  }
  console.log(`import-2026-10-15: regions created: ${regionsCreated}`);

  // ── 3. Growing item lookup ──
  const itemIdBySlug = new Map<string, string>(
    (await db.growingItem.findMany({ select: { id: true, slug: true } })).map((i) => [i.slug, i.id] as const)
  );

  // ── 4. Sources (dedupe by organization+title) ──
  const sourceIdByKey = new Map<string, string>();
  let sourcesCreated = 0;
  const SOURCE_TITLE = "NPK fertilizer dose recommendation (institutional)";
  for (const r of records) {
    const org = r.source.trim();
    const key = `${org}||${SOURCE_TITLE}`;
    if (sourceIdByKey.has(key)) continue;
    const existing = await db.source.findFirst({
      where: { organization: org, title: SOURCE_TITLE },
      select: { id: true },
    });
    if (existing) {
      sourceIdByKey.set(key, existing.id);
      continue;
    }
    const rec = await db.source.create({
      data: {
        organization: org,
        title: SOURCE_TITLE,
        country: countryNameByCode.get(r.country) ?? r.country,
        sourceType: "research",
        verificationStatus: "verified" as VerificationStatus,
        notes: `Institutional NPK source (Ahmed-supplied 2026-10-15, with sources).`,
      },
    });
    sourceIdByKey.set(key, rec.id);
    sourcesCreated++;
  }
  console.log(`import-2026-10-15: sources created: ${sourcesCreated}`);

  // ── 5. Fertilizer recommendations ──
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const r of records) {
    const itemId = itemIdBySlug.get(r.crop);
    if (!itemId) {
      console.warn(`import-2026-10-15: skipped (unknown item): ${r.crop}`);
      skipped++;
      continue;
    }
    const countryId = countryIdByCode.get(r.country);
    if (!countryId) {
      console.warn(`import-2026-10-15: skipped (unknown country): ${r.country}`);
      skipped++;
      continue;
    }

    // Resolve region: existing slug from dedup, or new-region slug
    let regionId: string | null = null;
    if (r._new_region) {
      const slug = regionSlugFor(r.country, r.region);
      regionId = (slug && regionIdBySlug.get(slug)) || null;
      if (!regionId) {
        console.warn(`import-2026-10-15: skipped (new region not resolved): ${r.country}/${r.region}`);
        skipped++;
        continue;
      }
    } else if (r._rslug) {
      regionId = regionIdBySlug.get(r._rslug) || null;
    }

    const sourceId = sourceIdByKey.get(`${r.source.trim()}||${SOURCE_TITLE}`);
    if (!sourceId) {
      console.warn(`import-2026-10-15: skipped (missing source): ${r.crop}`);
      skipped++;
      continue;
    }

    const nutrientData = {
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
      applicationTiming: r.application,
      sourceId,
      verificationStatus: "verified" as VerificationStatus,
    };

    if (r._action === "insert") {
      const existing = await db.fertilizerRecommendation.findFirst({
        where: { growingItemId: itemId, countryId, regionId },
        select: { id: true },
      });
      if (existing) {
        skipped++; // idempotent: already present
        continue;
      }
      await db.fertilizerRecommendation.create({
        data: {
          growingItemId: itemId,
          countryId,
          regionId,
          ...nutrientData,
          isPrimary: true,
        },
      });
      inserted++;
    } else {
      // UPDATE: overwrite existing record(s) with Ahmed's sourced values.
      // Only touch NPK ranges + application + source + status; leave isPrimary etc.
      const matches = await db.fertilizerRecommendation.findMany({
        where: { growingItemId: itemId, countryId, regionId },
        select: { id: true },
      });
      if (matches.length === 0) {
        // No existing record (seed proxy may have been stale) → insert instead
        await db.fertilizerRecommendation.create({
          data: {
            growingItemId: itemId,
            countryId,
            regionId,
            ...nutrientData,
            isPrimary: true,
          },
        });
        inserted++;
        console.log(
          `import-2026-10-15: update-target missing, inserted instead: ${r.country}/${r.crop}/${r.region ?? "national"}`
        );
      } else {
        if (matches.length > 1) {
          console.warn(
            `import-2026-10-15: ${matches.length} matches for ${r.country}/${r.crop}/${r.region ?? "national"} — updating all`
          );
        }
        for (const m of matches) {
          await db.fertilizerRecommendation.update({
            where: { id: m.id },
            data: nutrientData,
          });
          updated++;
        }
      }
    }
  }

  console.log(
    `import-2026-10-15: DONE — inserted: ${inserted}, updated: ${updated}, skipped: ${skipped}, regions created: ${regionsCreated}`
  );
}
