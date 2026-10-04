/**
 * Planting calendar data layer.
 *
 * DATA-INTEGRITY POLICY (binding):
 * - Planting windows are seeded ONLY from the app's existing published crop
 *   guidance (seasonDetail strings). Nothing is invented.
 * - Every window carries a SourceRef + verificationStatus. Seeds derived from
 *   editorial summaries are marked "in_review" until checked against a named
 *   provincial publication.
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
  source: SourceRef;
  verificationStatus: "verified" | "in_review";
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
    verificationStatus: "in_review",
    lastReviewed: "2026-10-04",
  };
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
