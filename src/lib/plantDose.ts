/**
 * Plant-dose calculator math (pure functions) — for home gardeners and
 * potted-plant growers. Unlike the field-crop calculators (per-acre doses),
 * this works in the horticultural units used for container plants:
 * grams of water-soluble fertilizer per litre of water (fertigation),
 * driven by a target nitrogen concentration in ppm.
 *
 * ── CORE FORMULA ──
 *   grams of fertilizer per litre = target ppm N ÷ (%N × 10)
 *
 * Why: 1 ppm = 1 mg/L. Dissolving 1 g of fertilizer per litre gives
 * (%N / 100) g of N per litre = %N × 10 mg/L = %N × 10 ppm of N.
 * So to reach P ppm of N with a fertilizer containing %N nitrogen:
 *   g/L = P ÷ (%N × 10)
 *
 * Cross-checks (published, independent of this derivation):
 *  - Greenhouse Grower ("Fertilizing Containers"): 1 level teaspoon of
 *    20-20-20 (≈6 g) in 1 US gallon (3.785 L) supplies "about 300 ppm" N.
 *    Our formula: (6 ÷ 3.785) × 20 × 10 = 317 ppm. ✓ consistent.
 *  - Virginia Tech SPES-744 ("The Basics of Fertilizer Calculations for
 *    Greenhouse Crops"): worked example targets 200 ppm N with 20-10-20.
 *    Our formula: 200 ÷ (20 × 10) = 1 g/L. ✓ same scale.
 *
 * ── FEEDING-RATE PRESETS (university extension sources, NOT invented) ──
 *  - GENTLE (100 ppm N): houseplants, seedlings, slow growers.
 *    Basis: UMass Extension, "Fertilizing Bedding Plant Seedlings"
 *    (Douglas Cox, Stockbridge School of Agriculture, 2011) —
 *    "Small, slow growing types should receive lower rates (100–150 ppm N)
 *    or less frequent applications until they are well-established."
 *    Preset uses the bottom of that band (100 ppm) — the conservative
 *    choice for home conditions.
 *  - REGULAR (150 ppm N): most container / potted plants.
 *    Basis: Michigan State University Extension publication E2186
 *    (container nursery production) — "For most container grown plants,
 *    satisfactory growth will occur with slow release fertilizer plus
 *    supplemental liquid fertilization at 150 to 200 ppm nitrogen."
 *    Preset uses the bottom of that band (150 ppm).
 *  - HEAVY (200 ppm N): vigorous, heavy-feeding bedding plants.
 *    Basis: UMass Extension (same fact sheet) — "Bedding plants are
 *    commonly fertilized on a constant basis at 200–250 ppm N."
 *    Preset uses the bottom of that band (200 ppm).
 *
 * All three presets deliberately take the LOW end of the published band:
 * home light levels are lower than greenhouse production, so the safe
 * default is the conservative end. Users can always enter a custom ppm.
 *
 * ── POT VOLUMES ──
 * Approximate soil volumes of standard trade pots, used only to convert
 * g/L into "grams per pot". These are approximate physical volumes of
 * common nursery pots (a 6-inch standard pot holds roughly 1.5–1.6 L of
 * medium), labeled as estimates in the UI — actual volume varies by
 * manufacturer and pot shape.
 */

export interface FeedPreset {
  id: string;
  ppmN: number;
  source: string;
}

export const FEED_PRESETS: FeedPreset[] = [
  {
    id: "gentle",
    ppmN: 100,
    source:
      "UMass Extension — 100–150 ppm N for slow-growing types (preset uses the low end)",
  },
  {
    id: "regular",
    ppmN: 150,
    source:
      "MSU Extension E2186 — 150–200 ppm N supplemental feed for container plants (preset uses the low end)",
  },
  {
    id: "heavy",
    ppmN: 200,
    source:
      "UMass Extension — 200–250 ppm N constant feed for vigorous bedding plants (preset uses the low end)",
  },
];

/** Common water-soluble fertilizer grades offered as quick presets. */
export interface FertilizerGrade {
  id: string;
  n: number;
  p: number;
  k: number;
  label: string;
}

export const GRADE_PRESETS: FertilizerGrade[] = [
  { id: "20-20-20", n: 20, p: 20, k: 20, label: "20-20-20 (balanced)" },
  { id: "19-19-19", n: 19, p: 19, k: 19, label: "19-19-19 (balanced)" },
  { id: "20-10-20", n: 20, p: 10, k: 20, label: "20-10-20 (high-N)" },
  { id: "15-5-15", n: 15, p: 5, k: 15, label: "15-5-15 (cal-mag type)" },
];

