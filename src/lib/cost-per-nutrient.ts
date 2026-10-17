/**
 * Cost-per-nutrient logic for the Fertilizer Cost Calculator.
 *
 * Compares any product's true cost per kg of nutrient (N, P2O5, K2O)
 * against standard benchmark products, so farmers can spot overpriced
 * liquid/specialty fertilizers instantly.
 */

export type Nutrient = "n" | "p" | "k";

export interface ReferenceProduct {
  id: string;
  name: string;
  bagKg: number;
  priceRs: number;
  n: number; // % N
  p2o5: number; // % P2O5
  k2o: number; // % K2O
}

export const DEFAULT_REFERENCE_PRODUCTS: ReferenceProduct[] = [
  { id: "dap", name: "DAP", bagKg: 50, priceRs: 14000, n: 18, p2o5: 46, k2o: 0 },
  { id: "urea", name: "Urea", bagKg: 50, priceRs: 4500, n: 46, p2o5: 0, k2o: 0 },
  { id: "sop", name: "SOP", bagKg: 50, priceRs: 12000, n: 0, p2o5: 0, k2o: 50 },
  { id: "mop", name: "MOP", bagKg: 50, priceRs: 8000, n: 0, p2o5: 0, k2o: 60 },
  { id: "ssp", name: "SSP", bagKg: 50, priceRs: 5500, n: 0, p2o5: 16, k2o: 0 },
  { id: "np", name: "Nitrophos (NP)", bagKg: 50, priceRs: 11000, n: 22, p2o5: 20, k2o: 0 },
];

/** Cost per kg of a given nutrient from a reference product. Returns null if the product has none of it. */
export function costPerKgNutrient(
  product: ReferenceProduct,
  nutrient: Nutrient
): number | null {
  const pct = nutrient === "n" ? product.n : nutrient === "p" ? product.p2o5 : product.k2o;
  if (pct <= 0) return null;
  const nutrientKg = (product.bagKg * pct) / 100;
  if (nutrientKg <= 0) return null;
  return product.priceRs / nutrientKg;
}

/** Cheapest Rs/kg for a nutrient across reference products, plus which product sets it. */
export function benchmark(
  refs: ReferenceProduct[],
  nutrient: Nutrient
): { costPerKg: number; productName: string } | null {
  let best: { costPerKg: number; productName: string } | null = null;
  for (const r of refs) {
    const c = costPerKgNutrient(r, nutrient);
    if (c != null && (best == null || c < best.costPerKg)) {
      best = { costPerKg: c, productName: r.name };
    }
  }
  return best;
}

export interface UserProduct {
  name: string;
  /** Pack size in kg. For liters we treat 1 L ≈ 1 kg (noted in UI). */
  weightKg: number;
  priceRs: number;
  nPct: number;
  pPct: number;
  kPct: number;
}

export interface NutrientResult {
  nutrient: Nutrient;
  nutrientKg: number;
  costPerKg: number;
  benchmarkCostPerKg: number;
  benchmarkProduct: string;
  /** ratio of this product's cost vs cheapest standard option */
  ratio: number;
}

export type Verdict = "good" | "pricier" | "expensive";

export interface CostAnalysis {
  results: NutrientResult[];
  verdict: Verdict;
  worstRatio: number;
  worstNutrient: NutrientResult | null;
}

export function analyzeProduct(
  product: UserProduct,
  refs: ReferenceProduct[]
): CostAnalysis | null {
  const nutrients: Nutrient[] = [];
  if (product.nPct > 0) nutrients.push("n");
  if (product.pPct > 0) nutrients.push("p");
  if (product.kPct > 0) nutrients.push("k");
  if (nutrients.length === 0 || product.weightKg <= 0 || product.priceRs <= 0) return null;

  const results: NutrientResult[] = [];
  for (const nut of nutrients) {
    const pct = nut === "n" ? product.nPct : nut === "p" ? product.pPct : product.kPct;
    const nutrientKg = (product.weightKg * pct) / 100;
    if (nutrientKg <= 0) continue;
    const bm = benchmark(refs, nut);
    if (!bm) continue;
    const costPerKg = product.priceRs / nutrientKg;
    results.push({
      nutrient: nut,
      nutrientKg,
      costPerKg,
      benchmarkCostPerKg: bm.costPerKg,
      benchmarkProduct: bm.productName,
      ratio: costPerKg / bm.costPerKg,
    });
  }
  if (results.length === 0) return null;

  const worst = results.reduce((a, b) => (b.ratio > a.ratio ? b : a));
  const verdict: Verdict =
    worst.ratio <= 1.1 ? "good" : worst.ratio <= 1.5 ? "pricier" : "expensive";

  return { results, verdict, worstRatio: worst.ratio, worstNutrient: worst };
}

export function formatRs(n: number): string {
  return "Rs " + Math.round(n).toLocaleString("en-PK");
}
