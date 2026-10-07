"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/fields";
import { AREA_UNITS, CROPS } from "@/lib/agronomy";
import {
  COST_FIELDS,
  calculateProfit,
  loadScenarios,
  saveScenarios,
  type ProfitInputs,
  type ProfitScenario,
} from "@/lib/profit";
import { cn } from "@/lib/utils";

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function ProfitCalculator({ initialArea, initialUnit }: { initialArea?: string; initialUnit?: string }) {
  const t = useTranslations("tools.profit");

  const [cropSlug, setCropSlug] = useState("");
  // Land Area Calculator integration: pre-fill from ?area=&unit= (validated).
  const [area, setArea] = useState(() => {
    const v = parseFloat(initialArea ?? "");
    return Number.isFinite(v) && v > 0 ? String(v) : "5";
  });
  const [areaUnit, setAreaUnit] = useState(() => {
    return AREA_UNITS.some((u) => u.id === initialUnit) ? (initialUnit as string) : "acre";
  });
  const [yieldPerAcre, setYieldPerAcre] = useState("");
  const [yieldUnit, setYieldUnit] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("Rs");
  const [costs, setCosts] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scenarios, setScenarios] = useState<ProfitScenario[]>(() => loadScenarios());
  const [scenarioName, setScenarioName] = useState("");

  const inputs: ProfitInputs = useMemo(
    () => ({
      area: num(area),
      areaUnit,
      yieldPerAcre: num(yieldPerAcre),
      pricePerYieldUnit: num(price),
      costs: {
        seed: num(costs.seed ?? ""),
        fertilizer: num(costs.fertilizer ?? ""),
        pesticide: num(costs.pesticide ?? ""),
        labor: num(costs.labor ?? ""),
        irrigation: num(costs.irrigation ?? ""),
        rent: num(costs.rent ?? ""),
        other: num(costs.other ?? ""),
      },
    }),
    [area, areaUnit, yieldPerAcre, price, costs]
  );

  const result = submitted ? calculateProfit(inputs) : null;

  const fmt = (n: number | null) =>
    n === null || !Number.isFinite(n)
      ? "—"
      : `${currency} ${Math.round(n).toLocaleString("en-US")}`;

  const setCost = (key: string, v: string) => setCosts((c) => ({ ...c, [key]: v }));

  const reset = () => {
    setCropSlug("");
    setArea("5");
    setAreaUnit("acre");
    setYieldPerAcre("");
    setYieldUnit("");
    setPrice("");
    setCosts({});
    setSubmitted(false);
  };

  const saveScenario = () => {
    const name = scenarioName.trim() || `Scenario ${scenarios.length + 1}`;
    const s: ProfitScenario = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      name,
      createdAt: new Date().toISOString(),
      currency,
      yieldUnit: yieldUnit.trim() || "units",
      cropSlug: cropSlug || null,
      inputs,
    };
    const next = [s, ...scenarios].slice(0, 30);
    setScenarios(next);
    saveScenarios(next);
    setScenarioName("");
  };

  const loadScenario = (s: ProfitScenario) => {
    setCropSlug(s.cropSlug ?? "");
    setArea(String(s.inputs.area));
    setAreaUnit(s.inputs.areaUnit);
    setYieldPerAcre(String(s.inputs.yieldPerAcre));
    setYieldUnit(s.yieldUnit);
    setPrice(String(s.inputs.pricePerYieldUnit));
    setCurrency(s.currency);
    const c: Record<string, string> = {};
    for (const f of COST_FIELDS) c[f.key] = String(s.inputs.costs[f.key]);
    setCosts(c);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeScenario = (id: string) => {
    const next = scenarios.filter((s) => s.id !== id);
    setScenarios(next);
    saveScenarios(next);
  };

  const yUnit = yieldUnit.trim() || "yield units";

  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
      {/* Form */}
      <Card data-print-hide>
        <CardBody>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <Field label={t("crop")}>
              <Select value={cropSlug} onChange={(e) => setCropSlug(e.target.value)}>
                <option value="">{t("noCrop")}</option>
                {CROPS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("area")}>
                <Input type="number" min="0" step="any" inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value)} />
              </Field>
              <Field label="Unit">
                <Select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)} className="capitalize">
                  {AREA_UNITS.map((u) => (
                    <option key={u.id} value={u.id} className="capitalize">{u.label}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("yieldPerUnit")}>
                <Input type="number" min="0" step="any" inputMode="decimal" value={yieldPerAcre} onChange={(e) => setYieldPerAcre(e.target.value)} placeholder="0" />
              </Field>
              <Field label={t("yieldUnit")}>
                <Input value={yieldUnit} onChange={(e) => setYieldUnit(e.target.value)} placeholder={t("yieldUnitPh")} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("pricePerYieldUnit")}>
                <Input type="number" min="0" step="any" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
              </Field>
              <Field label={t("currency")}>
                <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder={t("currencyPh")} maxLength={8} />
              </Field>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-2">{t("costsTitle")}</p>
              <div className="grid grid-cols-2 gap-3">
                {COST_FIELDS.map((f) => (
                  <Field key={f.key} label={t(f.labelKey)}>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={costs[f.key] ?? ""}
                      onChange={(e) => setCost(f.key, e.target.value)}
                      placeholder="0"
                    />
                  </Field>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-3 font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
              >
                {t("calculate")}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-line px-5 py-3 font-medium text-ink-soft hover:border-leaf-600 transition-colors"
              >
                {t("reset")}
              </button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Results */}
      <div className="space-y-5">
        {!result ? (
          <Card className="border-dashed">
            <CardBody className="text-center py-14">
              <h3 className="font-display text-xl font-semibold">{t("title")}</h3>
              <p className="text-sm text-ink-soft mt-2 max-w-md mx-auto leading-relaxed">{t("assumptionNote")}</p>
            </CardBody>
          </Card>
        ) : (
          <>
            <Card>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-1" data-print-hide>
                  <h3 className="font-display text-2xl font-semibold">{t("results")}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-leaf-600 transition-colors"
                    >
                      {t("print")}
                    </button>
                    <Link
                      href="/calculator"
                      className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-leaf-600 transition-colors"
                    >
                      {t("openCalculator")}
                    </Link>
                  </div>
                </div>
                {cropSlug && (
                  <p className="mb-4">
                    <Link href={`/crops/${cropSlug}`} className="text-sm font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
                      {t("openCropGuide")} →
                    </Link>
                  </p>
                )}

                <div className={cn("rounded-2xl p-5 text-center", result.profit >= 0 ? "bg-leaf-100 dark:bg-leaf-950" : "bg-red-50 dark:bg-red-950/40")}>
                  <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">{t("netProfit")}</p>
                  <p className={cn("font-display text-4xl font-semibold mt-1", result.profit >= 0 ? "text-leaf-800 dark:text-leaf-300" : "text-red-700 dark:text-red-400")}>
                    {fmt(result.profit)}
                  </p>
                  <p className="text-xs text-ink-faint mt-1">
                    {result.profit >= 0 ? t("profitPerAcre") : t("loss")}: {fmt(result.profitPerAcre)} {t("perAcre")} · {fmt(result.profitPerHa)} {t("perHectare")}
                  </p>
                </div>

                <dl className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {[
                    [t("revenue"), fmt(result.revenue), `${fmt(result.totalYield)} ${yUnit}`],
                    [t("totalCost"), fmt(result.totalCost), null],
                    [t("costPerYieldUnit"), result.costPerYieldUnit !== null ? `${currency} ${result.costPerYieldUnit.toFixed(1)}` : "—", null],
                    [t("breakEvenYield"), result.breakEvenYield !== null ? `${Math.ceil(result.breakEvenYield).toLocaleString()} ${yUnit}` : "—", null],
                    [t("breakEvenPrice"), result.breakEvenPrice !== null ? `${currency} ${result.breakEvenPrice.toFixed(1)} / ${yUnit.replace(/s$/, "")}` : "—", null],
                    [t("roi"), result.roi !== null ? `${result.roi.toFixed(1)}%` : "—", null],
                  ].map(([label, value, sub]) => (
                    <div key={label as string} className="flex items-baseline justify-between gap-3 border-b border-line pb-2.5">
                      <dt className="text-ink-soft">{label as string}</dt>
                      <dd className="text-end">
                        <span className="font-display text-lg font-semibold">{value as string}</span>
                        {sub && <span className="block text-xs text-ink-faint">{sub as string}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h4 className="font-display text-lg font-semibold mb-3">{t("formulasTitle")}</h4>
                <ul className="text-sm text-ink-soft space-y-1.5 leading-relaxed font-mono">
                  <li>revenue = yield × price = {result.totalYield.toLocaleString()} × {fmt(inputs.pricePerYieldUnit)}</li>
                  <li>total cost = Σ all input costs = {fmt(result.totalCost)}</li>
                  <li>net profit = revenue − total cost</li>
                  <li>break-even yield = total cost ÷ price per {yUnit.replace(/s$/, "")}</li>
                  <li>break-even price = total cost ÷ total yield</li>
                  <li>ROI = profit ÷ total cost × 100</li>
                </ul>
                <p className="mt-3 text-xs text-ink-faint leading-relaxed">{t("assumptionNote")}</p>
                <div className="mt-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                    {t("figuresDisclaimerTitle")}
                  </p>
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    {t("figuresDisclaimer")}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card data-print-hide>
              <CardBody>
                <h4 className="font-display text-lg font-semibold mb-3">{t("saveScenario")}</h4>
                <div className="flex gap-2.5">
                  <Input value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder={t("scenarioNamePh")} className="flex-1" />
                  <button
                    onClick={saveScenario}
                    className="rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors whitespace-nowrap"
                  >
                    {t("saveScenario")}
                  </button>
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {/* Saved scenarios */}
        <Card data-print-hide>
          <CardBody>
            <h4 className="font-display text-lg font-semibold mb-3">{t("scenarios")}</h4>
            {scenarios.length === 0 ? (
              <p className="text-sm text-ink-faint">{t("noScenarios")}</p>
            ) : (
              <ul className="space-y-2">
                {scenarios.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl border border-line px-4 py-2.5">
                    <button onClick={() => loadScenario(s)} className="flex-1 text-start min-w-0">
                      <span className="font-medium text-[15px] truncate block">{s.name}</span>
                      <span className="text-xs text-ink-faint">{new Date(s.createdAt).toLocaleDateString()}</span>
                    </button>
                    <button
                      onClick={() => removeScenario(s.id)}
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline shrink-0"
                    >
                      {t("deleteScenario")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
