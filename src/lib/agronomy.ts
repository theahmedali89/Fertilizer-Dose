/**
 * Agronomy data + calculation engine.
 * POLICY: every figure here is label-accurate or published-recommendation
 * accurate. Nothing is invented. Figures lacking a citable source are
 * represented as `null` and surfaced in the UI as "under review".
 */

export type FertilizerType = "mineral" | "organic";
export type OrganicCategory = "manure" | "compost" | "green_manure";
export type NutrientValueType = "fixed" | "typical_range" | "variable" | "lab_analysis_required";

export interface FertilizerInfo {
  slug: string;
  name: string;
  urdu: string;
  /**
   * Single label value (% N / % P2O5 / % K2O). NULL for organics with
   * ranges — there is NO single honest value, and storing a midpoint
   * would be fake precision.
   */
  n: number | null;
  p: number | null;
  k: number | null;
  tagline: string;
  description: string;
  benefits: string[];
  precautions: string[];
  application: string;
  /** "mineral" | "organic" */
  fertilizerType: FertilizerType;
  /** "manure" | "compost" | "green_manure" — organics only, else null */
  organicCategory: OrganicCategory | null;
  /** "fixed" | "typical_range" | "variable" | "lab_analysis_required" */
  nutrientValueType: NutrientValueType;
  /** Honest variability caveat, shown in the UI wherever ranges appear. */
  nutrientNote: string | null;
  /** Typical-range bounds (percent). Null when not applicable. */
  nMin: number | null;
  nMax: number | null;
  pMin: number | null;
  pMax: number | null;
  kMin: number | null;
  kMax: number | null;
  /** Source URL for the typical ranges. */
  sourceUrl: string | null;
}

/** Shared defaults for the 6 mineral fertilizers (fixed label values). */
const MINERAL_DEFAULTS = {
  fertilizerType: "mineral" as const,
  organicCategory: null as null,
  nutrientValueType: "fixed" as const,
  nutrientNote: null as null,
  nMin: null as null,
  nMax: null as null,
  pMin: null as null,
  pMax: null as null,
  kMin: null as null,
  kMax: null as null,
  sourceUrl: null as null,
};

