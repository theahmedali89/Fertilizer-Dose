/**
 * Automated tests for src/lib/dapTsp.ts (formula correctness).
 *
 * Run: npx tsc scripts/dap-tsp-tests.ts src/lib/dapTsp.ts \
 *        --outDir /tmp/daptsp-test --module commonjs --target es2020 --skipLibCheck \
 *      && node /tmp/daptsp-test/scripts/dap-tsp-tests.js
 *
 * The lib is dependency-free so it compiles standalone.
 *
 * Reference figures (research report 2026-11-06):
 * - 1 bag DAP = 23 kg P2O5 + 9 kg N; 1 bag TSP = 23 kg P2O5 + 0 kg N.
 * - 1 bag TSP + 20 kg urea (9.2 kg N) = 1 bag DAP in N + P.
 * - DAP Rs 17,153/bag (PBS, wk ended 29 Oct 2026) => Rs 746/kg P2O5.
 * - TSP Rs 12,995/bag => Rs 565/kg P2O5; TSP + 20 kg urea at
 *   Rs 4,750/bag urea => Rs 14,895 per DAP-equivalent bag.
 */
import {
  BAG_KG,
  P2O5_PER_BAG_KG,
  N_PER_DAP_BAG_KG,
  UREA_KG_PER_TSP_BAG,
  N_FROM_UREA_PER_TSP_BAG_KG,
  DEFAULT_DAP_PRICE_RS,
  DEFAULT_TSP_PRICE_RS,
  DEFAULT_UREA_PRICE_RS,
  costPerKgP2O5,
  bagsFromP2O5,
  convertDapTsp,
  validateBags,
  validateP2O5,
  validatePrice,
  formatRs,
} from "../src/lib/dapTsp";

let passed = 0;
let failed = 0;

function approx(actual: number | null, expected: number, tol: number, name: string) {
  if (actual === null || Math.abs(actual - expected) > tol) {
    failed++;
    console.error(`FAIL ${name}: got ${actual}, expected ${expected} ± ${tol}`);
  } else {
    passed++;
  }
}

function isNull(actual: unknown, name: string) {
  if (actual !== null) {
    failed++;
    console.error(`FAIL ${name}: expected null, got ${actual}`);
  } else {
    passed++;
  }
}

function isTrue(cond: boolean, name: string) {
  if (!cond) {
    failed++;
    console.error(`FAIL ${name}`);
  } else {
    passed++;
  }
}

function isEqual(actual: unknown, expected: unknown, name: string) {
  if (actual !== expected) {
    failed++;
    console.error(`FAIL ${name}: got ${actual}, expected ${expected}`);
  } else {
    passed++;
  }
}

/* Constants */
isEqual(P2O5_PER_BAG_KG, 23, "23 kg P2O5 per bag");
isEqual(N_PER_DAP_BAG_KG, 9, "9 kg N per DAP bag");
isEqual(UREA_KG_PER_TSP_BAG, 20, "20 kg urea per TSP bag");
approx(N_FROM_UREA_PER_TSP_BAG_KG, 9.2, 1e-9, "20 kg urea = 9.2 kg N");
isEqual(BAG_KG, 50, "50 kg bag");

/* Cost per kg P2O5 (report arithmetic) */
approx(costPerKgP2O5(17153), 745.78, 0.01, "DAP PBS Rs 17,153 => Rs 746/kg P2O5");
approx(costPerKgP2O5(16055), 698.04, 0.01, "DAP company Rs 16,055 => Rs 698/kg P2O5");
approx(costPerKgP2O5(12675), 551.09, 0.01, "TSP Rs 12,675 => Rs 551/kg P2O5");
approx(costPerKgP2O5(12995), 565, 0.01, "TSP Rs 12,995 => Rs 565/kg P2O5");
isNull(costPerKgP2O5(0), "zero price rejected");
isNull(costPerKgP2O5(-100), "negative price rejected");

/* Bags from P2O5 */
approx(bagsFromP2O5(23), 1, 1e-9, "23 kg P2O5 = 1 bag");
approx(bagsFromP2O5(46), 2, 1e-9, "46 kg P2O5 = 2 bags");
approx(bagsFromP2O5(34.5), 1.5, 1e-9, "34.5 kg P2O5 = 1.5 bags");
isNull(bagsFromP2O5(0), "zero P2O5 rejected");
isNull(bagsFromP2O5(-10), "negative P2O5 rejected");

