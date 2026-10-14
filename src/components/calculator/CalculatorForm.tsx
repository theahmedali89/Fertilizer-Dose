"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/fields";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { AREA_UNITS, calculateDose, calculateDoseRange, fmtRange, type CropInfo } from "@/lib/agronomy";
import { STANDARD_YIELDS_T_HA, DEFAULT_STANDARD_YIELD_T_HA, MAX_YIELD_FACTOR } from "@/lib/agronomy";
import { SaveCalcButton } from "@/components/garden/SaveCalcButton";
import { planSplitDose } from "@/lib/splitDose";

const SOILS = [
  "Loam (default)",
  "Clay loam",
  "Sandy loam",
  "Clay",
  "Sandy",
  "Saline / salt-affected",
];

export function CalculatorForm({ crops, initialArea, initialUnit, initialCrop }: { crops: CropInfo[]; initialArea?: string; initialUnit?: string; initialCrop?: string }) {
  const t = useTranslations("calculator");
  // Selectable = point dose OR ranged dose. Ranged crops unlock with the
  // range UI (range in → range out); formula/null-N crops stay locked.
  const selectable = crops.filter((c) => c.npk || c.npkRange);
  // Pre-fill from ?crop= (programmatic SEO pages); fall back to first selectable.
  const [cropSlug, setCropSlug] = useState(() =>
    initialCrop && selectable.some((c) => c.slug === initialCrop)
      ? initialCrop
      : selectable[0].slug
  );
  // Land Area Calculator integration: pre-fill from ?area=&unit= (validated).
  const [area, setArea] = useState(() => {
    const v = parseFloat(initialArea ?? "");
    return Number.isFinite(v) && v > 0 ? String(v) : "1";
  });
  const [unit, setUnit] = useState(() => {
    return AREA_UNITS.some((u) => u.id === initialUnit) ? (initialUnit as string) : "acre";
  });
  const [soil, setSoil] = useState(SOILS[0]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  // Target yield (optional): scales the NPK dose by (target ÷ standard yield).
  const [targetYield, setTargetYield] = useState("");
  // 10c — display-only unit toggle; never alters the kg calculation or saved calc
  const [displayUnit, setDisplayUnit] = useState<"kg" | "lbs">("kg");

  const crop = crops.find((c) => c.slug === cropSlug)!;

  /**
   * Target-yield scaling factor. The entered yield is converted to t/ha,
   * divided by the crop's standard reference yield, and capped at
   * MAX_YIELD_FACTOR. Null = no yield entered → classic behavior, unchanged.
   */
  const yieldFactor = useMemo(() => {
    if (!submitted) return null;
    const y = parseFloat(targetYield);
    if (!Number.isFinite(y) || y <= 0) return null;
    const u = AREA_UNITS.find((x) => x.id === unit) ?? AREA_UNITS[0];
    const yieldPerHa = unit === "hectare" ? y : y / u.toHectare;
    const standard = STANDARD_YIELDS_T_HA[crop.slug] ?? DEFAULT_STANDARD_YIELD_T_HA;
    if (standard <= 0) return null;
    return Math.min(yieldPerHa / standard, MAX_YIELD_FACTOR);
  }, [submitted, targetYield, unit, crop.slug]);

  /** Entered yield converted to t/ha, for the "adjusted" note. */
  const yieldPerHaDisplay = useMemo(() => {
    if (yieldFactor == null) return null;
    const y = parseFloat(targetYield);
    const u = AREA_UNITS.find((x) => x.id === unit) ?? AREA_UNITS[0];
    const perHa = unit === "hectare" ? y : y / u.toHectare;
    return Math.round(perHa * 10) / 10;
  }, [yieldFactor, targetYield, unit]);

  /** True only when scaling actually changes the dose. */
  const yieldAdjusted = yieldFactor != null && Math.abs(yieldFactor - 1) > 0.001;

  /**
   * Crop with NPK scaled by the yield factor. The existing calculators run
   * unchanged on this copy, so bag conversion, steps, totals and the split
   * plan all follow the adjusted dose automatically.
   */
  const effectiveCrop = useMemo((): CropInfo => {
    if (!yieldAdjusted || yieldFactor == null) return crop;
    const s = (v: number) => Math.round(v * yieldFactor * 10) / 10;
    const sr = (p: [number, number]): [number, number] => [s(p[0]), s(p[1])];
    return {
      ...crop,
      npk: crop.npk ? { n: s(crop.npk.n), p: s(crop.npk.p), k: s(crop.npk.k) } : null,
      npkRange: crop.npkRange
        ? { n: sr(crop.npkRange.n), p: sr(crop.npkRange.p), k: sr(crop.npkRange.k) }
        : null,
    };
  }, [crop, yieldFactor, yieldAdjusted]);

  const result = useMemo(() => {
    if (!submitted) return null;
    const a = parseFloat(area);
    if (!a || a <= 0) return null;
    return effectiveCrop.npkRange ? calculateDoseRange(effectiveCrop, a, unit) : calculateDose(effectiveCrop, a, unit);
  }, [submitted, area, effectiveCrop, unit]);

  // 10a — generic split-dose schedule derived from the calculated lines
  const splitPlan = useMemo(
    () => (result ? planSplitDose(crop.slug, result.lines) : null),
    [result, crop.slug]
  );

  /**
   * Smart application tips — one per fertilizer in the result, matched by
   * product name, plus the general fertigation protocol. Rendered below the
   * bag breakdown so farmers know HOW to apply, not just how much.
   */
  const applicationTips = useMemo(() => {
    if (!result) return [];
    const tips: { kind: "warning" | "info"; icon: string; title: string; body: string }[] = [];
    const products = result.lines.map((l) => l.product.toUpperCase());
    if (products.some((p) => p.includes("UREA"))) {
      tips.push({
        kind: "warning",
        icon: "⚠️",
        title: t("results.tipUreaTitle"),
        body: t("results.tipUreaBody"),
      });
    }
    if (products.some((p) => p.includes("DAP"))) {
      tips.push({
        kind: "info",
        icon: "💧",
        title: t("results.tipDapTitle"),
        body: t("results.tipDapBody"),
      });
    }
    if (products.some((p) => p.includes("MOP") || p.includes("SOP") || p.includes("POTASH"))) {
      tips.push({
        kind: "info",
        icon: "💧",
        title: t("results.tipPotashTitle"),
        body: t("results.tipPotashBody"),
      });
    }
    if (products.some((p) => p.includes("SSP"))) {
      tips.push({
        kind: "info",
        icon: "🌱",
        title: t("results.tipSspTitle"),
        body: t("results.tipSspBody"),
      });
    }
    // General fertigation protocol — always relevant.
    tips.push({
      kind: "info",
      icon: "🌱",
      title: t("results.tipGeneralTitle"),
      body: t("results.tipGeneralBody"),
    });
    return tips;
  }, [result, t]);

  /**
   * WhatsApp share — builds a compact, forward-friendly schedule card.
   * The message stays in English so the brand format is identical everywhere
   * it gets forwarded.
   *
   * NOTE: helpers (lbsPerAcre, rangeKg/Bags/Lbs) must stay ABOVE this useMemo —
   * the factory runs synchronously during render, so using them before their
   * declaration throws "Cannot access before initialization".
   */
  const lbsPerAcre = (kg: number): number => {
    if (!result || result.areaHa <= 0) return 0;
    return Math.round(((kg / result.areaHa) * 0.892) * 10) / 10;
  };

  // Range display helpers: "x" for exact, "x–y" for ranges.
  const rangeKg = (l: { kg: number; kgMax?: number }): string =>
    l.kgMax != null ? `${l.kg}–${l.kgMax}` : `${l.kg}`;
  const rangeBags = (l: { bags: number; bagsMax?: number }): string =>
    l.bagsMax != null ? `${l.bags}–${l.bagsMax}` : `${l.bags}`;
  const rangeLbs = (l: { kg: number; kgMax?: number }): string =>
    l.kgMax != null ? `${lbsPerAcre(l.kg)}–${lbsPerAcre(l.kgMax)}` : `${lbsPerAcre(l.kg)}`;

  const shareMessage = useMemo(() => {
    if (!result) return "";
    const divider = "━━━━━━━━━━━━";
    const bagLines = result.lines
      .map((l) => {
        const b = rangeBags(l);
        return `${l.product}: ${b} ${b === "1" ? "bag" : "bags"}`;
      })
      .join("\n");
    const stageLines = crop.stages
      .map((st) => `\u2022 ${st.timing}: ${st.note || st.name}`)
      .join("\n");
    return [
      "\u{1F331} FertDose - Fertilizer Schedule",
      `Crop: ${result.cropName} (${result.region})`,
      `Area: ${result.area} ${result.unitLabel}`,
      divider,
      bagLines,
      divider,
      "\u{1F4C5} Stage-wise:",
      stageLines,
      divider,
      "Calculated at fertdose.com",
    ].join("\n");
  }, [result, crop.stages, result?.cropName, result?.region, result?.area, result?.unitLabel]);

  const [shareFeedback, setShareFeedback] = useState<"idle" | "copied">("idle");

  const shareOnWhatsApp = async () => {
    if (!shareMessage) return;
    // 1. Native share sheet (mobile) — best UX where available.
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as Navigator & { share: (d: { title: string; text: string }) => Promise<void> }).share({
          title: "FertDose - Fertilizer Schedule",
          text: shareMessage,
        });
        return;
      }
    } catch {
      // User dismissed the sheet or share failed — fall through to wa.me.
    }
    // 2. Fallback: open WhatsApp with the pre-filled message.
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const copyShareMessage = async () => {
    if (!shareMessage) return;
    try {
      await navigator.clipboard.writeText(shareMessage);
    } catch {
      // Older browsers: hidden-textarea fallback.
      const ta = document.createElement("textarea");
      ta.value = shareMessage;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setShareFeedback("copied");
    window.setTimeout(() => setShareFeedback("idle"), 2000);
  };

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
    if (targetYield.trim() !== "") {
      const y = parseFloat(targetYield);
      if (!Number.isFinite(y) || y <= 0) {
        setError(t("form.yieldError"));
        setSubmitted(false);
        return;
      }
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
              <SearchableSelect
                id="crop-select"
                ariaLabel={t("form.crop")}
                placeholder={t("form.cropSearchPlaceholder")}
                value={cropSlug}
                onChange={(v) => { setCropSlug(v); setSubmitted(false); }}
                options={crops.map((c) => {
                  const unlocked = !!(c.npk || c.npkRange);
                  const hints = [
                    c.underReview ? t("form.underReviewBadge") : null,
                    c.npkRange ? t("form.rangeHint") : null,
                  ].filter(Boolean);
                  return {
                    value: c.slug,
                    label: c.localName ?? c.name,
                    disabled: !unlocked,
                    hint: unlocked ? (hints.length ? hints.join(" · ") : undefined) : t("form.inReview"),
                  };
                })}
              />
              {(crop.underReview || crop.npkRange) && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {crop.underReview && (
                    <Badge variant="review">{t("form.underReviewBadge")}</Badge>
                  )}
                  {crop.npkRange && (
                    <Badge>{t("form.rangeBadge")}</Badge>
                  )}
                </div>
              )}
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

            <Field
              label={`${t("form.targetYield")} (${unit === "hectare" ? t("form.targetYieldUnitHa") : t("form.targetYieldUnitAcre")})`}
              hint={t("form.targetYieldHint")}
            >
              <Input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={targetYield}
                onChange={(e) => { setTargetYield(e.target.value); setSubmitted(false); }}
                placeholder={t("form.targetYieldPlaceholder")}
              />
              <p className="mt-1.5 text-xs leading-relaxed text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2">
                ⚠️ {t("form.targetYieldWarning")}
              </p>
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
                    {crop.underReview && (
                      <Badge variant="review" className="ml-2 align-middle">{t("form.underReviewBadge")}</Badge>
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* 10c — display-only kg/lbs toggle */}
                    <div
                      role="group"
                      aria-label={t("results.unitToggleLabel")}
                      className="inline-flex rounded-full border border-line bg-surface-2 p-0.5 text-xs font-semibold"
                    >
                      <button
                        type="button"
                        onClick={() => setDisplayUnit("kg")}
                        aria-pressed={displayUnit === "kg"}
                        className={`rounded-full px-3 py-1 transition-colors ${displayUnit === "kg"
                          ? "bg-leaf-700 text-white dark:bg-leaf-600"
                          : "text-ink-soft hover:text-ink"}`}
                      >
                        {t("results.unitKg")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisplayUnit("lbs")}
                        aria-pressed={displayUnit === "lbs"}
                        className={`rounded-full px-3 py-1 transition-colors ${displayUnit === "lbs"
                          ? "bg-leaf-700 text-white dark:bg-leaf-600"
                          : "text-ink-soft hover:text-ink"}`}
                      >
                        {t("results.unitLbs")}
                      </button>
                    </div>
                    {result.isRange ? (
                      <span className="text-xs text-ink-faint max-w-[240px] leading-relaxed">
                        {t("results.rangeSaveNote")}
                      </span>
                    ) : (
                      <SaveCalcButton
                        cropSlug={crop.slug}
                        area={result.area}
                        unit={unit}
                        products={result.lines}
                      />
                    )}
                  </div>
                </div>
                <p className="text-sm text-ink-faint">
                  {result.isRange && effectiveCrop.npkRange
                    ? t("results.recommendedRangeLine", {
                        n: fmtRange(effectiveCrop.npkRange.n[0], effectiveCrop.npkRange.n[1]),
                        p: fmtRange(effectiveCrop.npkRange.p[0], effectiveCrop.npkRange.p[1]),
                        k: fmtRange(effectiveCrop.npkRange.k[0], effectiveCrop.npkRange.k[1]),
                        region: result.region,
                      })
                    : t("results.recommendedLine", {
                        n: effectiveCrop.npk!.n,
                        p: effectiveCrop.npk!.p,
                        k: effectiveCrop.npk!.k,
                        region: result.region,
                      })}
                </p>
                {yieldAdjusted && yieldPerHaDisplay != null && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-leaf-800 dark:text-leaf-300 bg-leaf-100 dark:bg-leaf-950 border border-leaf-200 dark:border-leaf-800 rounded-full px-3 py-1">
                    {t("results.yieldAdjusted", { yield: yieldPerHaDisplay })}
                  </p>
                )}
                <div className="mt-5 grid sm:grid-cols-3 gap-3">
                  {result.lines.map((l) => (
                    <div key={l.product} className="rounded-xl border border-line bg-surface-2 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">{l.product}</p>
                      {displayUnit === "kg" ? (
                        <>
                          <p className="mt-1 font-display text-3xl font-semibold">
                            {rangeKg(l)}<span className="text-base font-sans font-normal text-ink-faint"> {t("results.kgUnit")}</span>
                          </p>
                          <p className="text-xs text-ink-faint mt-0.5">≈ {rangeBags(l)} {t("results.bags")}</p>
                        </>
                      ) : (
                        <>
                          <p className="mt-1 font-display text-3xl font-semibold">
                            {rangeLbs(l)}<span className="text-base font-sans font-normal text-ink-faint"> {t("results.lbsUnit")}</span>
                          </p>
                          <p className="text-xs text-ink-faint mt-0.5">{t("results.lbsNote")}</p>
                        </>
                      )}
                      <p className="text-xs text-ink-soft mt-2 leading-relaxed">{l.purpose}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-leaf-100 dark:bg-leaf-950 px-4 py-3">
                  <span className="text-sm font-semibold">{t("results.total")}</span>
                  <span className="font-display text-xl font-semibold">
                    {displayUnit === "kg"
                      ? <>{result.totalKgMax != null ? `${result.totalKg}–${result.totalKgMax}` : result.totalKg} {t("results.kgUnit")}</>
                      : <>{result.totalKgMax != null ? `${lbsPerAcre(result.totalKg)}–${lbsPerAcre(result.totalKgMax)}` : lbsPerAcre(result.totalKg)} {t("results.lbsUnit")}</>}
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* WhatsApp share — every calculation becomes a forward (viral loop) */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#1eb85a] active:bg-[#199a4c] text-white font-semibold px-6 py-3.5 text-base shadow-sm transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                {t("results.shareButton")}
              </button>
              <button
                type="button"
                onClick={copyShareMessage}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3.5 text-sm font-semibold text-ink hover:bg-surface-2 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {shareFeedback === "copied" ? t("results.shareCopied") : t("results.shareCopy")}
              </button>
            </div>

            {/* Smart application tips — matched to the fertilizers in this result */}
            {applicationTips.length > 0 && (
              <Card>
                <CardBody>
                  <h4 className="font-display text-lg font-semibold mb-1">{t("results.tipsTitle")}</h4>
                  <p className="text-sm text-ink-faint mb-4">{t("results.tipsSubtitle")}</p>
                  <div className="space-y-3">
                    {applicationTips.map((tip, i) => (
                      <div
                        key={i}
                        className={`rounded-xl border p-4 flex gap-3 items-start ${
                          tip.kind === "warning"
                            ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40"
                            : "border-leaf-200 dark:border-leaf-800 bg-leaf-50 dark:bg-leaf-950/40"
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">{tip.icon}</span>
                        <div>
                          <p className={`font-semibold text-sm ${
                            tip.kind === "warning"
                              ? "text-amber-900 dark:text-amber-200"
                              : "text-leaf-900 dark:text-leaf-200"
                          }`}>
                            {tip.title}
                          </p>
                          <p className="text-sm text-ink-soft mt-1 leading-relaxed">{tip.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

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

            {/* 10a — generic split-dose planner: never presented as crop-specific */}
            {splitPlan && (
              <Card>
                <CardBody>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h4 className="font-display text-lg font-semibold">{t("results.splitTitle")}</h4>
                    <Badge>{t("results.splitGenericBadge")}</Badge>
                  </div>
                  <div className="space-y-3">
                    {splitPlan.stages.map((st, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <span className="shrink-0 text-xs font-bold text-leaf-800 dark:text-leaf-300 bg-leaf-100 dark:bg-leaf-950 border border-leaf-200 dark:border-leaf-800 rounded-full px-2.5 py-1">
                          {st.timing}
                        </span>
                        <div>
                          <p className="font-semibold text-sm">{st.stage}</p>
                          <ul className="mt-1 space-y-0.5">
                            {st.products.map((p, j) => (
                              <li key={j} className="text-sm text-ink-soft">
                                <span className="font-medium text-ink">{p.product}</span>
                                {" — "}
                                {displayUnit === "kg"
                                  ? <>{rangeKg(p)} {t("results.kgUnit")}</>
                                  : <>{rangeLbs(p)} {t("results.lbsUnit")}</>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-ink-faint leading-relaxed border-t border-line pt-3">
                    {splitPlan.basisNote}
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