export const FERTILIZERS: FertilizerInfo[] = [
  {
    slug: "urea",
    ...MINERAL_DEFAULTS,
    name: "Urea",
    urdu: "یوریا",
    n: 46,
    p: 0,
    k: 0,
    tagline: "The most concentrated nitrogen fertilizer in common use.",
    description:
      "Urea carries 46% nitrogen — the highest N concentration of any common solid fertilizer. Plants take up its nitrogen as ammonium and then nitrate after soil microbes convert it. Because the nitrogen is highly soluble, it is normally split into two or three applications rather than applied all at once.",
    benefits: [
      "Highest nitrogen per kilogram, so less product to transport and handle",
      "Suitable for basal and top-dressing applications",
      "Works across cereals, cotton, sugarcane, maize and vegetables",
    ],
    precautions: [
      "Nitrogen can volatilize as ammonia if urea sits on dry soil surface — irrigate or incorporate after application",
      "Avoid mixing with superphosphate in the same application heap for long storage",
      "Do not exceed the recommended dose: excess nitrogen causes lodging and delays maturity",
    ],
    application:
      "Apply as per the calculated dose, split into basal + 1–2 top-dressings at active growth stages (e.g. wheat: sowing, crown-root initiation ~21 days, flowering). Broadcast evenly and irrigate lightly afterwards where possible.",
  },
  {
    slug: "dap",
    ...MINERAL_DEFAULTS,
    name: "DAP (Di-Ammonium Phosphate)",
    urdu: "ڈی اے پی",
    n: 18,
    p: 46,
    k: 0,
    tagline: "The standard basal phosphorus source — with a nitrogen bonus.",
    description:
      "DAP supplies 18% nitrogen and 46% phosphate (P₂O₅). It is the workhorse phosphorus fertilizer for field crops because phosphorus is immobile in soil: it must be placed near the seed/root zone at sowing time. The 18% nitrogen it carries counts toward the crop's total nitrogen requirement.",
    benefits: [
      "Concentrated phosphorus for root development and early vigor",
      "Its nitrogen content reduces the urea needed later",
      "Granular and easy to band-place at sowing",
    ],
    precautions: [
      "Apply at sowing — top-dressed phosphorus barely reaches roots",
      "Keep granules slightly away from direct seed contact in dry soils",
      "Account for its nitrogen when calculating urea (the calculator does this automatically)",
    ],
    application:
      "Band or broadcast and incorporate at sowing time as the full phosphorus dose. In the standard calculation, DAP is allocated first for phosphorus, then urea covers the remaining nitrogen.",
  },
  {
    slug: "mop",
    ...MINERAL_DEFAULTS,
    name: "MOP (Muriate of Potash)",
    urdu: "ایم او پی",
    n: 0,
    p: 0,
    k: 60,
    tagline: "The economical potassium source for most field crops.",
    description:
      "MOP (potassium chloride) supplies 60% potash (K₂O). Potassium regulates water use, strengthens stems, and improves grain filling and disease resistance. It is the cheapest potassium source per unit of K₂O for cereals, cotton and sugarcane.",
    benefits: [
      "Highest K₂O concentration among potash fertilizers",
      "Improves lodging resistance and grain quality",
      "Single basal application usually suffices",
    ],
    precautions: [
      "Contains chloride — avoid on chloride-sensitive crops such as tobacco and some fruits (use SOP instead)",
      "Apply basally; top-dressing potassium is less effective",
    ],
    application:
      "Broadcast and incorporate at land preparation or sowing as the full potassium dose. For chloride-sensitive crops, substitute SOP (50% K₂O) at an adjusted rate.",
  },
  {
    slug: "ssp",
    ...MINERAL_DEFAULTS,
    name: "SSP (Single Super Phosphate)",
    urdu: "ایس ایس پی",
    n: 0,
    p: 16,
    k: 0,
    tagline: "Phosphorus plus sulphur and calcium in one granule.",
    description:
      "SSP contains 16% phosphate (P₂O₅) along with sulphur (~11%) and calcium (~19%). It suits oilseeds, pulses and crops on sulphur-deficient soils, where the secondary nutrients add real value beyond phosphorus.",
    benefits: [
      "Supplies sulphur — valuable for oilseeds and pulses",
      "Adds calcium, improving soil structure over time",
      "Lower cost per bag than DAP (more bulk needed)",
    ],
    precautions: [
      "Bulky: ~2.9× the quantity of DAP is needed for the same phosphorus",
      "Apply at sowing like other phosphorus sources",
    ],
    application:
      "Broadcast and incorporate at sowing. To replace DAP's phosphorus, multiply the DAP quantity by 46/16 ≈ 2.875.",
  },
  {
    slug: "sop",
    ...MINERAL_DEFAULTS,
    name: "SOP (Sulphate of Potash)",
    urdu: "ایس او پی",
    n: 0,
    p: 0,
    k: 50,
    tagline: "Chloride-free potassium for sensitive, high-value crops.",
    description:
      "SOP (potassium sulphate) supplies 50% potash (K₂O) plus ~17% sulphur, without chloride. It is the potassium source of choice for tobacco, fruits, vegetables and any chloride-sensitive crop.",
    benefits: [
      "Safe for chloride-sensitive crops",
      "Adds sulphur alongside potassium",
      "Improves fruit quality and shelf life",
    ],
    precautions: [
      "More expensive per unit of K₂O than MOP — reserve for crops that need it",
      "Apply basally at sowing/transplanting",
    ],
    application:
      "Broadcast and incorporate at sowing. Rate = (K₂O needed × 100) ÷ 50.",
  },
  {
    slug: "ammonium-sulphate",
    ...MINERAL_DEFAULTS,
    name: "Ammonium Sulphate",
    urdu: "امونیم سلفیٹ",
    n: 21,
    p: 0,
    k: 0,
    tagline: "Nitrogen plus sulphur, with an acidifying effect on soil.",
    description:
      "Ammonium sulphate carries 21% nitrogen and ~24% sulphur. It suits sulphur-deficient soils and alkaline conditions, where its acidifying effect is an advantage rather than a drawback.",
    benefits: [
      "Supplies sulphur with every nitrogen application",
      "Useful on alkaline soils",
      "Less volatilization loss than urea on the surface",
    ],
    precautions: [
      "Acidifies soil with repeated use — monitor pH on long-term use",
      "Lower N concentration means more bulk than urea",
    ],
    application:
      "Broadcast as a nitrogen top-dressing, particularly where sulphur is also deficient. Rate = (N needed × 100) ÷ 21.",
  },
];

