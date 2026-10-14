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

/**
 * Identity-only field crop (no verified agronomics yet).
 * For crops that have (or will have) FertilizerRecommendation rows but no
 * verified static agronomic profile. Never invent agronomics here.
 */
function fieldCrop(
  slug: string,
  name: string,
  urdu: string,
  scientificName: string | null
): GrowingItem {
  return {
    slug,
    name,
    urdu,
    scientificName,
    category: "crop",
    plantSubcategory: null,
    season: null,
    seasonDetail: null,
    sowingMonths: null, // covered by the planting calendar, never invented
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
    npk: { n: 12, p: 60, k: 80 },
    npkSource: "Iowa State Extension / Embrapa Soja",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
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
    npk: { n: 25, p: 50, k: 50 },
    npkSource: "ICAR-DGR Junagadh / UGA Extension",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
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
    npk: { n: 70, p: 28, k: 50 },
    npkSource: "BJRI Bangladesh / ICAR-CRIJAF Barrackpore",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
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
    npk: { n: 75, p: 40, k: 40 },
    npkSource: "ICAR-DRMR Bharatpur / AAFC Canada",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
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
    npk: { n: 20, p: 42, k: 30 },
    npkSource: "Saskatchewan Ministry of Agriculture / GRDC",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
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
    npk: { n: 20, p: 50, k: 28 },
    npkSource: "GRDC GrowNotes / ICAR-IIPR Kanpur",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
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
    npk: { n: 250, p: 60, k: 250 },
    npkSource: "Embrapa Cafe / Cenicafe Colombia",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
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
    npk: { n: 150, p: 80, k: 230 },
    npkSource: "MPOB Malaysia / IOPRI Indonesia",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
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
    npk: { n: 145, p: 58, k: 65 },
    npkSource: "Canola Council of Canada / Terres Inovia",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
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
    npk: { n: 80, p: 40, k: 55 },
    npkSource: "GRDC Australia / ARVALIS France",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
    indexable: false,
  },
  {
    slug: "sunflower",
    name: "Sunflower",
    urdu: "",
    scientificName: "Helianthus annuus",
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
    npk: { n: 65, p: 50, k: 55 },
    npkSource: "Terres Inovia France / MAPA Spain",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
    indexable: false,
  },
  {
    slug: "rubber",
    name: "Natural Rubber",
    urdu: "",
    scientificName: "Hevea brasiliensis",
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
    npk: { n: 75, p: 65, k: 100 },
    npkSource: "Malaysian Rubber Board (LGM) / RRIT Thailand",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
    indexable: false,
  },
  {
    slug: "durum-wheat",
    name: "Durum Wheat",
    urdu: "",
    scientificName: "Triticum durum",
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
    npk: { n: 135, p: 58, k: 55 },
    npkSource: "CREA Italy / Saskatchewan Agriculture",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
    indexable: false,
  },
  {
    slug: "sugar-beet",
    name: "Sugar Beet",
    urdu: "",
    scientificName: "Beta vulgaris",
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
    npk: { n: 130, p: 75, k: 200 },
    npkSource: "LfL Bayern / ITB France",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
    indexable: false,
  },
  {
    slug: "rye",
    name: "Rye",
    urdu: "",
    scientificName: "Secale cereale",
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
    npk: { n: 90, p: 50, k: 75 },
    npkSource: "IUNG-PIB Poland / LfL Germany",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
    indexable: false,
  },
  {
    slug: "triticale",
    name: "Triticale",
    urdu: "",
    scientificName: "× Triticosecale",
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
    npk: { n: 90, p: 50, k: 65 },
    npkSource: "IUNG-PIB Pulawy / GRDC Australia",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
    indexable: false,
  },
  {
    slug: "olive",
    name: "Olive",
    urdu: "",
    scientificName: "Olea europaea",
    category: "plant",
    plantSubcategory: "fruit",
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
    npk: { n: 80, p: 35, k: 110 },
    npkSource: "MAPA Spain / CREA-OFA Italy",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
    indexable: false,
  },
  {
    slug: "grape",
    name: "Grape",
    urdu: "",
    scientificName: "Vitis vinifera",
    category: "plant",
    plantSubcategory: "fruit",
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
    npk: { n: 65, p: 40, k: 110 },
    npkSource: "IFV France / AWRI Australia",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
    indexable: false,
  },
  {
    slug: "citrus",
    name: "Citrus (Orange)",
    urdu: "",
    scientificName: "Citrus sinensis",
    category: "plant",
    plantSubcategory: "fruit",
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
    npk: { n: 200, p: 65, k: 160 },
    npkSource: "IVIA Spain / University of Florida IFAS",
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: "verified",
    indexable: false,
  },
  // ── Global crop-dose program (2026-10-08): identity only; agronomics live
  // in FertilizerRecommendation rows, never invented here ──
  fieldCrop("beans", "Beans", "لوبیا", "Phaseolus vulgaris"),
  fieldCrop("sweet-potato", "Sweet Potato", "شکرقندی", "Ipomoea batatas"),
  fieldCrop("cassava", "Cassava", "", "Manihot esculenta"),
  fieldCrop("sesame", "Sesame", "تل", "Sesamum indicum"),
  fieldCrop("buckwheat", "Buckwheat", "", "Fagopyrum esculentum"),
  fieldCrop("coconut", "Coconut", "ناریل", "Cocos nucifera"),
  fieldCrop("oats", "Oats", "جئی", "Avena sativa"),
  fieldCrop("millet", "Millet", "", null), // generic — taxonomy ambiguous, left null
  fieldCrop("sorghum", "Sorghum", "جوار", "Sorghum bicolor"),
];

