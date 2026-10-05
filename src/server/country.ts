/**
 * Country/region data-access layer for the global agricultural database.
 *
 * Country and LANGUAGE are independent: changing country never changes the
 * UI locale, and vice versa. Country selection is persisted in the
 * FD_COUNTRY / FD_REGION cookies (1 year, set client-side on selection).
 *
 * Reads from PostgreSQL when configured; otherwise falls back to the static
 * datasets (Pakistan + India) so dev/build work with zero setup.
 */
import { cookies } from "next/headers";
import { db, isDbConfigured } from "@/lib/db";
import { COUNTRY_COOKIE, REGION_COOKIE } from "@/lib/countryCookies";
import {
  REGIONS as STATIC_REGIONS,
  PLANTING_WINDOWS as STATIC_WINDOWS,
  type Region as StaticRegion,
  type PlantingWindow as StaticWindow,
} from "@/lib/planting";
import { GROWING_ITEMS as STATIC_ITEMS } from "@/lib/growing";

export { COUNTRY_COOKIE, REGION_COOKIE };

export interface CountryInfo {
  code: string; // PK, IN, BD…
  name: string; // Pakistan
  slug: string; // pakistan
  defaultUnit: string;
}

export interface RegionInfo {
  slug: string;
  name: string;
  countryCode: string; // PK
  countryName: string; // Pakistan
}

const STATIC_COUNTRIES: CountryInfo[] = [
  { code: "PK", name: "Pakistan", slug: "pakistan", defaultUnit: "acre" },
  { code: "IN", name: "India", slug: "india", defaultUnit: "acre" },
];

const LEGACY_COUNTRY_TO_CODE: Record<string, string> = {
  pakistan: "PK",
  india: "IN",
};

async function tryDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try {
    return await fn();
  } catch (e) {
    console.error("[country] database read failed, using static fallback:", (e as Error).message);
    return fallback;
  }
}

function staticRegionToInfo(r: StaticRegion): RegionInfo {
  const code = LEGACY_COUNTRY_TO_CODE[r.country] ?? r.country.toUpperCase().slice(0, 2);
  return { slug: r.id, name: r.name, countryCode: code, countryName: r.countryName };
}

/* ── Countries ── */

export async function getCountries(): Promise<CountryInfo[]> {
  return tryDb(async () => {
    const rows = await db.country.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    });
    if (!rows.length) return STATIC_COUNTRIES;
    return rows.map((c) => ({
      code: c.code, name: c.name, slug: c.slug, defaultUnit: c.defaultUnit,
    }));
  }, STATIC_COUNTRIES);
}

export async function getCountryByCode(code: string): Promise<CountryInfo | undefined> {
  const all = await getCountries();
  return all.find((c) => c.code === code.toUpperCase());
}

/* ── Regions ── */

export async function getAllRegions(): Promise<RegionInfo[]> {
  return tryDb(async () => {
    const rows = await db.region.findMany({
      include: { countryObj: { select: { code: true, name: true } } },
      orderBy: { name: "asc" },
    });
    if (!rows.length) return STATIC_REGIONS.map(staticRegionToInfo);
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      countryCode: r.countryObj?.code ?? LEGACY_COUNTRY_TO_CODE[r.country] ?? "PK",
      countryName: r.countryObj?.name ?? (r.country === "india" ? "India" : "Pakistan"),
    }));
  }, STATIC_REGIONS.map(staticRegionToInfo));
}

export async function getRegionsByCountry(countryCode: string): Promise<RegionInfo[]> {
  const code = countryCode.toUpperCase();
  const all = await getAllRegions();
  return all.filter((r) => r.countryCode === code);
}

/* ── Cookie-backed selection ── */

export async function getSelectedCountryCode(): Promise<string> {
  const cookieCode = (await cookies()).get(COUNTRY_COOKIE)?.value?.toUpperCase();
  if (cookieCode) {
    const country = await getCountryByCode(cookieCode);
    if (country) return country.code;
  }
  return "PK";
}

export async function hasCountryCookie(): Promise<boolean> {
  const v = (await cookies()).get(COUNTRY_COOKIE)?.value;
  return !!v;
}

/** Region slug from cookie, validated to belong to the country; else null. */
export async function getSelectedRegionSlug(countryCode: string): Promise<string | null> {
  const slug = (await cookies()).get(REGION_COOKIE)?.value;
  if (!slug) return null;
  const regions = await getRegionsByCountry(countryCode);
  return regions.some((r) => r.slug === slug) ? slug : null;
}

/* ── Planting windows by month ── */

export type ActivityType =
  | "SOW" | "TRANSPLANT" | "PLANT" | "HARVEST" | "LAND_PREPARATION";

export interface PlantingHit {
  windowId: string;
  itemSlug: string;
  itemName: string;
  itemUrdu: string | null;
  scientificName: string | null;
  category: string;
  regionSlug: string;
  regionName: string;
  countryCode: string;
  countryName: string;
  activityType: ActivityType;
  startMonth: number;
  endMonth: number;
  harvestText: string | null;
  notes: string | null;
  verificationStatus: string;
  lastReviewed: string | null;
  sourceOrg: string;
  sourceTitle: string;
}

/** Cross-year aware: Nov→Feb matches Jan (but not Mar). */
export function monthInWindow(month: number, startMonth: number, endMonth: number): boolean {
  if (startMonth <= endMonth) return month >= startMonth && month <= endMonth;
  return month >= startMonth || month <= endMonth;
}

const VALID_ACTIVITIES = new Set(["SOW", "TRANSPLANT", "PLANT", "HARVEST", "LAND_PREPARATION"]);