/* 1-bag comparison at default prices */
const one = convertDapTsp({
  bags: 1,
  dapPriceRs: DEFAULT_DAP_PRICE_RS,
  tspPriceRs: DEFAULT_TSP_PRICE_RS,
  ureaPriceRs: DEFAULT_UREA_PRICE_RS,
  includeUrea: true,
});
isTrue(one !== null, "1-bag conversion returns a result");
if (one) {
  approx(one.p2o5Kg, 23, 1e-9, "1 bag supplies 23 kg P2O5");
  approx(one.dap.costRs, 17153, 1e-9, "DAP cost 1 bag = Rs 17,153");
  approx(one.dap.nKg, 9, 1e-9, "DAP supplies 9 kg N");
  approx(one.tsp.ureaKg, 20, 1e-9, "TSP option needs 20 kg urea");
  approx(one.tsp.ureaBags, 0.4, 1e-9, "20 kg urea = 0.4 bags");
  approx(one.tsp.costRs, 12995 + 20 * (4750 / 50), 1e-9, "TSP+urea cost = 12,995 + 1,900");
  approx(one.tsp.costRs, 14895, 1e-9, "TSP+urea cost Rs 14,895 (report figure)");
  approx(one.tsp.nKg, 9.2, 1e-9, "TSP+urea supplies 9.2 kg N");
  approx(one.differenceRs, 17153 - 14895, 1e-9, "saving Rs 2,258 per bag");
  isEqual(one.cheaper, "tsp", "TSP route cheaper at default prices");
  isEqual(one.nShortfallKg, 0, "no N shortfall with urea");
}

/* TSP at the out-of-stock Engro price */
const engro = convertDapTsp({
  bags: 1,
  dapPriceRs: 17153,
  tspPriceRs: 12675,
  ureaPriceRs: 4750,
  includeUrea: true,
});
if (engro) {
  approx(engro.tsp.costRs, 12675 + 1900, 1e-9, "Engro TSP+urea = Rs 14,575 (report figure)");
  approx(engro.differenceRs, 17153 - 14575, 1e-9, "saving Rs 2,578 at Engro price");
}

/* 10 bags scale linearly */
const ten = convertDapTsp({
  bags: 10,
  dapPriceRs: DEFAULT_DAP_PRICE_RS,
  tspPriceRs: DEFAULT_TSP_PRICE_RS,
  ureaPriceRs: DEFAULT_UREA_PRICE_RS,
  includeUrea: true,
});
if (ten) {
  approx(ten.dap.costRs, 171530, 1e-9, "10 bags DAP = Rs 171,530");
  approx(ten.tsp.costRs, 148950, 1e-9, "10 bags TSP+urea = Rs 148,950");
  approx(ten.differenceRs, 22580, 1e-9, "10-bag saving Rs 22,580");
  approx(ten.tsp.ureaKg, 200, 1e-9, "10 bags need 200 kg urea");
}

/* Without urea: cheaper on paper, flagged N shortfall */
const noUrea = convertDapTsp({
  bags: 2,
  dapPriceRs: 17153,
  tspPriceRs: 12995,
  ureaPriceRs: 4750,
  includeUrea: false,
});
if (noUrea) {
  approx(noUrea.tsp.costRs, 2 * 12995, 1e-9, "TSP-only cost has no urea");
  approx(noUrea.tsp.nKg, 0, 1e-9, "TSP-only supplies 0 kg N");
  approx(noUrea.nShortfallKg, 18, 1e-9, "2 bags short 18 kg N without urea");
  isEqual(noUrea.cheaper, "tsp", "TSP-only still cheaper on paper (flagged, not hidden)");
}

/* Expensive TSP flips the winner to DAP */
const pricey = convertDapTsp({
  bags: 1,
  dapPriceRs: 16000,
  tspPriceRs: 16000,
  ureaPriceRs: 4750,
  includeUrea: true,
});
if (pricey) {
  isEqual(pricey.cheaper, "dap", "equal bag prices => DAP wins (urea adds cost)");
  approx(pricey.differenceRs, 16000 - (16000 + 1900), 1e-9, "DAP cheaper by Rs 1,900");
}

/* Equal costs */
const equal = convertDapTsp({
  bags: 1,
  dapPriceRs: 14895,
  tspPriceRs: 12995,
  ureaPriceRs: 4750,
  includeUrea: true,
});
if (equal) {
  isEqual(equal.cheaper, "equal", "identical totals => equal");
  approx(equal.differenceRs, 0, 1e-9, "zero difference");
}

/* Validation */
isNull(
  convertDapTsp({ bags: 0, dapPriceRs: 17153, tspPriceRs: 12995, ureaPriceRs: 4750, includeUrea: true }),
  "zero bags rejected"
);
isNull(
  convertDapTsp({ bags: -2, dapPriceRs: 17153, tspPriceRs: 12995, ureaPriceRs: 4750, includeUrea: true }),
  "negative bags rejected"
);
isNull(
  convertDapTsp({ bags: 1, dapPriceRs: 0, tspPriceRs: 12995, ureaPriceRs: 4750, includeUrea: true }),
  "zero DAP price rejected"
);
isNull(
  convertDapTsp({ bags: 1, dapPriceRs: 17153, tspPriceRs: -5, ureaPriceRs: 4750, includeUrea: true }),
  "negative TSP price rejected"
);
isTrue(validateBags(1.5) === null, "fractional bags valid");
isTrue(validateBags(0) === "not_positive", "bags zero => not_positive");
isTrue(validateBags(10001) === "too_large", "bags over cap => too_large");
isTrue(validateBags(NaN) === "not_a_number", "bags NaN => not_a_number");
isTrue(validateP2O5(23) === null, "valid P2O5");
isTrue(validatePrice(4750) === null, "valid price");

/* Formatting */
isEqual(formatRs(17153), "Rs 17,153", "formatRs groups thousands");
isEqual(formatRs(14895.4), "Rs 14,895", "formatRs rounds");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
