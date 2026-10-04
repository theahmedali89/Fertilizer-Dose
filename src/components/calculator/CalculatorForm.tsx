"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/fields";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { AREA_UNITS, CROPS, calculateDose } from "@/lib/agronomy";
import { SaveCalcButton } from "@/components/garden/SaveCalcButton";

const SOILS = [
  "Loam (default)",
  "Clay loam",
  "Sandy loam",
  "Clay",
  "Sandy",
  "Saline / salt-affected",
];

export function CalculatorForm() {
  const t = useTranslations("calculator");
  const verified = CROPS.filter((c) => c.npk);
  const [cropSlug, setCropSlug] = useState(verified[0].slug);
  const [area, setArea] = useState("5");
  const [unit, setUnit] = useState("acre");
  const [soil, setSoil] = useState(SOILS[0]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const crop = CROPS.find((c) => c.slug === cropSlug)!;

  const result = useMemo(() => {
    if (!submitted) return null;
    const a = parseFloat(area);
    if (!a || a <= 0) return null;
    return calculateDose(crop, a, unit);
  }, [submitted, area, crop, unit]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(area);
    if (!a || a <= 0) {
      setError(t("form.areaError"));
      setSubmitted(false);
      return;
    }
    if (a > 100000) {
      setError(t("form.areaLargeError"));
      setSubmitted(false);
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
      {/* Form */}
      <Card>
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-5">
            <Field label={t("form.crop")}>
              <Select value={cropSlug} onChange={(e) => { setCropSlug(e.target.value); setSubmitted(false); }}>
                {CROPS.map((c) => (
                  <option key={c.slug} value={c.slug} disabled={!c.npk}>
                    {c.name} {c.npk ? "" : `(${t("form.inReview")})`}
                  </option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-ink-faint">
                {t("form.cropHint")}
              </p>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("form.area")}>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={area}
                  onChange={(e) => { setArea(e.target.value); setSubmitted(false); }}
                  placeholder={t("form.areaPlaceholder")}
                />
              </Field>
              <Field label={t("form.unit")}>
                <Select value={unit} onChange={(e) => { setUnit(e.target.value); setSubmitted(false); }}>
                  {AREA_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label={t("form.soil")} hint={t("form.soilHint")}>
              <Select value={soil} onChange={(e) => setSoil(e.target.value)}>
                {SOILS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>

            {error && (
              <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full">
              {t("form.submit")}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Results */}
      <div>
        {!result ? (
          <Card className="border-dashed">
            <CardBody className="text-center py-14">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-leaf-100 dark:bg-leaf-950 grid place-items-center text-leaf-700 dark:text-leaf-300 mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold">{t("empty.title")}</h3>
              <p className="text-sm text-ink-soft mt-2 max-w-sm mx-auto">
                {t("empty.desc")}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-5">
            <Card>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                  <h3 className="font-display text-2xl font-semibold">
                    {result.cropName} — {result.area} {result.unitLabel}
                  </h3>
                  <SaveCalcButton
                    cropSlug={crop.slug}
                    area={result.area}
                    unit={unit}
                    products={result.lines}
                  />
                </div>
                <p className="text-sm text-ink-faint">
                  {t("results.recommendedLine", {
                    n: crop.npk!.n,
                    p: crop.npk!.p,
                    k: crop.npk!.k,
                    region: result.region,
                  })}
                </p>
                <div className="mt-5 grid sm:grid-cols-3 gap-3">
                  {result.lines.map((l) => (
                    <div key={l.product} className="rounded-xl border border-line bg-surface-2 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">{l.product}</p>
                      <p className="mt-1 font-display text-3xl font-semibold">
                        {l.kg}<span className="text-base font-sans font-normal text-ink-faint"> {t("results.kgUnit")}</span>
                      </p>
                      <p className="text-xs text-ink-faint mt-0.5">≈ {l.bags} {t("results.bags")}</p>
                      <p className="text-xs text-ink-soft mt-2 leading-relaxed">{l.purpose}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-leaf-100 dark:bg-leaf-950 px-4 py-3">
                  <span className="text-sm font-semibold">{t("results.total")}</span>
                  <span className="font-display text-xl font-semibold">{result.totalKg} {t("results.kgUnit")}</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h4 className="font-display text-lg font-semibold mb-3">{t("results.howTitle")}</h4>
                <ol className="space-y-2.5">
                  {result.steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-leaf-700 dark:bg-leaf-600 text-white text-xs font-bold grid place-items-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-ink-soft">{s}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 rounded-xl border border-line bg-surface-2 p-4 text-xs text-ink-faint leading-relaxed">
                  <p><b className="text-ink-soft">{t("results.sourceLabel")}</b> {result.source}</p>
                  <p className="mt-1"><b className="text-ink-soft">{t("results.soilNoteLabel")}</b> {soil === SOILS[0]
                    ? t("results.soilDefault")
                    : t("results.soilCustom", { soil, soilLower: soil.toLowerCase() })}</p>
                  <p className="mt-1">{t("results.disclaimer")}</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h4 className="font-display text-lg font-semibold mb-3">{t("results.scheduleTitle")}</h4>
                <div className="space-y-3">
                  {crop.stages.map((st, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="shrink-0 text-xs font-bold text-leaf-800 dark:text-leaf-300 bg-leaf-100 dark:bg-leaf-950 border border-leaf-200 dark:border-leaf-800 rounded-full px-2.5 py-1">
                        {st.timing}
                      </span>
                      <div>
                        <p className="font-semibold text-sm">{st.name}</p>
                        <p className="text-sm text-ink-soft">{st.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
