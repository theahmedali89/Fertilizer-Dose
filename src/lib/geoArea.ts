/**
 * Geodesic polygon area for the Map Area Calculator.
 *
 * PURE + DEPENDENCY-FREE: no imports, so the math can be unit-tested by
 * compiling this single file with tsc and running node assertions against
 * it (see scripts/geo-area-tests.ts).
 *
 * Method: spherical-excess polygon area (Chamberlain & Duquette, JPL
 * Publication 07-03, "Some Algorithms for Polygons on a Sphere"):
 *
 *   A = |R²/2 · Σ (λ₂ − λ₁) · (2 + sin φ₁ + sin φ₂)|
 *
 * over consecutive vertex pairs (λ = longitude, φ = latitude, radians).
 * This is exact for a sphere of radius R. Using the IUGG mean Earth radius
 * (6371008.8 m), the sphere-vs-WGS84-ellipsoid difference is < 0.3% for the
 * small polygons this tool targets (fields, plots, gardens) — far below
 * the uncertainty of hand-placed map points, and the UI never claims
 * survey-grade accuracy.
 *
 * NEVER use naive flat-pixel/planar geometry for map polygons: degrees of
 * longitude shrink with latitude, so a planar calculation silently
 * under-measures away from the equator.
 */

/** IUGG mean Earth radius, meters. */
export const EARTH_RADIUS_M = 6371008.8;

export interface LatLon {
  lat: number;
  lon: number;
}

export function isValidLatLon(p: LatLon): boolean {
  return (
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lon) &&
    p.lat >= -90 &&
    p.lat <= 90 &&
    p.lon >= -180 &&
    p.lon <= 180
  );
}

/**
 * Geodesic area of a closed polygon in square meters.
 * Returns null when the polygon cannot form an area (< 3 valid points).
 * Winding order does not matter (absolute value is taken).
 */
export function sphericalPolygonAreaSqM(points: LatLon[]): number | null {
  if (!Array.isArray(points) || points.length < 3) return null;
  if (!points.every(isValidLatLon)) return null;

  const d2r = Math.PI / 180;
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const lon1 = p1.lon * d2r;
    const lon2 = p2.lon * d2r;
    const lat1 = p1.lat * d2r;
    const lat2 = p2.lat * d2r;
    total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  const area =
    Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
  return Number.isFinite(area) ? area : null;
}

/**
 * Perimeter of the polygon in meters (great-circle segment sum).
 * Useful as a sanity display next to the area.
 */
export function polygonPerimeterM(points: LatLon[]): number | null {
  if (!Array.isArray(points) || points.length < 2) return null;
  if (!points.every(isValidLatLon)) return null;
  const d2r = Math.PI / 180;
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const dLat = (p2.lat - p1.lat) * d2r;
    const dLon = (p2.lon - p1.lon) * d2r;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(p1.lat * d2r) *
        Math.cos(p2.lat * d2r) *
        Math.sin(dLon / 2) ** 2;
    total += 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  return Number.isFinite(total) ? total : null;
}
