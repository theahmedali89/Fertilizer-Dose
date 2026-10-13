/**
 * Planting calendar data layer.
 *
 * DATA-INTEGRITY POLICY (binding):
 * - Planting windows are seeded ONLY from the app's existing published crop
 *   guidance (seasonDetail strings) or from institutional guidance supplied by
 *   Ahmed (ICAR-IIVR / PAU / HAU / TNAU vegetable windows; MARDI Malaysia;
 *   RDA South Korea; Tarım Bakanlığı/BATEM Türkiye; MAFF/NARO Japan).
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
  country: "pakistan" | "india" | "malaysia" | "south_korea" | "turkiye" | "japan";
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
];

export function getRegion(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function regionsByCountry(country: "pakistan" | "india" | "malaysia" | "south_korea" | "turkiye" | "japan"): Region[] {
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
