/**
 * Automated tests for src/lib/geoArea.ts (geodesic polygon area).
 *
 * Run: npx tsc scripts/geo-area-tests.ts src/lib/geoArea.ts \
 *        --outDir /tmp/geotest --module commonjs --target es2020 --skipLibCheck \
 *      && node /tmp/geotest/scripts/geo-area-tests.js
 *
 * The lib is dependency-free so it compiles standalone.
 *
 * Independent check: a 100 m × 100 m square at the equator must measure
 * ≈ 10,000 m². Degree lengths used below are WGS84 values (independent of
 * the spherical formula under test):
 *   1° latitude at equator  ≈ 110,574.39 m
 *   1° longitude at equator ≈ 111,319.49 m
 */
import {
  sphericalPolygonAreaSqM,
  polygonPerimeterM,
  isValidLatLon,
  type LatLon,
} from "../src/lib/geoArea";

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
  if (actual === null) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL ${name}: expected null, got ${actual}`);
  }
}

function isTrue(actual: boolean, name: string) {
  if (actual) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL ${name}: expected true`);
  }
}

// 1-hectare square at the equator (0°, 0° corner).
const DLON = 100 / 111319.49; // 100 m of longitude at equator, degrees
const DLAT = 100 / 110574.39; // 100 m of latitude at equator, degrees
const hectare: LatLon[] = [
  { lat: 0, lon: 0 },
  { lat: 0, lon: DLON },
  { lat: DLAT, lon: DLON },
  { lat: DLAT, lon: 0 },
];

approx(sphericalPolygonAreaSqM(hectare), 10000, 100, "1-ha square at equator ≈ 10,000 m²");

// Winding order must not matter.
approx(
  sphericalPolygonAreaSqM([...hectare].reverse()),
  10000,
  100,
  "reversed winding gives same area"
);

// Same square at 45°N: longitude degrees are shorter there, but the
// geodesic formula must still return ≈ 10,000 m² (a planar degrees²
// calculation would be wrong here — this is the regression test for
// the "never naive flat geometry" rule).
const COS45 = Math.cos((45 * Math.PI) / 180);
const hectare45: LatLon[] = [
  { lat: 45, lon: 0 },
  { lat: 45, lon: DLON / COS45 },
  { lat: 45 + DLAT, lon: DLON / COS45 },
  { lat: 45 + DLAT, lon: 0 },
];
approx(sphericalPolygonAreaSqM(hectare45), 10000, 150, "1-ha square at 45°N ≈ 10,000 m²");

// Right triangle, 100 m legs at equator → 5,000 m².
const tri: LatLon[] = [
  { lat: 0, lon: 0 },
  { lat: 0, lon: DLON },
  { lat: DLAT, lon: 0 },
];
approx(sphericalPolygonAreaSqM(tri), 5000, 75, "right triangle 100 m legs ≈ 5,000 m²");

// Perimeter of the 1-ha square ≈ 400 m.
approx(polygonPerimeterM(hectare), 400, 2, "1-ha square perimeter ≈ 400 m");

// Degenerate inputs.
isNull(sphericalPolygonAreaSqM([]), "empty polygon → null");
isNull(sphericalPolygonAreaSqM([{ lat: 0, lon: 0 }]), "1 point → null");
isNull(
  sphericalPolygonAreaSqM([
    { lat: 0, lon: 0 },
    { lat: 0, lon: DLON },
  ]),
  "2 points → null"
);
isNull(
  sphericalPolygonAreaSqM([
    { lat: 0, lon: 0 },
    { lat: 0, lon: DLON },
    { lat: 91, lon: 0 },
  ]),
  "invalid latitude → null"
);
isNull(
  sphericalPolygonAreaSqM([
    { lat: 0, lon: 0 },
    { lat: 0, lon: DLON },
    { lat: DLAT, lon: 200 },
  ]),
  "invalid longitude → null"
);

// Validation helper.
isTrue(isValidLatLon({ lat: 31.5, lon: 74.3 }), "Lahore coords valid");
isTrue(!isValidLatLon({ lat: -91, lon: 0 }), "lat -91 invalid");
isTrue(!isValidLatLon({ lat: 0, lon: 181 }), "lon 181 invalid");
isTrue(!isValidLatLon({ lat: NaN, lon: 0 }), "NaN invalid");

console.log(`\ngeo-area tests: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
