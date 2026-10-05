/**
 * Unified growing knowledge architecture: CROPS + PLANTS + VEGETABLES.
 *
 * DATA-INTEGRITY POLICY (binding):
 * - Every agronomic figure lives here with a source or is `null`/empty.
 * - `null`/empty renders as "No verified data available yet." — never guessed.
 * - `indexable: false` keeps thin/in-review pages out of the sitemap and
 *   sets noindex until verified content lands (no programmatic SEO spam).
 *
 * UI strings live in src/messages/*.json. This file holds factual datasets only.
 */
import { CROPS, type CropInfo, type CropStage } from "./agronomy";

export type GrowingCategory = "crop" | "plant" | "vegetable";

/** Plant subcategories (spec §7). Only meaningful when category === "plant". */
export type PlantSubcategory =
  | "garden"
  | "flowering"
  | "indoor"
  | "outdoor"
  | "fruit";

export type VerificationStatus = "draft" | "under_review" | "verified" | "published" | "archived";

export interface SourceRef {
  organization: string;
  title: string;
  url?: string;
  country?: string;
  region?: string;
  publishedDate?: string;
  /** ISO date this source was last reviewed by us */
  lastReviewed: string;
}

export interface GrowingItem {
  slug: string;
  name: string;
  /** Common local name (Urdu where applicable) */
  urdu: string | null;
  /** Only where the taxonomy is unambiguous and well-established */
  scientificName: string | null;
  category: GrowingCategory;
  plantSubcategory: PlantSubcategory | null;

  season: string | null;
  seasonDetail: string | null;
  /** Verified sowing/planting window. null = not verified, never invented. */
  sowingMonths: string | null;
  /** Verified harvest window. null = not verified, never invented. */
  harvestPeriod: string | null;
  soil: string | null;
  water: string | null;
  sunlight: string | null;
  climate: string | null;
  regions: string[];

  stages: CropStage[];
  /** Common nutrient deficiencies (verified observations only) */
  deficiencies: string[];
  /** Common pests/diseases/problems */
  problems: string[];

  /** Recommended N–P2O5–K2O kg/ha. null = under review, never invented. */
  npk: { n: number; p: number; k: number } | null;
  npkSource: string | null;
  /** Region tag for the recommendation */
  region: string;

  sources: SourceRef[];
  /** ISO date the item's data was last reviewed */
  lastReviewed: string | null;
  verificationStatus: VerificationStatus;
  /** false = thin/in-review page: noindex + excluded from sitemap */
  indexable: boolean;
}

export type { CropStage };

/* ---------------- Existing crops, unified ---------------- */

const cropItems: GrowingItem[] = CROPS.map((c: CropInfo) => ({
  slug: c.slug,
  name: c.name,
  urdu: c.urdu,
  scientificName:
    c.slug === "wheat"
      ? "Triticum aestivum"
      : c.slug === "rice"
        ? "Oryza sativa"
        : c.slug === "maize"
          ? "Zea mays"
          : c.slug === "cotton"
            ? "Gossypium hirsutum"
            : c.slug === "sugarcane"
              ? "Saccharum officinarum"
              : c.slug === "potato"
                ? "Solanum tuberosum"
                : null,
  category: "crop",
  plantSubcategory: null,
  season: c.season,
  seasonDetail: c.seasonDetail,
  sowingMonths: null, // covered by seasonDetail; separate verified windows land with the planting calendar
  harvestPeriod: null,
  soil: c.soil,
  water: c.water,
  sunlight: null,
  climate: null,
  regions: [c.region],
  stages: c.stages,
  deficiencies: [],
  problems: c.problems,
  npk: c.npk,
  npkSource: c.npkSource,
  region: c.region,
  sources: c.npkSource
    ? [
        {
          organization: "Provincial agriculture departments / research institutes",
          title: c.npkSource,
          country: "Pakistan / India",
          region: c.region,
          lastReviewed: "2026-10-01",
        },
      ]
    : [],
  lastReviewed: "2026-10-01",
  verificationStatus: c.npk ? "verified" : "under_review",
  indexable: true, // substantive content even when the dose is in review
}));

/* ---------------- New crops (basic identity only — in review) ---------------- */

const newCrops: GrowingItem[] = [
  {
    slug: "soybean",
    name: "Soybean",
    urdu: "سویابین",
    scientificName: "Glycine max",
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  },
  {
    slug: "groundnut",
    name: "Groundnut (Peanut)",
    urdu: "مونگ پھلی",
    scientificName: "Arachis hypogaea",
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  },
  {
    slug: "jute",
    name: "Jute",
    urdu: "",
    scientificName: "Corchorus spp.",
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  },
  {
    slug: "mustard",
    name: "Mustard",
    urdu: "",
    scientificName: "Brassica juncea",
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  },
  {
    slug: "lentil",
    name: "Lentil",
    urdu: "",
    scientificName: "Lens culinaris",
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  },
  {
    slug: "chickpea",
    name: "Chickpea",
    urdu: "",
    scientificName: "Cicer arietinum",
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  },
  {
    slug: "coffee",
    name: "Coffee (Arabica)",
    urdu: "",
    scientificName: "Coffea arabica",
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  },
  {
    slug: "palm-oil",
    name: "Oil Palm",
    urdu: "",
    scientificName: "Elaeis guineensis",
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  },
  {
    slug: "canola",
    name: "Canola (Rapeseed)",
    urdu: "",
    scientificName: "Brassica napus",
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  },
  {
    slug: "barley",
    name: "Barley",
    urdu: "",
    scientificName: "Hordeum vulgare",
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  },
];

