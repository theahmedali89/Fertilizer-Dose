// ── Fertilizer Alternative Finder ────────────────────────────────────────
// Nutrient content per standard 50 kg bag (kg), from standard product grades.
// Used to suggest nutrient-equivalent replacement combinations when a
// product is unavailable or overpriced (e.g. DAP shortage season).

export interface AltFertilizer {
  id: string;
  name: string; // display name with grade
  short: string; // short label
  n: number; // kg N per 50 kg bag
  p: number; // kg P2O5 per 50 kg bag
  k: number; // kg K2O per 50 kg bag
  extras?: string; // secondary nutrients / handling note
}

export const ALT_FERTILIZERS: AltFertilizer[] = [
  { id: "dap", name: "DAP (18-46-0)", short: "DAP", n: 9, p: 23, k: 0 },
  { id: "urea", name: "Urea (46% N)", short: "Urea", n: 23, p: 0, k: 0 },
  { id: "sop", name: "SOP (0-0-50)", short: "SOP", n: 0, p: 0, k: 25, extras: "Sulphate of potash — chloride-free, also supplies sulphur." },
  { id: "mop", name: "MOP (0-0-60)", short: "MOP", n: 0, p: 0, k: 30, extras: "Muriate of potash — cheapest K source, contains chloride." },
  { id: "ssp", name: "SSP (16% P₂O₅)", short: "SSP", n: 0, p: 8, k: 0, extras: "Also supplies sulphur (~12%) and calcium; slower release than DAP." },
  { id: "np", name: "Nitrophos (20-20-0)", short: "Nitrophos", n: 10, p: 10, k: 0 },
  { id: "npk", name: "NPK 15-15-15", short: "NPK 15-15-15", n: 7.5, p: 7.5, k: 7.5 },
  { id: "ams", name: "Ammonium Sulphate (21% N)", short: "Ammonium Sulphate", n: 10.5, p: 0, k: 0, extras: "Also supplies sulphur (24% S) — good for oilseeds and alkaline soils." },
];

export function altFertilizerName(id: string): string {
  return ALT_FERTILIZERS.find((f) => f.id === id)?.name ?? id;
}

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

/** Contextual agronomic notes for an option. */
export function optionNotes(o: AltOption): string[] {
  const notes: string[] = [];
  const ids = o.items.map((it) => it.fertilizer.id);
  if (ids.includes("ssp")) {
    notes.push(
      "SSP releases phosphorus more slowly than DAP — incorporate it into the soil a few days before sowing for best results.",
    );
  }
  if (ids.includes("ams")) {
    notes.push(
      "Ammonium sulphate also supplies sulphur (24% S) — a plus for oilseeds, pulses and high-pH soils.",
    );
  }
  if (ids.includes("urea")) {
    notes.push(
      "Broadcast urea 1–2 days after irrigation on moist soil — do not flood it with the irrigation water (up to 40–50% can be lost).",
    );
  }
  if (ids.includes("mop") && o.needed.k > 0) {
    notes.push(
      "MOP contains chloride — prefer SOP for chloride-sensitive crops (tobacco, potato, citrus, grapes).",
    );
  }
  if (o.matchPct < 85) {
    notes.push(
      "This is the closest practical match — an exact NPK replica with different products is rarely possible.",
    );
  }
  return notes;
}

/** Nutrients the target quantity supplies (for the summary line). */
export function targetNutrients(targetId: string, bags: number): { n: number; p: number; k: number } | null {
  const t = ALT_FERTILIZERS.find((f) => f.id === targetId);
  if (!t || !(bags > 0)) return null;
  return { n: t.n * bags, p: t.p * bags, k: t.k * bags };
}
