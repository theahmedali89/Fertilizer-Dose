/**
 * Kitchen Garden Planner — suggestion data layer.
 *
 * DATA-INTEGRITY POLICY (binding):
 * - Suggestions come ONLY from PlantingWindow rows in the database, joined to
 *   their GrowingItem (category restricted to vegetable | herb).
 * - Windows with verificationStatus "verified" or "published" are suggested
 *   as-is. Per Ahmed's 2026-10-08 directive, "under_review" windows are ALSO
 *   shown — but NEVER presented as verified: the UI must render a visible
 *   "Under Review" badge on them (see KitchenGardenPlanner).
 * - Activity is restricted to SOW | TRANSPLANT | PLANT — harvest/land-prep
 *   windows are not planting suggestions.
 * - When the DB isn't configured (static build), there are no verified
 *   vegetable/herb windows to suggest, so the result is an honest empty set —
 *   never a guessed calendar.
 * - Sunlight is a GrowingItem field. When it is missing, a crop is never
 *   hidden by the sunlight filter; the UI discloses that the preference
 *   could not be applied.
 */
import { db, isDbConfigured } from "@/lib/db";
import { monthInWindow } from "./country";

export interface KitchenGardenSuggestion {
  windowId: string;
  itemSlug: string;
  itemName: string;
  /** Translated name for the active non-English locale (null → English). */
  localName: string | null;
  itemUrdu: string | null;
  scientificName: string | null;
  category: "vegetable" | "herb";
  regionSlug: string;
  regionName: string;
  activityType: string;
  startMonth: number;
  endMonth: number;
  harvestText: string | null;
  notes: string | null;
  sunlight: string | null;
  verificationStatus: string;
  lastReviewed: string | null;
  sourceOrg: string;
  sourceTitle: string;
}

export type SunlightPref = "any" | "full" | "partial" | "shade";

export const VALID_SUNLIGHT: SunlightPref[] = ["any", "full", "partial", "shade"];

/**
 * Tolerant match of a GrowingItem.sunlight string against the user's
 * preference. Missing sunlight data never hides a month-appropriate crop —
 * the UI shows an honest note that the preference couldn't be applied.
 */
export function sunlightMatches(sunlight: string | null, pref: SunlightPref): boolean {
  if (pref === "any") return true;
  if (!sunlight) return true;
  const s = sunlight.toLowerCase();
  if (pref === "full") return s.includes("full");
  if (pref === "partial") return s.includes("partial");
  // shade: "shade" or "semi-shade" — but a "full sun to partial shade" entry
  // must not match a shade preference.
  return s.includes("semi") || (s.includes("shade") && !s.includes("partial"));
}

export async function getKitchenGardenSuggestions(opts: {
  regionSlug: string;
  month: number;
  sunlight?: SunlightPref;
  limit?: number;
  locale?: string;
}): Promise<KitchenGardenSuggestion[]> {
  const { regionSlug, month, sunlight = "any", limit, locale } = opts;
  // Static fallback: the static seed set has no verified vegetable/herb
  // windows, so the honest answer is "no verified data yet".
  if (!isDbConfigured()) return [];
  let rows: Array<{
    id: string;
    startMonth: number;
    endMonth: number;
    activityType: string;
    harvestText: string | null;
    notes: string | null;
    verificationStatus: string;
    lastReviewed: Date | null;
    item: {
      slug: string;
      name: string;
      urdu: string | null;
      scientificName: string | null;
      category: string;
      sunlight: string | null;
    };
    region: { slug: string; name: string };
    sources: Array<{ source: { organization: string; title: string } }>;
  }>;
  try {
    rows = await db.plantingWindow.findMany({
      where: {
        region: { slug: regionSlug },
        item: { category: { in: ["vegetable", "herb"] } },
        verificationStatus: { in: ["verified", "published", "under_review"] },
        activityType: { in: ["SOW", "TRANSPLANT", "PLANT"] },
      },
      include: {
        item: {
          select: {
            slug: true,
            name: true,
            urdu: true,
            scientificName: true,
            category: true,
            sunlight: true,
          },
        },
        region: { select: { slug: true, name: true } },
        sources: { include: { source: true }, take: 1 },
      },
      orderBy: [{ startMonth: "asc" }, { item: { name: "asc" } }],
    });
  } catch (e) {
    console.error(
      "[kitchenGarden] database read failed, returning no suggestions:",
      (e as Error).message
    );
    return [];
  }

  const out: KitchenGardenSuggestion[] = [];
  const nameMap =
    locale && locale !== "en"
      ? await import("@/server/i18n-names").then((m) =>
          m.getTranslatedItemNames(
            [...new Set(rows.map((w) => w.item.slug))],
            locale
          )
        )
      : new Map<string, string>();
  for (const w of rows) {
    if (!monthInWindow(month, w.startMonth, w.endMonth)) continue;
    if (!sunlightMatches(w.item.sunlight, sunlight)) continue;
    const src = w.sources[0]?.source;
    out.push({
      windowId: w.id,
      itemSlug: w.item.slug,
      itemName: w.item.name,
      localName: nameMap.get(w.item.slug) ?? null,
      itemUrdu: w.item.urdu,
      scientificName: w.item.scientificName,
      category: w.item.category as "vegetable" | "herb",
      regionSlug: w.region.slug,
      regionName: w.region.name,
      activityType: w.activityType,
      startMonth: w.startMonth,
      endMonth: w.endMonth,
      harvestText: w.harvestText,
      notes: w.notes,
      sunlight: w.item.sunlight,
      verificationStatus: w.verificationStatus,
      lastReviewed: w.lastReviewed ? w.lastReviewed.toISOString().slice(0, 10) : null,
      sourceOrg: src?.organization ?? "Fertilizer Dose editorial",
      sourceTitle: src?.title ?? "Regional crop calendar summary",
    });
    if (limit && out.length >= limit) break;
  }
  return out;
}