/* ---------------- Organic fertilizers ----------------
 *
 * Typical N–P2O5–K2O % RANGES from published extension sources (see
 * sourceUrl per entry). Ranges — never single values — because composition
 * varies with feedstock, preparation and storage. Anything unsourced is
 * represented as lab_analysis_required with null bounds, never invented.
 */

export const ORGANIC_FERTILIZERS: FertilizerInfo[] = [
  {
    slug: "farmyard-manure",
    name: "Farmyard Manure (FYM)",
    urdu: "گوبر کی کھاد",
    n: null,
    p: null,
    k: null,
    fertilizerType: "organic",
    organicCategory: "manure",
    nutrientValueType: "typical_range",
    nMin: 0.5,
    nMax: 1.0,
    pMin: 0.15,
    pMax: 0.2,
    kMin: 0.5,
    kMax: 0.6,
    sourceUrl: "https://agritech.tnau.ac.in/ta/org_farm/orgfarm_manure.html",
    nutrientNote:
      "Typical range only. TNAU reports well-decomposed FYM at 0.5% N, 0.2% P2O5, 0.5% K2O; the FAO fertilizer glossary widens this to 0.5–1.0% N, 0.15–0.20% P2O5, 0.5–0.6% K2O. Your heap depends on animal feed, litter, urine capture and storage — only ~30% of its nitrogen is available to the first crop (TNAU). Get a lab analysis for precision dosing.",
    tagline: "The traditional bulky manure — low nutrients, high soil-conditioning value.",
    description:
      "Farmyard manure is the decomposed mixture of cattle dung and urine with litter and leftover fodder. It is the most widely used bulky organic manure in South Asia, but its nutrient concentration is roughly one-hundredth of urea's: it is a soil conditioner that also carries some nutrients, not a concentrated nutrient source.",
    benefits: [
      "Improves soil structure, water-holding capacity and microbial activity",
      "Supplies secondary and micronutrients alongside NPK",
      "Long residual effect — feeds subsequent crops, not just the first",
      "Widely available on-farm at low cash cost",
    ],
    precautions: [
      "Very low nutrient density: supplying 100 kg N/ha needs 10–20 t/ha of FYM",
      "Only ~30% of nitrogen is available to the first crop; the rest mineralizes slowly",
      "Poorly stored or fresh manure can carry weed seeds and immobilize soil nitrogen",
      "Cannot be precision-dosed without a lab analysis of your specific heap",
    ],
    application:
      "TNAU extension guidance: apply 10–20 t/ha of well-rotted FYM before sowing (at least 15 days before for heavy rates), spread and incorporate by ploughing immediately — do not leave it in small heaps in the field, which loses nutrients. Partially rotted FYM should go on 3–4 weeks before sowing.",
  },
  {
    slug: "compost",
    name: "Compost (farm compost)",
    urdu: "کمپوسٹ",
    n: null,
    p: null,
    k: null,
    fertilizerType: "organic",
    organicCategory: "compost",
    nutrientValueType: "typical_range",
    nMin: 0.5,
    nMax: 1.4,
    pMin: 0.15,
    pMax: 1.0,
    kMin: 0.5,
    kMax: 1.4,
    sourceUrl: "https://agritech.tnau.ac.in/org_farm/orgfarm_composting_coir.html",
    nutrientNote:
      "Wide range because feedstock decides the value. TNAU reports farm compost (crop residues, weeds) averaging 0.5% N, 0.15% P2O5, 0.5% K2O, while town compost (refuse, night soil) averages 1.4% N, 1.0% P2O5, 1.4% K2O. Your compost falls somewhere on this spectrum depending on what went into the pit — a lab analysis is the only precise number.",
    tagline: "Decomposed farm and household waste — variable, feedstock-dependent nutrition.",
    description:
      "Compost is rotted organic matter made from farm waste (sugarcane trash, paddy straw, weeds) or town refuse. Farm compost made from crop residues is the lowest-nutrient of the four materials listed here; town compost is richer but may carry contaminants. Both are primarily soil conditioners.",
    benefits: [
      "Recycles on-farm waste into a stable soil amendment",
      "Improves soil organic matter, structure and water retention",
      "Slow, steady nutrient release with minimal leaching risk",
      "Enrichable: TNAU notes adding rock phosphate (10–15 kg/t of raw material) raises its phosphorus value",
    ],
    precautions: [
      "Farm compost is the most dilute organic source here — large volumes needed for meaningful nutrition",
      "Town/municipal compost can contain heavy metals and glass — know your source",
      "Immature compost can rob nitrogen from the crop as it finishes decomposing",
      "Nutrient content cannot be read off a label — analyse before precision use",
    ],
    application:
      "Make in trenches or pits (5–6 months to maturity for farm compost). Apply well-rotted compost before land preparation and incorporate. Rates of 5–10 t/ha are common for field crops; use higher rates mainly for soil building, not as a primary nutrient source.",
  },
  {
    slug: "vermicompost",
    name: "Vermicompost",
    urdu: "ورمی کمپوسٹ",
    n: null,
    p: null,
    k: null,
    fertilizerType: "organic",
    organicCategory: "compost",
    nutrientValueType: "typical_range",
    nMin: 1.0,
    nMax: 3.0,
    pMin: 0.8,
    pMax: 2.9,
    kMin: 1.0,
    kMax: 2.0,
    sourceUrl: "https://agritech.tnau.ac.in/ta/org_farm/orgfarm_cotton.html",
    nutrientNote:
      "The most variable bulky manure here. TNAU reports earthworm castings at 2.0–2.5% N, 2.5–2.9% P2O5, 1.2–1.4% K2O, while mixed-feedstock analyses (e.g. a 2018 Journal of Pharmacognosy and Phytochemistry study) found 1.10% N, 0.80% P2O5, 1.00% K2O, and a KVK extension guide gives 1.5–3.0% N, 1.5–2.5% P2O5, 1.5–2.0% K2O. Composition follows the feedstock — analyse your batch before dosing.",
    tagline: "Earthworm-processed manure — richer than FYM, but feedstock decides everything.",
    description:
      "Vermicompost is organic waste (dung, crop residues, household waste) digested by earthworms into fine granular castings. It is more nutrient-concentrated than FYM or farm compost and rich in microbial activity, but its analysis swings widely with what the worms were fed.",
    benefits: [
      "Higher nutrient concentration than FYM or farm compost",
      "Fine granular texture — easy to apply evenly, good for nurseries and vegetables",
      "High microbial activity supports nutrient cycling in soil",
      "Can be produced on-farm in pits or beds in 40–75 days",
    ],
    precautions: [
      "No two batches are alike — feedstock changes the analysis completely",
      "Still dilute versus mineral fertilizers: ~1–3% N against urea's 46%",
      "Commercial vermicompost quality varies; buy from a trusted producer or analyse",
      "Keep beds moist but never waterlogged during production or nutrients leach",
    ],
    application:
      "Extension guidance commonly recommends mature vermicompost at ~5 t/ha for field crops, less for nurseries and potting mixes. Apply before sowing/transplanting and incorporate lightly. For high-value vegetables it works well as a basal soil builder alongside mineral top-dressing.",
  },
  {
    slug: "green-manure",
    name: "Green Manure (Dhaincha / Sesbania)",
    urdu: "سبز کھاد",
    n: null,
    p: null,
    k: null,
    fertilizerType: "organic",
    organicCategory: "green_manure",
    nutrientValueType: "typical_range",
    nMin: 2.6,
    nMax: 3.5,
    pMin: 0.5,
    pMax: 0.6,
    kMin: 1.0,
    kMax: 1.2,
    sourceUrl: "http://www.eagri.org/eagri50/AGRO302/lec18.pdf",
    nutrientNote:
      "Percentages are on an AIR-DRY biomass basis — fresh dhaincha is ~85% water, so per-tonne-fresh nutrients are far lower. eAgri/TNAU course material reports Sesbania aculeata at 2.6–3.2% N (dry basis) accumulating 130–185 kg N/ha; a published green-manure table gives 3.50% N, 0.60% P2O5, 1.20% K2O. Actual nitrogen added depends on biomass produced and incorporation timing.",
    tagline: "A living nitrogen factory — grown, then ploughed in before the main crop.",
    description:
      "Green manuring means growing a fast legume crop — dhaincha (Sesbania aculeata) is the classic choice in South Asian rice systems — and incorporating it into the soil at 45–60 days, before it turns woody. The legume fixes atmospheric nitrogen, and the incorporated biomass releases it as it decomposes.",
    benefits: [
      "Adds 130–185 kg N/ha of biologically fixed nitrogen (eAgri/TNAU figures)",
      "Adds large quantities of fresh organic matter, improving soil structure",
      "No transport or purchase cost — grown in situ",
      "Particularly valuable before transplanted rice",
    ],
    precautions: [
      "Takes land and water for 45–60 days — it competes with the cropping calendar",
      "Incorporating bulky biomass needs labour or machinery (plough/hydro-tiller)",
      "Nutrient percentages quoted are dry-basis; fresh-weight nutrients are ~6–7× lower",
      "Up to three-quarters of the fixed nitrogen can be lost in poorly managed lowland soils — incorporate into moist soil and transplant the next crop within 1–2 weeks",
    ],
    application:
      "Sow dhaincha at ~20–25 kg seed/ha after the previous harvest. Incorporate at 45–60 days while still succulent (before flowering woodiness), preferably into standing water for rice fields. Transplant or sow the next crop 1–2 weeks after incorporation.",
  },
];