/** Approximate medium volume (litres) of standard nursery pots. */
export interface PotSize {
  id: string;
  diameterCm: number;
  litres: number;
}

export const POT_SIZES: PotSize[] = [
  { id: "p10", diameterCm: 10, litres: 0.5 },
  { id: "p15", diameterCm: 15, litres: 1.6 },
  { id: "p20", diameterCm: 20, litres: 4 },
  { id: "p25", diameterCm: 25, litres: 7.5 },
  { id: "p30", diameterCm: 30, litres: 11 },
];

/**
 * Grams of fertilizer to dissolve per litre of water for a target N ppm.
 * @param ppmN target nitrogen concentration (mg N per litre)
 * @param pctN % nitrogen printed on the fertilizer bag
 */
export function gramsPerLitre(ppmN: number, pctN: number): number {
  if (pctN <= 0) return 0;
  return ppmN / (pctN * 10);
}

/**
 * Actual ppm N delivered by a measured dose — the inverse check, shown so
 * users can verify what their own spoonful actually delivers.
 */
export function ppmFromDose(gramsPerL: number, pctN: number): number {
  return gramsPerL * pctN * 10;
}

/** Total grams of fertilizer for a watering-can / tank of `litres` litres. */
export function totalGrams(gramsPerL: number, litres: number): number {
  return gramsPerL * litres;
}

/** Grams per pot at the same concentration (pot volume is approximate). */
export function gramsPerPot(gramsPerL: number, potLitres: number): number {
  return gramsPerL * potLitres;
}

/**
 * Rough kitchen equivalents for the per-litre dose. A level teaspoon of
 * granular water-soluble fertilizer weighs roughly 5–6 g (Greenhouse
 * Grower cites ~6 g for 20-20-20); a level tablespoon roughly 15–18 g.
 * These vary by product density — the component renders them as "about",
 * never as exact values.
 */
export function kitchenHint(gramsPerL: number): { tsp: number; tbsp: number } {
  return { tsp: gramsPerL / 6, tbsp: gramsPerL / 17 };
}

/* ── GARDEN BED MODE ── */

/** Square feet per square metre (exact definition). */
export const SQFT_PER_M2 = 10.7639;

/**
 * Water volume (litres) held by a garden bed: area × root-zone depth.
 * The depth is USER-ENTERED — the UI labels it explicitly as the assumed
 * root-zone depth (a common working value for vegetable beds is 15–20 cm,
 * but the user must confirm/adjust it; nothing is silently assumed).
 */
export function bedLitres(areaM2: number, depthCm: number): number {
  if (areaM2 <= 0 || depthCm <= 0) return 0;
  return areaM2 * (depthCm / 100) * 1000;
}

/* ── LIQUID CONCENTRATES ── */

/**
 * Millilitres of liquid concentrate per litre of water.
 * Density (g/ml) is USER-ENTERED from the product label — never assumed,
 * because liquid fertilizer densities vary widely (~1.1–1.4 g/ml is common
 * but the label is the only valid source).
 * Formula: ml/L = (g/L) ÷ density.
 */
export function mlPerLitre(gramsPerL: number, densityGperMl: number): number {
  if (densityGperMl <= 0) return 0;
  return gramsPerL / densityGperMl;
}

/** Total millilitres of concentrate for a tank of `litres` litres. */
export function totalMl(mlPerL: number, litres: number): number {
  return mlPerL * litres;
}

/* ── FEEDING SCHEDULE ── */

/** Feeding-interval presets (weeks between applications). */
export interface FeedInterval {
  id: string;
  weeks: number;
}

export const FEED_INTERVALS: FeedInterval[] = [
  { id: "w1", weeks: 1 },
  { id: "w2", weeks: 2 },
  { id: "w4", weeks: 4 },
];

/** ISO date (yyyy-mm-dd) `days` after `iso`. */
function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Next `count` feeding dates at `intervalWeeks` from `startISO`.
 * Pure date arithmetic — the schedule is a planning aid, not an
 * agronomic prescription; the UI labels every reminder "Suggested".
 */
export function feedingDates(
  startISO: string,
  intervalWeeks: number,
  count: number
): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startISO) || intervalWeeks <= 0 || count <= 0)
    return [];
  return Array.from({ length: count }, (_, i) =>
    addDaysISO(startISO, i * intervalWeeks * 7)
  );
}
