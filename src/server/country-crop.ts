/**
 * Country × crop programmatic SEO pages: /[country]/[crop]/
 * Data access for per-country fertilizer recommendations.
 */
import { db, isDbConfigured } from "@/lib/db";
import { getCountryByCode, getCountries } from "@/server/country";

export interface CountryCropCombo {
  countrySlug: string;
  cropSlug: string;
}

export interface CountryCropRecommendation {
  id: string;
  variety: string | null;
  soilContext: string | null;
  irrigationContext: string | null;
  growthStage: string | null;
  n: number | null;
  p2o5: number | null;
  k2o: number | null;
  nMin: number | null;
  nMax: number | null;
  p2o5Min: number | null;
  p2o5Max: number | null;
  k2oMin: number | null;
  k2oMax: number | null;
  micronutrients: string | null;
  applicationTiming: string | null;
  applicationMethod: string | null;
  verificationStatus: string;
  isPrimary: boolean;
  region: { slug: string; name: string } | null;
  source: {
    organization: string;
    title: string;
    url: string | null;
    sourceType: string | null;
  } | null;
}

export interface CountryCropPageData {
  country: { code: string; name: string; slug: string; defaultUnit: string };
  item: {
    slug: string;
    name: string;
    urdu: string | null;
    scientificName: string | null;
    category: string;
  };
  recommendations: CountryCropRecommendation[];
}

const ACTIVE_STATUSES = ["verified", "published", "under_review"] as const;

function tryDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return Promise.resolve(fallback);
  return fn().catch(() => fallback);
}

/**
 * All (countrySlug, cropSlug) combos that have at least one recommendation.
 * Used by generateStaticParams. Crops + vegetables only.
 */
export async function getCountryCropCombos(): Promise<CountryCropCombo[]> {
  return tryDb(async () => {
    // Distinct (country, item) pairs — scalar-only select because Prisma
    // doesn't allow distinct over relation selects.
    const pairs = await db.fertilizerRecommendation.findMany({
      where: { verificationStatus: { in: [...ACTIVE_STATUSES] } },
      select: { countryId: true, growingItemId: true },
      distinct: ["countryId", "growingItemId"],
    });
    if (!pairs.length) return [];
    const [countries, items] = await Promise.all([
      db.country.findMany({
        where: { id: { in: pairs.map((p) => p.countryId) } },
        select: { id: true, slug: true },
      }),
      db.growingItem.findMany({
        where: { id: { in: pairs.map((p) => p.growingItemId) } },
        select: { id: true, slug: true, category: true },
      }),
    ]);
    const countryById = new Map(countries.map((c) => [c.id, c.slug]));
    const itemById = new Map(items.map((i) => [i.id, i]));
    const combos: CountryCropCombo[] = [];
    for (const p of pairs) {
      const cSlug = countryById.get(p.countryId);
      const item = itemById.get(p.growingItemId);
      if (!cSlug || !item) continue;
      if (item.category !== "crop" && item.category !== "vegetable") continue;
      combos.push({ countrySlug: cSlug, cropSlug: item.slug });
    }
    return combos;
  }, []);
}

/**
 * Full page data for one country × crop combo.
 * Returns null when the combo doesn't exist (→ 404).
 */
export async function getCountryCropPage(
  countrySlug: string,
  cropSlug: string
): Promise<CountryCropPageData | null> {
  return tryDb(async () => {
    const countries = await getCountries();
    const country = countries.find((c) => c.slug === countrySlug);
    if (!country) return null;

    const item = await db.growingItem.findUnique({
      where: { slug: cropSlug },
      select: {
        slug: true,
        name: true,
        urdu: true,
        scientificName: true,
        category: true,
      },
    });
    if (!item || (item.category !== "crop" && item.category !== "vegetable")) {
      return null;
    }

    const dbCountry = await db.country.findUnique({
      where: { code: country.code },
      select: { id: true },
    });
    if (!dbCountry) return null;

    const recs = await db.fertilizerRecommendation.findMany({
      where: {
        countryId: dbCountry.id,
        growingItemId: (await db.growingItem.findUnique({
          where: { slug: cropSlug },
          select: { id: true },
        }))?.id,
        verificationStatus: { in: [...ACTIVE_STATUSES] },
      },
      include: {
        region: { select: { slug: true, name: true } },
        source: {
          select: { organization: true, title: true, url: true, sourceType: true },
        },
      },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });
    if (!recs.length) return null;

    return {
      country: {
        code: country.code,
        name: country.name,
        slug: country.slug,
        defaultUnit: country.defaultUnit,
      },
      item,
      recommendations: recs.map((r) => ({
        id: r.id,
        variety: r.variety,
        soilContext: r.soilContext,
        irrigationContext: r.irrigationContext,
        growthStage: r.growthStage,
        n: r.n,
        p2o5: r.p2o5,
        k2o: r.k2o,
        nMin: r.nMin,
        nMax: r.nMax,
        p2o5Min: r.p2o5Min,
        p2o5Max: r.p2o5Max,
        k2oMin: r.k2oMin,
        k2oMax: r.k2oMax,
        micronutrients: r.micronutrients,
        applicationTiming: r.applicationTiming,
        applicationMethod: r.applicationMethod,
        verificationStatus: r.verificationStatus,
        isPrimary: r.isPrimary,
        region: r.region,
        source: r.source,
      })),
    };
  }, null);
}

export { getCountryByCode };
