/**
 * Land Area Calculator — core calculation engine.
 *
 * PURE + DEPENDENCY-FREE: no imports, so the math can be unit-tested by
 * compiling this single file with tsc and running node assertions against it
 * (see scripts/land-area-tests.ts).
 *
 * Design rules (from the approved master prompt):
 * - Canonical internal unit: SQUARE METERS for area, METERS for length.
 *   Every input is normalized to canonical first; conversions go
 *   canonical -> target (no chained conversions, no accumulated error).
 * - Four side lengths ALONE do not determine a quadrilateral's area.
 *   quadAreaApprox() exists ONLY as an explicitly-labeled approximation with
 *   a warning; quadAreaWithDiagonal() is the exact method (two triangles).
 * - No invented local conversions: regional units ship ONLY with a verified
 *   conversion + source. Unverified => the unit is not offered.
 * - Precision is honest: results are rounded to sensible decimals and never
 *   imply survey-grade accuracy.
 */

/* ------------------------------------------------------------------ */
/* Length units (exact definitions)                                    */
/* ------------------------------------------------------------------ */

export interface LengthUnit {
  id: string;
  label: string;
  symbol: string;
  /** meters per one unit */
  toMeter: number;
}

export const LENGTH_UNITS: LengthUnit[] = [
  { id: "mm", label: "Millimeter", symbol: "mm", toMeter: 0.001 },
  { id: "cm", label: "Centimeter", symbol: "cm", toMeter: 0.01 },
  { id: "m", label: "Meter", symbol: "m", toMeter: 1 },
  { id: "km", label: "Kilometer", symbol: "km", toMeter: 1000 },
  { id: "in", label: "Inch", symbol: "in", toMeter: 0.0254 },
  { id: "ft", label: "Foot", symbol: "ft", toMeter: 0.3048 },
  { id: "yd", label: "Yard", symbol: "yd", toMeter: 0.9144 },
];

/* ------------------------------------------------------------------ */
/* Area units                                                          */
/*                                                                     */
/* Universal units use exact SI/imperial definitions. Regional units   */
/* ship ONLY when verified with a citable source.                      */
/*                                                                     */
/* Pakistan (Punjab revenue standard — Board of Revenue convention):   */
/*   1 karam = 5.5 ft; 1 marla = 9 sq karam = 272.25 sq ft;             */
/*   1 kanal = 20 marla = 5,445 sq ft = 605 sq yd.                      */
/*   NOTE: housing schemes sometimes use 250 or 225 sq ft marla — the   */
/*   revenue standard above is the calculator default and the variation */
/*   is disclosed in the UI.                                           */
/* ------------------------------------------------------------------ */

export interface AreaUnit {
  id: string;
  label: string;
  symbol: string;
  /** square meters per one unit */
  toSqM: number;
  kind: "universal" | "regional";
  /** ISO country code when kind === "regional" */
  country?: string;
  /** state/province the unit applies to, e.g. "Uttar Pradesh" (regional only) */
  region?: string;
  /** which convention, e.g. "Punjab revenue standard" */
  standard?: string;
  verified: boolean;
  source?: string;
}

const SQFT_TO_SQM = 0.09290304; // exact

