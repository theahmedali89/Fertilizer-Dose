/**
 * Soil-test-based fertilizer dose adjustment (pure functions).
 *
 * POLICY (same as agronomy.ts): nothing is invented. Every rating threshold
 * below is a documented standard, cited at the function that uses it.
 * Thresholds are kept as named constants so the basis is visible next to
 * the number, not buried in prose.
 *
 * Basis for the rating charts: the Indian soil-testing laboratory rating
 * framework used in the Government of India's Soil Health Card programme —
 * the same low/medium/high fertility classes printed on soil health cards
 * across Indian state soil-testing labs (available P by Olsen's method,
 * available K by 1N neutral ammonium acetate extraction, organic carbon by
 * Walkley–Black, pH by glass electrode on 1:2.5 soil–water suspension).
 * These are fertility *classes* used to decide whether a nutrient should be
 * built up, maintained, or drawn down — not crop-specific critical limits.
 */

/* ── Rating scales ── */

export type NutrientRating = "low" | "medium" | "high";
export type PhClass = "acidic" | "neutral" | "alkaline";

/**
 * Available phosphorus (Olsen's extractant), mg/kg (= ppm).
 * Soil Health Card class limits: low < 10, medium 10–25, high > 25 mg/kg.
 * (Ratings are quoted for Olsen P; Bray P uses different limits and is
 * NOT rated here — see normalizeP below.)
 */
const P_LOW_MG_KG = 10;
const P_HIGH_MG_KG = 25;

export function ratePhosphorus(olsenPmgKg: number): NutrientRating {
  if (olsenPmgKg < P_LOW_MG_KG) return "low";
  if (olsenPmgKg > P_HIGH_MG_KG) return "high";
  return "medium";
}

/**
 * Available potassium (1N neutral NH4OAc extraction), kg/ha.
 * Soil Health Card class limits: low < 120, medium 120–280, high > 280 kg/ha.
 */
const K_LOW_KG_HA = 120;
const K_HIGH_KG_HA = 280;

export function ratePotassium(availableKkgHa: number): NutrientRating {
  if (availableKkgHa < K_LOW_KG_HA) return "low";
  if (availableKkgHa > K_HIGH_KG_HA) return "high";
  return "medium";
}

/**
 * Organic carbon (Walkley–Black), %.
 * Soil Health Card class limits: low < 0.5, medium 0.5–0.75, high > 0.75 %.
 *
 * ASSUMPTION (documented): soil-testing labs rarely report a mineral-N
 * class, so organic carbon is used as the proxy for native nitrogen
 * supplying capacity — higher organic carbon means more mineralizable N,
 * the standard rationale for N recommendation bands in the Indian
 * extension system. This is a proxy, not a measured N value.
 */
const OC_LOW_PCT = 0.5;
const OC_HIGH_PCT = 0.75;

export function rateOrganicCarbon(ocPct: number): NutrientRating {
  if (ocPct < OC_LOW_PCT) return "low";
  if (ocPct > OC_HIGH_PCT) return "high";
  return "medium";
}

/**
 * Soil pH class (1:2.5 soil–water suspension, glass electrode).
 * Conventional agronomic bands: acidic < 6.5, neutral 6.5–7.5, alkaline > 7.5.
 * pH is informational here — it does not scale the dose, it flags risk.
 */
const PH_ACIDIC_MAX = 6.5;
const PH_NEUTRAL_MAX = 7.5;

export function classifyPh(ph: number): PhClass {
  if (ph < PH_ACIDIC_MAX) return "acidic";
  if (ph > PH_NEUTRAL_MAX) return "alkaline";
  return "neutral";
}

/* ── Unit conversion: ppm ⇄ kg/ha ── */

export type SoilUnit = "ppm" | "kgHa";

/**
 * Converts ppm (mg/kg) to kg/ha using the standard furrow-slice factor:
 * one hectare of soil to 15 cm depth at bulk density ~1.5 g/cm³ weighs
 * ≈ 2.24 × 10⁶ kg, so 1 mg/kg × 2.24×10⁶ kg = 2.24 kg/ha.
 * This is the textbook factor used by soil-testing labs to convert
 * analytical results (ppm) to field units (kg/ha). Rounded to 2.24.
 */
export const FURROW_SLICE_FACTOR = 2.24;

