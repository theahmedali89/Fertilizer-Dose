/**
 * My Garden data layer (frontend phase).
 *
 * PERSISTENCE: browser localStorage for now, honestly labeled in the UI.
 * The types below are shaped to map 1:1 onto future Prisma models
 * (GardenPlot, Planting, SavedCalculation, Reminder) when Auth.js + the
 * database land — see the "Backend mapping" notes on each interface.
 *
 * DATA-INTEGRITY POLICY:
 * - Growth-stage timing is never invented: we show "planted N days ago" and
 *   the stage the user records. No predicted harvest dates unless a verified
 *   harvest window exists for the item+region.
 * - Seasonal suggestions come only from src/lib/planting.ts windows.
 */
import { getItem } from "./growing";
import { PLANTING_WINDOWS, monthInWindow, windowLabel } from "./planting";

export { getItem };

export type AreaUnit = "acre" | "kanal" | "marla" | "hectare";

/** Backend mapping: GardenPlot prisma model (userId added later). */
export interface GardenPlot {
  id: string;
  name: string;
  location: string | null;
  /** Optional link into the planting-calendar region taxonomy. */
  regionId: string | null;
  area: number;
  unit: AreaUnit;
  soilType: string | null;
  notes: string | null;
  createdAt: string; // ISO
}

/** Backend mapping: Planting prisma model (plotId FK, userId later). */
export interface Planting {
  id: string;
  plotId: string;
  itemSlug: string;
  plantedOn: string; // ISO date
  stage: string | null;
  notes: string | null;
  createdAt: string;
}

/** Backend mapping: SavedCalculation prisma model. */
export interface SavedCalculation {
  id: string;
  cropSlug: string;
  area: number;
  unit: AreaUnit;
  products: { product: string; kg: number }[];
  notes: string | null;
  createdAt: string;
}

/** Backend mapping: Reminder prisma model (user-defined, never auto-invented). */
export interface GardenReminder {
  id: string;
  title: string;
  dueDate: string; // ISO date
  plotId: string | null;
  plantingId: string | null;
  done: boolean;
  createdAt: string;
}

export interface GardenState {
  version: 1;
  plots: GardenPlot[];
  plantings: Planting[];
  calculations: SavedCalculation[];
  reminders: GardenReminder[];
}

export const EMPTY_GARDEN: GardenState = {
  version: 1,
  plots: [],
  plantings: [],
  calculations: [],
  reminders: [],
};

export const STORAGE_KEY = "fertilizer-dose.garden.v1";

export function loadGarden(): GardenState {
  if (typeof window === "undefined") return EMPTY_GARDEN;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_GARDEN;
    const parsed = JSON.parse(raw) as GardenState;
    if (parsed.version !== 1) return EMPTY_GARDEN;
    return { ...EMPTY_GARDEN, ...parsed };
  } catch {
    return EMPTY_GARDEN;
  }
}

export function saveGarden(state: GardenState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — the UI keeps working in memory.
  }
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/* ---------- derived helpers ---------- */

export function daysSince(isoDate: string, now = new Date()): number {
  const d = new Date(isoDate + "T00:00:00");
  if (Number.isNaN(d.getTime())) return 0;
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
}

/** Verified harvest window for a planting, from planting-calendar data. */
export function harvestWindowFor(planting: Planting, regionId: string | null): string | null {
  if (!regionId) return null;
  const w = PLANTING_WINDOWS.find((x) => x.itemSlug === planting.itemSlug && x.regionId === regionId);
  return w?.harvestText ?? null;
}

export function sowingWindowFor(itemSlug: string, regionId: string | null, locale: string): string | null {
  if (!regionId) return null;
  const w = PLANTING_WINDOWS.find((x) => x.itemSlug === itemSlug && x.regionId === regionId);
  return w ? windowLabel(w, locale) : null;
}

export interface Suggestion {
  plotId: string;
  itemSlug: string;
  reason: string;
}

/**
 * Seasonal suggestions: for each plot with a region, items sowable in the
 * current month that are not already planted in that plot. Data-honest —
 * sourced from planting windows only.
 */
export function seasonalSuggestions(state: GardenState, month: number, locale: string): Suggestion[] {
  const out: Suggestion[] = [];
  for (const plot of state.plots) {
    if (!plot.regionId) continue;
    const plantedSlugs = new Set(
      state.plantings.filter((p) => p.plotId === plot.id).map((p) => p.itemSlug)
    );
    for (const w of PLANTING_WINDOWS) {
      if (w.regionId !== plot.regionId) continue;
      if (!monthInWindow(month, w)) continue;
      if (plantedSlugs.has(w.itemSlug)) continue;
      if (out.some((s) => s.plotId === plot.id && s.itemSlug === w.itemSlug)) continue;
      const item = getItem(w.itemSlug);
      if (!item) continue;
      out.push({
        plotId: plot.id,
        itemSlug: w.itemSlug,
        reason: windowLabel(w, locale),
      });
    }
  }
  return out;
}

export interface UpcomingTask {
  reminder: GardenReminder;
  overdue: boolean;
}

export function upcomingTasks(state: GardenState, now = new Date()): UpcomingTask[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return state.reminders
    .filter((r) => !r.done)
    .map((reminder) => {
      const due = new Date(reminder.dueDate + "T00:00:00");
      return { reminder, overdue: due < today };
    })
    .sort((a, b) => a.reminder.dueDate.localeCompare(b.reminder.dueDate));
}