/* ---------------- Vegetables (identity only — agronomics not yet verified) ---------------- */

function vegetable(
  slug: string,
  name: string,
  urdu: string,
  scientificName: string
): GrowingItem {
  return {
    slug,
    name,
    urdu,
    scientificName,
    category: "vegetable",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null,
    harvestPeriod: null,
    soil: null,
    water: null,
    sunlight: null,
    climate: null,
    regions: [],
    stages: [],
    deficiencies: [],
    problems: [],
    npk: null,
    npkSource: null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "under_review",
    indexable: false,
  };
}

const vegetables: GrowingItem[] = [
  vegetable("tomato", "Tomato", "ٹماٹر", "Solanum lycopersicum"),
  vegetable("onion", "Onion", "پیاز", "Allium cepa"),
  vegetable("garlic", "Garlic", "لہسن", "Allium sativum"),
  vegetable("chili", "Chili / Hot Pepper", "مرچ", "Capsicum annuum"),
  vegetable("okra", "Okra (Ladyfinger)", "بھنڈی", "Abelmoschus esculentus"),
  vegetable("peas", "Peas", "مٹر", "Pisum sativum"),
  vegetable("carrot", "Carrot", "گاجر", "Daucus carota"),
  vegetable("spinach", "Spinach", "پالک", "Spinacia oleracea"),
  vegetable("brinjal", "Brinjal (Eggplant)", "بینگن", "Solanum melongena"),
  vegetable("cucumber", "Cucumber", "کھیرا", "Cucumis sativus"),
  vegetable("cauliflower", "Cauliflower", "", "Brassica oleracea var. botrytis"),
  vegetable("cabbage", "Cabbage", "", "Brassica oleracea var. capitata"),
  vegetable("radish", "Radish", "", "Raphanus sativus"),
];

/* ---------------- Plants (identity + subcategory — agronomics not yet verified) ---------------- */

function plant(
  slug: string,
  name: string,
  urdu: string,
  scientificName: string,
  plantSubcategory: PlantSubcategory
): GrowingItem {
  return {
    ...vegetable(slug, name, urdu, scientificName),
    category: "plant",
    plantSubcategory,
  };
}

const plants: GrowingItem[] = [
  plant("rose", "Rose", "گلاب", "Rosa spp.", "flowering"),
  plant("marigold", "Marigold", "گیندا", "Tagetes spp.", "flowering"),
  plant("money-plant", "Money Plant", "منی پلانٹ", "Epipremnum aureum", "indoor"),
  plant("mango", "Mango", "آم", "Mangifera indica", "fruit"),
  plant("neem", "Neem", "نیم", "Azadirachta indica", "outdoor"),
];

/* ---------------- Unified access ---------------- */

export const GROWING_ITEMS: GrowingItem[] = [
  ...cropItems,
  ...newCrops,
  ...vegetables,
  ...plants,
];

export function getItem(slug: string): GrowingItem | undefined {
  return GROWING_ITEMS.find((i) => i.slug === slug);
}

export function getItemsByCategory(category: GrowingCategory): GrowingItem[] {
  return GROWING_ITEMS.filter((i) => i.category === category);
}

export function searchItems(query: string, category?: GrowingCategory): GrowingItem[] {
  const q = query.trim().toLowerCase();
  const pool = category ? getItemsByCategory(category) : GROWING_ITEMS;
  if (!q) return pool;
  return pool.filter((i) =>
    [i.name, i.urdu ?? "", i.scientificName ?? "", i.slug]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export const CATEGORY_META: Record<
  GrowingCategory,
  { title: string; description: string; basePath: string }
> = {
  crop: {
    title: "Crops",
    description:
      "Season, soil, water, growth stages, common problems — and the verified fertilizer recommendation where one exists.",
    basePath: "/crops",
  },
  plant: {
    title: "Plants",
    description:
      "Garden, flowering, indoor, outdoor and fruit plants. Agronomic data is published only after verification.",
    basePath: "/plants",
  },
  vegetable: {
    title: "Vegetables",
    description:
      "Common vegetables for kitchen gardens and fields. Agronomic data is published only after verification.",
    basePath: "/vegetables",
  },
};

export const PLANT_SUBCATEGORIES: { id: PlantSubcategory; label: string }[] = [
  { id: "garden", label: "Garden plants" },
  { id: "flowering", label: "Flowering plants" },
  { id: "indoor", label: "Indoor plants" },
  { id: "outdoor", label: "Outdoor plants" },
  { id: "fruit", label: "Fruit plants" },
];
