// ── Fertilizer Alternative Finder ────────────────────────────────────────
// Nutrient content per standard 50 kg bag (kg), from standard product grades.
// Used to suggest nutrient-equivalent replacement combinations when a
// product is unavailable or overpriced (e.g. DAP shortage season).
//
// Display text (name, short label, extras) is NOT stored here — it lives in
// the messages under alternativeFinder.fertilizers.<id> (i18n).

export interface AltFertilizer {
  id: string;
  n: number; // kg N per 50 kg bag
  p: number; // kg P2O5 per 50 kg bag
  k: number; // kg K2O per 50 kg bag
}

export const ALT_FERTILIZERS: AltFertilizer[] = [
  { id: "dap", n: 9, p: 23, k: 0 },
  { id: "urea", n: 23, p: 0, k: 0 },
  { id: "sop", n: 0, p: 0, k: 25 },
  { id: "mop", n: 0, p: 0, k: 30 },
  { id: "ssp", n: 0, p: 8, k: 0 },
  { id: "np", n: 10, p: 10, k: 0 },
  { id: "npk", n: 7.5, p: 7.5, k: 7.5 },
  { id: "ams", n: 10.5, p: 0, k: 0 },
];

export interface AltItem {
  fertilizer: AltFertilizer;
  bags: number;
}

export interface AltOption {
  items: AltItem[];
  provided: { n: number; p: number; k: number };
  needed: { n: number; p: number; k: number };
  matchPct: number;
}

type Dim = "n" | "p" | "k";

const STEP = 0.25;
const MAX_BAGS = 12;

const DIM_LABEL: Record<Dim, string> = { n: "N", p: "P₂O₅", k: "K₂O" };
export function dimLabel(d: Dim): string {
  return DIM_LABEL[d];
}

/** Score 0–100: mean per-nutrient match, penalising unrequested nutrients. */
function scoreOption(
  provided: { n: number; p: number; k: number },
  needed: { n: number; p: number; k: number },
  dims: Dim[],
): number {
  let s = 0;
  for (const d of dims) {
    const rel = Math.abs(provided[d] - needed[d]) / needed[d];
    s += Math.max(0, 1 - rel);
  }
  let avg = s / dims.length;
  // Penalise nutrients the target didn't ask for (e.g. P added when
  // replacing straight urea) — they are waste, not a bonus.
  const totalNeed = needed.n + needed.p + needed.k;
  for (const d of ["n", "p", "k"] as const) {
    if (needed[d] === 0 && provided[d] > 0 && totalNeed > 0) {
      avg -= (provided[d] / totalNeed) * 0.5;
    }
  }
  return Math.max(0, Math.round(avg * 100));
}

/**
 * Find up to 3 alternative fertilizer combinations that best match the
 * nutrients in `bags` bags of the target fertilizer. Searches single
 * products and two-product combos over a 0.25-bag grid.
 */
export function findAlternatives(targetId: string, bags: number): AltOption[] {
  const target = ALT_FERTILIZERS.find((f) => f.id === targetId);
  if (!target || !(bags > 0) || !Number.isFinite(bags)) return [];

  const needed = {
    n: target.n * bags,
    p: target.p * bags,
    k: target.k * bags,
  };
  const dims = (["n", "p", "k"] as Dim[]).filter((d) => needed[d] > 0);
  if (dims.length === 0) return [];

  const cands = ALT_FERTILIZERS.filter(
    (f) => f.id !== targetId && dims.some((d) => f[d] > 0),
  );
  if (cands.length === 0) return [];

  const bagSteps: number[] = [];
  for (let b = STEP; b <= MAX_BAGS + 1e-9; b += STEP) {
    bagSteps.push(Math.round(b * 100) / 100);
  }

  const raw: AltOption[] = [];
  const push = (items: AltItem[]) => {
    const provided = { n: 0, p: 0, k: 0 };
    for (const it of items) {
      provided.n += it.fertilizer.n * it.bags;
      provided.p += it.fertilizer.p * it.bags;
      provided.k += it.fertilizer.k * it.bags;
    }
    raw.push({ items, provided, needed, matchPct: scoreOption(provided, needed, dims) });
  };

  // Single-product options
  for (const c of cands) {
    let best: AltItem[] | null = null;
    let bestScore = -1;
    for (const b of bagSteps) {
      const s = scoreOption(
        { n: c.n * b, p: c.p * b, k: c.k * b },
        needed,
        dims,
      );
      if (s > bestScore) {
        bestScore = s;
        best = [{ fertilizer: c, bags: b }];
      }
    }
    if (best) push(best);
  }

  // Two-product combos
  for (let i = 0; i < cands.length; i++) {
    for (let j = i + 1; j < cands.length; j++) {
      const A = cands[i];
      const B = cands[j];
      let best: AltItem[] | null = null;
      let bestScore = -1;
      for (const a of bagSteps) {
        for (const b of bagSteps) {
          const s = scoreOption(
            { n: A.n * a + B.n * b, p: A.p * a + B.p * b, k: A.k * a + B.k * b },
            needed,
            dims,
          );
          if (s > bestScore) {
            bestScore = s;
            best = [
              { fertilizer: A, bags: a },
              { fertilizer: B, bags: b },
            ];
          }
        }
      }
      if (best) push(best);
    }
  }

  // Dedupe by fertilizer set (keep best score), sort, top 3
  const seen = new Map<string, AltOption>();
  for (const o of raw) {
    const key = o.items
      .map((it) => it.fertilizer.id)
      .sort()
      .join("+");
    const prev = seen.get(key);
    if (!prev || o.matchPct > prev.matchPct) seen.set(key, o);
  }
  const ranked = [...seen.values()].sort((a, b) => b.matchPct - a.matchPct);
  // Drop useless options, but always keep the best one.
  const useful = ranked.filter((o) => o.matchPct >= 40);
  return (useful.length > 0 ? useful : ranked.slice(0, 1)).slice(0, 3);
}

/**
 * Contextual agronomic note keys for an option. The component resolves each
 * key suffix under alternativeFinder.notes.*.
 */
export function optionNoteKeys(o: AltOption): string[] {
  const keys: string[] = [];
  const ids = o.items.map((it) => it.fertilizer.id);
  if (ids.includes("ssp")) keys.push("ssp");
  if (ids.includes("ams")) keys.push("ams");
  if (ids.includes("urea")) keys.push("urea");
  if (ids.includes("mop") && o.needed.k > 0) keys.push("mop");
  if (o.matchPct < 85) keys.push("imperfect");
  return keys;
}

/** Nutrients the target quantity supplies (for the summary line). */
export function targetNutrients(targetId: string, bags: number): { n: number; p: number; k: number } | null {
  const t = ALT_FERTILIZERS.find((f) => f.id === targetId);
  if (!t || !(bags > 0)) return null;
  return { n: t.n * bags, p: t.p * bags, k: t.k * bags };
}
