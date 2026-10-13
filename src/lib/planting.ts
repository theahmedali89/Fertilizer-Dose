/**
 * Planting calendar data layer.
 *
 * DATA-INTEGRITY POLICY (binding):
 * - Planting windows are seeded ONLY from the app's existing published crop
 *   guidance (seasonDetail strings) or from institutional guidance supplied by
 *   Ahmed (ICAR-IIVR / PAU / HAU / TNAU vegetable windows; MARDI Malaysia;
 *   RDA South Korea; Tarım Bakanlığı/BATEM Türkiye; MAFF/NARO Japan;
 *   ARI Tandojam/Tarnab/Sariab & PARC Pakistan; MAPA/IFAPA/IMIDA/CITA Spain).
 *   Nothing is invented.
 * - Every window carries a SourceRef + verificationStatus. Seeds derived from
 *   editorial summaries are marked "under_review" until checked against a named
 *   provincial publication; institutional guidance supplied by Ahmed is marked
 *   "verified".
 * - Regions/months with no records render an honest empty state — never a
 *   guessed calendar.
 */
import type { SourceRef, GrowingCategory } from "./growing";

export interface Region {
  id: string; // e.g. "pk-punjab"
  country: "pakistan" | "india" | "malaysia" | "south_korea" | "turkiye" | "japan" | "spain" | "china";
  countryName: string;
  name: string;
}

export interface PlantingWindow {
  itemSlug: string;
  regionId: string;
  /** 1–12 */
  startMonth: number;
  /** 1–12; may be < startMonth for windows crossing New Year */
  endMonth: number;
  /** Verified harvest window text, where the source states one */
  harvestText: string | null;
  notes: string | null;
  /** SOW | TRANSPLANT | PLANT — matches the DB's activityType column */
  activityType?: "SOW" | "TRANSPLANT" | "PLANT";
  /** e.g. "Kharif", "Rabi", "Zaid" — informational season label */
  seasonName?: string;
  source: SourceRef;
  verificationStatus: "draft" | "under_review" | "verified" | "published" | "archived";
  lastReviewed: string | null;
}

export const REGIONS: Region[] = [
  { id: "pk-punjab", country: "pakistan", countryName: "Pakistan", name: "Punjab" },
  { id: "pk-sindh", country: "pakistan", countryName: "Pakistan", name: "Sindh" },
  { id: "pk-kpk", country: "pakistan", countryName: "Pakistan", name: "Khyber Pakhtunkhwa" },
  { id: "pk-balochistan", country: "pakistan", countryName: "Pakistan", name: "Balochistan" },
  { id: "in-punjab", country: "india", countryName: "India", name: "Punjab" },
  { id: "in-haryana", country: "india", countryName: "India", name: "Haryana" },
  { id: "in-up", country: "india", countryName: "India", name: "Uttar Pradesh" },
  { id: "in-tn", country: "india", countryName: "India", name: "Tamil Nadu" },
  { id: "my-peninsular", country: "malaysia", countryName: "Malaysia", name: "Peninsular Malaysia" },
  { id: "my-sabah", country: "malaysia", countryName: "Malaysia", name: "Sabah" },
  { id: "my-cameron", country: "malaysia", countryName: "Malaysia", name: "Cameron Highlands" },
  { id: "kr-gyeonggi", country: "south_korea", countryName: "South Korea", name: "Gyeonggi" },
  { id: "kr-gangwon", country: "south_korea", countryName: "South Korea", name: "Gangwon Highlands" },
  { id: "tr-coastal", country: "turkiye", countryName: "Türkiye", name: "Mediterranean/Aegean Coast" },
  { id: "tr-central", country: "turkiye", countryName: "Türkiye", name: "Central Anatolia" },
  { id: "jp-hokkaido", country: "japan", countryName: "Japan", name: "Hokkaido" },
  { id: "jp-tohoku", country: "japan", countryName: "Japan", name: "Tohoku" },
  { id: "jp-kanto", country: "japan", countryName: "Japan", name: "Kanto/Kyushu" },
  { id: "es-andalucia", country: "spain", countryName: "Spain", name: "Andalucía" },
  { id: "es-murcia", country: "spain", countryName: "Spain", name: "Murcia" },
  { id: "es-aragon", country: "spain", countryName: "Spain", name: "Aragón" },
  { id: "es-castilla", country: "spain", countryName: "Spain", name: "Castilla-La Mancha" },
  { id: "cn-northeast", country: "china", countryName: "China", name: "Northeast China" },
  { id: "cn-ncp", country: "china", countryName: "China", name: "North China Plain" },
  { id: "cn-yangtze", country: "china", countryName: "China", name: "Yangtze River Basin" },
];

