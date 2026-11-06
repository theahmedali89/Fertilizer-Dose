/**
 * DAP ↔ TSP converter: pure, dependency-free calculation engine.
 *
 * Facts (research report 2026-11-06, "DAP vs TSP: Pakistan Focus"):
 * - Both bags hold 23 kg P2O5 (46% of a 50 kg bag). The only nutrient
 *   difference is nitrogen: DAP adds 9 kg N per bag, TSP adds none.
 * - 1 bag TSP + 20 kg urea = 1 bag DAP in N + P (20 kg urea × 46% N =
 *   9.2 kg N, about the 9 kg N in DAP).
 * - Default prices (dated, user-editable in the UI):
 *   DAP Rs 17,153 / 50 kg bag (PBS national retail average, week ended
 *   29 Oct 2026). TSP Rs 12,995 / bag (Manuchar retailer listing,
 *   Nov 2026; retailer listing, availability not guaranteed; the Engro
 *   listing at Rs 12,675 was out of stock). Urea Rs 4,750 / bag, the
 *   figure used in the report's equivalence arithmetic.
 *
 * Honesty rules encoded here, not just in copy:
 * - TSP is never presented as "better phosphorus": both options supply
 *   the same P2O5, and the comparison is cost-only.
 * - DAP's 9 kg N per bag is deducted automatically: the TSP option adds
 *   urea to match it (unless the user unchecks it, in which case the
 *   result flags the nitrogen shortfall instead of hiding it).
 */

export const BAG_KG = 50;
/** kg of P2O5 in one 50 kg bag of DAP or TSP (46%). */
export const P2O5_PER_BAG_KG = 23;
/** kg of nitrogen in one 50 kg bag of DAP (18%). */
export const N_PER_DAP_BAG_KG = 9;
/** kg of urea needed per bag of TSP to replace DAP's nitrogen. */
export const UREA_KG_PER_TSP_BAG = 20;
/** Urea nitrogen content (46%). */
export const UREA_N_PCT = 46;
/** kg of nitrogen supplied by 20 kg of urea (20 × 0.46). */
export const N_FROM_UREA_PER_TSP_BAG_KG = 9.2;

/** PBS national retail average, week ended 29 Oct 2026. */
export const DEFAULT_DAP_PRICE_RS = 17153;
/** Manuchar retailer listing, Nov 2026. Availability not guaranteed. */
export const DEFAULT_TSP_PRICE_RS = 12995;
/** Engro retailer listing, Nov 2026, shown as out of stock. */
export const TSP_OUT_OF_STOCK_PRICE_RS = 12675;
/** Urea price used in the report's equivalence arithmetic. */
export const DEFAULT_UREA_PRICE_RS = 4750;

export const MAX_BAGS = 10000;
export const MAX_PRICE_RS = 1000000;

export interface DapTspInput {
  /** Bags of DAP planned (also the number of TSP bags in the TSP option). */
  bags: number;
  dapPriceRs: number;
  tspPriceRs: number;
  ureaPriceRs: number;
  /** When false, the TSP option is priced without urea and the N shortfall is flagged. */
  includeUrea: boolean;
}

export interface DapTspOption {
  bags: number;
  /** kg of urea needed (TSP option only). */
  ureaKg: number;
  /** 50 kg bags of urea (TSP option only). */
  ureaBags: number;
  costRs: number;
  p2o5Kg: number;
  nKg: number;
  costPerKgP2O5: number;
}

export interface DapTspResult {
  bags: number;
  p2o5Kg: number;
  dap: DapTspOption;
  tsp: DapTspOption;
  /** dap.costRs - tsp.costRs. Positive means the TSP route is cheaper. */
  differenceRs: number;
  cheaper: "dap" | "tsp" | "equal";
  /** kg of nitrogen missing when the TSP option runs without urea. */
  nShortfallKg: number;
}