export const AREA_UNITS: AreaUnit[] = [
  { id: "sqm", label: "Square meter", symbol: "m²", toSqM: 1, kind: "universal", verified: true },
  { id: "sqkm", label: "Square kilometer", symbol: "km²", toSqM: 1_000_000, kind: "universal", verified: true },
  { id: "sqft", label: "Square foot", symbol: "ft²", toSqM: SQFT_TO_SQM, kind: "universal", verified: true },
  { id: "sqyd", label: "Square yard", symbol: "yd²", toSqM: 0.83612736, kind: "universal", verified: true },
  { id: "acre", label: "Acre", symbol: "ac", toSqM: 4046.8564224, kind: "universal", verified: true },
  { id: "hectare", label: "Hectare", symbol: "ha", toSqM: 10000, kind: "universal", verified: true },
  {
    id: "marla",
    label: "Marla",
    symbol: "marla",
    toSqM: 272.25 * SQFT_TO_SQM,
    kind: "regional",
    country: "PK",
    standard: "Punjab revenue standard (1 marla = 272.25 sq ft)",
    verified: true,
    source: "Punjab Board of Revenue convention (1 karam = 5.5 ft; 1 marla = 9 sq karam)",
  },
  {
    id: "kanal",
    label: "Kanal",
    symbol: "kanal",
    toSqM: 5445 * SQFT_TO_SQM,
    kind: "regional",
    country: "PK",
    standard: "Punjab revenue standard (1 kanal = 20 marla = 5,445 sq ft)",
    verified: true,
    source: "Punjab Board of Revenue convention (1 kanal = 20 marla)",
  },
  // ── India: STATE-SPECIFIC units (no universal Bigha). ─────────────────
  // Uttar Pradesh — pucca/revenue standard (Ilahi-gaz system).
  {
    id: "bigha-up", label: "Bigha (UP)", symbol: "bigha", toSqM: 2529.285264,
    kind: "regional", country: "IN", region: "Uttar Pradesh",
    standard: "UP revenue (pucca) standard — 3025 sq yd (60×60 Ilahi guz); 1 bigha = 20 biswa",
    verified: true,
    source: "Rowlett 'How Many?' gazetteer, citing Prinsep 1834 / Wilson 1855",
  },
  {
    id: "biswa-up", label: "Biswa (UP)", symbol: "biswa", toSqM: 126.464263,
    kind: "regional", country: "IN", region: "Uttar Pradesh",
    standard: "1/20 bigha = 151.25 sq yd = 1361.25 sq ft",
    verified: true,
    source: "PLRonline revenue terminology; Rowlett (derived)",
  },
  {
    id: "biswansi-up", label: "Biswansi (UP)", symbol: "biswansi", toSqM: 6.323213,
    kind: "regional", country: "IN", region: "Uttar Pradesh",
    standard: "1/20 biswa = 68.0625 sq ft",
    verified: true,
    source: "PLRonline revenue terminology; Rowlett (derived)",
  },
  // Bihar — Patna survey standard.
  {
    id: "bigha-br", label: "Bigha (Bihar)", symbol: "bigha", toSqM: 2529.285264,
    kind: "regional", country: "IN", region: "Bihar",
    standard: "Patna survey standard — 3025 sq yd; 1 bigha = 20 katha",
    verified: true,
    source: "Rowlett gazetteer, citing Prinsep 1834",
  },
  {
    id: "katha-br", label: "Katha (Bihar)", symbol: "katha", toSqM: 126.464263,
    kind: "regional", country: "IN", region: "Bihar",
    standard: "1/20 bigha = 1361.25 sq ft; 1 katha = 20 dhur",
    verified: true,
    source: "Rowlett gazetteer",
  },
  {
    id: "dhur-br", label: "Dhur (Bihar)", symbol: "dhur", toSqM: 6.323213,
    kind: "regional", country: "IN", region: "Bihar",
    standard: "1/20 katha = 68.0625 sq ft; 1 dhur = 20 dhurki",
    verified: true,
    source: "Rowlett gazetteer",
  },
  {
    id: "dhurki-br", label: "Dhurki (Bihar)", symbol: "dhurki", toSqM: 0.316161,
    kind: "regional", country: "IN", region: "Bihar",
    standard: "1/20 dhur = 3.403125 sq ft",
    verified: true,
    source: "Rowlett gazetteer (derived)",
  },
  // West Bengal — colonial Bengal standard (shared with Bangladesh).
  {
    id: "bigha-wb", label: "Bigha (WB)", symbol: "bigha", toSqM: 1337.803776,
    kind: "regional", country: "IN", region: "West Bengal",
    standard: "Colonial Bengal standard — 1600 sq yd = 14,400 sq ft; 1 bigha = 20 katha = 33 decimal",
    verified: true,
    source: "Rowlett gazetteer; Asutosh College (Univ. of Calcutta) study material",
  },
  {
    id: "katha-wb", label: "Katha (WB)", symbol: "katha", toSqM: 66.890189,
    kind: "regional", country: "IN", region: "West Bengal",
    standard: "1/20 bigha = 720 sq ft; 1 katha = 16 chhatak",
    verified: true,
    source: "Rowlett gazetteer; Asutosh College study material",
  },
  {
    id: "chhatak-wb", label: "Chhatak (WB)", symbol: "chhatak", toSqM: 4.180637,
    kind: "regional", country: "IN", region: "West Bengal",
    standard: "1/16 katha = 45 sq ft",
    verified: true,
    source: "Asutosh College (Univ. of Calcutta) study material",
  },
  {
    id: "decimal-wb", label: "Decimal (WB)", symbol: "decimal", toSqM: 40.468564,
    kind: "regional", country: "IN", region: "West Bengal",
    standard: "1/100 acre = 435.6 sq ft (also used in Bihar)",
    verified: true,
    source: "Asutosh College study material; GOI NIC LRISD (Jharkhand dismil = 40.46 sq m)",
  },
  // Haryana — post-settlement standard (GOI NIC LRISD).
  {
    id: "kanal-hr", label: "Kanal (Haryana)", symbol: "kanal", toSqM: 505.857053,
    kind: "regional", country: "IN", region: "Haryana",
    standard: "Post-settlement standard — 605 sq yd = 5,445 sq ft; 1 kanal = 20 marla; 8 kanal = 1 acre",
    verified: true,
    source: "GOI NIC LRISD 'Standard Classification for AREA UNIT/EXTENT' Table 2.7.3",
  },
  {
    id: "marla-hr", label: "Marla (Haryana)", symbol: "marla", toSqM: 25.292853,
    kind: "regional", country: "IN", region: "Haryana",
    standard: "1/20 kanal = 272.25 sq ft = 9 sarsahi",
    verified: true,
    source: "GOI NIC LRISD Table 2.7.3",
  },
  {
    id: "sarsahi-hr", label: "Sarsahi (Haryana)", symbol: "sarsahi", toSqM: 2.810317,
    kind: "regional", country: "IN", region: "Haryana",
    standard: "1 karam² (66-inch karam) = 30.25 sq ft; 9 sarsahi = 1 marla",
    verified: true,
    source: "GOI NIC LRISD Table 2.7.3",
  },
  // Rajasthan — jarib systems (GOI NIC LRISD).
  {
    id: "bigha-rj-pucca", label: "Bigha (Rajasthan, pucca)", symbol: "bigha", toSqM: 2529.285264,
    kind: "regional", country: "IN", region: "Rajasthan",
    standard: "Shahjahani jarib (165 ft)² = 27,225 sq ft; 1 bigha = 20 biswansi",
    verified: true,
    source: "GOI NIC LRISD Table 2.7.3",
  },
  {
    id: "bigha-rj-kachha", label: "Bigha (Rajasthan, kachha)", symbol: "bigha", toSqM: 1618.742569,
    kind: "regional", country: "IN", region: "Rajasthan",
    standard: "Gantari jarib (132 ft)² = 17,424 sq ft",
    verified: true,
    source: "GOI NIC LRISD Table 2.7.3; Rowlett (1618.7 sq m)",
  },
  {
    id: "biswansi-rj", label: "Biswansi (Rajasthan)", symbol: "biswansi", toSqM: 126.464263,
    kind: "regional", country: "IN", region: "Rajasthan",
    standard: "1/20 bigha = 1361.25 sq ft",
    verified: true,
    source: "GOI NIC LRISD Table 2.7.3",
  },
  // ── Bangladesh: national general standard = colonial Bengal system. ──
  {
    id: "bigha-bd", label: "Bigha", symbol: "bigha", toSqM: 1337.803776,
    kind: "regional", country: "BD",
    standard: "General standard — 20 katha = 1600 sq yd = 14,400 sq ft = 33 decimal (district variants exist)",
    verified: true,
    source: "Rowlett gazetteer (district table)",
  },
  {
    id: "katha-bd", label: "Katha", symbol: "katha", toSqM: 66.890189,
    kind: "regional", country: "BD",
    standard: "1/20 bigha = 720 sq ft = 1.65 decimal",
    verified: true,
    source: "Rowlett gazetteer",
  },
  {
    id: "chhatak-bd", label: "Chhatak", symbol: "chhatak", toSqM: 4.180637,
    kind: "regional", country: "BD",
    standard: "1/16 katha = 45 sq ft (Bengal system)",
    verified: true,
    source: "Asutosh College study material (Bengal system)",
  },
  {
    id: "decimal-bd", label: "Decimal (shotangsho)", symbol: "decimal", toSqM: 40.468564,
    kind: "regional", country: "BD",
    standard: "1/100 acre = 435.6 sq ft",
    verified: true,
    source: "Asutosh College study material",
  },
  // ── Brazil: alqueire regional variants (still in rural/commercial use). ─
  {
    id: "alqueire-paulista", label: "Alqueire paulista", symbol: "alq.", toSqM: 24200,
    kind: "regional", country: "BR", region: "São Paulo, Paraná",
    standard: "Alqueire paulista = 24,200 m²",
    verified: true,
    source: "Brazilian rural land-use reference (see research-landunits/west.md)",
  },
  {
    id: "alqueire-mineiro", label: "Alqueire mineiro", symbol: "alq.", toSqM: 48400,
    kind: "regional", country: "BR", region: "Minas Gerais, Goiás, Rio de Janeiro",
    standard: "Alqueire mineiro/goiano = 48,400 m²",
    verified: true,
    source: "Brazilian rural land-use reference (see research-landunits/west.md)",
  },
  {
    id: "alqueire-baiano", label: "Alqueire baiano", symbol: "alq.", toSqM: 96800,
    kind: "regional", country: "BR", region: "Bahia",
    standard: "Alqueire baiano = 96,800 m²",
    verified: true,
    source: "Brazilian rural land-use reference (see research-landunits/west.md)",
  },
  {
    id: "alqueire-norte", label: "Alqueire do norte", symbol: "alq.", toSqM: 27225,
    kind: "regional", country: "BR", region: "Northern Brazil",
    standard: "Alqueire do norte = 27,225 m² (dictionary value preferred)",
    verified: true,
    source: "Brazilian dictionary reference (see research-landunits/west.md)",
  },
  // ── Türkiye ───────────────────────────────────────────────────────────
  {
    id: "donum-tr", label: "Dönüm", symbol: "dönüm", toSqM: 1000,
    kind: "regional", country: "TR",
    standard: "Legal dönüm = 1,000 m² = 1 dekar = 10 ar (NOT the old Ottoman dönüm of 918.393 m²)",
    verified: true,
    source: "Turkish law of 11 June 1945 (Topraklandırma Kanunu)",
  },
  // ── Japan ─────────────────────────────────────────────────────────────
  {
    id: "tsubo-jp", label: "Tsubo (坪)", symbol: "坪", toSqM: 3.3057851239669,
    kind: "regional", country: "JP",
    standard: "Exact 400/121 m²; restricted-use unit — permitted for land/building transactions only",
    verified: true,
    source: "Japanese Measurement Act, official English translation (japaneselawtranslation.go.jp)",
  },
  // ── South Korea ───────────────────────────────────────────────────────
  {
    id: "pyeong-kr", label: "Pyeong (평)", symbol: "평", toSqM: 3.3057851239669,
    kind: "regional", country: "KR",
    standard: "Exact 400/121 m²; commercial use banned since 1 July 2007 (informal use continues)",
    verified: true,
    source: "Korean Measures Act, KLRI official English translation; KoreaScience journal",
  },
  // ── Russia ────────────────────────────────────────────────────────────
  {
    id: "sotka-ru", label: "Sotka (сотка)", symbol: "сотка", toSqM: 100,
    kind: "regional", country: "RU",
    standard: "Colloquial name for the metric are (100 m²); not a separate standard",
    verified: true,
    source: "Russian land-use reference (see research-landunits/west.md)",
  },
];

