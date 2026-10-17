// ── Tank-Mix Compatibility Checker data ──────────────────────────────
// Real agronomic tank-mix compatibility rules for common fertilizers.
// Pair keys are the unordered "aId|bId" (alphabetical order) with "|"
// replaced by "_". All human-readable text lives in the "tankMix"
// i18n namespace; this module only carries logic + rule keys.

export type Verdict = "safe" | "caution" | "danger" | "unknown";

export interface Fertilizer {
  id: string;
}

export const FERTILIZERS: Fertilizer[] = [
  { id: "urea" },
  { id: "dap" },
  { id: "sop" },
  { id: "mop" },
  { id: "ssp" },
  { id: "np" },
  { id: "npk" },
  { id: "zinc" },
  { id: "boron" },
  { id: "calnit" },
  { id: "ams" },
];

export interface CompatibilityResult {
  verdict: Verdict;
  ruleKey: string;
}

function pair(a: string, b: string): string {
  return [a, b].sort().join("|");
}

const RULES: Record<string, Verdict> = {
  // ── DANGEROUS ────────────────────────────────────────────────────
  [pair("dap", "zinc")]: "danger",
  [pair("dap", "calnit")]: "danger",
  [pair("np", "zinc")]: "danger",
  [pair("ssp", "zinc")]: "danger",

  // ── CAUTION ──────────────────────────────────────────────────────
  [pair("urea", "ssp")]: "caution",
  [pair("dap", "urea")]: "caution",
  [pair("urea", "calnit")]: "caution",
  [pair("mop", "zinc")]: "caution",
  [pair("npk", "calnit")]: "caution",

  // ── SAFE ─────────────────────────────────────────────────────────
  [pair("urea", "sop")]: "safe",
  [pair("sop", "zinc")]: "safe",
  [pair("urea", "boron")]: "safe",
  [pair("urea", "ams")]: "safe",
  [pair("sop", "boron")]: "safe",
  [pair("urea", "mop")]: "safe",
  [pair("dap", "sop")]: "safe",
  [pair("npk", "urea")]: "safe",
  [pair("npk", "sop")]: "safe",
};

// Default rule when no specific entry exists — NEVER "safe".
// Unknown combinations must not be presented as compatible.
const DEFAULT_RULE_KEY = "default";

export function checkCompatibility(aId: string, bId: string): CompatibilityResult {
  if (aId === bId) {
    return { verdict: "safe", ruleKey: "same" };
  }
  const key = pair(aId, bId).replace("|", "_");
  const verdict = RULES[pair(aId, bId)] ?? "unknown";
  return { verdict, ruleKey: verdict === "unknown" ? DEFAULT_RULE_KEY : key };
}
