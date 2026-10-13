// ── Tank-Mix Compatibility Checker data ──────────────────────────────
// Real agronomic tank-mix compatibility rules for common fertilizers.
// Keyed by unordered pair "aId|bId" (alphabetical order).

export type Verdict = "safe" | "caution" | "danger";

export interface Fertilizer {
  id: string;
  name: string;
  short: string;
}

export const FERTILIZERS: Fertilizer[] = [
  { id: "urea", name: "Urea (46% N)", short: "Urea" },
  { id: "dap", name: "DAP (18-46-0)", short: "DAP" },
  { id: "sop", name: "SOP / Sulphate of Potash (50% K₂O)", short: "SOP" },
  { id: "mop", name: "MOP / Muriate of Potash (60% K₂O)", short: "MOP" },
  { id: "ssp", name: "SSP / Single Super Phosphate", short: "SSP" },
  { id: "np", name: "Nitrophos / NP (22-20-0)", short: "Nitrophos" },
  { id: "npk", name: "NPK 15-15-15", short: "NPK 15-15-15" },
  { id: "zinc", name: "Zinc Sulphate (Heptahydrate)", short: "Zinc Sulphate" },
  { id: "boron", name: "Borax / Boron", short: "Boron" },
  { id: "calnit", name: "Calcium Nitrate", short: "Calcium Nitrate" },
  { id: "ams", name: "Ammonium Sulphate (21% N)", short: "Ammonium Sulphate" },
];

interface Rule {
  verdict: Verdict;
  title: string;
  explanation: string;
  instead: string;
}

function pair(a: string, b: string): string {
  return [a, b].sort().join("|");
}

// Default rule when no specific entry exists
const DEFAULT_SAFE: Rule = {
  verdict: "safe",
  title: "Likely compatible",
  explanation:
    "No known adverse reaction between these two in a tank mix. Still, do a small jar test first: mix a little of both in water, wait 15 minutes, and check for heat, gas, curdling, or sediment before filling the whole tank.",
  instead: "",
};

