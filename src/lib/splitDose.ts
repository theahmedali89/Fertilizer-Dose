/**
 * Split-dose scheduling — generic principles, honestly labeled.
 *
 * AGRONOMIC BASIS (no invented per-crop schedules):
 * - Phosphorus (DAP/SSP) and potassium (MOP) are immobile in soil: standard
 *   extension practice worldwide applies the FULL P and K dose as basal at
 *   sowing/planting. (Basis: PAU Package of Practices; ICAR extension
 *   bulletins — wheat/rice chapters prescribe full P,K basal.)
 * - Nitrogen (urea) is mobile and lost to leaching/volatilization: standard
 *   practice splits N across growth stages. The 3-way split used here
 *   (1/3 basal + 1/3 tillering + 1/3 flowering/panicle initiation) is the
 *   widely published cereal pattern (PAU/ICAR wheat & rice packages prescribe
 *   1/3 N at sowing, 1/3 at first irrigation/tillering, 1/3 at flowering).
 * - For non-cereal crops (no verified stage data in this app), a simpler
 *   1/2 basal + 1/2 at active vegetative growth is used — a conservative,
 *   universally taught pattern.
 *
 * Every schedule this module produces is labeled `generic: true` because the
 * app holds no verified per-crop, per-region split schedules. Crop-specific
 * overrides can be added when verified data exists.
 */

export interface SplitProduct {
  product: string;
  kg: number;
}

export interface SplitStage {
  /** e.g. "Basal — at sowing/planting" */
  stage: string;
  /** Short timing note, e.g. "Day 0" or "25–30 days after sowing". */
  timing: string;
  products: SplitProduct[];
  generic: boolean;
}

export interface SplitPlan {
  stages: SplitStage[];
  /** Always true until verified per-crop schedules are added. */
  generic: boolean;
  basisNote: string;
}

/** Cereals where the 3-way N split is standard extension practice. */
const THREE_WAY_N_SPLIT = new Set([
  "wheat",
  "durum-wheat",
  "rice",
  "maize",
  "barley",
  "rye",
  "triticale",
]);

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function isPCarrier(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("dap") || n.includes("ssp") || n.includes("tsp");
}

function isKCarrier(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("mop") || n.includes("sop");
}

function isNCarrier(name: string): boolean {
  return name.toLowerCase().includes("urea");
}

/**
 * Build a split schedule from calculator dose lines ({ product, kg }).
 * - P/K carriers (DAP, SSP, MOP): full basal — immobile nutrients, and DAP's
 *   nitrogen is never re-split (standard practice: DAP is always basal).
 * - Urea: split per the cereal / non-cereal pattern.
 * - Anything unrecognized goes basal — we never invent a schedule for it.
 */
export function planSplitDose(
  cropSlug: string,
  lines: { product: string; kg: number }[],
): SplitPlan {
  const threeWay = THREE_WAY_N_SPLIT.has(cropSlug);
  const basal: SplitProduct[] = [];
  const mid: SplitProduct[] = [];
  const late: SplitProduct[] = [];

  for (const l of lines) {
    const kg = round1(l.kg);
    if (isPCarrier(l.product) || isKCarrier(l.product)) {
      basal.push({ product: l.product, kg });
    } else if (isNCarrier(l.product)) {
      if (threeWay) {
        const third = round1(kg / 3);
        basal.push({ product: l.product, kg: third });
        mid.push({ product: l.product, kg: third });
        late.push({ product: l.product, kg: round1(kg - third * 2) });
      } else {
        const half = round1(kg / 2);
        basal.push({ product: l.product, kg: half });
        mid.push({ product: l.product, kg: round1(kg - half) });
      }
    } else {
      basal.push({ product: l.product, kg });
    }
  }

  const stages: SplitStage[] = [
    { stage: "Basal — at sowing/planting", timing: "Day 0", products: basal, generic: true },
  ];
  if (mid.length) {
    stages.push({
      stage: threeWay ? "Top-dress — tillering" : "Top-dress — active vegetative growth",
      timing: threeWay ? "25–30 days after sowing" : "3–4 weeks after sowing",
      products: mid,
      generic: true,
    });
  }
  if (late.length) {
    stages.push({
      stage: "Top-dress — flowering / panicle initiation",
      timing: "55–65 days after sowing",
      products: late,
      generic: true,
    });
  }

  return {
    stages,
    generic: true,
    basisNote:
      "Generic schedule: full P & K basal (immobile nutrients); nitrogen split across growth stages " +
      "(standard extension practice). Confirm timing with your local agriculture officer — " +
      "exact stages vary by variety and season.",
  };
}

/**
 * Suggested reminder titles + offsets for a planting, derived from the same
 * generic split principles. The caller converts offsets to dates.
 */
export function reminderScheduleFor(
  cropSlug: string,
  cropName: string,
): { title: string; daysAfterPlanting: number }[] {
  const threeWay = THREE_WAY_N_SPLIT.has(cropSlug);
  const out = [
    { title: `Basal fertilizer — ${cropName}`, daysAfterPlanting: 0 },
    {
      title: threeWay ? `Urea top-dress (tillering) — ${cropName}` : `Urea top-dress — ${cropName}`,
      daysAfterPlanting: threeWay ? 28 : 25,
    },
  ];
  if (threeWay) {
    out.push({ title: `Urea top-dress (flowering) — ${cropName}`, daysAfterPlanting: 60 });
  }
  return out;
}
