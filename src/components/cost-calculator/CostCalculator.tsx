"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  DEFAULT_REFERENCE_PRODUCTS,
  analyzeProduct,
  benchmark,
  costPerKgNutrient,
  formatRs,
  type Nutrient,
  type ReferenceProduct,
  type Verdict,
} from "@/lib/cost-per-nutrient";

const VERDICT_STYLE: Record<
  Verdict,
  { ring: string; bg: string; badge: string; icon: string }
> = {
  good: {
    ring: "border-leaf-300 dark:border-leaf-700",
    bg: "bg-leaf-50 dark:bg-leaf-950/40",
    badge: "bg-leaf-600 text-white",
    icon: "✅",
  },
  pricier: {
    ring: "border-amber-300 dark:border-amber-700",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    badge: "bg-amber-500 text-white",
    icon: "⚠️",
  },
  expensive: {
    ring: "border-red-300 dark:border-red-700",
    bg: "bg-red-50 dark:bg-red-950/30",
    badge: "bg-red-600 text-white",
    icon: "❌",
  },
};

const NUTRIENT_DOT: Record<Nutrient, string> = {
  n: "bg-emerald-500",
  p: "bg-sky-500",
  k: "bg-violet-500",
};

const ALL_NUTRIENTS: Nutrient[] = ["n", "p", "k"];