function toActivityType(v: string): ActivityType {
  return VALID_ACTIVITIES.has(v) ? (v as ActivityType) : "SOW";
}

/** Category filter groups for the calendar: fruit/herb/flower + "other" bucket. */
const OTHER_CATEGORIES = new Set([
  "plant", "garden_plant", "indoor_plant", "outdoor_plant",
]);

export function categoryMatchesFilter(itemCategory: string, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "other") return OTHER_CATEGORIES.has(itemCategory);
  return itemCategory === filter;
}

/** Map the static fallback windows to PlantingHit (dev / no-DB mode). */
function staticHits(regionSlug: string, month: number, category: string, limit?: number): PlantingHit[] {
  const region = STATIC_REGIONS.find((r) => r.id === regionSlug);
  if (!region) return [];
  const code = LEGACY_COUNTRY_TO_CODE[region.country] ?? "PK";
  const hits: PlantingHit[] = [];
  for (const w of STATIC_WINDOWS) {
    if (w.regionId !== regionSlug) continue;
    if (!monthInWindow(month, w.startMonth, w.endMonth)) continue;
    const item = STATIC_ITEMS.find((i) => i.slug === w.itemSlug);
    if (!item) continue;
    if (!categoryMatchesFilter(item.category, category)) continue;
    hits.push({
      windowId: `${w.itemSlug}-${w.startMonth}`,
      itemSlug: item.slug,
      itemName: item.name,
      itemUrdu: item.urdu,
      scientificName: item.scientificName,
      category: item.category,
      regionSlug: region.id,
      regionName: region.name,
      countryCode: code,
      countryName: region.countryName,
      activityType: "SOW",
      startMonth: w.startMonth,
      endMonth: w.endMonth,
      harvestText: w.harvestText,
      notes: w.notes,
      verificationStatus: w.verificationStatus,
      lastReviewed: w.lastReviewed,
      sourceOrg: w.source.organization,
      sourceTitle: w.source.title,
    });
    if (limit && hits.length >= limit) break;
  }
  return hits;
}

export async function getPlantingByMonth(opts: {
  regionSlug: string;
  month: number;
  category?: string;
  limit?: number;
}): Promise<PlantingHit[]> {
  const { regionSlug, month, category = "all", limit } = opts;
  // Static fallback when the database isn't configured (dev / build without DB).
  if (!isDbConfigured()) return staticHits(regionSlug, month, category, limit);
  const rows = await tryDb(async () => {
    return await db.plantingWindow.findMany({
      where: { region: { slug: regionSlug } },
      include: {
        item: {
          select: {
            slug: true, name: true, urdu: true,
            scientificName: true, category: true,
          },
        },
        region: {
          select: {
            slug: true, name: true,
            countryObj: { select: { code: true, name: true } },
            country: true,
          },
        },
        sources: { include: { source: true }, take: 1 },
      },
      orderBy: { startMonth: "asc" },
    });
  }, []);

  const hits: PlantingHit[] = [];
  for (const w of rows) {
    if (!monthInWindow(month, w.startMonth, w.endMonth)) continue;
    if (!categoryMatchesFilter(w.item.category, category)) continue;
    const src = w.sources[0]?.source;
    hits.push({
      windowId: w.id,
      itemSlug: w.item.slug,
      itemName: w.item.name,
      itemUrdu: w.item.urdu,
      scientificName: w.item.scientificName,
      category: w.item.category,
      regionSlug: w.region.slug,
      regionName: w.region.name,
      countryCode: w.region.countryObj?.code ?? LEGACY_COUNTRY_TO_CODE[w.region.country] ?? "PK",
      countryName: w.region.countryObj?.name ?? (w.region.country === "india" ? "India" : "Pakistan"),
      activityType: toActivityType(w.activityType),
      startMonth: w.startMonth,
      endMonth: w.endMonth,
      harvestText: w.harvestText,
      notes: w.notes,
      verificationStatus: w.verificationStatus,
      lastReviewed: w.lastReviewed ? w.lastReviewed.toISOString().slice(0, 10) : null,
      sourceOrg: src?.organization ?? "Fertilizer Dose editorial",
      sourceTitle: src?.title ?? "Regional crop calendar summary",
    });
    if (limit && hits.length >= limit) break;
  }
  return hits;
}

/** Minimal index for client-side directory filtering (small payload). */
export interface WindowFilterRow {
  itemSlug: string;
  regionSlug: string;
  countryCode: string;
  startMonth: number;
  endMonth: number;
}

export async function getWindowFilterIndex(): Promise<WindowFilterRow[]> {
  if (!isDbConfigured()) {
    return STATIC_WINDOWS.map((w) => {
      const region = STATIC_REGIONS.find((r) => r.id === w.regionId);
      const code = region ? LEGACY_COUNTRY_TO_CODE[region.country] ?? "PK" : "PK";
      return {
        itemSlug: w.itemSlug,
        regionSlug: w.regionId,
        countryCode: code,
        startMonth: w.startMonth,
        endMonth: w.endMonth,
      };
    });
  }
  const rows = await tryDb(async () => {
    return await db.plantingWindow.findMany({
      select: {
        startMonth: true, endMonth: true,
        item: { select: { slug: true } },
        region: {
          select: {
            slug: true, country: true,
            countryObj: { select: { code: true } },
          },
        },
      },
    });
  }, []);
  return rows.map((w) => ({
    itemSlug: w.item.slug,
    regionSlug: w.region.slug,
    countryCode: w.region.countryObj?.code ?? LEGACY_COUNTRY_TO_CODE[w.region.country] ?? "PK",
    startMonth: w.startMonth,
    endMonth: w.endMonth,
  }));
}
