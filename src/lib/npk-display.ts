import type { GrowingItem } from "./growing";

export interface ResolvedNpk {
  n: string | null;
  p: string | null;
  k: string | null;
}

function oneNutrient(
  range: [number, number] | null | undefined,
  single: number | null | undefined
): string | null {
  if (range) {
    const [lo, hi] = range;
    const loMissing = lo == null || lo === 0;
    const hiMissing = hi == null || hi === 0;
    if (loMissing && hiMissing) return null;
    if (lo === hi) return String(lo);
    return `${lo ?? 0}–${hi ?? 0}`;
  }
  if (single == null || single === 0) return null;
  return String(single);
}

/**
 * Resolve N–P2O5–K2O for honest display.
 * A null or 0 value means "no verified data" — it resolves to null
 * and must NEVER be rendered as "0". Ranges are preferred over
 * single values; a [0,0] range is also treated as missing.
 */
export function resolveNpk(
  item: Pick<GrowingItem, "npk" | "npkRange">
): ResolvedNpk {
  return {
    n: oneNutrient(item.npkRange?.n, item.npk?.n),
    p: oneNutrient(item.npkRange?.p, item.npk?.p),
    k: oneNutrient(item.npkRange?.k, item.npk?.k),
  };
}

export function hasAnyNpk(r: ResolvedNpk): boolean {
  return !!(r.n || r.p || r.k);
}

/**
 * Translate a season label (e.g. "Rabi (winter)") via the
 * `growing.seasonLabels` message map. Falls back to the English
 * source string when no translation exists.
 */
export function translateSeason(
  seasonLabels: Record<string, string> | undefined | null,
  season: string | null | undefined
): string | null {
  if (!season) return null;
  return seasonLabels?.[season] ?? season;
}