/* ---------------- Crops ---------------- */

export interface CropStage {
  name: string;
  timing: string;
  note: string;
}

export interface CropInfo {
  slug: string;
  name: string;
  urdu: string;
  season: string;
  seasonDetail: string;
  soil: string;
  water: string;
  stages: CropStage[];
  problems: string[];
  /** Recommended N–P2O5–K2O in kg/ha. null = under review, never invented. */
  npk: { n: number; p: number; k: number } | null;
  npkSource: string | null;
  /** True when the dose comes from an under_review recommendation — UI must badge it. */
  underReview: boolean;
  region: string;
}

export const CROPS: CropInfo[] = [
  {
    slug: "wheat",
    name: "Wheat",
    urdu: "گندم",
    season: "Rabi (winter)",
    seasonDetail: "Sow late October – November; harvest March – April.",
    soil: "Well-drained loam to clay loam; pH 6.0–7.5.",
    water: "4–6 irrigations: crown-root initiation (~21 days) is the most critical.",
    stages: [
      { name: "Basal (at sowing)", timing: "Day 0", note: "Full phosphorus + potassium + ⅓ nitrogen with seedbed preparation." },
      { name: "Crown root initiation", timing: "~21 days", note: "⅓ nitrogen with first irrigation — the most critical top-dressing." },
      { name: "Flowering", timing: "~60–70 days", note: "Remaining ⅓ nitrogen before flowering." },
    ],
    problems: ["Aphids", "Rust (yellow/brown)", "Termites in light soils", "Lodging from excess nitrogen"],
    npk: { n: 124, p: 62, k: 0 },
    npkSource: "PAU Package of Practices for Crops of Punjab, Rabi 2025–26 (IN-Punjab; K soil-test-based, no blanket K dose)",
    region: "Punjab, India (PAU)",
    underReview: false,
  },
  {
    slug: "rice",
    name: "Rice (Paddy)",
    urdu: "چاول / دھان",
    season: "Kharif (summer)",
    seasonDetail: "Transplant June – July; harvest October – November.",
    soil: "Clay loam that holds standing water; pH 5.5–7.0.",
    water: "Continuous shallow flooding for most of the season; drain before harvest.",
    stages: [
      { name: "Basal (puddling/transplanting)", timing: "Day 0", note: "Full phosphorus + potassium + ⅓ nitrogen." },
      { name: "Tillering", timing: "~25–30 days", note: "⅓ nitrogen." },
      { name: "Panicle initiation", timing: "~50–55 days", note: "Remaining ⅓ nitrogen." },
    ],
    problems: ["Stem borer", "Leaf folder", "Bacterial leaf blight", "Zinc deficiency (khaira disease)"],
    npk: { n: 104, p: 30, k: 30 },
    npkSource: "PAU Package of Practices for Crops of Punjab, Kharif 2026 (IN-Punjab; P/K only on deficiency)",
    region: "Punjab, India (PAU)",
    underReview: false,
  },
  {
    slug: "maize",
    name: "Maize",
    urdu: "مکئی",
    season: "Kharif (also spring in irrigated areas)",
    seasonDetail: "Sow June – July (kharif) or February (spring).",
    soil: "Well-drained fertile loam; waterlogging is fatal.",
    water: "4–5 irrigations; critical at knee-high and tasseling stages.",
    stages: [
      { name: "Basal (at sowing)", timing: "Day 0", note: "Full phosphorus + potassium + ¼ nitrogen." },
      { name: "Knee-high", timing: "~30 days", note: "½ nitrogen." },
      { name: "Tasseling", timing: "~55–60 days", note: "Remaining ¼ nitrogen." },
    ],
    problems: ["Fall armyworm", "Stem borer", "Waterlogging", "Zinc deficiency"],
    npk: { n: 124, p: 60, k: 30 },
    npkSource: "PAU Package of Practices for Crops of Punjab, Kharif 2026 (IN-Punjab; K conditional)",
    region: "Punjab, India (PAU)",
    underReview: false,
  },
  {
    slug: "cotton",
    name: "Cotton",
    urdu: "کپاس",
    season: "Kharif",
    seasonDetail: "Sow April – May; picking October – December.",
    soil: "Deep, well-drained loam to clay loam.",
    water: "6–8 irrigations; avoid water stress at flowering and boll formation.",
    stages: [
      { name: "Basal", timing: "At sowing", note: "Full phosphorus + potassium." },
      { name: "Squaring", timing: "~40 days", note: "First nitrogen split." },
      { name: "Flowering–boll formation", timing: "~70–90 days", note: "Remaining nitrogen in 1–2 splits." },
    ],
    problems: ["Whitefly", "Pink bollworm", "Cotton leaf curl virus", "Thrips"],
    npk: null,
    npkSource: null,
    region: "Punjab PK / Sindh",
    underReview: false,
  },
  {
    slug: "sugarcane",
    name: "Sugarcane",
    urdu: "گنا",
    season: "Year-round (12–14 month crop)",
    seasonDetail: "Plant February – March (spring) or September (autumn).",
    soil: "Deep, rich loam; heavy feeder — high organic matter helps.",
    water: "High requirement; critical during tillering and grand growth.",
    stages: [
      { name: "Basal", timing: "At planting", note: "Full phosphorus + potassium + part nitrogen in furrows." },
      { name: "Tillering", timing: "~90 days", note: "Nitrogen top-dressing." },
      { name: "Grand growth", timing: "~180 days", note: "Final nitrogen split; no late nitrogen (reduces sugar recovery)." },
    ],
    problems: ["Sugarcane borer", "Red rot", "Whip smut", "Waterlogging"],
    npk: null,
    npkSource: null,
    region: "Punjab PK / UP India",
    underReview: false,
  },
  {
    slug: "potato",
    name: "Potato",
    urdu: "آلو",
    season: "Rabi",
    seasonDetail: "Plant October; harvest January – February.",
    soil: "Loose, well-drained sandy loam; avoid waterlogging.",
    water: "Light, frequent irrigations; stop 10 days before harvest.",
    stages: [
      { name: "Basal", timing: "At planting", note: "Full phosphorus + potassium + half nitrogen in ridges." },
      { name: "Earthing-up", timing: "~30 days", note: "Remaining nitrogen." },
    ],
    problems: ["Late blight", "Aphids", "Cutworms", "Hollow heart from uneven water"],
    npk: null,
    npkSource: null,
    region: "Punjab PK / UP India",
    underReview: false,
  },
];