export function getAreaUnit(id: string): AreaUnit | undefined {
  return AREA_UNITS.find((u) => u.id === id);
}

export function getLengthUnit(id: string): LengthUnit | undefined {
  return LENGTH_UNITS.find((u) => u.id === id);
}

/** Units offered for a country: universal always + verified regional units. */
export function areaUnitsForCountry(countryCode: string): AreaUnit[] {
  return AREA_UNITS.filter(
    (u) => u.kind === "universal" || (u.verified && u.country === countryCode)
  );
}

/* ------------------------------------------------------------------ */
/* Countries (18 priority + International)                             */
/* ------------------------------------------------------------------ */

export interface LandCountry {
  code: string; // ISO-3166 alpha-2, or "INTL"
  name: string;
  /** sensible default display unit */
  defaultUnit: string;
}

export const LAND_COUNTRIES: LandCountry[] = [
  { code: "PK", name: "Pakistan", defaultUnit: "acre" },
  { code: "IN", name: "India", defaultUnit: "acre" },
  { code: "BD", name: "Bangladesh", defaultUnit: "acre" },
  { code: "CN", name: "China", defaultUnit: "hectare" },
  { code: "US", name: "United States", defaultUnit: "acre" },
  { code: "BR", name: "Brazil", defaultUnit: "hectare" },
  { code: "ID", name: "Indonesia", defaultUnit: "hectare" },
  { code: "TR", name: "Türkiye", defaultUnit: "hectare" },
  { code: "MY", name: "Malaysia", defaultUnit: "hectare" },
  { code: "JP", name: "Japan", defaultUnit: "hectare" },
  { code: "KR", name: "South Korea", defaultUnit: "hectare" },
  { code: "ES", name: "Spain", defaultUnit: "hectare" },
  { code: "FR", name: "France", defaultUnit: "hectare" },
  { code: "DE", name: "Germany", defaultUnit: "hectare" },
  { code: "IT", name: "Italy", defaultUnit: "hectare" },
  { code: "PL", name: "Poland", defaultUnit: "hectare" },
  { code: "RU", name: "Russia", defaultUnit: "hectare" },
  { code: "AU", name: "Australia", defaultUnit: "hectare" },
  { code: "INTL", name: "International / Other", defaultUnit: "hectare" },
];

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export type AreaError =
  | "not_a_number"
  | "not_positive"
  | "too_large"
  | "impossible_triangle"
  | "impossible_quadrilateral"
  | "unknown_unit";

