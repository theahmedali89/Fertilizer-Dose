/**
 * Data-access layer: single source of truth for public content.
 *
 * Reads from PostgreSQL when DATABASE_URL is configured; otherwise falls
 * back to the static TypeScript datasets (so `npm run dev` / `npm run build`
 * work with zero setup). Admin edits in the database take effect on the
 * public site as soon as DATABASE_URL is set.
 *
 * All functions return the SAME shapes as the static libs, so pages only
 * swap `import { X } from "@/lib/…"` for `await getX()`.
 */
import { db, isDbConfigured } from "@/lib/db";
import {
  FERTILIZERS as STATIC_FERTILIZERS,
  CROPS as STATIC_CROPS,
  type FertilizerInfo,
  type CropInfo,
} from "@/lib/agronomy";
import {
  GROWING_ITEMS as STATIC_ITEMS,
  type GrowingItem,
  type GrowingCategory,
} from "@/lib/growing";
import {
  REGIONS as STATIC_REGIONS,
  PLANTING_WINDOWS as STATIC_WINDOWS,
  type Region,
  type PlantingWindow,
} from "@/lib/planting";
import { POSTS as STATIC_POSTS, type BlogPost } from "@/lib/blog";

async function tryDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try {
    return await fn();
  } catch (e) {
    console.error("[data] database read failed, using static fallback:", (e as Error).message);
    return fallback;
  }
}

/* ── Fertilizers ── */

function toFertilizerInfo(r: {
  slug: string; name: string; urdu: string | null;
  n: number; p: number; k: number; tagline: string | null;
  description: string; benefits: string[]; precautions: string[];
  application: string;
}): FertilizerInfo {
  return {
    slug: r.slug, name: r.name, urdu: r.urdu ?? "",
    n: r.n, p: r.p, k: r.k, tagline: r.tagline ?? "",
    description: r.description, benefits: r.benefits,
    precautions: r.precautions, application: r.application,
  };
}

export async function getFertilizers(): Promise<FertilizerInfo[]> {
  return tryDb(async () => {
    const rows = await db.fertilizer.findMany({
      where: { published: true }, orderBy: { name: "asc" },
    });
    if (!rows.length) return STATIC_FERTILIZERS;
    return rows.map(toFertilizerInfo);
  }, STATIC_FERTILIZERS);
}

export async function getFertilizer(slug: string): Promise<FertilizerInfo | undefined> {
  const all = await getFertilizers();
  return all.find((f) => f.slug === slug);
}

/* ── Growing library ── */

type GrowingRow = {
  slug: string; name: string; urdu: string | null; scientificName: string | null;
  category: string; plantSubcategory: string | null; season: string | null;
  seasonDetail: string | null; sowingMonths: string | null; harvestPeriod: string | null;
  soil: string | null; water: string | null; sunlight: string | null; climate: string | null;
  regions: string[]; npkN: number | null; npkP: number | null; npkK: number | null;
  npkSource: string | null; verificationStatus: "draft" | "under_review" | "verified" | "published" | "archived";
  indexable: boolean;
  stages: { name: string; timing: string | null; note: string | null }[];
};

function toGrowingItem(r: GrowingRow): GrowingItem {
  return {
    slug: r.slug, name: r.name, urdu: r.urdu,
    scientificName: r.scientificName,
    category: r.category as GrowingCategory,
    plantSubcategory: r.plantSubcategory as GrowingItem["plantSubcategory"],
    season: r.season, seasonDetail: r.seasonDetail,
    sowingMonths: r.sowingMonths, harvestPeriod: r.harvestPeriod,
    soil: r.soil, water: r.water, sunlight: r.sunlight, climate: r.climate,
    regions: r.regions,
    npk: r.npkN != null && r.npkP != null && r.npkK != null
      ? { n: r.npkN, p: r.npkP, k: r.npkK } : null,
    npkSource: r.npkSource,
    region: "",
    verificationStatus: r.verificationStatus,
    indexable: r.indexable,
    stages: r.stages.map((s) => ({ name: s.name, timing: s.timing ?? "", note: s.note ?? "" })),
    deficiencies: [],
    problems: [],
    sources: [],
    lastReviewed: null,
  };
}

export async function getGrowingItems(): Promise<GrowingItem[]> {
  return tryDb(async () => {
    const rows = await db.growingItem.findMany({
      where: { published: true },
      include: { stages: { orderBy: { position: "asc" } } },
      orderBy: { name: "asc" },
    });
    if (!rows.length) return STATIC_ITEMS;
    return rows.map(toGrowingItem);
  }, STATIC_ITEMS);
}

export async function getGrowingItem(slug: string): Promise<GrowingItem | undefined> {
  const all = await getGrowingItems();
  return all.find((i) => i.slug === slug);
}

export async function getGrowingByCategory(category: GrowingCategory): Promise<GrowingItem[]> {
  const all = await getGrowingItems();
  return all.filter((i) => i.category === category);
}

/* ── Regions + planting windows ── */