/* ---------------- Units ---------------- */

export interface AreaUnit {
  id: string;
  label: string;
  plural: string;
  /** hectares per one unit */
  toHectare: number;
}

export const AREA_UNITS: AreaUnit[] = [
  { id: "acre", label: "Acre", plural: "Acres", toHectare: 0.404686 },
  { id: "kanal", label: "Kanal", plural: "Kanal", toHectare: 0.0505856 },
  { id: "marla", label: "Marla", plural: "Marla", toHectare: 0.00252929 },
  { id: "hectare", label: "Hectare", plural: "Hectares", toHectare: 1 },
];

/* ---------------- Calculation engine (pure) ---------------- */

export interface DoseLine {
  product: string;
  kg: number;
  bags: number; // 50 kg bags
  purpose: string;
}

export interface DoseResult {
  cropName: string;
  area: number;
  unitLabel: string;
  areaHa: number;
  lines: DoseLine[];
  steps: string[];
  totalKg: number;
  source: string;
  region: string;
}

const BAG_KG = 50;
const r1 = (x: number) => Math.round(x * 10) / 10;

export function calculateDose(
  crop: CropInfo,
  area: number,
  unitId: string
): DoseResult | null {
  if (!crop.npk || area <= 0) return null;
  const unit = AREA_UNITS.find((u) => u.id === unitId) ?? AREA_UNITS[0];
  const areaHa = area * unit.toHectare;
  const { n, p, k } = crop.npk;

  // Standard DAP-first NPK algorithm (industry practice)
  const dapPerHa = (p * 100) / 46;
  const nFromDapPerHa = dapPerHa * 0.18;
  const ureaPerHa = ((n - nFromDapPerHa) * 100) / 46;
  const mopPerHa = (k * 100) / 60;

  const dapKg = r1(dapPerHa * areaHa);
  const ureaKg = r1(ureaPerHa * areaHa);
  const mopKg = r1(mopPerHa * areaHa);

  const lines: DoseLine[] = [
    { product: "DAP", kg: dapKg, bags: r1(dapKg / BAG_KG), purpose: `Full phosphorus (${p} kg P₂O₅/ha) + ${r1(nFromDapPerHa * areaHa)} kg nitrogen as bonus` },
    { product: "Urea", kg: ureaKg, bags: r1(ureaKg / BAG_KG), purpose: `Remaining nitrogen after DAP's contribution` },
    { product: "MOP", kg: mopKg, bags: r1(mopKg / BAG_KG), purpose: `Full potassium (${k} kg K₂O/ha)` },
  ];

  const steps = [
    `Recommended dose for ${crop.name}: ${n}–${p}–${k} kg N–P₂O₅–K₂O per hectare (${crop.region}).`,
    `${area} ${area === 1 ? unit.label : unit.plural} = ${areaHa >= 0.01 ? r1(areaHa * 100) / 100 : areaHa.toFixed(4)} hectare.`,
    `Phosphorus first: DAP is 46% P₂O₅, so (${p} × 100) ÷ 46 = ${r1(dapPerHa)} kg DAP per hectare.`,
    `That DAP also supplies ${r1(nFromDapPerHa)} kg nitrogen per hectare (18% of DAP).`,
    `Remaining nitrogen: ${n} − ${r1(nFromDapPerHa)} = ${r1(n - nFromDapPerHa)} kg/ha → (${r1(n - nFromDapPerHa)} × 100) ÷ 46 = ${r1(ureaPerHa)} kg urea per hectare.`,
    `Potassium: MOP is 60% K₂O, so (${k} × 100) ÷ 60 = ${r1(mopPerHa)} kg MOP per hectare.`,
    `Scaled to your ${area} ${area === 1 ? unit.label : unit.plural}: ${dapKg} kg DAP + ${ureaKg} kg urea + ${mopKg} kg MOP.`,
  ];

  return {
    cropName: crop.name,
    area,
    unitLabel: area === 1 ? unit.label : unit.plural,
    areaHa,
    lines,
    steps,
    totalKg: r1(dapKg + ureaKg + mopKg),
    source: crop.npkSource ?? "",
    region: crop.region,
  };
}

export function getCrop(slug: string): CropInfo | undefined {
  return CROPS.find((c) => c.slug === slug);
}

export function getFertilizer(slug: string): FertilizerInfo | undefined {
  return FERTILIZERS.find((f) => f.slug === slug);
}
