"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/fields";
import { ORGANIC_FERTILIZERS } from "@/lib/agronomy";

const CUSTOM = "__custom__";

/**
 * Calculator Mode A — organic dose from USER-ENTERED analysis.
 * Pure arithmetic on user inputs: the app holds no organic nutrient data
 * of its own. kg/ha = rate (t/ha) × 1,000 × (percentage ÷ 100).
 */
export function OrganicDoseSection() {
  const t = useTranslations("calculator.organic");
  const [material, setMaterial] = useState(ORGANIC_FERTILIZERS[0].slug);
  const [nPct, setNPct] = useState("");
  const [pPct, setPPct] = useState("");
  const [kPct, setKPct] = useState("");
  const [rate, setRate] = useState("");
  const [warnDismissed, setWarnDismissed] = useState(false);

  const selected = ORGANIC_FERTILIZERS.find((m) => m.slug === material);

  const num = (v: string): number | null => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  const result = useMemo(() => {
    const n = num(nPct), p = num(pPct), k = num(kPct), r = num(rate);
    if (n === null || p === null || k === null || r === null) return null;
    if (n > 100 || p > 100 || k > 100) return null;
    // 1 t/ha = 1,000 kg/ha → kg nutrient/ha = rate × 1,000 × (pct / 100)
    const kgHa = (pct: number) => Math.round(r * 1000 * (pct / 100) * 10) / 10;
    return { n: kgHa(n), p: kgHa(p), k: kgHa(k) };
  }, [nPct, pPct, kPct, rate]);

  const rangeText = selected && selected.nMin != null && selected.nMax != null
    ? `N ${selected.nMin}–${selected.nMax}%, P₂O₅ ${selected.pMin}–${selected.pMax}%, K₂O ${selected.kMin}–${selected.kMax}%`
    : null;

  return (
    <Card className="mt-6">
      <CardBody>
        <h3 className="font-display text-2xl font-semibold">{t("title")}</h3>
        <p className="mt-2 text-sm text-ink-soft leading-relaxed max-w-3xl">{t("desc")}</p>

        {!warnDismissed && (
          <div className="mt-4 rounded-2xl border border-harvest-300 dark:border-harvest-800 bg-harvest-50 dark:bg-harvest-950/40 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold mb-1">{t("warnTitle")}</p>
                <p className="text-sm text-ink-soft leading-relaxed">{t("warnBody")}</p>
              </div>
              <button
                type="button"
                onClick={() => setWarnDismissed(true)}
                className="shrink-0 text-xs font-semibold text-ink-faint hover:text-ink border border-line rounded-full px-3 py-1.5 transition-colors"
              >
                {t("dismiss")}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Field label={t("materialLabel")}>
            <Select value={material} onChange={(e) => setMaterial(e.target.value)}>
              {ORGANIC_FERTILIZERS.map((m) => (
                <option key={m.slug} value={m.slug}>{m.name}</option>
              ))}
              <option value={CUSTOM}>{t("customOption")}</option>
            </Select>
          </Field>
          <Field label={t("nLabel")}>
            <Input type="number" min="0" max="100" step="any" inputMode="decimal" value={nPct}
              onChange={(e) => setNPct(e.target.value)} placeholder="0.5" />
          </Field>
          <Field label={t("pLabel")}>
            <Input type="number" min="0" max="100" step="any" inputMode="decimal" value={pPct}
              onChange={(e) => setPPct(e.target.value)} placeholder="0.2" />
          </Field>
          <Field label={t("kLabel")}>
            <Input type="number" min="0" max="100" step="any" inputMode="decimal" value={kPct}
              onChange={(e) => setKPct(e.target.value)} placeholder="0.5" />
          </Field>
          <Field label={`${t("rateLabel")} (${t("rateUnit")})`}>
            <Input type="number" min="0" step="any" inputMode="decimal" value={rate}
              onChange={(e) => setRate(e.target.value)} placeholder="10" />
          </Field>
        </div>

        {rangeText && selected && (
          <p className="mt-2 text-xs text-ink-faint leading-relaxed">
            {t("rangeHint", { name: selected.name, range: rangeText })}
          </p>
        )}
        {material === CUSTOM && (
          <p className="mt-2 text-xs text-ink-faint leading-relaxed">{t("noRangeHint")}</p>
        )}

        <div className="mt-5 rounded-2xl border border-line bg-surface-2 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-1">{t("formulaLabel")}</p>
          <p className="font-mono text-sm mb-4">{t("formula")}</p>
          {result ? (
            <>
              <p className="text-sm font-bold mb-2">{t("resultsTitle")}</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: t("resultN"), v: result.n },
                  { label: t("resultP"), v: result.p },
                  { label: t("resultK"), v: result.k },
                ].map((r) => (
                  <div key={r.label} className="rounded-xl border border-line bg-surface px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">{r.label}</p>
                    <p className="mt-1 font-display text-2xl font-semibold">
                      {r.v}<span className="text-sm font-sans font-normal text-ink-faint"> {t("perHa")}</span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-faint">{t("enterValues")}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