/* ---------------- Vegetables (identity only — agronomics not yet verified) ---------------- */

/* Ahmed's verified NPK research (2026-10-14) — kg/ha midpoints of institutional ranges. */
const GROWING_NPK: Record<string, { n: number; p: number; k: number; source: string }> = {
  "alfalfa": { n: 28, p: 92, k: 150, source: "UC Davis Extension / FRI Sargodha" },
  "barley": { n: 80, p: 40, k: 55, source: "GRDC Australia / ARVALIS France" },
  "bean": { n: 42, p: 70, k: 50, source: "ICAR / Michigan State Extension" },
  "beans": { n: 40, p: 70, k: 50, source: "ICAR-IIPR Kanpur / Embrapa Arroz e Feijao" },
  "brinjal": { n: 140, p: 75, k: 80, source: "TNAU Agritech / BATEM Antalya" },
  "buckwheat": { n: 38, p: 50, k: 40, source: "MAFF Japan / Cornell University Extension" },
  "cabbage": { n: 190, p: 75, k: 160, source: "KTBL Germany / Purdue Extension" },
  "cabbage-chinese": { n: 175, p: 75, k: 130, source: "RDA Korea / CAAS IVF" },
  "canola": { n: 145, p: 58, k: 65, source: "Canola Council of Canada / Terres Inovia" },
  "carrot": { n: 110, p: 75, k: 170, source: "AHDB UK / WA DPIRD" },
  "cassava": { n: 100, p: 50, k: 125, source: "IITA Ibadan / BSIP Kementan" },
  "cauliflower": { n: 165, p: 85, k: 125, source: "ICAR-IIVR / CTIFL France" },
  "chickpea": { n: 20, p: 50, k: 28, source: "GRDC GrowNotes / ICAR-IIPR Kanpur" },
  "chili": { n: 140, p: 70, k: 75, source: "TNAU / Texas A&M AgriLife" },
  "chinese-cabbage": { n: 210, p: 100, k: 160, source: "NARO Japan / RDA NIHHS" },
  "citrus": { n: 200, p: 65, k: 160, source: "IVIA Spain / University of Florida IFAS" },
  "cocoa": { n: 100, p: 55, k: 130, source: "CRIG Ghana / CNRA Cote d'Ivoire" },
  "coconut": { n: 125, p: 65, k: 215, source: "ICAR-CPCRI Kasaragod / PCA Philippines" },
  "coffee": { n: 250, p: 60, k: 250, source: "Embrapa Cafe / Cenicafe Colombia" },
  "cotton": { n: 170, p: 65, k: 70, source: "Mississippi State Extension / CCRI Multan" },
  "cowpea": { n: 25, p: 50, k: 32, source: "IITA Ibadan / ICAR" },
  "cucumber": { n: 130, p: 75, k: 150, source: "University of Florida IFAS / BATEM" },
  "daikon": { n: 130, p: 110, k: 130, source: "MAFF Japan / RDA Korea" },
  "durum-wheat": { n: 135, p: 58, k: 55, source: "CREA Italy / Saskatchewan Agriculture" },
  "finger-millet": { n: 52, p: 38, k: 30, source: "ICAR-IIMR Hyderabad / NARO Uganda" },
  "garlic": { n: 130, p: 75, k: 120, source: "ITACyL / Shandong Academy of Agricultural Sciences" },
  "grape": { n: 65, p: 40, k: 110, source: "IFV France / AWRI Australia" },
  "groundnut": { n: 25, p: 50, k: 50, source: "ICAR-DGR Junagadh / UGA Extension" },
  "jute": { n: 70, p: 28, k: 50, source: "BJRI Bangladesh / ICAR-CRIJAF Barrackpore" },
  "lentil": { n: 20, p: 42, k: 30, source: "Saskatchewan Ministry of Agriculture / GRDC" },
  "lupins": { n: 10, p: 45, k: 52, source: "WA DPIRD Australia / LfL Germany" },
  "mango": { n: 150, p: 62, k: 150, source: "ICAR-CISH Lucknow / INIFAP Mexico" },
  "marigold": { n: 100, p: 70, k: 70, source: "ICAR-DFR Pune / TNAU Horticulture" },
  "millet": { n: 52, p: 32, k: 28, source: "UNL CropWatch Nebraska / CAAS" },
  "mung-bean": { n: 25, p: 50, k: 30, source: "ICAR-IIPR Kanpur / GRDC GrowNotes" },
  "mustard": { n: 75, p: 40, k: 40, source: "ICAR-DRMR Bharatpur / AAFC Canada" },
  "napa-cabbage": { n: 160, p: 75, k: 140, source: "UC Davis Extension / RDA Korea" },
  "neem": { n: 40, p: 28, k: 30, source: "ICAR-CAFRI Jhansi / TNAU Forestry" },
  "oats": { n: 75, p: 45, k: 55, source: "University of Minnesota Extension / LWK Niedersachsen" },
  "okra": { n: 105, p: 60, k: 75, source: "TNAU / University of Florida IFAS" },
  "olive": { n: 80, p: 35, k: 110, source: "MAPA Spain / CREA-OFA Italy" },
  "onion": { n: 130, p: 75, k: 135, source: "Oregon State University Extension / WUR Wageningen" },
  "palm-oil": { n: 150, p: 80, k: 230, source: "MPOB Malaysia / IOPRI Indonesia" },
  "pearl-millet": { n: 70, p: 38, k: 32, source: "ICAR-AICRP on Pearl Millet / ICRISAT" },
  "peas": { n: 32, p: 60, k: 65, source: "PGRO UK / UNIP France" },
  "pepper": { n: 180, p: 85, k: 190, source: "MAPA Spain / University of Florida IFAS" },
  "pigeon-pea": { n: 25, p: 55, k: 28, source: "ICAR / ICRISAT / KALRO Kenya" },
  "potato": { n: 170, p: 100, k: 220, source: "LfL Bayern / University of Idaho Extension" },
  "radish": { n: 62, p: 45, k: 62, source: "DLR Rheinpfalz / MAFF Japan" },
  "rose": { n: 220, p: 80, k: 230, source: "WUR Wageningen / KALRO Kenya" },
  "rubber": { n: 75, p: 65, k: 100, source: "Malaysian Rubber Board (LGM) / RRIT Thailand" },
  "rye": { n: 90, p: 50, k: 75, source: "IUNG-PIB Poland / LfL Germany" },
  "sesame": { n: 50, p: 32, k: 32, source: "ICAR-AICRP Sesame / Texas A&M AgriLife" },
  "shallot": { n: 105, p: 62, k: 85, source: "Balitsa Kementan / CTIFL France" },
  "sorghum": { n: 100, p: 45, k: 48, source: "Texas A&M AgriLife / GRDC Australia" },
  "soybean": { n: 12, p: 60, k: 80, source: "Iowa State Extension / Embrapa Soja" },
  "spinach": { n: 110, p: 55, k: 90, source: "LWK NRW / UC Davis Extension" },
  "sugar-beet": { n: 130, p: 75, k: 200, source: "LfL Bayern / ITB France" },
  "sugarcane": { n: 150, p: 60, k: 150, source: "IAC Boletim 100 / Sugar Research Australia (SRA)" },
  "sunflower": { n: 65, p: 50, k: 55, source: "Terres Inovia France / MAPA Spain" },
  "sweet-potato": { n: 58, p: 50, k: 120, source: "LSU AgCenter / CAAS" },
  "tomato": { n: 205, p: 100, k: 225, source: "UC Davis / MAPA Spain" },
  "triticale": { n: 90, p: 50, k: 65, source: "IUNG-PIB Pulawy / GRDC Australia" },
  "yam": { n: 95, p: 50, k: 115, source: "IITA Ibadan / NRCRI Umudike" },
};

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
    npk: GROWING_NPK[slug] ? { n: GROWING_NPK[slug].n, p: GROWING_NPK[slug].p, k: GROWING_NPK[slug].k } : null,
    npkSource: GROWING_NPK[slug]?.source ?? null,
    region: "",
    sources: [],
    lastReviewed: null,
    verificationStatus: GROWING_NPK[slug] ? "verified" : "under_review",
    indexable: false,
  };
}

const vegetables: GrowingItem[] = [
  vegetable("tomato", "Tomato", "ٹماٹر", "Solanum lycopersicum"),
  vegetable("onion", "Onion", "پیاز", "Allium cepa"),
  vegetable("shallot", "Shallot", "", "Allium cepa var. aggregatum"),
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
  vegetable("napa-cabbage", "Napa Cabbage", "", "Brassica rapa subsp. pekinensis"),
  vegetable("radish", "Radish", "", "Raphanus sativus"),
  vegetable("daikon", "Daikon (Japanese Radish)", "", "Raphanus sativus var. longipinnatus"),
  vegetable("cabbage-chinese", "Chinese Cabbage", "", "Brassica rapa subsp. pekinensis"),
];
// NOTE (taxonomy decision, Ahmed-approved fix 2026-10-08): potato is maintained
// as a SINGLE item under category "crop" (slug "potato", verified dose data,
// /crops/potato live). The former duplicate vegetable("potato", ...) definition
// was removed — it was shadowed by insert-if-missing seed order and could never
// materialize. Vegetable planting windows and veg NPK doses with itemSlug
// "potato" resolve to the crop item; /vegetables/potato 404s by design.

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