export function ppmToKgHa(ppm: number): number {
  return ppm * FURROW_SLICE_FACTOR;
}

export function kgHaToPpm(kgHa: number): number {
  return kgHa / FURROW_SLICE_FACTOR;
}

/** Phosphorus is rated in mg/kg (= ppm), so kg/ha input is converted down. */
export function normalizePtoMgKg(value: number, unit: SoilUnit): number {
  return unit === "ppm" ? value : kgHaToPpm(value);
}

/** Potassium is rated in kg/ha, so ppm input is converted up. */
export function normalizeKtoKgHa(value: number, unit: SoilUnit): number {
  return unit === "ppm" ? ppmToKgHa(value) : value;
}

/* ── Build-up / maintenance / drawdown adjustment ── */

/**
 * Adjustment multipliers implementing the build-up/maintenance concept
 * used in soil-test-based fertilizer recommendation systems
 * (e.g. the STCR / targeted-yield and Soil Health Card advisory logic):
 * a soil testing low in a nutrient needs a build-up dose above the
 * standard recommendation; a medium soil is maintained at the standard
 * dose; a high soil can be drawn down below it, saving fertilizer.
 *
 * The +30% / −25% magnitudes are advisory planning bands, not published
 * critical values — they are labeled as estimates everywhere they appear.
 */
const BUILD_UP_PCT = 30; // low rating
const DRAW_DOWN_PCT = 25; // high rating

export function adjustmentPctFor(rating: NutrientRating): number {
  if (rating === "low") return BUILD_UP_PCT;
  if (rating === "high") return -DRAW_DOWN_PCT;
  return 0;
}

const r1 = (x: number) => Math.round(x * 10) / 10;

export function adjustDose(baseKgHa: number, rating: NutrientRating): number {
  const adjusted = baseKgHa * (1 + adjustmentPctFor(rating) / 100);
  return Math.max(0, r1(adjusted)); // clamped at zero — never negative
}

/* ── Full soil-test evaluation ── */

export interface SoilTestInput {
  /** Olsen available P, mg/kg (ppm). null = not tested. */
  pMgKg: number | null;
  /** Available K (NH4OAc), kg/ha. null = not tested. */
  kKgHa: number | null;
  /** Organic carbon %, the N-supply proxy. null = not tested. */
  ocPct: number | null;
  /** Soil pH, informational. null = not tested. */
  ph: number | null;
}

export interface NutrientAdjustment {
  /** null when the test value was not supplied — base dose kept as-is. */
  rating: NutrientRating | null;
  baseKgHa: number;
  adjustedKgHa: number;
  /** % change applied: +30 / 0 / −25 (0 when not rated). */
  pctChange: number;
}

export interface SoilTestOutput {
  n: NutrientAdjustment; // rated via organic-carbon proxy
  p: NutrientAdjustment;
  k: NutrientAdjustment;
  phClass: PhClass | null;
  /** True when pH is alkaline: Ca/Mg phosphates fix P, placement matters. */
  pFixationRisk: boolean;
}

function evaluate(
  baseKgHa: number,
  testValue: number | null,
  rate: (v: number) => NutrientRating
): NutrientAdjustment {
  if (testValue === null) {
    return { rating: null, baseKgHa, adjustedKgHa: r1(baseKgHa), pctChange: 0 };
  }
  const rating = rate(testValue);
  return {
    rating,
    baseKgHa,
    adjustedKgHa: adjustDose(baseKgHa, rating),
    pctChange: adjustmentPctFor(rating),
  };
}

export function evaluateSoilTest(
  base: { n: number; p: number; k: number },
  input: SoilTestInput
): SoilTestOutput {
  const phClass = input.ph === null ? null : classifyPh(input.ph);
  return {
    n: evaluate(base.n, input.ocPct, rateOrganicCarbon),
    p: evaluate(base.p, input.pMgKg, ratePhosphorus),
    k: evaluate(base.k, input.kKgHa, ratePotassium),
    phClass,
    // Above pH 7.5, soluble P increasingly precipitates as calcium/magnesium
    // phosphates (P fixation). Band-placement at sowing matters more than
    // ever; the dose itself is unchanged — the flag is advisory only.
    pFixationRisk: phClass === "alkaline",
  };
}