/** Finite, positive, and below a sanity ceiling (1e12 m² ~ 1M km²). */
export function validateDimension(v: number): AreaError | null {
  if (typeof v !== "number" || Number.isNaN(v)) return "not_a_number";
  if (!Number.isFinite(v)) return "not_a_number";
  if (v <= 0) return "not_positive";
  if (v > 1e9) return "too_large"; // 1e9 m input length is absurd; guard typos
  return null;
}

/* ------------------------------------------------------------------ */
/* Conversions (canonical square meters)                               */
/* ------------------------------------------------------------------ */

export function toSqM(value: number, unitId: string): number | null {
  const u = getAreaUnit(unitId);
  if (!u) return null;
  return value * u.toSqM;
}

export function fromSqM(sqm: number, unitId: string): number | null {
  const u = getAreaUnit(unitId);
  if (!u || u.toSqM === 0) return null;
  return sqm / u.toSqM;
}

/** Convert an area value between any two units via canonical sqm. */
export function convertArea(value: number, fromId: string, toId: string): number | null {
  const sqm = toSqM(value, fromId);
  if (sqm === null) return null;
  return fromSqM(sqm, toId);
}

export function lengthToMeter(value: number, unitId: string): number | null {
  const u = getLengthUnit(unitId);
  if (!u) return null;
  return value * u.toMeter;
}

