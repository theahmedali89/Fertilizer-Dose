"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/fields";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Badge } from "@/components/ui/Badge";
import {
  AREA_UNITS,
  calculateDose,
  type CropInfo,
} from "@/lib/agronomy";
import {
  evaluateSoilTest,
  normalizePtoMgKg,
  normalizeKtoKgHa,
  type SoilUnit,
  type NutrientRating,
} from "@/lib/soilTest";

const CUSTOM = "custom";

const r1 = (x: number) => Math.round(x * 10) / 10;

function toNum(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const v = parseFloat(t);
  return Number.isFinite(v) ? v : null;
}

function ratingVariant(rating: NutrientRating | null): "verified" | "review" | "neutral" {
  if (rating === "low") return "review";
  if (rating === "high") return "verified";
  return "neutral";
}

export function SoilTestForm({ crops }: { crops: CropInfo[] }) {
  const t = useTranslations("soilTest");
  const verified = crops.filter((c) => c.npk);

  const [cropSlug, setCropSlug] = useState(verified[0]?.slug ?? CUSTOM);
  const [area, setArea] = useState("5");
  const [unit, setUnit] = useState("acre");
  const [pVal, setPVal] = useState("");
  const [pUnit, setPUnit] = useState<SoilUnit>("ppm");
  const [kVal, setKVal] = useState("");
  const [kUnit, setKUnit] = useState<SoilUnit>("kgHa");
  const [oc, setOc] = useState("");
  const [ph, setPh] = useState("");
  const [baseN, setBaseN] = useState("");
  const [baseP, setBaseP] = useState("");
  const [baseK, setBaseK] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isCustomPicked = cropSlug === CUSTOM;
  const crop = crops.find((c) => c.slug === cropSlug);
  // Honest fallback: a crop with no verified recommendation behaves like
  // the custom base-dose path, clearly labeled as generic guidance.
  const isCustom = isCustomPicked || !crop?.npk;

  const result = useMemo(() => {
    if (!submitted) return null;
    const a = toNum(area);
    if (a === null || a <= 0) return null;

    let base: { n: number; p: number; k: number } | null = null;
    if (!isCustom && crop?.npk) {
      base = { n: crop.npk.n, p: crop.npk.p, k: crop.npk.k };
    } else {
      const n = toNum(baseN) ?? 0;
      const p = toNum(baseP) ?? 0;
      const k = toNum(baseK) ?? 0;
      base = { n, p, k };
    }

    const pMgKg = toNum(pVal) === null ? null : normalizePtoMgKg(toNum(pVal)!, pUnit);
    const kKgHa = toNum(kVal) === null ? null : normalizeKtoKgHa(toNum(kVal)!, kUnit);
    const ocPct = toNum(oc);
    const phVal = toNum(ph);

    const evalOut = evaluateSoilTest(base, { pMgKg, kKgHa, ocPct, ph: phVal });

    const synthetic: CropInfo = {
      slug: `soil-test-${cropSlug}`,
      name: isCustom ? "Custom" : (crop?.name ?? "Custom"),
      urdu: crop?.urdu ?? "",
      season: "",
      seasonDetail: "",
      soil: "",
      water: "",
      stages: [],
      problems: [],
      npk: {
        n: evalOut.n.adjustedKgHa,
        p: evalOut.p.adjustedKgHa,
        k: evalOut.k.adjustedKgHa,
      },
      npkSource: isCustom
        ? t("results.genericLabel")
        : (crop?.npkSource ?? ""),
      region: isCustom ? t("results.genericLabel") : (crop?.region ?? ""),
    };

    const dose = calculateDose(synthetic, a, unit);
    return { evalOut, dose, base };
  }, [submitted, area, unit, cropSlug, crop, isCustom, pVal, pUnit, kVal, kUnit, oc, ph, baseN, baseP, baseK, t]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = toNum(area);
    if (a === null || a <= 0) {
      setError(t("form.areaError"));
      setSubmitted(false);
      return;
    }
    if (a > 100000) {
      setError(t("form.areaLargeError"));
      setSubmitted(false);
      return;
    }
    const phVal = toNum(ph);
    if (phVal !== null && (phVal < 0 || phVal > 14)) {
      setError(t("form.phRangeError"));
      setSubmitted(false);
      return;
    }
    for (const v of [pVal, kVal, oc, baseN, baseP, baseK]) {
      const n = toNum(v);
      if (n !== null && n < 0) {
        setError(t("form.negativeError"));
        setSubmitted(false);
        return;
      }
    }
    setError("");
    setSubmitted(true);
  };

  const basisNotes = t.raw("results.basis") as string[];

  const ratingLabel = (r: NutrientRating | null) =>
    r === null ? t("results.notRated") : t(`results.${r}`);

  const pctChip = (rating: NutrientRating | null, pct: number) => {
    if (rating === null) return t("results.notRatedNote");
    if (pct > 0) return `+${pct}% · ${t("results.buildUp")}`;
    if (pct < 0) return `${pct}% · ${t("results.drawdown")}`;
    return t("results.maintenance");
  };

  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
      {/* Form */}
      <Card>
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-5">
            <Field label={t("form.crop")}>
              <SearchableSelect
                id="soil-crop-select"
                ariaLabel={t("form.crop")}
                placeholder={t("form.cropSearchPlaceholder")}
                value={cropSlug}
                onChange={(v) => { setCropSlug(v); setSubmitted(false); }}
                options={[
                  { value: CUSTOM, label: t("form.custom") },
                  ...crops.map((c) => ({
                    value: c.slug,
                    label: c.name,
                    disabled: !c.npk,
                    hint: c.npk ? undefined : t("form.inReview"),
                  })),
                ]}
              />
              <p className="mt-1.5 text-xs text-ink-faint">
                {t("form.cropHint")}
              </p>
            </Field>

            {isCustom && (
              <div className="rounded-xl border border-harvest-200 dark:border-harvest-800 bg-harvest-50 dark:bg-harvest-950/30 p-4">
                {crop && !crop.npk && !isCustomPicked && (
                  <p className="text-xs font-medium text-harvest-800 dark:text-harvest-300 mb-3">
                    {t("form.noVerified", { crop: crop.name })}
                  </p>
                )}
                <p className="text-xs font-bold uppercase tracking-wider text-harvest-800 dark:text-harvest-300 mb-2">
                  {t("form.custom")}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Field label={t("form.baseN")}>
                    <Input
                      type="number" min="0" step="any" inputMode="decimal"
                      value={baseN}
                      onChange={(e) => { setBaseN(e.target.value); setSubmitted(false); }}
                      placeholder="0"
                    />
                  </Field>
                  <Field label={t("form.baseP")}>
                    <Input
                      type="number" min="0" step="any" inputMode="decimal"
                      value={baseP}
                      onChange={(e) => { setBaseP(e.target.value); setSubmitted(false); }}
                      placeholder="0"
                    />
                  </Field>
                  <Field label={t("form.baseK")}>
                    <Input
                      type="number" min="0" step="any" inputMode="decimal"
                      value={baseK}
                      onChange={(e) => { setBaseK(e.target.value); setSubmitted(false); }}
                      placeholder="0"
                    />
                  </Field>
                </div>
                <p className="mt-2 text-xs text-ink-faint">{t("form.baseHint")}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("form.area")}>
                <Input
                  type="number" min="0" step="any" inputMode="decimal"
                  value={area}
                  onChange={(e) => { setArea(e.target.value); setSubmitted(false); }}
                  placeholder="e.g. 5"
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

            <div className="grid grid-cols-2 gap-3">
              <Field label={`${t("form.phosphorus")} (${t("form.optional")})`} hint={t("form.soilTestHint")}>
                <div className="flex flex-col gap-2 min-[480px]:flex-row">
                  <Input
                    type="number" min="0" step="any" inputMode="decimal"
                    value={pVal}
                    onChange={(e) => { setPVal(e.target.value); setSubmitted(false); }}
                    placeholder="—"
                  />
                  <Select value={pUnit} onChange={(e) => setPUnit(e.target.value as SoilUnit)} className="w-full min-[480px]:w-28 min-[480px]:shrink-0">
                    <option value="ppm">{t("form.unitPpm")}</option>
                    <option value="kgHa">{t("form.unitKgHa")}</option>
                  </Select>
                </div>
              </Field>
              <Field label={`${t("form.potassium")} (${t("form.optional")})`}>
                <div className="flex flex-col gap-2 min-[480px]:flex-row">
                  <Input
                    type="number" min="0" step="any" inputMode="decimal"
                    value={kVal}
                    onChange={(e) => { setKVal(e.target.value); setSubmitted(false); }}
                    placeholder="—"
                  />
                  <Select value={kUnit} onChange={(e) => setKUnit(e.target.value as SoilUnit)} className="w-full min-[480px]:w-28 min-[480px]:shrink-0">
                    <option value="ppm">{t("form.unitPpm")}</option>
                    <option value="kgHa">{t("form.unitKgHa")}</option>
                  </Select>
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label={`${t("form.organicCarbon")} (${t("form.optional")})`}
                hint={t("form.nProxyNote")}
              >
                <Input
                  type="number" min="0" step="any" inputMode="decimal"
                  value={oc}
                  onChange={(e) => { setOc(e.target.value); setSubmitted(false); }}
                  placeholder="—"
                />
              </Field>
              <Field label={`${t("form.ph")} (${t("form.optional")})`}>
                <Input
                  type="number" min="0" max="14" step="any" inputMode="decimal"
                  value={ph}
                  onChange={(e) => { setPh(e.target.value); setSubmitted(false); }}
                  placeholder="—"
                />
              </Field>
            </div>

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
        {!result || !result.dose ? (
          <Card className="border-dashed">
            <CardBody className="text-center py-14">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-leaf-100 dark:bg-leaf-950 grid place-items-center text-leaf-700 dark:text-leaf-300 mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3v18M5 8c4 0 7 2 7 5s-3 5-7 5M19 8c-4 0-7 2-7 5s3 5 7 5" strokeLinecap="round" />
                  <path d="M8 21h8" strokeLinecap="round" />
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
                <h3 className="font-display text-2xl font-semibold">
                  {t("results.title")}
                </h3>
                <p className="text-sm text-ink-faint mt-1">
                  {t("results.baseLine", {
                    n: r1(result.base.n),
                    p: r1(result.base.p),
                    k: r1(result.base.k),
                  })}
                </p>
                <p className="mt-2 text-base font-semibold text-leaf-800 dark:text-leaf-300">
                  {t("results.adjustedLine", {
                    n: r1(result.evalOut.n.adjustedKgHa),
                    p: r1(result.evalOut.p.adjustedKgHa),
                    k: r1(result.evalOut.k.adjustedKgHa),
                    region: result.dose.region,
                  })}
                </p>

                {/* Rating badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant={ratingVariant(result.evalOut.p.rating)}>
                    {t("results.ratingP")}: {ratingLabel(result.evalOut.p.rating)}
                  </Badge>
                  <Badge variant={ratingVariant(result.evalOut.k.rating)}>
                    {t("results.ratingK")}: {ratingLabel(result.evalOut.k.rating)}
                  </Badge>
                  <Badge variant={ratingVariant(result.evalOut.n.rating)}>
                    {t("results.ratingN")}: {ratingLabel(result.evalOut.n.rating)}
                  </Badge>
                  {result.evalOut.phClass && (
                    <Badge variant="neutral">
                      {t("results.phLabel")}: {t(`results.${result.evalOut.phClass}`)}
                    </Badge>
                  )}
                </div>

                {result.evalOut.pFixationRisk && (
                  <p className="mt-3 text-sm text-harvest-800 dark:text-harvest-300 bg-harvest-50 dark:bg-harvest-950/30 border border-harvest-200 dark:border-harvest-800 rounded-xl px-4 py-2.5">
                    {t("results.phFixation")}
                  </p>
                )}

                {/* Per-nutrient adjustment detail */}
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  {(
                    [
                      { label: "N", adj: result.evalOut.n },
                      { label: "P₂O₅", adj: result.evalOut.p },
                      { label: "K₂O", adj: result.evalOut.k },
                    ] as const
                  ).map(({ label, adj }) => (
                    <div key={label} className="rounded-xl border border-line bg-surface-2 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">{label}</p>
                      <p className="mt-1 text-sm">
                        <span className="text-ink-faint line-through">{r1(adj.baseKgHa)}</span>
                        <span className="mx-1.5 text-ink-faint">→</span>
                        <span className="font-display text-2xl font-semibold">{r1(adj.adjustedKgHa)}</span>
                        <span className="text-xs text-ink-faint"> {t("results.kgUnit")}/ha</span>
                      </p>
                      <p className="text-xs text-ink-soft mt-1.5">
                        {ratingLabel(adj.rating)} · {pctChip(adj.rating, adj.pctChange)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Product cards */}
                <div className="mt-5 grid sm:grid-cols-3 gap-3">
                  {result.dose.lines.map((l) => (
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
                  <span className="font-display text-xl font-semibold">{result.dose.totalKg} {t("results.kgUnit")}</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h4 className="font-display text-lg font-semibold mb-3">{t("results.basisTitle")}</h4>
                <ul className="space-y-2.5">
                  {basisNotes.map((b, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-leaf-700 dark:bg-leaf-600 text-white text-xs font-bold grid place-items-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-xl border border-line bg-surface-2 p-4 text-xs text-ink-faint leading-relaxed">
                  <p><b className="text-ink-soft">{t("results.sourceLabel")}</b> {result.dose.source}</p>
                  <p className="mt-1 font-medium text-ink-soft">{t("results.disclaimer")}</p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