/** Cost of one kg of P2O5 from a 50 kg bag at the given price. Null when the price is invalid. */
export function costPerKgP2O5(priceRsPerBag: number): number | null {
  if (!Number.isFinite(priceRsPerBag) || priceRsPerBag <= 0) return null;
  return priceRsPerBag / P2O5_PER_BAG_KG;
}

/** Bags of DAP (or TSP) that supply the given kg of P2O5. Null when invalid. */
export function bagsFromP2O5(p2o5Kg: number): number | null {
  if (!Number.isFinite(p2o5Kg) || p2o5Kg <= 0 || p2o5Kg > MAX_BAGS * P2O5_PER_BAG_KG) return null;
  return p2o5Kg / P2O5_PER_BAG_KG;
}

export function validateBags(bags: number): "not_positive" | "too_large" | "not_a_number" | null {
  if (!Number.isFinite(bags)) return "not_a_number";
  if (bags <= 0) return "not_positive";
  if (bags > MAX_BAGS) return "too_large";
  return null;
}

export function validateP2O5(p2o5Kg: number): "not_positive" | "too_large" | "not_a_number" | null {
  if (!Number.isFinite(p2o5Kg)) return "not_a_number";
  if (p2o5Kg <= 0) return "not_positive";
  if (p2o5Kg > MAX_BAGS * P2O5_PER_BAG_KG) return "too_large";
  return null;
}

export function validatePrice(priceRs: number): "not_positive" | "too_large" | "not_a_number" | null {
  if (!Number.isFinite(priceRs)) return "not_a_number";
  if (priceRs <= 0) return "not_positive";
  if (priceRs > MAX_PRICE_RS) return "too_large";
  return null;
}

/**
 * Compare buying `bags` of DAP against buying the same number of TSP bags
 * plus the urea needed to match DAP's nitrogen. Returns null on any
 * invalid input.
 */
export function convertDapTsp(input: DapTspInput): DapTspResult | null {
  const { bags, dapPriceRs, tspPriceRs, ureaPriceRs, includeUrea } = input;
  if (validateBags(bags) !== null) return null;
  if (validatePrice(dapPriceRs) !== null) return null;
  if (validatePrice(tspPriceRs) !== null) return null;
  if (validatePrice(ureaPriceRs) !== null) return null;

  const p2o5Kg = bags * P2O5_PER_BAG_KG;
  const dapCost = bags * dapPriceRs;
  const ureaKg = includeUrea ? bags * UREA_KG_PER_TSP_BAG : 0;
  const ureaBags = ureaKg / BAG_KG;
  const tspCost = bags * tspPriceRs + ureaKg * (ureaPriceRs / BAG_KG);
  const differenceRs = dapCost - tspCost;
  const cheaper: DapTspResult["cheaper"] =
    Math.abs(differenceRs) < 0.5 ? "equal" : differenceRs > 0 ? "tsp" : "dap";

  return {
    bags,
    p2o5Kg,
    dap: {
      bags,
      ureaKg: 0,
      ureaBags: 0,
      costRs: dapCost,
      p2o5Kg,
      nKg: bags * N_PER_DAP_BAG_KG,
      costPerKgP2O5: dapPriceRs / P2O5_PER_BAG_KG,
    },
    tsp: {
      bags,
      ureaKg,
      ureaBags,
      costRs: tspCost,
      p2o5Kg,
      nKg: includeUrea ? bags * N_FROM_UREA_PER_TSP_BAG_KG : 0,
      costPerKgP2O5: tspPriceRs / P2O5_PER_BAG_KG,
    },
    differenceRs,
    cheaper,
    nShortfallKg: includeUrea ? 0 : bags * N_PER_DAP_BAG_KG,
  };
}

/** Whole rupees with thousands separators (Rs 17,153). */
export function formatRs(n: number): string {
  return `Rs ${Math.round(n).toLocaleString("en-US")}`;
}

/** Round to at most 2 decimals and trim trailing zeros. */
export function formatNum(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? String(r) : String(r);
}