/* ------------------------------------------------------------------ */
/* Shape formulas (all return sqm, or null on invalid input)            */
/* ------------------------------------------------------------------ */

/** Rectangle: A = length × width (lengths may use different units). */
export function rectAreaSqM(
  length: number,
  lengthUnit: string,
  width: number,
  widthUnit: string
): number | null {
  if (validateDimension(length) || validateDimension(width)) return null;
  const l = lengthToMeter(length, lengthUnit);
  const w = lengthToMeter(width, widthUnit);
  if (l === null || w === null) return null;
  return l * w;
}

export function squareAreaSqM(side: number, unit: string): number | null {
  return rectAreaSqM(side, unit, side, unit);
}

/** Triangle: A = 1/2 × base × height. */
export function triangleAreaSqM(base: number, height: number, unit: string): number | null {
  if (validateDimension(base) || validateDimension(height)) return null;
  const b = lengthToMeter(base, unit);
  const h = lengthToMeter(height, unit);
  if (b === null || h === null) return null;
  return 0.5 * b * h;
}

/** Trapezoid: A = ((a + b) / 2) × height. */
export function trapezoidAreaSqM(a: number, b: number, height: number, unit: string): number | null {
  if (validateDimension(a) || validateDimension(b) || validateDimension(height)) return null;
  const aM = lengthToMeter(a, unit);
  const bM = lengthToMeter(b, unit);
  const hM = lengthToMeter(height, unit);
  if (aM === null || bM === null || hM === null) return null;
  return ((aM + bM) / 2) * hM;
}

/**
 * Triangle from three sides (Heron). Returns null when the sides cannot
 * form a triangle (triangle inequality violated).
 */
export function heronArea(a: number, b: number, c: number): number | null {
  if (validateDimension(a) || validateDimension(b) || validateDimension(c)) return null;
  if (a + b <= c || a + c <= b || b + c <= a) return null;
  const s = (a + b + c) / 2;
  const v = s * (s - a) * (s - b) * (s - c);
  if (v <= 0) return null;
  return Math.sqrt(v);
}

/**
 * EXACT quadrilateral area from 4 sides + one diagonal.
 * Sides a,b,c,d in order; diagonal splits the quad into triangles
 * (a,b,diag) and (c,d,diag). Null when geometry is impossible.
 */
