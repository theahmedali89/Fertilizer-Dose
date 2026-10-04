"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Field, Input } from "@/components/ui/fields";
import { FERTILIZERS } from "@/lib/agronomy";
import { getItemsByCategory } from "@/lib/growing";
import { cn } from "@/lib/utils";

type Tab = "fertilizers" | "crops";

interface FertPrice {
  bagPrice: string;
  bagKg: string;
}

function perKgNutrient(bagPrice: number, bagKg: number, pct: number): number | null {
  if (bagPrice <= 0 || bagKg <= 0 || pct <= 0) return null;
  return bagPrice / bagKg / (pct / 100);
}

export function CompareTool() {
  const t = useTranslations("tools.compare");
  const [tab, setTab] = useState<Tab>("fertilizers");
  const [selected, setSelected] = useState<string[]>(["urea", "dap", "mop"]);
  const [prices, setPrices] = useState<Record<string, FertPrice>>({});
  const [cropSlugs, setCropSlugs] = useState<string[]>(["wheat", "rice", "maize"]);

  const crops = useMemo(() => getItemsByCategory("crop"), []);

  const toggleFert = (slug: string) =>
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  const toggleCrop = (slug: string) =>
    setCropSlugs((s) =>
      s.includes(slug) ? s.filter((x) => x !== slug) : s.length < 3 ? [...s, slug] : s
    );

  const fertRows = useMemo(() => {
    const rows = selected
      .map((slug) => FERTILIZERS.find((f) => f.slug === slug)!)
      .filter(Boolean)
      .map((f) => {
        const p = prices[f.slug] ?? { bagPrice: "", bagKg: "50" };
        const bagPrice = parseFloat(p.bagPrice);
        const bagKg = parseFloat(p.bagKg) || 50;
        return {
          f,
          bagPrice: Number.isFinite(bagPrice) ? bagPrice : null,
          bagKg,
          perN: bagPrice > 0 ? perKgNutrient(bagPrice, bagKg, f.n) : null,
          perP: bagPrice > 0 ? perKgNutrient(bagPrice, bagKg, f.p) : null,
          perK: bagPrice > 0 ? perKgNutrient(bagPrice, bagKg, f.k) : null,
        };
      });
    const min = (fn: (r: (typeof rows)[number]) => number | null) => {
      const vals = rows.map(fn).filter((v): v is number => v !== null);
      return vals.length ? Math.min(...vals) : null;
    };
    return { rows, minN: min((r) => r.perN), minP: min((r) => r.perP), minK: min((r) => r.perK) };
  }, [selected, prices]);

  const setPrice = (slug: string, patch: Partial<FertPrice>) =>
    setPrices((ps) => {
      const prev = ps[slug] ?? { bagPrice: "", bagKg: "50" };
      return { ...ps, [slug]: { ...prev, ...patch } };
    });

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1.5 mb-6" role="tablist">
        {(["fertilizers", "crops"] as Tab[]).map((tb) => (
          <button
            key={tb}
            role="tab"
            aria-selected={tab === tb}
            onClick={() => setTab(tb)}
            className={cn(
              "rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
              tab === tb
                ? "bg-leaf-700 dark:bg-leaf-600 text-white"
                : "border border-line text-ink-soft hover:border-leaf-600"
            )}
          >
            {t(tb === "fertilizers" ? "tabFertilizers" : "tabCrops")}
          </button>
        ))}
      </div>

      {tab === "fertilizers" && (
        <div className="space-y-5">
          <Card>
            <CardBody>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-2.5">{t("selectFertilizers")}</p>
              <div className="flex flex-wrap gap-2">
                {FERTILIZERS.map((f) => (
                  <button
                    key={f.slug}
                    onClick={() => toggleFert(f.slug)}
                    aria-pressed={selected.includes(f.slug)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium border transition-colors",
                      selected.includes(f.slug)
                        ? "bg-leaf-700 dark:bg-leaf-600 text-white border-transparent"
                        : "border-line text-ink-soft hover:border-leaf-600"
                    )}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-faint leading-relaxed">{t("userPriceNote")}</p>
            </CardBody>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fertRows.rows.map(({ f }) => {
              const p = prices[f.slug] ?? { bagPrice: "", bagKg: "50" };
              return (
                <Card key={f.slug}>
                  <CardBody>
                    <h3 className="font-display text-lg font-semibold">{f.name}</h3>
                    <p className="text-xs text-ink-faint mt-0.5">N {f.n}% · P₂O₅ {f.p}% · K₂O {f.k}%</p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <Field label={t("pricePerBag")}>
                        <Input
                          type="number" min="0" step="any" inputMode="decimal" placeholder="0"
                          value={p.bagPrice}
                          onChange={(e) => setPrice(f.slug, { bagPrice: e.target.value })}
                        />
                      </Field>
                      <Field label={t("bagSize")}>
                        <Input
                          type="number" min="0" step="any" inputMode="decimal"
                          value={p.bagKg}
                          onChange={(e) => setPrice(f.slug, { bagKg: e.target.value })}
                        />
                      </Field>
                    </div>
                    <Link href={`/fertilizers/${f.slug}`} className="mt-2 inline-block text-xs font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
                      {t("viewFertilizer")} →
                    </Link>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {fertRows.rows.length > 0 && (
            <Card>
              <CardBody className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="text-start text-xs uppercase tracking-wider text-ink-faint">
                      <th className="text-start font-bold pb-3 pe-4"></th>
                      <th className="text-start font-bold pb-3 pe-4">{t("pricePerBag")}</th>
                      <th className="text-start font-bold pb-3 pe-4">{t("pricePerKgN")}</th>
                      <th className="text-start font-bold pb-3 pe-4">{t("pricePerKgP")}</th>
                      <th className="text-start font-bold pb-3">{t("pricePerKgK")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fertRows.rows.map(({ f, bagPrice, perN, perP, perK }) => (
                      <tr key={f.slug} className="border-t border-line">
                        <td className="py-3 pe-4 font-semibold">{f.name}</td>
                        <td className="py-3 pe-4 text-ink-soft">{bagPrice !== null ? bagPrice.toLocaleString() : t("na")}</td>
                        {[
                          [perN, fertRows.minN],
                          [perP, fertRows.minP],
                          [perK, fertRows.minK],
                        ].map(([v, m], i) => (
                          <td key={i} className="py-3 pe-4 text-ink-soft">
                            {v === null ? (
                              t("na")
                            ) : (
                              <span className={cn(m !== null && v === m && "font-bold text-leaf-800 dark:text-leaf-300")}>
                                {(v as number).toFixed(1)}
                                {m !== null && v === m && (
                                  <span className="ms-1.5 text-[10px] font-bold uppercase tracking-wide text-leaf-700 dark:text-leaf-400">
                                    {t("cheapest")}
                                  </span>
                                )}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {tab === "crops" && (
        <div className="space-y-5">
          <Card>
            <CardBody>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-2.5">{t("selectCrops")}</p>
              <div className="flex flex-wrap gap-2">
                {crops.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => toggleCrop(c.slug)}
                    aria-pressed={cropSlugs.includes(c.slug)}
                    disabled={!cropSlugs.includes(c.slug) && cropSlugs.length >= 3}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium border transition-colors disabled:opacity-40",
                      cropSlugs.includes(c.slug)
                        ? "bg-leaf-700 dark:bg-leaf-600 text-white border-transparent"
                        : "border-line text-ink-soft hover:border-leaf-600"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {cropSlugs.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cropSlugs.map((slug) => {
                const item = crops.find((c) => c.slug === slug)!;
                return (
                  <Card key={slug} className="min-w-0">
                    <CardBody>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                        {item.verificationStatus === "verified" ? (
                          <Badge variant="verified">Verified</Badge>
                        ) : (
                          <Badge variant="review">{t("inReview")}</Badge>
                        )}
                      </div>
                      <dl className="mt-3 space-y-2 text-sm">
                        <div>
                          <dt className="text-xs text-ink-faint">{t("dose")}</dt>
                          <dd className="font-semibold mt-0.5">
                            {item.npk ? `${item.npk.n}–${item.npk.p}–${item.npk.k} kg/ha` : t("noDoseData")}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ink-faint">{t("season")}</dt>
                          <dd className="text-ink-soft mt-0.5">{item.season ?? t("na")}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ink-faint">{t("water")}</dt>
                          <dd className="text-ink-soft mt-0.5">{item.water ?? t("na")}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ink-faint">{t("soil")}</dt>
                          <dd className="text-ink-soft mt-0.5">{item.soil ?? t("na")}</dd>
                        </div>
                      </dl>
                      <Link href={`/crops/${item.slug}`} className="mt-3 inline-block text-xs font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
                        {t("viewGuide")} →
                      </Link>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