export function getRegion(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function regionsByCountry(country: "pakistan" | "india" | "malaysia" | "south_korea" | "turkiye" | "japan" | "spain" | "china"): Region[] {
  return REGIONS.filter((r) => r.country === country);
}

const editorialSource = (region: Region): SourceRef => ({
  organization: "Fertilizer Dose editorial",
  title: "Regional crop calendar summary, derived from the app's published crop guidance",
  country: region.countryName,
  region: region.name,
  lastReviewed: "2026-10-04",
});

function window(
  regionId: string,
  itemSlug: string,
  startMonth: number,
  endMonth: number,
  harvestText: string | null,
  notes: string | null
): PlantingWindow {
  const region = getRegion(regionId)!;
  return {
    itemSlug,
    regionId,
    startMonth,
    endMonth,
    harvestText,
    notes,
    source: editorialSource(region),
    verificationStatus: "under_review",
    lastReviewed: "2026-10-04",
  };
}

// ── India vegetable planting windows (institutional, verified) ──
// Source: ICAR-IIVR Varanasi, PAU Ludhiana, CCS HAU Hisar, TNAU Coimbatore.
// Applies to the India plains regions: Punjab, Haryana, Uttar Pradesh, Tamil Nadu.
// Supplied by Ahmed 2026-10-13 as verified institutional guidance.

const INDIA_VEG_REGIONS = ["in-punjab", "in-haryana", "in-up", "in-tn"] as const;

const indiaVegSource = (region: Region): SourceRef => ({
  organization: "ICAR-IIVR Varanasi; PAU Ludhiana; CCS HAU Hisar; TNAU Coimbatore",
  title: "Vegetable planting windows — India plains",
  country: region.countryName,
  region: region.name,
  lastReviewed: "2026-10-13",
});

interface VegWindowSpec {
  itemSlug: string;
  activityType: "SOW" | "TRANSPLANT" | "PLANT";
  startMonth: number;
  endMonth: number;
  notes: string;
  seasonName: string;
}

const INDIA_VEG_WINDOW_SPECS: VegWindowSpec[] = [
  // — 1. Okra (Bhindi) — direct seeded, Zaid & Kharif —
  { itemSlug: "okra", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Spring/summer direct sowing: Feb 15 – Mar 20.", seasonName: "Zaid" },
  { itemSlug: "okra", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Rainy/kharif direct sowing: Jun 15 – Jul 30.", seasonName: "Kharif" },
  // — 2. Peas (Matar) — direct seeded, Rabi —
  { itemSlug: "peas", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "Early rabi direct sowing: Sep 25 – Oct 15.", seasonName: "Early Rabi" },
  { itemSlug: "peas", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "Main rabi direct sowing: Oct 20 – Nov 15.", seasonName: "Rabi" },
  // — 3. Spinach (Palak) — direct seeded —
  { itemSlug: "spinach", activityType: "SOW", startMonth: 9, endMonth: 11, notes: "Winter direct sowing: Sep 15 – Nov 15 (peak rabi).", seasonName: "Rabi" },
  { itemSlug: "spinach", activityType: "SOW", startMonth: 2, endMonth: 4, notes: "Summer/spring direct sowing: Feb 15 – Apr 15.", seasonName: "Summer" },
  // — 4. Cauliflower — nursery + transplant, Kharif to late Rabi —
  { itemSlug: "cauliflower", activityType: "SOW", startMonth: 5, endMonth: 6, notes: "Early nursery sowing: mid-May – Jun.", seasonName: "Early (Kharif)" },
  { itemSlug: "cauliflower", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "Mid nursery sowing: Jul – Aug.", seasonName: "Mid" },
  { itemSlug: "cauliflower", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "Late (Snowball) nursery sowing: Sep – Oct.", seasonName: "Late (Rabi)" },
  { itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 7, endMonth: 7, notes: "Early transplanting: Jul.", seasonName: "Early (Kharif)" },
  { itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 9, endMonth: 9, notes: "Mid transplanting: Sep.", seasonName: "Mid" },
  { itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 10, endMonth: 11, notes: "Late transplanting: Oct – Nov.", seasonName: "Late (Rabi)" },
  // — 5. Cabbage — Rabi —
  { itemSlug: "cabbage", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "Nursery sowing: Sep 15 – Oct 30.", seasonName: "Rabi" },
  { itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 10, endMonth: 11, notes: "Transplanting: Oct 15 – Nov 30.", seasonName: "Rabi" },
  // — 6. Radish (Mooli) — direct seeded on ridges, Autumn to Winter —
  { itemSlug: "radish", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Asiatic (Pusa Chetki) direct sowing on ridges: Aug – Sep.", seasonName: "Autumn" },
  { itemSlug: "radish", activityType: "SOW", startMonth: 10, endMonth: 12, notes: "European (white) direct sowing on ridges: Oct – Dec.", seasonName: "Winter" },
  // — 7. Carrot (Gajar) — direct seeded on ridges, Rabi —
  { itemSlug: "carrot", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Desi (red) direct sowing on ridges: Aug 15 – Sep 30.", seasonName: "Rabi" },
  { itemSlug: "carrot", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "English (orange) direct sowing on ridges: Oct 1 – Nov 15.", seasonName: "Rabi" },
  // — 8. Brinjal (Baingan) — Kharif & Zaid —
  { itemSlug: "brinjal", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Autumn nursery sowing: Jun – Jul.", seasonName: "Kharif" },
  { itemSlug: "brinjal", activityType: "SOW", startMonth: 11, endMonth: 12, notes: "Spring nursery sowing: Nov – Dec.", seasonName: "Spring" },
  { itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "Autumn transplanting: Jul – Aug.", seasonName: "Kharif" },
  { itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 1, endMonth: 2, notes: "Spring transplanting: Jan – Feb.", seasonName: "Spring" },
  // — 9. Garlic (Lehsan) — cloves dibbled directly, Rabi —
  { itemSlug: "garlic", activityType: "PLANT", startMonth: 9, endMonth: 10, notes: "Cloves dibbled directly: Sep 25 – Oct 30.", seasonName: "Rabi" },
  // — 10. Potato (Aaloo) — tubers planted on ridges, Autumn Rabi —
  { itemSlug: "potato", activityType: "PLANT", startMonth: 9, endMonth: 10, notes: "Early planting of tubers on ridges: Sep 15 – Oct 5.", seasonName: "Early Rabi" },
  { itemSlug: "potato", activityType: "PLANT", startMonth: 10, endMonth: 10, notes: "Main planting of tubers on ridges: Oct 10 – Oct 25.", seasonName: "Rabi" },
  // — 11. Chili (Mirch) — Zaid & Kharif —
  { itemSlug: "chili", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Summer/rainy nursery sowing: Jan – Feb.", seasonName: "Zaid" },
  { itemSlug: "chili", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Autumn/winter nursery sowing: Jun – Jul.", seasonName: "Kharif" },
  { itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 2, endMonth: 3, notes: "Summer transplanting: Feb – Mar.", seasonName: "Zaid" },
  { itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "Winter transplanting: Jul – Aug.", seasonName: "Kharif" },
  // — 12. Onion (Piyaz) — Rabi & late Kharif —
  { itemSlug: "onion", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "Rabi nursery sowing: mid-Oct – Nov.", seasonName: "Rabi" },
  { itemSlug: "onion", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Kharif nursery sowing: Jun – Jul.", seasonName: "Kharif" },
  { itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 12, endMonth: 1, notes: "Rabi transplanting: Dec 15 – Jan 15 (crosses New Year).", seasonName: "Rabi" },
  { itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 8, endMonth: 9, notes: "Kharif transplanting: Aug – Sep.", seasonName: "Late Kharif" },
  // — 13. Tomato — Kharif & Spring —
  { itemSlug: "tomato", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Autumn nursery sowing: Jun – Jul.", seasonName: "Kharif" },
  { itemSlug: "tomato", activityType: "SOW", startMonth: 11, endMonth: 12, notes: "Spring nursery sowing: Nov – Dec.", seasonName: "Spring" },
  { itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "Autumn transplanting: Jul – Aug.", seasonName: "Kharif" },
  { itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 1, endMonth: 2, notes: "Spring transplanting: Jan – Feb.", seasonName: "Spring" },
  // — 14. Chinese Cabbage — mild winter —
  { itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "Nursery/direct sowing: Sep 15 – Oct 15.", seasonName: "Mild Winter" },
  { itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 10, endMonth: 11, notes: "Transplanting: Oct 10 – Nov 5.", seasonName: "Mild Winter" },
];

function indiaVegWindows(): PlantingWindow[] {
  const out: PlantingWindow[] = [];
  for (const regionId of INDIA_VEG_REGIONS) {
    const region = getRegion(regionId)!;
    for (const spec of INDIA_VEG_WINDOW_SPECS) {
      out.push({
        itemSlug: spec.itemSlug,
        regionId,
        startMonth: spec.startMonth,
        endMonth: spec.endMonth,
        harvestText: null,
        notes: spec.notes,
        activityType: spec.activityType,
        seasonName: spec.seasonName,
        source: indiaVegSource(region),
        verificationStatus: "verified",
        lastReviewed: "2026-10-13",
      });
    }
  }
  return out;
}

// ── Malaysia vegetable planting windows (institutional, verified) ──
// Source: MARDI (Institut Penyelidikan dan Kemajuan Pertanian Malaysia),
// Jabatan Pertanian Malaysia (DOA), Jabatan Pertanian Sabah.
// Two zones: Lowland (Tanah Rendah — Peninsular & Sabah) and Highland
// (Tanah Tinggi — Cameron Highlands & Kundasang). Supplied by Ahmed 2026-10-13.

interface ZonedVegWindowSpec extends VegWindowSpec {
  regions: string[];
}

const malaysiaVegSource = (region: Region): SourceRef => ({
  organization: "MARDI; Jabatan Pertanian Malaysia (DOA); Jabatan Pertanian Sabah",
  title: "Vegetable planting windows — Malaysia",
  country: region.countryName,
  region: region.name,
  lastReviewed: "2026-10-13",
});

const MALAYSIA_VEG_WINDOW_SPECS: ZonedVegWindowSpec[] = [
  // — 1. Okra (Bendi) — direct seeded, Lowland —
  { regions: ["my-peninsular", "my-sabah"], itemSlug: "okra", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Cycle 1 direct sowing (lubang tanaman): Feb – Mar.", seasonName: "Lowland (Tanah Rendah)" },
  { regions: ["my-peninsular", "my-sabah"], itemSlug: "okra", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "Cycle 2 direct sowing (lubang tanaman): Jul – Aug.", seasonName: "Lowland (Tanah Rendah)" },
  // — 2. Peas (Kacang Pis/Manis) — direct seeded on trellises, Highland —
  { regions: ["my-cameron"], itemSlug: "peas", activityType: "SOW", startMonth: 1, endMonth: 3, notes: "Cycle 1 direct sowing on trellises: Jan – Mar.", seasonName: "Highland (Cameron Highlands)" },
  { regions: ["my-cameron"], itemSlug: "peas", activityType: "SOW", startMonth: 7, endMonth: 9, notes: "Cycle 2 direct sowing on trellises: Jul – Sep.", seasonName: "Highland (Cameron Highlands)" },
  // — 3. Spinach (Bayam) — year-round continuous sowing, Lowland —
  { regions: ["my-peninsular", "my-sabah"], itemSlug: "spinach", activityType: "SOW", startMonth: 1, endMonth: 12, notes: "Year-round: continuous sowing every 3–4 weeks, direct broadcast/line on raised beds.", seasonName: "Lowland (all seasons)" },
  // — 4. Cauliflower (Kobis Bunga) —
  { regions: ["my-cameron"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 2, endMonth: 4, notes: "Highland nursery sowing (peak cycle): Feb – Apr.", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-cameron"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 8, endMonth: 10, notes: "Highland nursery sowing (peak cycle): Aug – Oct.", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-peninsular"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 10, endMonth: 12, notes: "Lowland F1 hybrid nursery sowing: Oct – Dec.", seasonName: "Sub-tropical lowlands" },
  { regions: ["my-peninsular"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 11, endMonth: 1, notes: "Lowland transplanting: Nov – Jan.", seasonName: "Sub-tropical lowlands" },
  // — 5. Cabbage (Kobis Bulat) — Highland —
  { regions: ["my-cameron"], itemSlug: "cabbage", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Cycle 1 nursery sowing: Jan – Feb.", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-cameron"], itemSlug: "cabbage", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "Cycle 2 nursery sowing: Jul – Aug.", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-cameron"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 2, endMonth: 3, notes: "Cycle 1 transplanting (25–28 days after nursery): Feb – Mar.", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-cameron"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 8, endMonth: 9, notes: "Cycle 2 transplanting (25–28 days after nursery): Aug – Sep.", seasonName: "Highland (Tanah Tinggi)" },
  // — 6. Radish (Lobak Putih) — direct seeded on beds —
  { regions: ["my-cameron", "my-peninsular"], itemSlug: "radish", activityType: "SOW", startMonth: 2, endMonth: 4, notes: "Cycle 1 direct sowing on beds (batas): Feb – Apr.", seasonName: "Highland & selected lowlands" },
  { regions: ["my-cameron", "my-peninsular"], itemSlug: "radish", activityType: "SOW", startMonth: 8, endMonth: 10, notes: "Cycle 2 direct sowing on beds (batas): Aug – Oct.", seasonName: "Highland & selected lowlands" },
  // — 7. Carrot (Lobak Merah) — direct seeded, Highland exclusive —
  { regions: ["my-cameron"], itemSlug: "carrot", activityType: "SOW", startMonth: 1, endMonth: 3, notes: "Cycle 1 direct sowing in fine tilth beds: Jan – Mar.", seasonName: "Highland exclusive" },
  { regions: ["my-cameron"], itemSlug: "carrot", activityType: "SOW", startMonth: 7, endMonth: 9, notes: "Cycle 2 direct sowing in fine tilth beds: Jul – Sep.", seasonName: "Highland exclusive" },
  // — 8. Brinjal (Terung) — Lowland —
  { regions: ["my-peninsular"], itemSlug: "brinjal", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Cycle 1 nursery sowing: Jan – Feb.", seasonName: "Lowland (fertigasi/open field)" },
  { regions: ["my-peninsular"], itemSlug: "brinjal", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Cycle 2 nursery sowing: Jun – Jul.", seasonName: "Lowland (fertigasi/open field)" },
  { regions: ["my-peninsular"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 2, endMonth: 3, notes: "Cycle 1 transplanting (25–30 DAT): Feb – Mar.", seasonName: "Lowland (fertigasi/open field)" },
  { regions: ["my-peninsular"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "Cycle 2 transplanting: Jul – Aug.", seasonName: "Lowland (fertigasi/open field)" },
  // — 9. Garlic (Bawang Putih) — direct cloves, Highland microclimate —
  { regions: ["my-cameron"], itemSlug: "garlic", activityType: "PLANT", startMonth: 9, endMonth: 11, notes: "Direct planted cloves: Sep – Nov.", seasonName: "Highland microclimate" },
  // — 10. Potato (Ubi Kentang) — tubers in deep furrows, Highland —
  { regions: ["my-cameron"], itemSlug: "potato", activityType: "PLANT", startMonth: 1, endMonth: 3, notes: "Main season: seed tubers planted in deep furrows, Jan – Mar.", seasonName: "Highland (Kundasang & Cameron)" },
  { regions: ["my-cameron"], itemSlug: "potato", activityType: "PLANT", startMonth: 7, endMonth: 8, notes: "Off-season: seed tubers planted in deep furrows, Jul – Aug.", seasonName: "Highland (Kundasang & Cameron)" },
  // — 11. Chili (Cili Merah/Kulai) — Lowland —
  { regions: ["my-peninsular"], itemSlug: "chili", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Cycle 1 semaian (nursery): Jan – Feb.", seasonName: "Lowland (Tanah Rendah)" },
  { regions: ["my-peninsular"], itemSlug: "chili", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Cycle 2 semaian (nursery): Jun – Jul.", seasonName: "Lowland (Tanah Rendah)" },
  { regions: ["my-peninsular"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 2, endMonth: 3, notes: "Cycle 1 transplanting (3–4 weeks nursery): Feb – Mar.", seasonName: "Lowland (Tanah Rendah)" },
  { regions: ["my-peninsular"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "Cycle 2 transplanting: Jul – Aug.", seasonName: "Lowland (Tanah Rendah)" },
  // — 12. Shallot/Onion (Bawang Merah) — direct planting, Lowland dry seasons —
  { regions: ["my-peninsular", "my-sabah"], itemSlug: "shallot", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Dry season 1 direct planting (umbisi)/TSS nursery: Jan – Feb.", seasonName: "Lowland dry season" },
  { regions: ["my-peninsular", "my-sabah"], itemSlug: "shallot", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Dry season 2 direct planting (umbisi)/TSS nursery: Jun – Jul.", seasonName: "Lowland dry season" },
  // — 13. Tomato —
  { regions: ["my-cameron"], itemSlug: "tomato", activityType: "SOW", startMonth: 1, endMonth: 3, notes: "Highland nursery sowing (peak): Jan – Mar.", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-cameron"], itemSlug: "tomato", activityType: "SOW", startMonth: 6, endMonth: 8, notes: "Highland nursery sowing (peak): Jun – Aug.", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-cameron"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 2, endMonth: 4, notes: "Highland transplanting (25–30 days after nursery): Feb – Apr.", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-cameron"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 7, endMonth: 9, notes: "Highland transplanting (25–30 days after nursery): Jul – Sep.", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-peninsular"], itemSlug: "tomato", activityType: "SOW", startMonth: 5, endMonth: 7, notes: "Lowland fertigasi nursery sowing: May – Jul.", seasonName: "Lowland rain-shelter fertigation" },
  { regions: ["my-peninsular"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 6, endMonth: 8, notes: "Lowland transplanting: Jun – Aug.", seasonName: "Lowland rain-shelter fertigation" },
  // — 14. Chinese Cabbage (Sawi Putih/Kobis Cina) —
  { regions: ["my-cameron"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 1, endMonth: 12, notes: "Highland year-round nursery sowing.", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-cameron"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 1, endMonth: 12, notes: "Highland year-round transplanting (20–25 days after nursery).", seasonName: "Highland (Tanah Tinggi)" },
  { regions: ["my-peninsular"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 9, endMonth: 11, notes: "Lowland nursery sowing (cooler months): Sep – Nov.", seasonName: "Lowland cooler months" },
  { regions: ["my-peninsular"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 10, endMonth: 12, notes: "Lowland transplanting (20–25 days after nursery): Oct – Dec.", seasonName: "Lowland cooler months" },
];

function malaysiaVegWindows(): PlantingWindow[] {
  const out: PlantingWindow[] = [];
  for (const spec of MALAYSIA_VEG_WINDOW_SPECS) {
    for (const regionId of spec.regions) {
      const region = getRegion(regionId)!;
      out.push({
        itemSlug: spec.itemSlug,
        regionId,
        startMonth: spec.startMonth,
        endMonth: spec.endMonth,
        harvestText: null,
        notes: spec.notes,
        activityType: spec.activityType,
        seasonName: spec.seasonName,
        source: malaysiaVegSource(region),
        verificationStatus: "verified",
        lastReviewed: "2026-10-13",
      });
    }
  }
  return out;
}

// ── South Korea vegetable planting windows (institutional, verified) ──
// Source: RDA (Rural Development Administration — 농촌진흥청),
// National Institute of Horticultural and Herbal Science (NIHHS),
// Gangwon Highland Agriculture Research Institute.
// Systems: Spring (봄재배), Highland Summer (고랭지 하계재배),
// Autumn/Kimchi Season (가을 김장재배). Supplied by Ahmed 2026-10-13.

const koreaVegSource = (region: Region): SourceRef => ({
  organization: "RDA (Rural Development Administration); NIHHS; Gangwon Highland Agriculture Research Institute",
  title: "Vegetable planting windows — South Korea",
  country: region.countryName,
  region: region.name,
  lastReviewed: "2026-10-13",
});

const KOREA_VEG_WINDOW_SPECS: ZonedVegWindowSpec[] = [
  // — 1. Okra (오크라) — summer open-field, Jeju & southern coast —
  { regions: ["kr-gyeonggi"], itemSlug: "okra", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "Nursery/direct sowing: Apr 15 – May 10.", seasonName: "Summer open-field" },
  { regions: ["kr-gyeonggi"], itemSlug: "okra", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Transplanting: May 15 – May 30.", seasonName: "Summer open-field" },
  // — 2. Peas (완두) — spring plains & overwintered south —
  { regions: ["kr-gyeonggi"], itemSlug: "peas", activityType: "SOW", startMonth: 3, endMonth: 3, notes: "Spring (plains) direct sowing under mulch: Mar 5 – Mar 25.", seasonName: "Spring (봄재배)" },
  { regions: ["kr-gyeonggi"], itemSlug: "peas", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "Autumn (south) direct sowing under mulch: Oct 15 – Nov 5.", seasonName: "Overwintered south" },
  // — 3. Spinach (시금치) — spring open-field & winter outdoor —
  { regions: ["kr-gyeonggi"], itemSlug: "spinach", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Spring direct drill/broadcast: Mar 10 – Apr 15.", seasonName: "Spring open-field" },
  { regions: ["kr-gyeonggi"], itemSlug: "spinach", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "Autumn/winter (Namhae) direct drill/broadcast: Sep 15 – Oct 20.", seasonName: "Winter outdoor (노지 월동)" },
  // — 4. Cauliflower (콜리플라워) — spring tunnel & autumn open-field —
  { regions: ["kr-gyeonggi"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Spring nursery sowing: Feb 15 – Mar 10.", seasonName: "Spring plastic tunnel" },
  { regions: ["kr-gyeonggi"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 7, endMonth: 7, notes: "Autumn nursery sowing: Jul 10 – Jul 30.", seasonName: "Autumn open-field" },
  { regions: ["kr-gyeonggi"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Spring transplanting: Mar 25 – Apr 15.", seasonName: "Spring plastic tunnel" },
  { regions: ["kr-gyeonggi"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 8, endMonth: 8, notes: "Autumn transplanting: Aug 10 – Aug 25.", seasonName: "Autumn open-field" },
  // — 5. Cabbage (양배추) — spring, highland summer, autumn —
  { regions: ["kr-gyeonggi"], itemSlug: "cabbage", activityType: "SOW", startMonth: 2, endMonth: 2, notes: "Spring nursery sowing: Feb 1 – Feb 25.", seasonName: "Spring (봄재배)" },
  { regions: ["kr-gyeonggi"], itemSlug: "cabbage", activityType: "SOW", startMonth: 7, endMonth: 7, notes: "Autumn nursery sowing: Jul 5 – Jul 25.", seasonName: "Autumn (가을재배)" },
  { regions: ["kr-gyeonggi"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Spring transplanting: Mar 20 – Apr 10.", seasonName: "Spring (봄재배)" },
  { regions: ["kr-gyeonggi"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 8, endMonth: 8, notes: "Autumn transplanting: Aug 5 – Aug 20.", seasonName: "Autumn (가을재배)" },
  { regions: ["kr-gangwon"], itemSlug: "cabbage", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "Gangwon highland summer nursery sowing: Apr 15 – May 15.", seasonName: "Highland summer (고랭지 하계재배)" },
  { regions: ["kr-gangwon"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 5, endMonth: 6, notes: "Gangwon highland summer transplanting: May 20 – Jun 15.", seasonName: "Highland summer (고랭지 하계재배)" },
  // — 6. Radish (무 Korean Daikon) — direct seeded under vinyl mulch —
  { regions: ["kr-gyeonggi"], itemSlug: "radish", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Spring mulch direct sowing: Mar 25 – Apr 20.", seasonName: "Spring tunnel (봄터널)" },
  { regions: ["kr-gyeonggi"], itemSlug: "radish", activityType: "SOW", startMonth: 8, endMonth: 8, notes: "Autumn kimchi radish (김장무) direct sowing: Aug 15 – Aug 30.", seasonName: "Autumn kimchi (peak)" },
  { regions: ["kr-gangwon"], itemSlug: "radish", activityType: "SOW", startMonth: 5, endMonth: 6, notes: "Gangwon highland direct sowing: May 15 – Jun 20.", seasonName: "Highland summer radish" },
  // — 7. Carrot (당근) — direct seeded on high ridges —
  { regions: ["kr-gyeonggi"], itemSlug: "carrot", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Spring inland direct sowing on high ridges: Mar 15 – Apr 10.", seasonName: "Spring inland" },
  { regions: ["kr-gangwon"], itemSlug: "carrot", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "Autumn/Jeju winter carrot direct sowing: Jul 25 – Aug 20.", seasonName: "Autumn Jeju winter (제주 당근)" },
  // — 8. Brinjal (가지) — open-field summer / vinyl house —
  { regions: ["kr-gyeonggi"], itemSlug: "brinjal", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Nursery sowing in heat bed: Feb 15 – Mar 10.", seasonName: "Open field / vinyl house" },
  { regions: ["kr-gyeonggi"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Transplanting after late frost risk: Apr 25 – May 15.", seasonName: "Open field / vinyl house" },
  // — 9. Garlic (마늘) — overwintering crop, direct cloves under black vinyl —
  { regions: ["kr-gyeonggi"], itemSlug: "garlic", activityType: "PLANT", startMonth: 9, endMonth: 10, notes: "Warm-type (Namdo/Daeseo, south) cloves planted under black vinyl: Sep 20 – Oct 15.", seasonName: "Overwintering (월동재배)" },
  { regions: ["kr-gyeonggi"], itemSlug: "garlic", activityType: "PLANT", startMonth: 10, endMonth: 11, notes: "Cold-type (Hanji, inland/Uiseong) cloves planted under black vinyl: Oct 15 – Nov 10.", seasonName: "Overwintering (월동재배)" },
  // — 10. Potato (감자) — tubers under mulch —
  { regions: ["kr-gyeonggi"], itemSlug: "potato", activityType: "PLANT", startMonth: 2, endMonth: 3, notes: "Spring mulch (Superior) seed tubers planted directly: Feb 20 – Mar 20.", seasonName: "Spring plains (봄재배)" },
  { regions: ["kr-gangwon"], itemSlug: "potato", activityType: "PLANT", startMonth: 4, endMonth: 5, notes: "Gangwon highland (Daegwallyeong) seed tubers planted: Apr 20 – May 10.", seasonName: "Highland (고랭지재배)" },
  // — 11. Chili (고추 red pepper) — main outdoor season —
  { regions: ["kr-gyeonggi"], itemSlug: "chili", activityType: "SOW", startMonth: 2, endMonth: 2, notes: "Nursery sowing in heating glasshouse: Feb 5 – Feb 25.", seasonName: "Main outdoor (노지 정식)" },
  { regions: ["kr-gyeonggi"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Transplanting after late spring freeze: May 1 – May 15.", seasonName: "Main outdoor (노지 정식)" },
  // — 12. Onion (양파) — autumn-transplanted overwintering —
  { regions: ["kr-gyeonggi"], itemSlug: "onion", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Nursery bed sowing: Aug 25 – Sep 10.", seasonName: "Autumn-transplanted overwintering (가을정식)" },
  { regions: ["kr-gyeonggi"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 10, endMonth: 11, notes: "Transplanting: Oct 20 – Nov 10.", seasonName: "Autumn-transplanted overwintering (가을정식)" },
  // — 13. Tomato (토마토) — protected greenhouse & Gangwon highland —
  { regions: ["kr-gyeonggi"], itemSlug: "tomato", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Spring house nursery sowing: Jan 10 – Feb 10.", seasonName: "Protected greenhouse" },
  { regions: ["kr-gyeonggi"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Spring transplanting: Mar 15 – Apr 5.", seasonName: "Protected greenhouse" },
  { regions: ["kr-gangwon"], itemSlug: "tomato", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Summer highland nursery sowing: Mar 15 – Apr 10.", seasonName: "Gangwon highland" },
  { regions: ["kr-gangwon"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Summer highland transplanting: May 5 – May 25.", seasonName: "Gangwon highland" },
  // — 14. Chinese Cabbage (배추 kimchi baechu) — spring, highland, autumn kimchi —
  { regions: ["kr-gyeonggi"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 3, endMonth: 3, notes: "Spring nursery sowing: Mar 1 – Mar 25.", seasonName: "Spring (봄배추)" },
  { regions: ["kr-gyeonggi"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 8, endMonth: 8, notes: "Autumn kimchi (김장배추) nursery sowing: Aug 10 – Aug 25.", seasonName: "Autumn kimchi (major baseline)" },
  { regions: ["kr-gyeonggi"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 4, endMonth: 4, notes: "Spring transplanting: Apr 5 – Apr 25.", seasonName: "Spring (봄배추)" },
  { regions: ["kr-gyeonggi"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 8, endMonth: 9, notes: "Autumn kimchi transplanting: Aug 25 – Sep 10.", seasonName: "Autumn kimchi (major baseline)" },
  { regions: ["kr-gangwon"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 5, endMonth: 6, notes: "Gangwon highland nursery sowing: May 20 – Jun 20.", seasonName: "Highland (고랭지 배추)" },
  { regions: ["kr-gangwon"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 6, endMonth: 7, notes: "Gangwon highland transplanting: Jun 20 – Jul 15.", seasonName: "Highland (고랭지 배추)" },
];

function koreaVegWindows(): PlantingWindow[] {
  const out: PlantingWindow[] = [];
  for (const spec of KOREA_VEG_WINDOW_SPECS) {
    for (const regionId of spec.regions) {
      const region = getRegion(regionId)!;
      out.push({
        itemSlug: spec.itemSlug,
        regionId,
        startMonth: spec.startMonth,
        endMonth: spec.endMonth,
        harvestText: null,
        notes: spec.notes,
        activityType: spec.activityType,
        seasonName: spec.seasonName,
        source: koreaVegSource(region),
        verificationStatus: "verified",
        lastReviewed: "2026-10-13",
      });
    }
  }
  return out;
}

// ── Türkiye vegetable planting windows (institutional, verified) ──
// Source: T.C. Tarım ve Orman Bakanlığı (Sebze Yetiştiriciliği Kılavuzları),
// BATEM (Batı Akdeniz Tarımsal Araştırma Enstitüsü, Antalya),
// Atatürk Bahçe Kültürleri Merkez Araştırma Enstitüsü (Yalova).
// Two systems: Coastal Belt (Sahil Kuşağı — Mediterranean/Aegean: Antalya,
// Mersin, İzmir) and Central Anatolia (İç Anadolu — Ankara, Konya, Niğde).
// Supplied by Ahmed 2026-10-13.

const turkiyeVegSource = (region: Region): SourceRef => ({
  organization: "T.C. Tarım ve Orman Bakanlığı; BATEM Antalya; Atatürk Bahçe Kültürleri Yalova",
  title: "Vegetable planting windows — Türkiye",
  country: region.countryName,
  region: region.name,
  lastReviewed: "2026-10-13",
});

const TURKIYE_VEG_WINDOW_SPECS: ZonedVegWindowSpec[] = [
  // — 1. Okra (Bamya) — direct seeded — (chili slug map: n/a) —
  { regions: ["tr-coastal"], itemSlug: "okra", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "Aegean/Marmara direct sowing (doğrudan tohuma ekim): Apr 15 – May 20.", seasonName: "Açık Tarla (Spring/Summer)" },
  { regions: ["tr-coastal"], itemSlug: "okra", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Mediterranean early direct sowing: Mar 20 – Apr 15.", seasonName: "Açık Tarla (Early Spring)" },
  // — 2. Peas (Bezelye) — direct seeded —
  { regions: ["tr-coastal"], itemSlug: "peas", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "Coastal winter direct sowing (Akdeniz/Ege): Oct 15 – Nov 30.", seasonName: "Kışlık Sahil" },
  { regions: ["tr-central"], itemSlug: "peas", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Central Anatolia spring direct sowing (İç Anadolu): Mar 1 – Apr 10.", seasonName: "İlkbahar İç Bölge" },
  // — 3. Spinach (Ispanak) — direct seeded —
  { regions: ["tr-coastal", "tr-central"], itemSlug: "spinach", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "Autumn/winter direct broadcast/drill: Sep 1 – Oct 20.", seasonName: "Sonbahar/Kış" },
  { regions: ["tr-coastal", "tr-central"], itemSlug: "spinach", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Spring direct broadcast/drill: Feb 15 – Mar 20.", seasonName: "Erken İlkbahar" },
  // — 4. Cauliflower (Karnabahar) —
  { regions: ["tr-coastal"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Coastal (Akdeniz/Ege) nursery sowing: Jun 15 – Jul 20.", seasonName: "Güzlük ve Kışlık" },
  { regions: ["tr-central"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 5, endMonth: 6, notes: "Marmara/Central nursery sowing: May 15 – Jun 15.", seasonName: "Güzlük ve Kışlık" },
  { regions: ["tr-coastal"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 8, endMonth: 9, notes: "Coastal transplanting (dikim): Aug 1 – Sep 10.", seasonName: "Güzlük ve Kışlık" },
  { regions: ["tr-central"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 6, endMonth: 7, notes: "Central transplanting (dikim): Jun 25 – Jul 25.", seasonName: "Güzlük ve Kışlık" },
  // — 5. Cabbage (Lahana) —
  { regions: ["tr-central"], itemSlug: "cabbage", activityType: "SOW", startMonth: 5, endMonth: 6, notes: "Autumn/winter (güzlük) nursery sowing: May 20 – Jun 25.", seasonName: "Ana Sezon (Bafra, Niğde)" },
  { regions: ["tr-central"], itemSlug: "cabbage", activityType: "SOW", startMonth: 2, endMonth: 2, notes: "Spring (ilkbaharlık) nursery sowing: Feb 1 – Feb 25.", seasonName: "İlkbahar" },
  { regions: ["tr-central"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "Autumn/winter transplanting: Jul 1 – Aug 10.", seasonName: "Ana Sezon (Bafra, Niğde)" },
  { regions: ["tr-central"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Spring transplanting: Mar 15 – Apr 5.", seasonName: "İlkbahar" },
  // — 6. Radish (Turp) — direct seeded on ridges —
  { regions: ["tr-coastal", "tr-central"], itemSlug: "radish", activityType: "SOW", startMonth: 8, endMonth: 10, notes: "Autumn/winter (Kadirli/Osmaniye) direct sowing on ridges: Aug 20 – Oct 15.", seasonName: "Ana Hasat Dönemi (Sonbahar/Kış)" },
  { regions: ["tr-coastal", "tr-central"], itemSlug: "radish", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Spring direct sowing on ridges: Mar 1 – Apr 15.", seasonName: "Spring" },
  // — 7. Carrot (Havuç) — direct seeded on ridges —
  { regions: ["tr-central"], itemSlug: "carrot", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "Main crop (Konya/Kaşınhanı) direct sowing on ridges: Apr 10 – May 25.", seasonName: "Yazlık Havuç" },
  { regions: ["tr-central"], itemSlug: "carrot", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Autumn crop (Beypazarı) direct sowing on ridges: Jun 15 – Jul 15.", seasonName: "Kışlık Depoluk Havuç" },
  // — 8. Brinjal (Patlıcan) —
  { regions: ["tr-coastal"], itemSlug: "brinjal", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Coastal early open-field nursery: Jan 15 – Feb 15.", seasonName: "Açık Tarla (Post-frost)" },
  { regions: ["tr-central"], itemSlug: "brinjal", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Central/inland nursery: Feb 25 – Mar 20.", seasonName: "Açık Tarla (Post-frost)" },
  { regions: ["tr-coastal"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Coastal transplanting (dikim): Mar 25 – Apr 20.", seasonName: "Açık Tarla (Post-frost)" },
  { regions: ["tr-central"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Central transplanting (dikim): May 5 – May 25.", seasonName: "Açık Tarla (Post-frost)" },
  // — 9. Garlic (Sarımsak) — direct clove planting —
  { regions: ["tr-central"], itemSlug: "garlic", activityType: "PLANT", startMonth: 10, endMonth: 11, notes: "Winter garlic (Kastamonu Taşköprü) clove planting (diş ekimi): Oct 15 – Nov 20.", seasonName: "Kışlık Dikim (Preferred)" },
  { regions: ["tr-central"], itemSlug: "garlic", activityType: "PLANT", startMonth: 2, endMonth: 3, notes: "Spring clove planting: Feb 15 – Mar 15.", seasonName: "İlkbahar" },
  // — 10. Potato (Patates) — seed tubers on ridges —
  { regions: ["tr-coastal"], itemSlug: "potato", activityType: "PLANT", startMonth: 12, endMonth: 1, notes: "Early coastal (Ödemiş/Adana) tuber planting: Dec 15 – Jan 25.", seasonName: "Turfanda (Early)" },
  { regions: ["tr-central"], itemSlug: "potato", activityType: "PLANT", startMonth: 4, endMonth: 5, notes: "Main central (Niğde/Nevşehir/Konya) tuber planting: Apr 10 – May 10.", seasonName: "Ana Ürün (Main)" },
  // — 11. Peppers → chili (Biber: Sivri, Kapya, Dolma) —
  { regions: ["tr-coastal"], itemSlug: "chili", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Coastal nursery (fide): Jan 20 – Feb 20.", seasonName: "Açık Tarla Yazlık" },
  { regions: ["tr-central"], itemSlug: "chili", activityType: "SOW", startMonth: 3, endMonth: 3, notes: "Central/inland nursery (fide): Mar 1 – Mar 25.", seasonName: "Açık Tarla Yazlık" },
  { regions: ["tr-coastal"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 4, endMonth: 4, notes: "Coastal transplanting: Apr 5 – Apr 25.", seasonName: "Açık Tarla Yazlık" },
  { regions: ["tr-central"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Central transplanting: May 10 – May 30.", seasonName: "Açık Tarla Yazlık" },
  // — 12. Onion (Kuru Soğan) —
  { regions: ["tr-central"], itemSlug: "onion", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Direct seed (Polatlı/Amasya): Mar 1 – Apr 10.", seasonName: "Ana Mahsul (Main Long-Day Bulb)" },
  { regions: ["tr-central"], itemSlug: "onion", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Sets/arpacık planting: Feb 15 – Mar 20.", seasonName: "Ana Mahsul (Main Long-Day Bulb)" },
  // — 13. Tomato (Domates: salçalık & sofralık) —
  { regions: ["tr-coastal"], itemSlug: "tomato", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Processing (Bursa/Manisa/Salihli) nursery: Feb 15 – Mar 10.", seasonName: "Sanayi Domatesi" },
  { regions: ["tr-central"], itemSlug: "tomato", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Central open-field nursery: Mar 10 – Apr 5.", seasonName: "Açık Tarla Sofralık" },
  { regions: ["tr-coastal"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Processing transplanting: Apr 15 – May 10.", seasonName: "Sanayi Domatesi" },
  { regions: ["tr-central"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Central transplanting: May 10 – May 31.", seasonName: "Açık Tarla Sofralık" },
  // — 14. Chinese cabbage (Çin/ Pekin Lahanası) —
  { regions: ["tr-central"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 8, endMonth: 8, notes: "Nursery/direct sowing: Aug 1 – Aug 25.", seasonName: "Sonbahar Dönemi (Autumn)" },
  { regions: ["tr-central"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 9, endMonth: 9, notes: "Transplanting: Sep 1 – Sep 20.", seasonName: "Sonbahar Dönemi (Autumn)" },
];

function turkiyeVegWindows(): PlantingWindow[] {
  const out: PlantingWindow[] = [];
  for (const spec of TURKIYE_VEG_WINDOW_SPECS) {
    for (const regionId of spec.regions) {
      const region = getRegion(regionId)!;
      out.push({
        itemSlug: spec.itemSlug,
        regionId,
        startMonth: spec.startMonth,
        endMonth: spec.endMonth,
        harvestText: null,
        notes: spec.notes,
        activityType: spec.activityType,
        seasonName: spec.seasonName,
        source: turkiyeVegSource(region),
        verificationStatus: "verified",
        lastReviewed: "2026-10-13",
      });
    }
  }
  return out;
}

// ── Japan vegetable planting windows (institutional, verified) ──
// Source: MAFF (農林水産省 都道府県施肥・栽培指針), NARO
// (農業・食品産業技術総合研究機構), Hokkaido Research Organization (HRO),
// Chiba & Gunma Agricultural Experiment Stations.
// Regimes: Hokkaido & Tohoku (cold single-season/highland summer) and
// Kanto/Tokai/Kyushu (warm temperate double-cropping: spring + autumn/winter).
// Supplied by Ahmed 2026-10-13.

const japanVegSource = (region: Region): SourceRef => ({
  organization: "MAFF; NARO; Hokkaido Research Organization; Chiba & Gunma Ag. Experiment Stations",
  title: "Vegetable planting windows — Japan",
  country: region.countryName,
  region: region.name,
  lastReviewed: "2026-10-13",
});

const JAPAN_VEG_WINDOW_SPECS: ZonedVegWindowSpec[] = [
  // — 1. Okra (オクラ) — warm temperate (Kyushu, Kochi, Kanto) —
  { regions: ["jp-kanto"], itemSlug: "okra", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "Pot nursery/direct sowing: Apr 10 – May 5.", seasonName: "Warm temperate" },
  { regions: ["jp-kanto"], itemSlug: "okra", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Transplanting: May 10 – May 31 (post-frost).", seasonName: "Warm temperate" },
  // — 2. Peas (エンドウ/サヤエンドウ) — direct seeded under mulch —
  { regions: ["jp-kanto"], itemSlug: "peas", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "Overwintering (Kanto/Kyushu) direct sowing under mulch: Oct 20 – Nov 10.", seasonName: "秋まき越冬栽培" },
  { regions: ["jp-hokkaido"], itemSlug: "peas", activityType: "SOW", startMonth: 4, endMonth: 4, notes: "Spring sown (Tohoku/Hokkaido) direct sowing under mulch: Apr 5 – Apr 25.", seasonName: "春まき寒冷地" },
  // — 3. Spinach (ホウレンソウ) — direct drill —
  { regions: ["jp-kanto"], itemSlug: "spinach", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Spring (春まき) direct drill in beds: Mar 15 – Apr 20.", seasonName: "春どり露地" },
  { regions: ["jp-kanto"], itemSlug: "spinach", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "Autumn/winter (秋・冬まき, Kanto) direct drill in beds: Sep 15 – Oct 25.", seasonName: "秋冬どり露地" },
  // — 4. Cauliflower (カリフラワー) —
  { regions: ["jp-kanto"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Autumn harvest (秋どり) nursery sowing: Jun 25 – Jul 15.", seasonName: "一般地 秋どり露地" },
  { regions: ["jp-kanto"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 12, endMonth: 1, notes: "Spring harvest (春どり) tunnel nursery sowing: Dec 15 – Jan 15.", seasonName: "温暖地 春どり" },
  { regions: ["jp-kanto"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "Autumn transplanting: Jul 25 – Aug 15.", seasonName: "一般地 秋どり露地" },
  { regions: ["jp-kanto"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 2, endMonth: 3, notes: "Spring transplanting: Feb 20 – Mar 15.", seasonName: "温暖地 春どり" },
  // — 5. Cabbage (キャベツ) —
  { regions: ["jp-tohoku"], itemSlug: "cabbage", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Spring sown/highland summer (Tsumagoi) nursery: Mar 25 – Apr 25.", seasonName: "群馬嬬恋 高原夏秋キャベツ" },
  { regions: ["jp-kanto"], itemSlug: "cabbage", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "Autumn sown/winter (Aichi/Chiba) nursery: Jul 15 – Aug 10.", seasonName: "暖地 冬キャベツ" },
  { regions: ["jp-tohoku"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 5, endMonth: 6, notes: "Highland transplanting: May 10 – Jun 5.", seasonName: "群馬嬬恋 高原夏秋キャベツ" },
  { regions: ["jp-kanto"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 8, endMonth: 9, notes: "Winter transplanting: Aug 20 – Sep 10.", seasonName: "暖地 冬キャベツ" },
  // — 6. Radish (ダイコン) — direct seeded on high ridges —
  { regions: ["jp-kanto"], itemSlug: "radish", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Spring (春どり) direct sowing on high ridges (高畝): Mar 20 – Apr 15.", seasonName: "春どり" },
  { regions: ["jp-kanto"], itemSlug: "radish", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Autumn/winter main (秋冬どり, Miura/Chiba) direct sowing: Aug 25 – Sep 20.", seasonName: "秋まき秋冬どり" },
  // — 7. Carrot (ニンジン) — direct seeded —
  { regions: ["jp-kanto"], itemSlug: "carrot", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Spring (春まき) tunnel direct sowing in fine tilth beds: Feb 20 – Mar 20.", seasonName: "春まきトンネル" },
  { regions: ["jp-kanto"], itemSlug: "carrot", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "Autumn/winter (秋冬まき, Tomisato) direct sowing: Jul 10 – Aug 5.", seasonName: "夏まき秋冬どり" },
  // — 8. Brinjal (ナス) —
  { regions: ["jp-kanto"], itemSlug: "brinjal", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Heated nursery sowing: Feb 15 – Mar 10.", seasonName: "夏秋どり露地" },
  { regions: ["jp-kanto"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Transplanting: May 1 – May 20 (frost-free).", seasonName: "夏秋どり露地" },
  // — 9. Garlic (ニンニク, Fukuchi White) — direct clove planting —
  { regions: ["jp-tohoku"], itemSlug: "garlic", activityType: "PLANT", startMonth: 9, endMonth: 10, notes: "Aomori/Tohoku autumn clove planting (1片植え): Sep 15 – Oct 10.", seasonName: "青森寒冷地 秋植え" },
  { regions: ["jp-kanto"], itemSlug: "garlic", activityType: "PLANT", startMonth: 10, endMonth: 10, notes: "Warm south clove planting: Oct 5 – Oct 30.", seasonName: "温暖地 秋植え" },
  // — 10. Potato (バレイショ/ジャガイモ) — tubers on ridges —
  { regions: ["jp-hokkaido"], itemSlug: "potato", activityType: "PLANT", startMonth: 4, endMonth: 5, notes: "Hokkaido spring (Tokachi/Yotei) tuber planting on ridges: Apr 20 – May 15.", seasonName: "北海道春植え" },
  { regions: ["jp-kanto"], itemSlug: "potato", activityType: "PLANT", startMonth: 2, endMonth: 2, notes: "Warm double-crop (Nagasaki/Kagoshima) tuber planting: Feb 1 – Feb 25.", seasonName: "暖地春作" },
  // — 11. Peppers → chili (ピーマン, sweet pepper) —
  { regions: ["jp-kanto"], itemSlug: "chili", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Greenhouse nursery sowing: Feb 15 – Mar 15.", seasonName: "露地・雨よけ夏秋どり" },
  { regions: ["jp-kanto"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Transplanting: May 5 – May 25.", seasonName: "露地・雨よけ夏秋どり" },
  // — 12. Onion (タマネギ) —
  { regions: ["jp-hokkaido"], itemSlug: "onion", activityType: "SOW", startMonth: 2, endMonth: 2, notes: "Hokkaido spring sown (Kitami) nursery: Feb 1 – Feb 20.", seasonName: "北海道春まき" },
  { regions: ["jp-kanto"], itemSlug: "onion", activityType: "SOW", startMonth: 9, endMonth: 9, notes: "Honshu/Awaji autumn sown nursery: Sep 5 – Sep 20.", seasonName: "本州秋まき越冬" },
  { regions: ["jp-hokkaido"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Hokkaido transplanting: Apr 20 – May 10.", seasonName: "北海道春まき" },
  { regions: ["jp-kanto"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 11, endMonth: 11, notes: "Awaji/Honshu transplanting: Nov 5 – Nov 25.", seasonName: "本州秋まき越冬" },
  // — 13. Tomato (トマト) — open field / rain-shelter —
  { regions: ["jp-tohoku"], itemSlug: "tomato", activityType: "SOW", startMonth: 3, endMonth: 3, notes: "Nursery sowing: Mar 1 – Mar 25.", seasonName: "夏秋露地・雨よけ" },
  { regions: ["jp-tohoku"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Transplanting: May 10 – May 30.", seasonName: "夏秋露地・雨よけ" },
  // — 14. Chinese cabbage (ハクサイ) —
  { regions: ["jp-tohoku"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 5, endMonth: 5, notes: "Highland summer (Nagano/Gunma) nursery: May 1 – May 25.", seasonName: "高原夏どり" },
  { regions: ["jp-kanto"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 8, endMonth: 8, notes: "Autumn/winter main (Ibaraki/Tohoku) nursery: Aug 10 – Aug 30.", seasonName: "秋冬どり露地" },
  { regions: ["jp-tohoku"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 6, endMonth: 6, notes: "Highland transplanting: Jun 1 – Jun 20.", seasonName: "高原夏どり" },
  { regions: ["jp-kanto"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 9, endMonth: 9, notes: "Autumn transplanting: Sep 1 – Sep 20.", seasonName: "秋冬どり露地" },
];

function japanVegWindows(): PlantingWindow[] {
  const out: PlantingWindow[] = [];
  for (const spec of JAPAN_VEG_WINDOW_SPECS) {
    for (const regionId of spec.regions) {
      const region = getRegion(regionId)!;
      out.push({
        itemSlug: spec.itemSlug,
        regionId,
        startMonth: spec.startMonth,
        endMonth: spec.endMonth,
        harvestText: null,
        notes: spec.notes,
        activityType: spec.activityType,
        seasonName: spec.seasonName,
        source: japanVegSource(region),
        verificationStatus: "verified",
        lastReviewed: "2026-10-13",
      });
    }
  }
  return out;
}


// ── Pakistan (remaining provinces) vegetable planting windows (institutional, verified) ──
// Source: ARI Tandojam (Sindh), ARI Tarnab (KPK), ARI Sariab/Quetta (Balochistan),
// Pakistan Agricultural Research Council (PARC).
// Three zones: Sindh (Lower Indus Basin — mild winter, early heat), KPK
// (Peshawar Valley plains + Swat/Hazara summer highlands), Balochistan
// (upland valleys — cold-arid, summer off-season). Supplied by Ahmed 2026-10-13.

const pakistanVegSource = (region: Region): SourceRef => ({
  organization: "ARI Tandojam (Sindh); ARI Tarnab (KPK); ARI Sariab/Quetta (Balochistan); PARC",
  title: "Vegetable planting windows — Pakistan (Sindh, KPK, Balochistan)",
  country: region.countryName,
  region: region.name,
  lastReviewed: "2026-10-13",
});

const PAKISTAN_VEG_WINDOW_SPECS: ZonedVegWindowSpec[] = [
  // — 1. Okra (Bhindi) — direct seeded on ridges/beds —
  { regions: ["pk-sindh"], itemSlug: "okra", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Sindh early sowing: Jan 15 – Feb 28.", seasonName: "Sindh early Zaid" },
  { regions: ["pk-kpk"], itemSlug: "okra", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "KPK plains sowing: Mar 01 – Apr 15.", seasonName: "KPK spring" },
  { regions: ["pk-balochistan"], itemSlug: "okra", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "Balochistan uplands sowing: Apr 15 – May 20.", seasonName: "Balochistan summer" },
  // — 2. Peas (Matar) — direct seeded —
  { regions: ["pk-sindh"], itemSlug: "peas", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "Sindh sowing: Oct 15 – Nov 20.", seasonName: "Sindh Rabi" },
  { regions: ["pk-kpk"], itemSlug: "peas", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "KPK plains sowing: Oct 01 – Nov 10.", seasonName: "KPK Rabi" },
  { regions: ["pk-balochistan"], itemSlug: "peas", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Balochistan/Swat summer sowing: Mar 15 – Apr 20.", seasonName: "Highland off-season summer" },
  // — 3. Spinach (Palak) — direct broadcast/lines —
  { regions: ["pk-sindh"], itemSlug: "spinach", activityType: "SOW", startMonth: 9, endMonth: 11, notes: "Sindh sowing: Sep 15 – Nov 15.", seasonName: "Plains winter" },
  { regions: ["pk-kpk"], itemSlug: "spinach", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "KPK plains sowing: Sep 01 – Oct 31.", seasonName: "Plains winter" },
  { regions: ["pk-balochistan"], itemSlug: "spinach", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Balochistan spring sowing: Mar 15 – Apr 30.", seasonName: "Upland summer" },
  { regions: ["pk-balochistan"], itemSlug: "spinach", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Balochistan autumn sowing: Aug 15 – Sep 15.", seasonName: "Upland autumn" },
  // — 4. Cauliflower —
  { regions: ["pk-sindh"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Sindh nursery sowing: Aug 15 – Sep 30.", seasonName: "Lower plains Rabi" },
  { regions: ["pk-sindh"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 9, endMonth: 10, notes: "Sindh transplanting: Sep 15 – Oct 31.", seasonName: "Lower plains Rabi" },
  { regions: ["pk-kpk"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "KPK plains early nursery sowing: Jun 15 – Jul 31.", seasonName: "KPK plains" },
  { regions: ["pk-kpk"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "KPK plains late nursery sowing: Aug – Sep.", seasonName: "KPK plains" },
  { regions: ["pk-kpk"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "KPK early transplanting: Jul 15 – Aug 15.", seasonName: "KPK plains" },
  { regions: ["pk-kpk"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 9, endMonth: 10, notes: "KPK late transplanting: Sep – Oct.", seasonName: "KPK plains" },
  { regions: ["pk-balochistan"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Balochistan uplands nursery sowing: Mar 15 – Apr 15.", seasonName: "Upland summer off-season" },
  { regions: ["pk-balochistan"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Balochistan uplands transplanting: Apr 20 – May 15.", seasonName: "Upland summer off-season" },
  // — 5. Cabbage —
  { regions: ["pk-sindh"], itemSlug: "cabbage", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "Sindh nursery sowing: Sep 01 – Oct 15.", seasonName: "Subtropical Rabi" },
  { regions: ["pk-sindh"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 10, endMonth: 11, notes: "Sindh transplanting: Oct 01 – Nov 15.", seasonName: "Subtropical Rabi" },
  { regions: ["pk-kpk"], itemSlug: "cabbage", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "KPK plains nursery sowing: Aug 15 – Sep 30.", seasonName: "Subtropical Rabi" },
  { regions: ["pk-kpk"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 9, endMonth: 10, notes: "KPK plains transplanting: Sep 15 – Oct 31.", seasonName: "Subtropical Rabi" },
  { regions: ["pk-balochistan"], itemSlug: "cabbage", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Balochistan uplands nursery sowing: Mar 20 – Apr 20.", seasonName: "Highland summer" },
  { regions: ["pk-balochistan"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Balochistan uplands transplanting: Apr 25 – May 25.", seasonName: "Highland summer" },
  // — 6. Radish (Mooli) — direct seeded on ridges —
  { regions: ["pk-sindh"], itemSlug: "radish", activityType: "SOW", startMonth: 9, endMonth: 11, notes: "Sindh sowing (desi/white): Sep 15 – Nov 15.", seasonName: "Plains autumn/winter" },
  { regions: ["pk-kpk"], itemSlug: "radish", activityType: "SOW", startMonth: 8, endMonth: 10, notes: "KPK plains sowing: Aug 15 – Oct 31.", seasonName: "Plains autumn/winter" },
  { regions: ["pk-balochistan"], itemSlug: "radish", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "Balochistan uplands spring sowing: Apr 01 – May 15.", seasonName: "Highland summer" },
  { regions: ["pk-balochistan"], itemSlug: "radish", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Balochistan uplands autumn sowing: Aug – Sep.", seasonName: "Highland autumn" },
  // — 7. Carrot (Gajar) — direct seeded on fine ridges —
  { regions: ["pk-sindh"], itemSlug: "carrot", activityType: "SOW", startMonth: 9, endMonth: 11, notes: "Sindh sowing: Sep 15 – Nov 10.", seasonName: "Plains winter" },
  { regions: ["pk-kpk"], itemSlug: "carrot", activityType: "SOW", startMonth: 8, endMonth: 10, notes: "KPK plains sowing: Aug 15 – Oct 15.", seasonName: "Plains winter" },
  { regions: ["pk-balochistan"], itemSlug: "carrot", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Balochistan uplands sowing: Mar 15 – Apr 30.", seasonName: "Upland early summer" },
  // — 8. Brinjal (Baingan) —
  { regions: ["pk-sindh"], itemSlug: "brinjal", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Sindh Cycle 1 nursery sowing: Jan 10 – Feb 15.", seasonName: "Sindh year-round (Cycle 1)" },
  { regions: ["pk-sindh"], itemSlug: "brinjal", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Sindh Cycle 2 nursery sowing: Jun – Jul.", seasonName: "Sindh year-round (Cycle 2)" },
  { regions: ["pk-sindh"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 2, endMonth: 3, notes: "Sindh Cycle 1 transplanting: Feb 15 – Mar 15.", seasonName: "Sindh year-round (Cycle 1)" },
  { regions: ["pk-sindh"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "Sindh Cycle 2 transplanting: Jul – Aug.", seasonName: "Sindh year-round (Cycle 2)" },
  { regions: ["pk-kpk"], itemSlug: "brinjal", activityType: "SOW", startMonth: 3, endMonth: 3, notes: "KPK nursery sowing: Mar 01 – Mar 31.", seasonName: "Highland summer" },
  { regions: ["pk-kpk"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "KPK transplanting: Apr 15 – May 10.", seasonName: "Highland summer" },
  { regions: ["pk-balochistan"], itemSlug: "brinjal", activityType: "SOW", startMonth: 3, endMonth: 3, notes: "Balochistan nursery sowing: Mar 01 – Mar 31.", seasonName: "Highland summer" },
  { regions: ["pk-balochistan"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Balochistan transplanting: Apr 15 – May 10.", seasonName: "Highland summer" },
  // — 9. Garlic (Lehsan) — direct clove dibbling —
  { regions: ["pk-sindh"], itemSlug: "garlic", activityType: "PLANT", startMonth: 10, endMonth: 11, notes: "Sindh clove planting: Oct 01 – Nov 10.", seasonName: "Rabi (national baseline)" },
  { regions: ["pk-kpk"], itemSlug: "garlic", activityType: "PLANT", startMonth: 9, endMonth: 10, notes: "KPK plains (Swabi/Peshawar) clove planting: Sep 15 – Oct 25.", seasonName: "Rabi (national baseline)" },
  { regions: ["pk-balochistan"], itemSlug: "garlic", activityType: "PLANT", startMonth: 10, endMonth: 11, notes: "Balochistan uplands overwintering clove planting: Oct 15 – Nov 15.", seasonName: "Rabi overwintering" },
  // — 10. Potato (Aaloo) — tubers on ridges —
  { regions: ["pk-sindh"], itemSlug: "potato", activityType: "PLANT", startMonth: 10, endMonth: 11, notes: "Sindh autumn/winter tuber planting: Oct 15 – Nov 15.", seasonName: "Sindh winter" },
  { regions: ["pk-kpk"], itemSlug: "potato", activityType: "PLANT", startMonth: 9, endMonth: 10, notes: "KPK plains autumn tuber planting: Sep 25 – Oct 20.", seasonName: "KPK autumn" },
  { regions: ["pk-balochistan"], itemSlug: "potato", activityType: "PLANT", startMonth: 3, endMonth: 4, notes: "Balochistan/Swat summer tuber planting: Mar 15 – Apr 20.", seasonName: "Balochistan summer off-season" },
  // — 11. Chili (Mirch) —
  { regions: ["pk-sindh"], itemSlug: "chili", activityType: "SOW", startMonth: 12, endMonth: 1, notes: "Sindh (Kunri belt) nursery sowing: Dec 15 – Jan 31.", seasonName: "Kunri main season" },
  { regions: ["pk-sindh"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 2, endMonth: 3, notes: "Sindh transplanting: Feb 01 – Mar 15.", seasonName: "Kunri main season" },
  { regions: ["pk-kpk"], itemSlug: "chili", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "KPK plains nursery sowing: Feb 01 – Mar 10.", seasonName: "KPK summer" },
  { regions: ["pk-kpk"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "KPK plains transplanting: Mar 15 – Apr 20.", seasonName: "KPK summer" },
  { regions: ["pk-balochistan"], itemSlug: "chili", activityType: "SOW", startMonth: 3, endMonth: 3, notes: "Balochistan uplands nursery sowing: Mar 01 – Mar 31.", seasonName: "Upland summer" },
  { regions: ["pk-balochistan"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Balochistan uplands transplanting: Apr 20 – May 15.", seasonName: "Upland summer" },
  // — 12. Onion (Piyaz) —
  { regions: ["pk-sindh"], itemSlug: "onion", activityType: "SOW", startMonth: 5, endMonth: 6, notes: "Sindh early/Kharif nursery sowing: May – Jun.", seasonName: "Sindh early market" },
  { regions: ["pk-sindh"], itemSlug: "onion", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "Sindh main/late Rabi nursery sowing: Sep – Oct.", seasonName: "Sindh main Rabi" },
  { regions: ["pk-sindh"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "Sindh early transplanting: Jul – Aug.", seasonName: "Sindh early market" },
  { regions: ["pk-sindh"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 11, endMonth: 12, notes: "Sindh main transplanting: Nov – Dec.", seasonName: "Sindh main Rabi" },
  { regions: ["pk-balochistan"], itemSlug: "onion", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Balochistan highland summer nursery sowing: Jan – Feb.", seasonName: "Balochistan summer" },
  { regions: ["pk-balochistan"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Balochistan highland transplanting: Mar 15 – Apr 30.", seasonName: "Balochistan summer" },
  // — 13. Tomato —
  { regions: ["pk-sindh"], itemSlug: "tomato", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "Sindh autumn/winter (Badin/Thatta) nursery sowing: Jul – Aug.", seasonName: "Sindh winter picking" },
  { regions: ["pk-sindh"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 8, endMonth: 9, notes: "Sindh transplanting: Aug – Sep (peak winter picking).", seasonName: "Sindh winter picking" },
  { regions: ["pk-kpk"], itemSlug: "tomato", activityType: "SOW", startMonth: 12, endMonth: 1, notes: "KPK plains tunnel nursery sowing: Dec – Jan.", seasonName: "KPK tunnel" },
  { regions: ["pk-kpk"], itemSlug: "tomato", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "KPK plains summer nursery sowing: Jun – Jul.", seasonName: "KPK summer" },
  { regions: ["pk-kpk"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 2, endMonth: 3, notes: "KPK transplanting (tunnel): Feb – Mar.", seasonName: "KPK tunnel" },
  { regions: ["pk-kpk"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "KPK transplanting (summer): Jul – Aug.", seasonName: "KPK summer" },
  { regions: ["pk-balochistan"], itemSlug: "tomato", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Balochistan (Quetta/Barkhan) summer nursery sowing: Feb – Mar.", seasonName: "Counter-seasonal summer" },
  { regions: ["pk-balochistan"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Balochistan transplanting: Apr 01 – May 10.", seasonName: "Counter-seasonal summer" },
  // — 14. Chinese cabbage — transplant 20–25 days post-sowing —
  { regions: ["pk-sindh"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "Sindh sowing: Oct 01 – Nov 15.", seasonName: "Mild winter plains" },
  { regions: ["pk-sindh"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 10, endMonth: 11, notes: "Sindh transplanting (20–25 days post-sowing): Oct – Nov.", seasonName: "Mild winter plains" },
  { regions: ["pk-kpk"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "KPK plains sowing: Oct 01 – Nov 15.", seasonName: "Mild winter plains" },
  { regions: ["pk-kpk"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 10, endMonth: 11, notes: "KPK plains transplanting (20–25 days post-sowing): Oct – Nov.", seasonName: "Mild winter plains" },
  { regions: ["pk-balochistan"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "Swat/Balochistan sowing: Apr 01 – May 10.", seasonName: "Cool highland" },
  { regions: ["pk-balochistan"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Swat/Balochistan transplanting (20–25 days post-sowing): Apr – May.", seasonName: "Cool highland" },
];

function pakistanVegWindows(): PlantingWindow[] {
  const out: PlantingWindow[] = [];
  for (const spec of PAKISTAN_VEG_WINDOW_SPECS) {
    for (const regionId of spec.regions) {
      const region = getRegion(regionId)!;
      out.push({
        itemSlug: spec.itemSlug,
        regionId,
        startMonth: spec.startMonth,
        endMonth: spec.endMonth,
        harvestText: null,
        notes: spec.notes,
        activityType: spec.activityType,
        seasonName: spec.seasonName,
        source: pakistanVegSource(region),
        verificationStatus: "verified",
        lastReviewed: "2026-10-13",
      });
    }
  }
  return out;
}


// ── Spain vegetable planting windows (institutional, verified) ──
// Source: MAPA (Guía Práctica de la Fertilización Racional), IFAPA (Andalucía),
// IMIDA (Murcia), CITA Aragón, ITAP (Castilla-La Mancha).
// Three systems: Andalucía & Murcia (Costa Cálida — frost-free Mediterranean
// coast), Meseta Central (Castilla-La Mancha — continental, severe winter
// freezes), Valle del Ebro (Aragón — irrigated river basin). Supplied by Ahmed 2026-10-13.

const spainVegSource = (region: Region): SourceRef => ({
  organization: "MAPA; IFAPA (Andalucía); IMIDA (Murcia); CITA Aragón; ITAP (Castilla-La Mancha)",
  title: "Vegetable planting windows — Spain",
  country: region.countryName,
  region: region.name,
  lastReviewed: "2026-10-13",
});

const SPAIN_VEG_WINDOW_SPECS: ZonedVegWindowSpec[] = [
  // — 1. Okra (Ocra / Quimbombó) —
  { regions: ["es-andalucia", "es-murcia"], itemSlug: "okra", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Andalucía/Murcia direct sowing: Mar 15 – Apr 30.", seasonName: "Costa Mediterránea spring/summer" },
  { regions: ["es-andalucia", "es-murcia"], itemSlug: "okra", activityType: "TRANSPLANT", startMonth: 5, endMonth: 5, notes: "Transplanting: May 01 – May 20.", seasonName: "Costa Mediterránea spring/summer" },
  // — 2. Peas (Guisante Verde) — direct seeded —
  { regions: ["es-andalucia"], itemSlug: "peas", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "Andalucía/Murcia early sowing: Oct 15 – Nov 30.", seasonName: "Otoño/invierno costa" },
  { regions: ["es-aragon", "es-castilla"], itemSlug: "peas", activityType: "SOW", startMonth: 1, endMonth: 3, notes: "Aragón/Castilla (Valle del Ebro) sowing: Jan 15 – Mar 10.", seasonName: "Primavera interior" },
  // — 3. Spinach (Espinaca) — direct seeded in flat beds —
  { regions: ["es-murcia"], itemSlug: "spinach", activityType: "SOW", startMonth: 9, endMonth: 10, notes: "Murcia/Valencia autumn/winter sowing: Sep 01 – Oct 31.", seasonName: "Campaña de invierno" },
  { regions: ["es-aragon"], itemSlug: "spinach", activityType: "SOW", startMonth: 1, endMonth: 3, notes: "Navarra/Aragón spring sowing: Jan 15 – Mar 01.", seasonName: "Campaña de primavera" },
  // — 4. Cauliflower (Coliflor) —
  { regions: ["es-murcia"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Murcia/Valle del Guadalentín nursery sowing: Jun 15 – Jul 30.", seasonName: "Campaña de otoño/invierno (export)" },
  { regions: ["es-murcia"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 8, endMonth: 9, notes: "Murcia transplanting: Aug 01 – Sep 15.", seasonName: "Campaña de otoño/invierno (export)" },
  { regions: ["es-aragon"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 5, endMonth: 6, notes: "Navarra/La Rioja nursery sowing: May 15 – Jun 25.", seasonName: "Norte" },
  { regions: ["es-aragon"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "Navarra/La Rioja transplanting: Jul 01 – Aug 10.", seasonName: "Norte" },
  // — 5. Cabbage (Repollo / Col) —
  { regions: ["es-andalucia"], itemSlug: "cabbage", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "Andalucía/Murcia nursery sowing: Jul 01 – Aug 15.", seasonName: "Invierno Mediterráneo" },
  { regions: ["es-andalucia"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 8, endMonth: 9, notes: "Andalucía/Murcia transplanting: Aug 15 – Sep 30.", seasonName: "Invierno Mediterráneo" },
  { regions: ["es-castilla"], itemSlug: "cabbage", activityType: "SOW", startMonth: 3, endMonth: 5, notes: "Norte/Galicia nursery sowing: Mar 15 – May 01.", seasonName: "Verano Cantábrico" },
  { regions: ["es-castilla"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 5, endMonth: 6, notes: "Norte transplanting: May 01 – Jun 15.", seasonName: "Verano Cantábrico" },
  // — 6. Radish (Rábano / Rabanito) — direct seeded, multi-cut —
  { regions: ["es-murcia", "es-andalucia"], itemSlug: "radish", activityType: "SOW", startMonth: 9, endMonth: 11, notes: "Year-round crop, peak sowing: Sep – Nov.", seasonName: "Campaña continua" },
  { regions: ["es-murcia", "es-andalucia"], itemSlug: "radish", activityType: "SOW", startMonth: 2, endMonth: 4, notes: "Year-round crop, spring peak sowing: Feb – Apr.", seasonName: "Campaña continua" },
  // — 7. Carrot (Zanahoria) — direct seeded on ridges/beds —
  { regions: ["es-andalucia"], itemSlug: "carrot", activityType: "SOW", startMonth: 9, endMonth: 11, notes: "Andalucía (Cádiz/Sanlúcar) sowing: Sep 01 – Nov 15.", seasonName: "Invierno litoral" },
  { regions: ["es-castilla"], itemSlug: "carrot", activityType: "SOW", startMonth: 3, endMonth: 5, notes: "Castilla y León (Segovia/Valladolid) sowing: Mar 15 – May 15.", seasonName: "Primavera/verano interior" },
  // — 8. Brinjal (Berenjena) —
  { regions: ["es-andalucia"], itemSlug: "brinjal", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Almería/Murcia open-field nursery sowing: Jan 15 – Feb 28.", seasonName: "Aire libre Mediterráneo" },
  { regions: ["es-andalucia"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Almería/Murcia transplanting: Mar 15 – Apr 15.", seasonName: "Aire libre Mediterráneo" },
  { regions: ["es-aragon"], itemSlug: "brinjal", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Aragón/Valencia nursery sowing: Feb 15 – Mar 31.", seasonName: "Interior" },
  { regions: ["es-aragon"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Aragón/Valencia transplanting: Apr 20 – May 20.", seasonName: "Interior" },
  // — 9. Garlic (Ajo Blanco y Morado) — direct clove dibbling —
  { regions: ["es-castilla"], itemSlug: "garlic", activityType: "PLANT", startMonth: 11, endMonth: 12, notes: "Castilla-La Mancha (Las Pedroñeras) clove planting: Nov 15 – Dec 31.", seasonName: "Campaña nacional principal" },
  { regions: ["es-andalucia"], itemSlug: "garlic", activityType: "PLANT", startMonth: 10, endMonth: 11, notes: "Andalucía (Montalbán/Córdoba) clove planting: Oct 15 – Nov 30.", seasonName: "Campaña nacional principal" },
  // — 10. Potato (Patata) — tubers in ridges —
  { regions: ["es-andalucia"], itemSlug: "potato", activityType: "PLANT", startMonth: 12, endMonth: 1, notes: "Temprana (Andalucía/Cartagena) tuber planting: Dec 15 – Jan 31.", seasonName: "Patata temprana" },
  { regions: ["es-castilla"], itemSlug: "potato", activityType: "PLANT", startMonth: 3, endMonth: 4, notes: "Media estación/tardía (Castilla y León/Galicia) tuber planting: Mar 15 – Apr 30.", seasonName: "Patata de conservación" },
  // — 11. Peppers (Pimiento) → chili —
  { regions: ["es-andalucia"], itemSlug: "chili", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Andalucía/Murcia open-field nursery sowing: Jan 15 – Feb 28.", seasonName: "Aire libre primavera/verano" },
  { regions: ["es-andalucia"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Andalucía/Murcia transplanting: Mar 20 – Apr 25.", seasonName: "Aire libre primavera/verano" },
  { regions: ["es-aragon"], itemSlug: "chili", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Navarra/Ebro (piquillo) nursery sowing: Feb 15 – Mar 20.", seasonName: "Ebro" },
  { regions: ["es-aragon"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Navarra/Ebro transplanting: Apr 25 – May 20.", seasonName: "Ebro" },
  // — 12. Onion (Cebolla) —
  { regions: ["es-andalucia"], itemSlug: "onion", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Grano temprana (Valencia/Andalucía) nursery sowing: Aug 15 – Sep 30.", seasonName: "Cebolla temprana" },
  { regions: ["es-andalucia"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 11, endMonth: 12, notes: "Temprana transplanting: Nov 01 – Dec 15.", seasonName: "Cebolla temprana" },
  { regions: ["es-castilla"], itemSlug: "onion", activityType: "SOW", startMonth: 12, endMonth: 2, notes: "Medio grano/tardía (Castilla-La Mancha/Aragón) nursery sowing: Dec 15 – Feb 15.", seasonName: "Cebolla de guardar" },
  { regions: ["es-castilla"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Tardía transplanting: Mar 15 – Apr 30.", seasonName: "Cebolla de guardar" },
  // — 13. Tomato (Tomate) —
  { regions: ["es-aragon"], itemSlug: "tomato", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Extremadura/Ebro (tomate de industria) nursery sowing: Feb 01 – Mar 10.", seasonName: "Tomate de industria" },
  { regions: ["es-aragon"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Industria transplanting: Apr 05 – May 10.", seasonName: "Tomate de industria" },
  { regions: ["es-andalucia"], itemSlug: "tomato", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Andalucía/Valencia (fresco aire libre) nursery sowing: Jan 15 – Feb 25.", seasonName: "Fresco aire libre" },
  { regions: ["es-andalucia"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Fresco transplanting: Mar 15 – Apr 15.", seasonName: "Fresco aire libre" },
  // — 14. Chinese cabbage (Col China / Pak Choi) —
  { regions: ["es-murcia"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Murcia/Almería sowing: Aug 15 – Sep 30.", seasonName: "Cultivo de otoño/invierno para exportación" },
  { regions: ["es-murcia"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 9, endMonth: 10, notes: "Transplanting: Sep 15 – Oct 31.", seasonName: "Cultivo de otoño/invierno para exportación" },
];

function spainVegWindows(): PlantingWindow[] {
  const out: PlantingWindow[] = [];
  for (const spec of SPAIN_VEG_WINDOW_SPECS) {
    for (const regionId of spec.regions) {
      const region = getRegion(regionId)!;
      out.push({
        itemSlug: spec.itemSlug,
        regionId,
        startMonth: spec.startMonth,
        endMonth: spec.endMonth,
        harvestText: null,
        notes: spec.notes,
        activityType: spec.activityType,
        seasonName: spec.seasonName,
        source: spainVegSource(region),
        verificationStatus: "verified",
        lastReviewed: "2026-10-13",
      });
    }
  }
  return out;
}

// ── China vegetable planting windows (institutional, verified) ──
// Source: MARA (Ministry of Agriculture and Rural Affairs — 农业农村部),
// CAAS Institute of Vegetables and Flowers (IVF-CAAS),
// Shandong Academy of Agricultural Sciences (SAAS),
// Hubei Academy of Agricultural Sciences (HBAAS).
// Three macro-regions: Northeast (东北一季作区), North China Plain / Huang-Huai-Hai
// (黄淮海及华北平原区), Yangtze River Basin (长江中下游及西南流域).
// Supplied by Ahmed 2026-10-13 as verified institutional guidance.

const chinaVegSource = (region: Region): SourceRef => ({
  organization: "MARA; CAAS (IVF); SAAS; HBAAS",
  title: "Vegetable planting windows — China",
  country: region.countryName,
  region: region.name,
  lastReviewed: "2026-10-13",
});

const CHINA_VEG_WINDOW_SPECS: ZonedVegWindowSpec[] = [
  // — 1. Okra (秋葵 / 黄秋葵) — direct seeded, spring-sown summer harvest —
  { regions: ["cn-yangtze"], itemSlug: "okra", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Yangtze Basin direct sowing: Mar 20 – Apr 15.", seasonName: "露地春播夏季采收" },
  { regions: ["cn-ncp"], itemSlug: "okra", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "North China Plain direct sowing: Apr 10 – May 5.", seasonName: "露地春播夏季采收" },
  { regions: ["cn-northeast"], itemSlug: "okra", activityType: "SOW", startMonth: 5, endMonth: 5, notes: "Northeast direct sowing (short frost-free season): May 5 – May 25.", seasonName: "露地春播夏季采收" },
  // — 2. Peas (豌豆 / 荷兰豆) — direct drill/dibble —
  { regions: ["cn-yangtze"], itemSlug: "peas", activityType: "SOW", startMonth: 10, endMonth: 11, notes: "Yangtze Basin overwintering direct sowing: Oct 20 – Nov 15.", seasonName: "长江流域越冬栽培" },
  { regions: ["cn-ncp"], itemSlug: "peas", activityType: "SOW", startMonth: 3, endMonth: 3, notes: "North China Plain spring direct sowing: Mar 1 – Mar 25.", seasonName: "北方春季露地" },
  { regions: ["cn-northeast"], itemSlug: "peas", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "Northeast spring direct sowing: Apr 15 – May 5.", seasonName: "北方春季露地" },
  // — 3. Spinach (菠菜) — direct broadcast/drill, multi-crop —
  { regions: ["cn-yangtze"], itemSlug: "spinach", activityType: "SOW", startMonth: 9, endMonth: 11, notes: "Yangtze Basin autumn direct sowing: Sep 15 – Nov 10.", seasonName: "秋茬" },
  { regions: ["cn-yangtze"], itemSlug: "spinach", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Yangtze Basin spring direct sowing: Feb – Mar.", seasonName: "春菠菜" },
  { regions: ["cn-ncp"], itemSlug: "spinach", activityType: "SOW", startMonth: 8, endMonth: 10, notes: "North China Plain autumn/winter direct sowing: Aug 25 – Oct 10.", seasonName: "秋茬/越冬茬" },
  { regions: ["cn-northeast"], itemSlug: "spinach", activityType: "SOW", startMonth: 4, endMonth: 5, notes: "Northeast spring direct sowing: Apr 15 – May 10.", seasonName: "春菠菜" },
  { regions: ["cn-northeast"], itemSlug: "spinach", activityType: "SOW", startMonth: 8, endMonth: 8, notes: "Northeast autumn direct sowing: Aug 1 – Aug 20.", seasonName: "秋茬" },
  // — 4. Cauliflower (花椰菜 / 花菜) — nursery + transplant, autumn main —
  { regions: ["cn-yangtze"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 7, endMonth: 7, notes: "Yangtze Basin autumn/winter nursery sowing: Jul 5 – Jul 30.", seasonName: "秋花菜主产区" },
  { regions: ["cn-ncp"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "North China Plain autumn nursery sowing: Jun 20 – Jul 15.", seasonName: "秋花菜主产区" },
  { regions: ["cn-northeast"], itemSlug: "cauliflower", activityType: "SOW", startMonth: 5, endMonth: 5, notes: "Northeast summer/autumn nursery sowing: May 1 – May 25.", seasonName: "秋花菜主产区" },
  { regions: ["cn-yangtze"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 8, endMonth: 8, notes: "Yangtze Basin transplanting: Aug 10 – Aug 30.", seasonName: "秋花菜主产区" },
  { regions: ["cn-ncp"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "North China Plain transplanting: Jul 25 – Aug 15.", seasonName: "秋花菜主产区" },
  { regions: ["cn-northeast"], itemSlug: "cauliflower", activityType: "TRANSPLANT", startMonth: 6, endMonth: 6, notes: "Northeast transplanting: Jun 5 – Jun 25.", seasonName: "秋花菜主产区" },
  // — 5. Cabbage (甘蓝 / 包菜) — spring + autumn + highland —
  { regions: ["cn-ncp"], itemSlug: "cabbage", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "North China Plain spring nursery sowing (hotbed): Jan 10 – Feb 5.", seasonName: "春甘蓝" },
  { regions: ["cn-ncp"], itemSlug: "cabbage", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "North China Plain autumn nursery sowing: Jun 20 – Jul 15.", seasonName: "秋冬甘蓝" },
  { regions: ["cn-northeast"], itemSlug: "cabbage", activityType: "SOW", startMonth: 4, endMonth: 4, notes: "Northeast summer/autumn nursery sowing: Apr 5 – Apr 30.", seasonName: "夏秋甘蓝" },
  { regions: ["cn-yangtze"], itemSlug: "cabbage", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "Yangtze Basin autumn/winter nursery sowing: Jul 15 – Aug 10.", seasonName: "秋冬甘蓝" },
  { regions: ["cn-ncp"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "North China Plain spring transplanting: Mar 25 – Apr 15.", seasonName: "春甘蓝" },
  { regions: ["cn-ncp"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 7, endMonth: 8, notes: "North China Plain autumn transplanting: Jul 25 – Aug 10.", seasonName: "秋冬甘蓝" },
  { regions: ["cn-northeast"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 5, endMonth: 6, notes: "Northeast transplanting: May 20 – Jun 10.", seasonName: "夏秋甘蓝" },
  { regions: ["cn-yangtze"], itemSlug: "cabbage", activityType: "TRANSPLANT", startMonth: 8, endMonth: 9, notes: "Yangtze Basin transplanting: Aug 20 – Sep 10.", seasonName: "秋冬甘蓝" },
  // — 6. Radish (萝卜 / 大白萝卜) — direct seeded on high ridges, autumn main —
  { regions: ["cn-ncp"], itemSlug: "radish", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "North China Plain autumn main direct sowing (起垄点播): Jul 25 – Aug 15.", seasonName: "秋萝卜大宗生产" },
  { regions: ["cn-yangtze"], itemSlug: "radish", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Yangtze Basin autumn/winter direct sowing: Aug 20 – Sep 20.", seasonName: "秋萝卜大宗生产" },
  { regions: ["cn-northeast"], itemSlug: "radish", activityType: "SOW", startMonth: 6, endMonth: 7, notes: "Northeast summer direct sowing: Jun 15 – Jul 10.", seasonName: "秋萝卜大宗生产" },
  // — 7. Carrot (胡萝卜) — direct seeded, summer sown autumn harvest —
  { regions: ["cn-ncp"], itemSlug: "carrot", activityType: "SOW", startMonth: 7, endMonth: 8, notes: "North China Plain autumn main direct sowing: Jul 15 – Aug 5.", seasonName: "夏播秋收主力茬口" },
  { regions: ["cn-yangtze"], itemSlug: "carrot", activityType: "SOW", startMonth: 8, endMonth: 8, notes: "Yangtze Basin autumn direct sowing: Aug 5 – Aug 30.", seasonName: "夏播秋收主力茬口" },
  { regions: ["cn-northeast"], itemSlug: "carrot", activityType: "SOW", startMonth: 6, endMonth: 6, notes: "Northeast summer direct sowing: Jun 1 – Jun 25.", seasonName: "夏播秋收主力茬口" },
  // — 8. Brinjal (茄子) — nursery + transplant, post-frost —
  { regions: ["cn-yangtze"], itemSlug: "brinjal", activityType: "SOW", startMonth: 12, endMonth: 1, notes: "Yangtze Basin nursery sowing (protected): Dec 15 – Jan 20.", seasonName: "露地春茄子" },
  { regions: ["cn-ncp"], itemSlug: "brinjal", activityType: "SOW", startMonth: 2, endMonth: 2, notes: "North China Plain nursery sowing (hotbed/plug): Feb 1 – Feb 25.", seasonName: "露地春茄子" },
  { regions: ["cn-northeast"], itemSlug: "brinjal", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Northeast nursery sowing (greenhouse): Mar 10 – Apr 5.", seasonName: "露地春茄子" },
  { regions: ["cn-yangtze"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Yangtze Basin transplanting: Mar 25 – Apr 15.", seasonName: "露地春茄子" },
  { regions: ["cn-ncp"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "North China Plain transplanting: Apr 20 – May 10.", seasonName: "露地春茄子" },
  { regions: ["cn-northeast"], itemSlug: "brinjal", activityType: "TRANSPLANT", startMonth: 5, endMonth: 6, notes: "Northeast transplanting: May 20 – Jun 5.", seasonName: "露地春茄子" },
  // — 9. Garlic (大蒜) — direct clove dibbling —
  { regions: ["cn-ncp"], itemSlug: "garlic", activityType: "PLANT", startMonth: 9, endMonth: 10, notes: "North China Plain clove dibbling under mulch (瓣植覆膜): Sep 25 – Oct 15.", seasonName: "秋播地膜覆盖大蒜" },
  { regions: ["cn-yangtze"], itemSlug: "garlic", activityType: "PLANT", startMonth: 10, endMonth: 10, notes: "Yangtze Basin clove dibbling: Oct 5 – Oct 25.", seasonName: "秋播地膜覆盖大蒜" },
  { regions: ["cn-northeast"], itemSlug: "garlic", activityType: "PLANT", startMonth: 4, endMonth: 4, notes: "Northeast spring clove planting: Apr 5 – Apr 25.", seasonName: "春蒜" },
  // — 10. Potato (马铃薯 / 土豆) — tubers in furrows —
  { regions: ["cn-ncp"], itemSlug: "potato", activityType: "PLANT", startMonth: 2, endMonth: 3, notes: "North China Plain spring double-crop: Feb 15 – Mar 10.", seasonName: "中原二季作区 (Spring)" },
  { regions: ["cn-ncp"], itemSlug: "potato", activityType: "PLANT", startMonth: 8, endMonth: 8, notes: "North China Plain autumn double-crop: Aug 5 – Aug 20.", seasonName: "中原二季作区 (Autumn)" },
  { regions: ["cn-yangtze"], itemSlug: "potato", activityType: "PLANT", startMonth: 12, endMonth: 1, notes: "Yangtze Basin winter/spring planting: Dec 15 – Jan 20.", seasonName: "长江流域冬作" },
  { regions: ["cn-northeast"], itemSlug: "potato", activityType: "PLANT", startMonth: 4, endMonth: 5, notes: "Northeast single-crop planting: Apr 20 – May 15.", seasonName: "北方一季作区" },
  // — 11. Peppers (辣椒 / 甜椒 → chili) — nursery + transplant —
  { regions: ["cn-yangtze"], itemSlug: "chili", activityType: "SOW", startMonth: 12, endMonth: 1, notes: "Yangtze Basin nursery sowing (heated): Dec 20 – Jan 25.", seasonName: "露地春椒" },
  { regions: ["cn-ncp"], itemSlug: "chili", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "North China Plain nursery sowing (plug tray): Feb 5 – Mar 1.", seasonName: "露地春椒" },
  { regions: ["cn-northeast"], itemSlug: "chili", activityType: "SOW", startMonth: 3, endMonth: 3, notes: "Northeast nursery sowing (greenhouse): Mar 5 – Mar 30.", seasonName: "露地春椒" },
  { regions: ["cn-yangtze"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 4, endMonth: 4, notes: "Yangtze Basin transplanting: Apr 5 – Apr 25.", seasonName: "露地春椒" },
  { regions: ["cn-ncp"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "North China Plain transplanting: Apr 25 – May 15.", seasonName: "露地春椒" },
  { regions: ["cn-northeast"], itemSlug: "chili", activityType: "TRANSPLANT", startMonth: 5, endMonth: 6, notes: "Northeast transplanting: May 20 – Jun 5.", seasonName: "露地春椒" },
  // — 12. Onion (洋葱) — nursery + transplant —
  { regions: ["cn-ncp"], itemSlug: "onion", activityType: "SOW", startMonth: 9, endMonth: 9, notes: "North China Plain overwintering nursery sowing: Sep 1 – Sep 15.", seasonName: "黄淮海秋播越冬洋葱" },
  { regions: ["cn-yangtze"], itemSlug: "onion", activityType: "SOW", startMonth: 9, endMonth: 9, notes: "Yangtze Basin nursery sowing: Sep 10 – Sep 25.", seasonName: "长江流域" },
  { regions: ["cn-northeast"], itemSlug: "onion", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "Northeast/Gansu spring nursery sowing: Feb 15 – Mar 5.", seasonName: "北方春定植洋葱" },
  { regions: ["cn-ncp"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 10, endMonth: 11, notes: "North China Plain transplanting: Oct 25 – Nov 10.", seasonName: "黄淮海秋播越冬洋葱" },
  { regions: ["cn-yangtze"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 11, endMonth: 11, notes: "Yangtze Basin transplanting: Nov 5 – Nov 25.", seasonName: "长江流域" },
  { regions: ["cn-northeast"], itemSlug: "onion", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "Northeast transplanting: Apr 20 – May 10.", seasonName: "北方春定植洋葱" },
  // — 13. Tomato (番茄) — open-field spring tomato —
  { regions: ["cn-yangtze"], itemSlug: "tomato", activityType: "SOW", startMonth: 1, endMonth: 2, notes: "Yangtze Basin nursery sowing: Jan 5 – Feb 5.", seasonName: "露地春番茄" },
  { regions: ["cn-ncp"], itemSlug: "tomato", activityType: "SOW", startMonth: 2, endMonth: 3, notes: "North China Plain nursery sowing (plug): Feb 15 – Mar 10.", seasonName: "露地春番茄" },
  { regions: ["cn-northeast"], itemSlug: "tomato", activityType: "SOW", startMonth: 3, endMonth: 4, notes: "Northeast/Xinjiang nursery sowing (field processing): Mar 25 – Apr 20.", seasonName: "新疆/东北大田加工番茄" },
  { regions: ["cn-yangtze"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 3, endMonth: 4, notes: "Yangtze Basin transplanting: Mar 25 – Apr 20.", seasonName: "露地春番茄" },
  { regions: ["cn-ncp"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 4, endMonth: 5, notes: "North China Plain transplanting: Apr 20 – May 10.", seasonName: "露地春番茄" },
  { regions: ["cn-northeast"], itemSlug: "tomato", activityType: "TRANSPLANT", startMonth: 5, endMonth: 6, notes: "Northeast transplanting: May 15 – Jun 5.", seasonName: "新疆/东北大田加工番茄" },
  // — 14. Chinese Cabbage (大白菜) — autumn storage national baseline —
  { regions: ["cn-ncp"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 8, endMonth: 8, notes: "North China Plain autumn main direct sowing (立秋前后): Aug 1 – Aug 15.", seasonName: "秋大白菜全国大宗生产" },
  { regions: ["cn-yangtze"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 8, endMonth: 9, notes: "Yangtze Basin autumn/winter direct sowing: Aug 20 – Sep 10.", seasonName: "秋大白菜全国大宗生产" },
  { regions: ["cn-northeast"], itemSlug: "cabbage-chinese", activityType: "SOW", startMonth: 7, endMonth: 7, notes: "Northeast autumn storage direct sowing: Jul 15 – Jul 30.", seasonName: "秋大白菜全国大宗生产" },
  { regions: ["cn-ncp"], itemSlug: "cabbage-chinese", activityType: "TRANSPLANT", startMonth: 8, endMonth: 8, notes: "North China Plain transplanting (if plug): Aug 15 – Aug 25.", seasonName: "秋大白菜全国大宗生产" },
];

function chinaVegWindows(): PlantingWindow[] {
  const out: PlantingWindow[] = [];
  for (const spec of CHINA_VEG_WINDOW_SPECS) {
    for (const regionId of spec.regions) {
      const region = getRegion(regionId)!;
      out.push({
        itemSlug: spec.itemSlug,
        regionId,
        startMonth: spec.startMonth,
        endMonth: spec.endMonth,
        harvestText: null,
        notes: spec.notes,
        activityType: spec.activityType,
        seasonName: spec.seasonName,
        source: chinaVegSource(region),
        verificationStatus: "verified",
        lastReviewed: "2026-10-13",
      });
    }
  }
  return out;
}

/**

 * Seeds derived strictly from the crop library's published seasonDetail lines:
 * wheat "Sow late October – November; harvest March – April" · rice "Transplant
 * June – July; harvest October – November" · maize "Sow June – July (kharif) or
 * February (spring)" · cotton "Sow April – May; picking October – December" ·
 * sugarcane "Plant February – March (spring) or September (autumn)" ·
 * potato "Plant October; harvest January – February".
 */
export const PLANTING_WINDOWS: PlantingWindow[] = [
  // — Punjab, Pakistan —
  window("pk-punjab", "wheat", 10, 11, "March – April", "Late October to November sowing for irrigated wheat."),
  window("pk-punjab", "rice", 6, 7, "October – November", "Transplant June – July."),
  window("pk-punjab", "maize", 6, 7, null, "Kharif sowing."),
  window("pk-punjab", "maize", 2, 2, null, "Spring sowing in irrigated areas."),
  window("pk-punjab", "cotton", 4, 5, "October – December (picking)", "Sow April – May."),
  window("pk-punjab", "sugarcane", 2, 3, null, "Spring planting."),
  window("pk-punjab", "sugarcane", 9, 9, null, "Autumn planting."),
  window("pk-punjab", "potato", 10, 10, "January – February", "Plant October."),
  // — Sindh, Pakistan —
  window("pk-sindh", "cotton", 4, 5, "October – December (picking)", "Sow April – May."),
  window("pk-sindh", "rice", 6, 7, "October – November", "Transplant June – July."),
  window("pk-sindh", "sugarcane", 2, 3, null, "Spring planting."),
  // — Punjab, India —
  window("in-punjab", "wheat", 10, 11, "March – April", "Late October to November sowing for irrigated wheat."),
  window("in-punjab", "rice", 6, 7, "October – November", "Transplant June – July."),
  window("in-punjab", "maize", 6, 7, null, "Kharif sowing."),
  window("in-punjab", "potato", 10, 10, "January – February", "Plant October."),
  window("in-punjab", "sugarcane", 2, 3, null, "Spring planting."),
  // — India vegetable windows (ICAR-IIVR / PAU / HAU / TNAU, verified) —
  ...indiaVegWindows(),
  // — Malaysia vegetable windows (MARDI / DOA / Sabah, verified) —
  ...malaysiaVegWindows(),
  // — South Korea vegetable windows (RDA / NIHHS / Gangwon, verified) —
  ...koreaVegWindows(),
  // — Türkiye vegetable windows (Tarım Bakanlığı / BATEM / Yalova, verified) —
  ...turkiyeVegWindows(),
  // — Japan vegetable windows (MAFF / NARO / HRO, verified) —
  ...japanVegWindows(),
  ...pakistanVegWindows(),
  ...spainVegWindows(),
  // — China vegetable windows (MARA / CAAS / SAAS / HBAAS, verified) —
  ...chinaVegWindows(),
];

/** True if `month` (1–12) falls inside a possibly year-crossing window. */
export function monthInWindow(month: number, w: PlantingWindow): boolean {
  if (w.startMonth <= w.endMonth) return month >= w.startMonth && month <= w.endMonth;
  return month >= w.startMonth || month <= w.endMonth;
}

export interface PlantingResult {
  window: PlantingWindow;
  region: Region;
}

export function windowsForMonth(
  month: number,
  regionId: string,
  category: GrowingCategory | "all" = "all"
): PlantingResult[] {
  // Category filtering needs the item's category — resolved by callers via getItem.
  // This layer filters by month + region only.
  return PLANTING_WINDOWS.filter(
    (w) => w.regionId === regionId && monthInWindow(month, w)
  ).map((w) => ({ window: w, region: getRegion(regionId)! }));
}

export function regionHasData(regionId: string): boolean {
  return PLANTING_WINDOWS.some((w) => w.regionId === regionId);
}

/** Localized month name via the browser/Node Intl API — no dictionary needed. */
export function monthName(month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(2026, month - 1, 1)
  );
}

export function windowLabel(w: PlantingWindow, locale: string): string {
  const s = monthName(w.startMonth, locale);
  const e = monthName(w.endMonth, locale);
  return w.startMonth === w.endMonth ? s : `${s} – ${e}`;
}