export function quadAreaWithDiagonal(
  a: number,
  b: number,
  c: number,
  d: number,
  diagonal: number,
  unit: string
): number | null {
  for (const v of [a, b, c, d, diagonal]) if (validateDimension(v)) return null;
  const toM = (v: number) => lengthToMeter(v, unit);
  const aM = toM(a),
    bM = toM(b),
    cM = toM(c),
    dM = toM(d),
    gM = toM(diagonal);
  if ([aM, bM, cM, dM, gM].some((v) => v === null)) return null;
  const t1 = heronArea(aM as number, bM as number, gM as number);
  const t2 = heronArea(cM as number, dM as number, gM as number);
  if (t1 === null || t2 === null) return null;
  return t1 + t2;
}

/**
 * APPROXIMATE quadrilateral area from 4 sides only.
 * ((a + c) / 2) × ((b + d) / 2). This is NOT exact — it assumes the plot
 * is close to rectangular. Callers MUST surface the approximation warning
 * (see QUAD_APPROX_WARNING). Included because farmers commonly have only
 * side measurements; honesty requires the label, not the removal.
 */
export function quadAreaApprox(a: number, b: number, c: number, d: number, unit: string): number | null {
  for (const v of [a, b, c, d]) if (validateDimension(v)) return null;
  const toM = (v: number) => lengthToMeter(v, unit);
  const vs = [a, b, c, d].map(toM);
  if (vs.some((v) => v === null)) return null;
  const [aM, bM, cM, dM] = vs as number[];
  return ((aM + cM) / 2) * ((bM + dM) / 2);
}

export const QUAD_APPROX_WARNING =
  "Approximation only: four side lengths alone cannot determine the exact area of an irregular plot. " +
  "This estimate assumes the plot is close to rectangular. For an exact result, measure a diagonal as well.";

/* ------------------------------------------------------------------ */
/* Irregular land: multiple sections                                   */
/* ------------------------------------------------------------------ */

export type SectionShape = "rectangle" | "square" | "triangle" | "trapezoid";

export interface LandSection {
  id: string;
  name: string;
  shape: SectionShape;
  /** dims depend on shape: rectangle [l,w], square [s], triangle [base,height], trapezoid [a,b,height] */
  dims: number[];
  unit: string; // length unit id
}

export function sectionAreaSqM(s: LandSection): number | null {
  switch (s.shape) {
    case "rectangle":
      return s.dims.length >= 2 ? rectAreaSqM(s.dims[0], s.unit, s.dims[1], s.unit) : null;
    case "square":
      return s.dims.length >= 1 ? squareAreaSqM(s.dims[0], s.unit) : null;
    case "triangle":
      return s.dims.length >= 2 ? triangleAreaSqM(s.dims[0], s.dims[1], s.unit) : null;
    case "trapezoid":
      return s.dims.length >= 3 ? trapezoidAreaSqM(s.dims[0], s.dims[1], s.dims[2], s.unit) : null;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Formatting — sensible precision, never fake survey accuracy         */
/* ------------------------------------------------------------------ */

/**
 * Format an area value for display. Large values get fewer decimals;
 * trailing zeros are trimmed. Never more than 2 decimals — inputs from a
 * tape measure do not justify more.
 */
export function formatArea(value: number, unitId: string): string {
  const u = getAreaUnit(unitId);
  const symbol = u ? u.symbol : unitId;
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  let decimals = 2;
  if (abs >= 1000) decimals = 0;
  else if (abs >= 100) decimals = 1;
  const rounded = Number(value.toFixed(decimals));
  const str = rounded.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return `${str} ${symbol}`;
}

/** Pick a readable display unit for a sqm value (largest unit with value >= 1, else sqm). */
export function bestDisplayUnit(sqm: number, countryCode: string): string {
  const units = areaUnitsForCountry(countryCode);
  const preference = ["sqkm", "hectare", "acre", "kanal", "marla", "sqyd", "sqft", "sqm"];
  for (const id of preference) {
    const u = units.find((x) => x.id === id);
    if (!u) continue;
    if (sqm / u.toSqM >= 1) return id;
  }
  return "sqm";
}

/** Equivalents list for the result card: primary + a useful set. */
export function equivalentAreas(sqm: number, countryCode: string): { unitId: string; value: number }[] {
  const ids = ["hectare", "acre", "sqm", "sqft", "sqyd"];
  const regional = areaUnitsForCountry(countryCode)
    .filter((u) => u.kind === "regional")
    .map((u) => u.id);
  const out: { unitId: string; value: number }[] = [];
  for (const id of [...ids, ...regional]) {
    const v = fromSqM(sqm, id);
    if (v !== null) out.push({ unitId: id, value: v });
  }
  return out;
}
