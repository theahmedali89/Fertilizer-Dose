/**
 * Profit calculator — pure math on USER-ENTERED assumptions only.
 * This module contains no market prices, yields, or cost figures.
 */
import { AREA_UNITS } from "./agronomy";

export interface ProfitCosts {
  seed: number;
  fertilizer: number;
  pesticide: number;
  labor: number;
  irrigation: number;
  rent: number;
  other: number;
}

export interface ProfitInputs {
  area: number;
  areaUnit: string; // AREA_UNITS id
  yieldPerAcre: number; // in the user's yield unit, per acre
  pricePerYieldUnit: number;
  costs: ProfitCosts;
}

export interface ProfitResult {
  totalYield: number;
  revenue: number;
  totalCost: number;
  profit: number;
  profitPerAcre: number;
  profitPerHa: number;
  costPerYieldUnit: number | null;
  breakEvenYield: number | null;
  breakEvenPrice: number | null;
  roi: number | null; // percent
  areaAcres: number;
  areaHa: number;
}

const ACRE_TO_HA = 0.404686;

export function calculateProfit(inp: ProfitInputs): ProfitResult | null {
  if (inp.area <= 0 || inp.yieldPerAcre <= 0 || inp.pricePerYieldUnit <= 0) return null;
  const unit = AREA_UNITS.find((u) => u.id === inp.areaUnit) ?? AREA_UNITS[0];
  const areaHa = inp.area * unit.toHectare;
  const areaAcres = areaHa / ACRE_TO_HA;

  const totalYield = inp.yieldPerAcre * areaAcres;
  const revenue = totalYield * inp.pricePerYieldUnit;
  const totalCost =
    inp.costs.seed +
    inp.costs.fertilizer +
    inp.costs.pesticide +
    inp.costs.labor +
    inp.costs.irrigation +
    inp.costs.rent +
    inp.costs.other;
  const profit = revenue - totalCost;

  return {
    totalYield,
    revenue,
    totalCost,
    profit,
    profitPerAcre: areaAcres > 0 ? profit / areaAcres : 0,
    profitPerHa: areaHa > 0 ? profit / areaHa : 0,
    costPerYieldUnit: totalYield > 0 ? totalCost / totalYield : null,
    breakEvenYield: inp.pricePerYieldUnit > 0 ? totalCost / inp.pricePerYieldUnit : null,
    breakEvenPrice: totalYield > 0 ? totalCost / totalYield : null,
    roi: totalCost > 0 ? (profit / totalCost) * 100 : null,
    areaAcres,
    areaHa,
  };
}

export const COST_FIELDS: { key: keyof ProfitCosts; labelKey: string }[] = [
  { key: "seed", labelKey: "costSeed" },
  { key: "fertilizer", labelKey: "costFertilizer" },
  { key: "pesticide", labelKey: "costPesticide" },
  { key: "labor", labelKey: "costLabor" },
  { key: "irrigation", labelKey: "costIrrigation" },
  { key: "rent", labelKey: "costRent" },
  { key: "other", labelKey: "costOther" },
];

/* ---------- saved scenarios (localStorage) ---------- */

export interface ProfitScenario {
  id: string;
  name: string;
  createdAt: string;
  currency: string;
  yieldUnit: string;
  cropSlug: string | null;
  inputs: ProfitInputs;
}

const SCENARIO_KEY = "fertilizer-dose.profit-scenarios.v1";

export function loadScenarios(): ProfitScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SCENARIO_KEY);
    const arr = raw ? (JSON.parse(raw) as ProfitScenario[]) : [];
    return Array.isArray(arr) ? arr.slice(0, 30) : [];
  } catch {
    return [];
  }
}

export function saveScenarios(scenarios: ProfitScenario[]): void {
  try {
    window.localStorage.setItem(SCENARIO_KEY, JSON.stringify(scenarios.slice(0, 30)));
  } catch {
    /* storage unavailable — ignore */
  }
}