export async function getRegions(): Promise<Region[]> {
  return tryDb(async () => {
    const rows = await db.region.findMany({ orderBy: [{ country: "asc" }, { name: "asc" }] });
    if (!rows.length) return STATIC_REGIONS;
    return rows.map((r) => ({
      id: r.slug, country: r.country as Region["country"],
      countryName: r.country === "pakistan" ? "Pakistan" : "India", name: r.name,
    }));
  }, STATIC_REGIONS);
}

export async function getPlantingWindows(): Promise<PlantingWindow[]> {
  return tryDb(async () => {
    const rows = await db.plantingWindow.findMany({
      include: {
        item: { select: { slug: true } },
        region: { select: { slug: true, country: true, name: true } },
        sources: { include: { source: true } },
      },
    });
    if (!rows.length) return STATIC_WINDOWS;
    return rows.map((w) => ({
      itemSlug: w.item.slug,
      regionId: w.region.slug,
      startMonth: w.startMonth, endMonth: w.endMonth,
      harvestText: w.harvestText, notes: w.notes,
      source: {
        organization: w.sources[0]?.source.organization ?? "Fertilizer Dose editorial",
        title: w.sources[0]?.source.title ?? "Regional crop calendar summary",
        country: w.sources[0]?.source.country ?? undefined,
        region: w.sources[0]?.source.region ?? undefined,
        lastReviewed: w.sources[0]?.source.lastReviewed
          ? w.sources[0].source.lastReviewed!.toISOString().slice(0, 10) : "",
      },
      verificationStatus: w.verificationStatus,
      lastReviewed: w.lastReviewed ? w.lastReviewed.toISOString().slice(0, 10) : null,
    }));
  }, STATIC_WINDOWS);
}

/* ── Blog ── */

function toBlogPost(r: {
  slug: string; title: string; excerpt: string; body: string;
  category: string | null; publishedAt: Date | null;
}): BlogPost {
  return {
    slug: r.slug, title: r.title, excerpt: r.excerpt,
    category: r.category ?? "",
    date: (r.publishedAt ?? new Date()).toISOString().slice(0, 10),
    readMinutes: Math.max(1, Math.round(r.body.split(/\s+/).length / 200)),
    body: r.body.split("\n\n"),
    image: "",
  };
}

export async function getPosts(): Promise<BlogPost[]> {
  return tryDb(async () => {
    const rows = await db.post.findMany({
      where: { published: true }, orderBy: { publishedAt: "desc" },
    });
    if (!rows.length) return STATIC_POSTS;
    return rows.map(toBlogPost);
  }, STATIC_POSTS);
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const all = await getPosts();
  return all.find((p) => p.slug === slug);
}

/* ── Calculator crops (dose data) ── */

export async function getCrops(): Promise<CropInfo[]> {
  return tryDb(async () => {
    const items = await getGrowingItems();
    const crops = items.filter((i) => i.category === "crop");
    if (!crops.length) return STATIC_CROPS;

    // Get verified fertilizer recommendations to populate NPK data.
    // The calculator uses GrowingItem.npk (legacy flat field), but verified
    // data lives in FertilizerRecommendation. Merge them here.
    let recMap = new Map<string, { n: number | null; p: number | null; k: number | null; source: string }>();
    try {
      // Try to get selected country; default to PK if unavailable
      const { getSelectedCountryCode } = await import("@/server/country");
      const countryCode = await getSelectedCountryCode().catch(() => "PK");
      const country = await db.country.findUnique({ where: { code: countryCode }, select: { id: true } });
      if (country) {
        const recs = await db.fertilizerRecommendation.findMany({
          where: {
            countryId: country.id,
            verificationStatus: { in: ["verified", "published"] },
          },
          include: {
            item: { select: { slug: true } },
            source: { select: { title: true, organization: true } },
          },
        });
        for (const r of recs) {
          const slug = r.item.slug;
          // Keep first (most specific) record per crop; prefer region-specific over country-wide
          if (!recMap.has(slug) || r.regionId) {
            recMap.set(slug, {
              n: r.n, p: r.p2o5, k: r.k2o,
              source: r.source.organization ? `${r.source.organization} — ${r.source.title}` : r.source.title,
            });
          }
        }
      }
    } catch {
      // If recommendation lookup fails, fall back to GrowingItem.npk
    }

    // Map GrowingItem → CropInfo shape used by the calculator engine.
    return crops.map((c) => {
      const rec = recMap.get(c.slug);
      // Use verified recommendation NPK if available, else fall back to legacy flat field
      const npk = rec && rec.n != null
        ? { n: rec.n, p: rec.p ?? 0, k: rec.k ?? 0 }
        : c.npk;
      const npkSource = rec ? rec.source : c.npkSource;
      return {
        slug: c.slug, name: c.name, urdu: c.urdu ?? "",
        season: c.season ?? "", seasonDetail: c.seasonDetail ?? "",
        soil: c.soil ?? "", water: c.water ?? "",
        stages: c.stages.map((s) => ({ name: s.name, timing: s.timing, note: s.note })),
        problems: c.problems ?? [],
        npk, npkSource,
        region: c.region ?? "",
      };
    });
  }, STATIC_CROPS);
}
