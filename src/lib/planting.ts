/**
 * Planting calendar data layer.
 *
 * DATA-INTEGRITY POLICY (binding):
 * - Planting windows are seeded ONLY from the app's existing published crop
 *   guidance (seasonDetail strings) or from institutional guidance supplied by
 *   Ahmed (ICAR-IIVR / PAU / HAU / TNAU vegetable windows). Nothing is invented.
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
  country: "pakistan" | "india";
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
];

export function getRegion(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function regionsByCountry(country: "pakistan" | "india"): Region[] {
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
