/**
 * Automated tests for src/lib/landArea.ts (formula correctness).
 *
 * Run: npx tsc scripts/land-area-tests.ts src/lib/landArea.ts \
 *        --outDir /tmp/landtest --module commonjs --target es2020 --skipLibCheck \
 *      && node /tmp/landtest/scripts/land-area-tests.js
 *
 * The lib is dependency-free so it compiles standalone.
 */
import {
  rectAreaSqM,
  squareAreaSqM,
  triangleAreaSqM,
  trapezoidAreaSqM,
  heronArea,
  quadAreaWithDiagonal,
  quadAreaApprox,
  convertArea,
  toSqM,
  fromSqM,
  lengthToMeter,
  sectionAreaSqM,
  validateDimension,
  areaUnitsForCountry,
  type LandSection,
} from "../src/lib/landArea";

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

/* Rectangle */
approx(rectAreaSqM(100, "m", 50, "m"), 5000, 1e-9, "rect 100x50 m");
approx(rectAreaSqM(100, "ft", 50, "ft"), 5000 * 0.09290304, 1e-6, "rect 100x50 ft");
approx(rectAreaSqM(100, "m", 50, "ft"), 100 * 50 * 0.3048, 1e-9, "rect mixed units m/ft");
isNull(rectAreaSqM(-5, "m", 50, "m"), "rect negative rejected");
isNull(rectAreaSqM(0, "m", 50, "m"), "rect zero rejected");
isNull(rectAreaSqM(NaN, "m", 50, "m"), "rect NaN rejected");
isNull(rectAreaSqM(100, "m", 50, "furlong"), "rect unknown unit rejected");

/* Square / triangle / trapezoid */
approx(squareAreaSqM(10, "m"), 100, 1e-9, "square 10m");
approx(triangleAreaSqM(10, 4, "m"), 20, 1e-9, "triangle 1/2*b*h");
approx(trapezoidAreaSqM(10, 6, 4, "m"), 32, 1e-9, "trapezoid ((a+b)/2)*h");

/* Heron */
approx(heronArea(3, 4, 5), 6, 1e-9, "heron 3-4-5 = 6");
isNull(heronArea(1, 2, 10), "heron impossible triangle rejected");
isNull(heronArea(2, 2, 4), "heron degenerate rejected");

/* Quad with diagonal: rectangle 3x4 split by diagonal 5 -> 12 */
approx(quadAreaWithDiagonal(3, 4, 3, 4, 5, "m"), 12, 1e-9, "quad+diagonal rectangle 3x4");
isNull(quadAreaWithDiagonal(3, 4, 3, 4, 50, "m"), "quad+diagonal impossible rejected");

/* Quad approx: clearly labeled, math check on a rectangle */
approx(quadAreaApprox(10, 20, 10, 20, "m"), 200, 1e-9, "quad approx rectangle");

/* Conversions */
approx(convertArea(1, "acre", "hectare"), 0.40468564224, 1e-9, "1 acre -> ha");
approx(convertArea(1, "hectare", "acre"), 2.47105381, 1e-6, "1 ha -> acre");
approx(convertArea(1, "kanal", "marla"), 20, 1e-9, "1 kanal = 20 marla");
approx(convertArea(1, "marla", "sqft"), 272.25, 1e-9, "1 marla = 272.25 sqft");
approx(convertArea(1, "kanal", "sqyd"), 605, 1e-9, "1 kanal = 605 sqyd");
approx(convertArea(43560, "sqft", "acre"), 1, 1e-9, "43560 sqft = 1 acre");
approx(toSqM(1, "acre"), 4046.8564224, 1e-9, "toSqM acre");
approx(fromSqM(10000, "hectare"), 1, 1e-9, "fromSqM hectare");
isNull(convertArea(1, "acre", "bigha"), "unknown target unit rejected");
isNull(lengthToMeter(1, "cubit"), "unknown length unit rejected");

/* Country units: PK gets kanal/marla; others universal only */
isTrue(areaUnitsForCountry("PK").some((u) => u.id === "kanal"), "PK has kanal");
isTrue(areaUnitsForCountry("PK").some((u) => u.id === "marla"), "PK has marla");
isTrue(!areaUnitsForCountry("IN").some((u) => u.id === "kanal"), "IN has no kanal");
isTrue(!areaUnitsForCountry("US").some((u) => u.id === "marla"), "US has no marla");
isTrue(areaUnitsForCountry("INTL").every((u) => u.kind === "universal"), "INTL universal only");

/* Sections */
const sec: LandSection = { id: "s1", name: "A", shape: "rectangle", dims: [100, 50], unit: "m" };
approx(sectionAreaSqM(sec), 5000, 1e-9, "section rectangle");
approx(
  sectionAreaSqM({ id: "s2", name: "B", shape: "trapezoid", dims: [10, 6, 4], unit: "m" }),
  32,
  1e-9,
  "section trapezoid"
);
isNull(sectionAreaSqM({ id: "s3", name: "C", shape: "rectangle", dims: [100], unit: "m" }), "section missing dim");

/* Validation */
isTrue(validateDimension(5) === null, "valid dimension");
isTrue(validateDimension(-1) === "not_positive", "negative dimension");
isTrue(validateDimension(Infinity) === "not_a_number", "infinity rejected");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