const RULES: Record<string, Rule> = {
  // ── DANGEROUS ────────────────────────────────────────────────────
  [pair("dap", "zinc")]: {
    verdict: "danger",
    title: "DANGER — Do NOT mix",
    explanation:
      "DAP + Zinc Sulphate forms insoluble zinc phosphate — a thick, curd-like precipitate. The zinc becomes fixed and unavailable to the plant, and the sludge blocks spray nozzles and drip emitters.",
    instead:
      "Apply separately: broadcast DAP at sowing/land preparation, and apply zinc sulphate as a separate soil application or foliar spray (0.5% solution) 2–3 weeks later.",
  },
  [pair("dap", "calnit")]: {
    verdict: "danger",
    title: "DANGER — Do NOT mix",
    explanation:
      "DAP + Calcium Nitrate forms calcium phosphate precipitate. Both nutrients lock each other out and settle at the bottom of the tank — a complete waste of both fertilizers.",
    instead:
      "Apply calcium nitrate through fertigation on a different day than any phosphate fertilizer. Keep at least a 3–4 day gap.",
  },
  [pair("np", "zinc")]: {
    verdict: "danger",
    title: "DANGER — Do NOT mix",
    explanation:
      "Nitrophos contains phosphate, which reacts with zinc to form insoluble zinc phosphate — the same curd-like precipitate as DAP + Zinc. Zinc is lost and nozzles clog.",
    instead:
      "Apply zinc sulphate separately — as a basal soil dose or a 0.5% foliar spray — at least 2 weeks away from any phosphate fertilizer.",
  },
  [pair("ssp", "zinc")]: {
    verdict: "danger",
    title: "DANGER — Do NOT mix",
    explanation:
      "SSP contains phosphate + calcium. Mixed with zinc sulphate it forms insoluble zinc phosphate and calcium precipitates — the mixture turns milky and unusable.",
    instead:
      "Apply zinc separately as a foliar spray or basal dose, away from SSP application.",
  },

  // ── CAUTION ──────────────────────────────────────────────────────
  [pair("urea", "ssp")]: {
    verdict: "caution",
    title: "CAUTION — Use immediately",
    explanation:
      "Urea + SSP is chemically compatible, but the mixture cakes and hardens quickly because urea absorbs moisture and SSP is acidic. It becomes difficult to spread evenly.",
    instead:
      "Mix only the amount you will broadcast within 1–2 hours. Do not store the mixture overnight.",
  },
  [pair("dap", "urea")]: {
    verdict: "caution",
    title: "CAUTION — Fine dry, risky in solution",
    explanation:
      "Dry-mixing DAP + Urea for broadcasting is safe. But dissolving both together in a spray tank raises pH and releases ammonia gas — you lose nitrogen and the high pH can scorch leaves.",
    instead:
      "Dry mix is fine for broadcasting. For fertigation/spray, apply them in separate passes.",
  },
  [pair("urea", "calnit")]: {
    verdict: "caution",
    title: "CAUTION — Highly hygroscopic",
    explanation:
      "Urea + Calcium Nitrate is chemically compatible, but both are strongly hygroscopic — the mixture absorbs moisture from the air, turns sticky, and cakes within hours.",
    instead:
      "Mix just before use and broadcast the same day. Store the two fertilizers separately in sealed bags.",
  },
  [pair("mop", "zinc")]: {
    verdict: "caution",
    title: "CAUTION — Chloride load",
    explanation:
      "MOP + Zinc Sulphate mixes fine physically, but MOP adds a heavy chloride load. In drip irrigation or for chloride-sensitive crops (tobacco, potato, citrus, grapes), this combination stresses the crop.",
    instead:
      "Prefer SOP over MOP when mixing with micronutrients, especially under drip irrigation or for sensitive crops.",
  },
  [pair("npk", "calnit")]: {
    verdict: "caution",
    title: "CAUTION — Check the grade",
    explanation:
      "NPK 15-15-15 contains phosphate, which can precipitate with calcium from calcium nitrate. Some liquid NPK grades are chelated and fine — granular NPK is risky in the same tank.",
    instead:
      "If both are needed, apply the NPK to soil and fertigate calcium nitrate separately, a few days apart.",
  },

  // ── SAFE ─────────────────────────────────────────────────────────
  [pair("urea", "sop")]: {
    verdict: "safe",
    title: "SAFE — Compatible",
    explanation:
      "Urea + SOP is a fully compatible mix, dry or dissolved. No precipitation, no nutrient loss. A common and effective combination for top-dressing.",
    instead: "",
  },
  [pair("sop", "zinc")]: {
    verdict: "safe",
    title: "SAFE — Compatible",
    explanation:
      "SOP + Zinc Sulphate is safe in the tank. Sulphate-based fertilizers do not react with zinc, and both dissolve cleanly together.",
    instead: "",
  },
  [pair("urea", "boron")]: {
    verdict: "safe",
    title: "SAFE — Compatible",
    explanation:
      "Urea + Boron (borax/boric acid) is compatible in solution. This is a standard foliar combination — often sprayed together at flowering and fruit set.",
    instead: "",
  },
  [pair("urea", "ams")]: {
    verdict: "safe",
    title: "SAFE — Compatible",
    explanation:
      "Urea + Ammonium Sulphate mixes safely. Both are nitrogen sources; the combination also supplies sulphur. No adverse reaction.",
    instead: "",
  },
  [pair("sop", "boron")]: {
    verdict: "safe",
    title: "SAFE — Compatible",
    explanation:
      "SOP + Boron is safe together in solution — a common fertigation pairing for fruit crops at flowering.",
    instead: "",
  },
  [pair("urea", "mop")]: {
    verdict: "safe",
    title: "SAFE — Compatible",
    explanation:
      "Urea + MOP is chemically compatible for dry broadcasting. (Note: in drip irrigation or for chloride-sensitive crops, prefer SOP over MOP.)",
    instead: "",
  },
  [pair("dap", "sop")]: {
    verdict: "safe",
    title: "SAFE — Compatible",
    explanation:
      "DAP + SOP is a safe, widely used basal combination. No precipitation between phosphate and sulphate of potash.",
    instead: "",
  },
  [pair("npk", "urea")]: {
    verdict: "safe",
    title: "SAFE — Compatible",
    explanation:
      "NPK 15-15-15 + Urea is safe — commonly used to boost nitrogen in a basal dose. No adverse reaction.",
    instead: "",
  },
  [pair("npk", "sop")]: {
    verdict: "safe",
    title: "SAFE — Compatible",
    explanation:
      "NPK + SOP is safe and commonly used to raise potash in fruiting crops without adding chloride.",
    instead: "",
  },
};

export function checkCompatibility(aId: string, bId: string): Rule {
  if (aId === bId) {
    const f = FERTILIZERS.find((x) => x.id === aId);
    return {
      verdict: "safe",
      title: "Same fertilizer",
      explanation: `You selected ${f?.short ?? "the same fertilizer"} twice — nothing to mix. Pick two different fertilizers to check compatibility.`,
      instead: "",
    };
  }
  return RULES[pair(aId, bId)] ?? DEFAULT_SAFE;
}

export function fertilizerName(id: string): string {
  return FERTILIZERS.find((f) => f.id === id)?.short ?? id;
}