function Field({
  label,
  value,
  onChange,
  placeholder,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: number;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <input
        type="number"
        min={min}
        step={step ?? "any"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/30"
      />
    </label>
  );
}

function RefRow({
  product,
  onChange,
  t,
}: {
  product: ReferenceProduct;
  onChange: (p: ReferenceProduct) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="grid grid-cols-[1fr_88px_64px] items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
      <div>
        <p className="text-sm font-semibold text-ink">{product.name}</p>
        <p className="text-xs text-ink-faint">
          {t("refs.bagUnit", { bagKg: product.bagKg })}
          {[
            product.n > 0 ? `N ${product.n}%` : null,
            product.p2o5 > 0 ? `P₂O₅ ${product.p2o5}%` : null,
            product.k2o > 0 ? `K₂O ${product.k2o}%` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <input
        type="number"
        min={0}
        value={product.priceRs || ""}
        onChange={(e) =>
          onChange({ ...product, priceRs: Number(e.target.value) || 0 })
        }
        aria-label={t("refs.priceAria", { name: product.name })}
        className="w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:border-leaf-500 focus:outline-none"
      />
      <span className="text-xs text-ink-faint">{t("refs.perBag")}</span>
    </div>
  );
}

export function CostCalculator() {
  const t = useTranslations("costCalculator");
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [unit, setUnit] = useState<"kg" | "L">("kg");
  const [price, setPrice] = useState("");
  const [nPct, setNPct] = useState("");
  const [pPct, setPPct] = useState("");
  const [kPct, setKPct] = useState("");
  const [refs, setRefs] = useState<ReferenceProduct[]>(DEFAULT_REFERENCE_PRODUCTS);
  const [showRefs, setShowRefs] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const analysis = useMemo(() => {
    if (!submitted) return null;
    const weightKg = Number(size) || 0;
    return analyzeProduct(
      {
        name: name.trim() || "Your product",
        weightKg,
        priceRs: Number(price) || 0,
        nPct: Number(nPct) || 0,
        pPct: Number(pPct) || 0,
        kPct: Number(kPct) || 0,
      },
      refs
    );
  }, [submitted, name, size, price, nPct, pPct, kPct, refs]);

  const benchmarks = useMemo(() => {
    const b = (nut: Nutrient) => benchmark(refs, nut);
    return { n: b("n"), p: b("p"), k: b("k") };
  }, [refs]);

  const style = analysis ? VERDICT_STYLE[analysis.verdict] : null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  {t("form.productName")}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("form.productPh")}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/30"
                />
              </label>

              <div>
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  {t("form.packSize")}
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder={t("form.packSizePh")}
                    className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/30"
                  />
                  <div className="flex shrink-0 overflow-hidden rounded-xl border border-line">
                    {(["kg", "L"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUnit(u)}
                        className={cn(
                          "px-4 text-sm font-semibold",
                          unit === u
                            ? "bg-leaf-600 text-white"
                            : "bg-surface text-ink-soft"
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                {unit === "L" && (
                  <p className="mt-1 text-xs text-ink-faint">
                    {t("form.liquidNote")}
                  </p>
                )}
              </div>

              <Field
                label={t("form.price")}
                value={price}
                onChange={setPrice}
                placeholder={t("form.pricePh")}
                min={0}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-ink">
                {t("form.nutrientPct")}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <Field label={t("form.nPct")} value={nPct} onChange={setNPct} placeholder="0" min={0} />
                <Field label={t("form.pPct")} value={pPct} onChange={setPPct} placeholder="10" min={0} />
                <Field label={t("form.kPct")} value={kPct} onChange={setKPct} placeholder="0" min={0} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-leaf-600 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-leaf-700 sm:w-auto"
            >
              {t("form.submit")}
            </button>
          </form>
        </CardBody>
      </Card>

      {/* Reference prices */}
      <Card>
        <CardBody>
          <button
            type="button"
            onClick={() => setShowRefs((s) => !s)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-bold text-ink">
              {t("refs.title")}
            </span>
            <span className="text-ink-faint">{showRefs ? "▲" : "▼"}</span>
          </button>
          {showRefs && (
            <div className="mt-4 space-y-2">
              {refs.map((r) => (
                <RefRow
                  key={r.id}
                  product={r}
                  onChange={(p) =>
                    setRefs((prev) => prev.map((x) => (x.id === p.id ? p : x)))
                  }
                  t={t}
                />
              ))}
              <button
                type="button"
                onClick={() => setRefs(DEFAULT_REFERENCE_PRODUCTS)}
                className="text-xs font-semibold text-leaf-700 dark:text-leaf-400 underline"
              >
                {t("refs.reset")}
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Results */}
      {submitted && (
        <div>
          {analysis && style ? (
            <div className="space-y-6">
              {/* Nutrient cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                {analysis.results.map((r) => (
                  <Card key={r.nutrient} className={cn("border-2", style.ring, style.bg)}>
                    <CardBody>
                      <p className="flex items-center gap-2 text-sm font-bold text-ink">
                        <span className={cn("inline-block h-2.5 w-2.5 rounded-full", NUTRIENT_DOT[r.nutrient])} />
                        {t(`nutrients.${r.nutrient}`)}
                      </p>
                      <p className="mt-2 text-3xl font-extrabold text-ink">
                        {formatRs(r.costPerKg)}
                        <span className="text-sm font-medium text-ink-faint"> {t("results.perKg")}</span>
                      </p>
                      <p className="mt-1 text-xs text-ink-faint">
                        {t("results.kgInPack", { kg: r.nutrientKg.toFixed(2) })} ·{" "}
                        {r.benchmarkProduct}: {formatRs(r.benchmarkCostPerKg)}/kg
                      </p>
                      <p
                        className={cn(
                          "mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold",
                          r.ratio <= 1.1
                            ? "bg-leaf-100 text-leaf-800 dark:bg-leaf-950/60 dark:text-leaf-200"
                            : r.ratio <= 1.5
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                              : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200"
                        )}
                      >
                        {t("results.vsBenchmark", {
                          ratio: r.ratio.toFixed(1),
                          product: r.benchmarkProduct,
                        })}
                      </p>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Verdict */}
              <div className={cn("rounded-2xl border-2 p-5 sm:p-6", style.ring, style.bg)}>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">{style.icon}</span>
                  <span className={cn("rounded-full px-3 py-1 text-sm font-bold", style.badge)}>
                    {t(`verdicts.${analysis.verdict}.title`)}
                  </span>
                </p>
                <p className="mt-3 text-base leading-relaxed text-ink">
                  {analysis.verdict === "good" && (
                    <>
                      {t("results.verdictGood", {
                        name: name.trim() || t("results.thisProduct"),
                      })}
                    </>
                  )}
                  {analysis.verdict === "pricier" && analysis.worstNutrient && (
                    <>
                      {t("results.verdictPricier", {
                        nutrient: t(`nutrients.${analysis.worstNutrient.nutrient}`),
                        ratio: analysis.worstRatio.toFixed(1),
                        product: analysis.worstNutrient.benchmarkProduct,
                        price: formatRs(analysis.worstNutrient.benchmarkCostPerKg),
                      })}
                    </>
                  )}
                  {analysis.verdict === "expensive" && analysis.worstNutrient && (
                    <>
                      {t("results.verdictExpensive", {
                        nutrient: t(`nutrients.${analysis.worstNutrient.nutrient}`),
                        ratio: analysis.worstRatio.toFixed(1),
                        product: analysis.worstNutrient.benchmarkProduct,
                        price: formatRs(analysis.worstNutrient.benchmarkCostPerKg),
                      })}
                    </>
                  )}
                </p>
              </div>

              {/* Comparison table */}
              <Card>
                <CardBody>
                  <h2 className="mb-3 text-base font-bold text-ink">
                    {t("results.benchTitle")}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-line text-left text-ink-faint">
                          <th className="py-2 pr-3 font-semibold">{t("results.thNutrient")}</th>
                          <th className="py-2 pr-3 font-semibold">{t("results.thYours")}</th>
                          <th className="py-2 pr-3 font-semibold">{t("results.thCheapest")}</th>
                          <th className="py-2 font-semibold">{t("results.thRatio")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.results.map((r) => (
                          <tr key={r.nutrient} className="border-b border-line/60 last:border-0">
                            <td className="py-2.5 pr-3 font-semibold text-ink">
                              {t(`nutrients.${r.nutrient}`)}
                            </td>
                            <td className="py-2.5 pr-3 text-ink">{formatRs(r.costPerKg)}/kg</td>
                            <td className="py-2.5 pr-3 text-ink-soft">
                              {r.benchmarkProduct} · {formatRs(r.benchmarkCostPerKg)}/kg
                            </td>
                            <td className="py-2.5 font-bold text-ink">
                              {r.ratio.toFixed(1)}×
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : (
            <Card className="border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
              <CardBody>
                <p className="text-sm text-ink">
                  {t("results.noInput")}
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Benchmark strip */}
      <Card>
        <CardBody>
          <h2 className="mb-2 text-sm font-bold text-ink">
            {t("results.cheapTitle")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_NUTRIENTS.map((nut) => {
              const b = benchmarks[nut];
              return b ? (
                <span
                  key={nut}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  {t("results.cheapLine", {
                    nutrient: t(`nutrients.${nut}`),
                    product: b.productName,
                    price: formatRs(b.costPerKg),
                  })}
                </span>
              ) : null;
            })}
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            {t("results.footnote")}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
