"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/fields";
import { Badge } from "@/components/ui/Badge";
import { useGarden } from "@/hooks/useGarden";
import { cn } from "@/lib/utils";
import {
  FEED_PRESETS,
  FEED_INTERVALS,
  GRADE_PRESETS,
  POT_SIZES,
  SQFT_PER_M2,
  gramsPerLitre,
  totalGrams,
  gramsPerPot,
  kitchenHint,
  bedLitres,
  mlPerLitre,
  totalMl,
  feedingDates,
} from "@/lib/plantDose";

const CUSTOM = "custom";

type Mode = "can" | "bed";
type ProductForm = "solid" | "liquid";
type Nutrient = "n" | "p" | "k";

const r2 = (x: number) => Math.round(x * 100) / 100;

function toNum(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const v = parseFloat(t);
  return Number.isFinite(v) ? v : null;
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function PlantDoseForm() {
  const t = useTranslations("plantDose");
  const garden = useGarden();

  const [mode, setMode] = useState<Mode>("can");
  const [productForm, setProductForm] = useState<ProductForm>("solid");
  const [nutrient, setNutrient] = useState<Nutrient>("n");
  const [gradeId, setGradeId] = useState(GRADE_PRESETS[0].id);
  const [customN, setCustomN] = useState("");
  const [customP, setCustomP] = useState("");
  const [customK, setCustomK] = useState("");
  const [presetId, setPresetId] = useState(FEED_PRESETS[1].id);
  const [customPpm, setCustomPpm] = useState("");
  const [customPpmPK, setCustomPpmPK] = useState("");
  const [litres, setLitres] = useState("5");
  const [potId, setPotId] = useState(POT_SIZES[1].id);
  const [bedArea, setBedArea] = useState("2");
  const [bedAreaUnit, setBedAreaUnit] = useState<"m2" | "ft2">("m2");
  const [bedDepth, setBedDepth] = useState("20");
  const [density, setDensity] = useState("");
  const [intervalId, setIntervalId] = useState(FEED_INTERVALS[1].id);
  const [startDate, setStartDate] = useState(todayISO());
  const [submitted, setSubmitted] = useState(false);
  const [gardenAdded, setGardenAdded] = useState(false);
  const [error, setError] = useState("");

  const isCustomGrade = gradeId === CUSTOM;
  const isCustomPpm = presetId === CUSTOM;

  const grade = GRADE_PRESETS.find((g) => g.id === gradeId);
  const pctN = isCustomGrade ? toNum(customN) : (grade?.n ?? null);
  const pctP = isCustomGrade ? toNum(customP) : (grade?.p ?? null);
  const pctK = isCustomGrade ? toNum(customK) : (grade?.k ?? null);
  const pct = nutrient === "n" ? pctN : nutrient === "p" ? pctP : pctK;

  // Extension feeding presets exist only for nitrogen. For P/K there is no
  // published home-gardener preset band, so the target is always user-entered.
  const ppm =
    nutrient === "n"
      ? isCustomPpm
        ? toNum(customPpm)
        : (FEED_PRESETS.find((p) => p.id === presetId)?.ppmN ?? null)
      : toNum(customPpmPK);

  const L = toNum(litres);
  const area = toNum(bedArea);
  const depth = toNum(bedDepth);
  const dens = toNum(density);
  const isLiquid = productForm === "liquid";
  const isBed = mode === "bed";

  const inputsValid =
    pct !== null &&
    pct > 0 &&
    pct <= 60 &&
    ppm !== null &&
    ppm > 0 &&
    ppm <= 1000 &&
    (!isBed
      ? L !== null && L > 0
      : area !== null && area > 0 && depth !== null && depth > 0) &&
    (!isLiquid || (dens !== null && dens > 0));

  // Pure, cheap arithmetic — computed on every render; no memo needed.
  const gPerL = inputsValid ? gramsPerLitre(ppm!, pct!) : 0;
  const mlPerL = inputsValid && isLiquid ? mlPerLitre(gPerL, dens!) : 0;
  const total = inputsValid && !isBed ? totalGrams(gPerL, L!) : 0;
  const totalMlAll = inputsValid && !isBed && isLiquid ? totalMl(mlPerL, L!) : 0;
  const pot = POT_SIZES.find((p) => p.id === potId);
  const perPot = inputsValid && !isBed && pot ? gramsPerPot(gPerL, pot.litres) : null;
  const areaM2 = inputsValid && isBed ? (bedAreaUnit === "m2" ? area! : area! / SQFT_PER_M2) : 0;
  const bedVol = inputsValid && isBed ? bedLitres(areaM2, depth!) : 0;
  const bedTotalG = inputsValid && isBed ? gPerL * bedVol : 0;
  const bedTotalMl = inputsValid && isBed && isLiquid ? mlPerL * bedVol : 0;
  const kitchen = kitchenHint(gPerL);

  const interval = FEED_INTERVALS.find((f) => f.id === intervalId) ?? FEED_INTERVALS[1];
  const dates = inputsValid ? feedingDates(startDate, interval.weeks, 6) : [];
  const nutrientLabel =
    nutrient === "n" ? "N" : nutrient === "p" ? t("form.nutrientP") : t("form.nutrientK");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGardenAdded(false);
    setSubmitted(true);
  };

  const addScheduleToGarden = () => {
    const existing = new Set(
      garden.state.reminders.map((r) => `${r.title}::${r.dueDate}`)
    );
    let added = 0;
    for (const d of dates) {
      const title = t("form.scheduleTitle", { ppm: ppm ?? "", nutrient: nutrientLabel });
      if (!existing.has(`${title}::${d}`)) {
        garden.addReminder({ title, dueDate: d, plotId: null, plantingId: null });
        added++;
      }
    }
    if (added > 0) setGardenAdded(true);
  };

  const gradeLabel = isCustomGrade
    ? t("form.customGradeLabel", { n: customN || "?", p: customP || "?", k: customK || "?" })
    : (grade?.label ?? "");

  const tabCls = (active: boolean) =>
    cn(
      "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
      active
        ? "bg-leaf-700 dark:bg-leaf-600 text-white"
        : "border border-line text-ink-soft hover:border-leaf-600"
    );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardBody className="space-y-5">
          {/* Mode tabs: watering can vs garden bed */}
          <div>
            <p className="text-sm font-semibold text-ink mb-1.5">{t("form.mode")}</p>
            <div className="flex gap-2" role="tablist" aria-label={t("form.mode")}>
              <button type="button" role="tab" aria-selected={mode === "can"} onClick={() => setMode("can")} className={tabCls(mode === "can")}>
                {t("form.modeCan")}
              </button>
              <button type="button" role="tab" aria-selected={mode === "bed"} onClick={() => setMode("bed")} className={tabCls(mode === "bed")}>
                {t("form.modeBed")}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-ink-faint leading-relaxed">
              {mode === "can" ? t("form.modeCanHint") : t("form.modeBedHint")}
            </p>
          </div>

          {/* Product form: solid vs liquid */}
          <div>
            <p className="text-sm font-semibold text-ink mb-1.5">{t("form.productForm")}</p>
            <div className="flex gap-2" role="tablist" aria-label={t("form.productForm")}>
              <button type="button" role="tab" aria-selected={!isLiquid} onClick={() => setProductForm("solid")} className={tabCls(!isLiquid)}>
                {t("form.solid")}
              </button>
              <button type="button" role="tab" aria-selected={isLiquid} onClick={() => setProductForm("liquid")} className={tabCls(isLiquid)}>
                {t("form.liquid")}
              </button>
            </div>
          </div>

          {isLiquid && (
            <Field label={t("form.density")} hint={t("form.densityHint")}>
              <Input
                inputMode="decimal"
                placeholder="1.2"
                value={density}
                onChange={(e) => setDensity(e.target.value)}
              />
            </Field>
          )}

          {/* Nutrient target */}
          <Field label={t("form.nutrient")} hint={t("form.nutrientHint")}>
            <Select value={nutrient} onChange={(e) => setNutrient(e.target.value as Nutrient)}>
              <option value="n">{t("form.nutrientN")}</option>
              <option value="p">{t("form.nutrientP")}</option>
              <option value="k">{t("form.nutrientK")}</option>
            </Select>
          </Field>

          <Field label={t("form.grade")} hint={t("form.gradeHint")}>
            <Select value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
              {GRADE_PRESETS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
              <option value={CUSTOM}>{t("form.custom")}</option>
            </Select>
          </Field>

          {isCustomGrade && (
            <div className="grid grid-cols-3 gap-3">
              <Field label={t("form.nitrogen")}>
                <Input inputMode="decimal" placeholder="20" value={customN} onChange={(e) => setCustomN(e.target.value)} />
              </Field>
              <Field label={t("form.phosphorus")}>
                <Input inputMode="decimal" placeholder="20" value={customP} onChange={(e) => setCustomP(e.target.value)} />
              </Field>
              <Field label={t("form.potash")}>
                <Input inputMode="decimal" placeholder="20" value={customK} onChange={(e) => setCustomK(e.target.value)} />
              </Field>
            </div>
          )}

          {nutrient === "n" ? (
            <>
              <Field label={t("form.strength")} hint={t("form.strengthHint")}>
                <Select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
                  {FEED_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {t(`presets.${p.id}.label`, { ppm: p.ppmN })}
                    </option>
                  ))}
                  <option value={CUSTOM}>{t("form.customPpm")}</option>
                </Select>
              </Field>
              {isCustomPpm ? (
                <Field label={t("form.targetPpm")} hint={t("form.targetPpmHint")}>
                  <Input inputMode="decimal" placeholder="150" value={customPpm} onChange={(e) => setCustomPpm(e.target.value)} />
                </Field>
              ) : (
                <p className="text-xs text-ink-faint leading-relaxed">
                  {t("form.presetSource", { source: FEED_PRESETS.find((p) => p.id === presetId)?.source ?? "" })}
                </p>
              )}
            </>
          ) : (
            <Field label={t("form.targetPpmPK", { nutrient: nutrientLabel })} hint={t("form.pkCustomNote")}>
              <Input
                inputMode="decimal"
                placeholder={nutrient === "p" ? "50" : "100"}
                value={customPpmPK}
                onChange={(e) => setCustomPpmPK(e.target.value)}
              />
            </Field>
          )}

          {!isBed ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("form.litres")} hint={t("form.litresHint")}>
                <Input inputMode="decimal" value={litres} onChange={(e) => setLitres(e.target.value)} />
              </Field>
              <Field label={t("form.potSize")} hint={t("form.potSizeHint")}>
                <Select value={potId} onChange={(e) => setPotId(e.target.value)}>
                  {POT_SIZES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {t("form.potOption", { cm: p.diameterCm })}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("form.bedArea")} hint={t("form.bedAreaHint")}>
                <div className="flex flex-col gap-2 min-[480px]:flex-row">
                  <Input inputMode="decimal" value={bedArea} onChange={(e) => setBedArea(e.target.value)} />
                  <Select
                    value={bedAreaUnit}
                    onChange={(e) => setBedAreaUnit(e.target.value as "m2" | "ft2")}
                    className="w-full min-[480px]:w-28 min-[480px]:shrink-0"
                  >
                    <option value="m2">{t("form.areaM2")}</option>
                    <option value="ft2">{t("form.areaFt2")}</option>
                  </Select>
                </div>
              </Field>
              <Field label={t("form.bedDepth")} hint={t("form.bedDepthHint")}>
                <Input inputMode="decimal" placeholder="20" value={bedDepth} onChange={(e) => setBedDepth(e.target.value)} />
              </Field>
            </div>
          )}

          {/* Feeding schedule */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("form.frequency")}>
              <Select value={intervalId} onChange={(e) => setIntervalId(e.target.value)}>
                {FEED_INTERVALS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {t(`form.interval${f.weeks}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("form.startDate")}>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            {t("form.submit")}
          </Button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </CardBody>
      </Card>

      {submitted && !inputsValid && (
        <Card>
          <CardBody>
            <p className="text-sm text-red-600 dark:text-red-400">{t("results.invalid")}</p>
          </CardBody>
        </Card>
      )}

      {submitted && inputsValid && (
        <Card>
          <CardBody className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{t("results.title")}</h2>
              <Badge variant="neutral">{t("results.guidanceBadge")}</Badge>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-surface-2 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  {isLiquid ? t("results.perLitreMl") : t("results.perLitre")}
                </dt>
                <dd className="mt-1 text-3xl font-bold text-leaf-700 dark:text-leaf-300">
                  {r2(isLiquid ? mlPerL : gPerL)}{" "}
                  <span className="text-base font-medium">{isLiquid ? t("results.mlPerL") : "g/L"}</span>
                </dd>
                {!isLiquid && (
                  <dd className="mt-1 text-xs text-ink-faint">
                    {t("results.kitchenApprox", {
                      tsp:
                        kitchen.tsp < 1
                          ? t("results.quarterTsp")
                          : kitchen.tsp < 2
                            ? t("results.oneTsp")
                            : t("results.manyTsp", { n: r2(kitchen.tsp) }),
                    })}
                  </dd>
                )}
              </div>

              {!isBed ? (
                <>
                  <div className="rounded-xl border border-line bg-surface-2 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                      {t("results.total", { litres: litres.trim() })}
                    </dt>
                    <dd className="mt-1 text-3xl font-bold text-leaf-700 dark:text-leaf-300">
                      {r2(isLiquid ? totalMlAll : total)}{" "}
                      <span className="text-base font-medium">{isLiquid ? "ml" : "g"}</span>
                    </dd>
                    <dd className="mt-1 text-xs text-ink-faint">{t("results.totalHint")}</dd>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-2 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                      {t("results.perPot", { cm: pot?.diameterCm ?? "" })}
                    </dt>
                    <dd className="mt-1 text-3xl font-bold text-leaf-700 dark:text-leaf-300">
                      {perPot !== null ? r2(isLiquid ? perPot / (dens || 1) : perPot) : "–"}{" "}
                      <span className="text-base font-medium">{isLiquid ? "ml" : "g"}</span>
                    </dd>
                    <dd className="mt-1 text-xs text-ink-faint">{t("results.perPotHint")}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-line bg-surface-2 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                      {t("results.bedVolume")}
                    </dt>
                    <dd className="mt-1 text-3xl font-bold text-leaf-700 dark:text-leaf-300">
                      {r2(bedVol)} <span className="text-base font-medium">L</span>
                    </dd>
                    <dd className="mt-1 text-xs text-ink-faint">
                      {t("results.bedVolumeHint", {
                        area: bedArea.trim(),
                        unit: bedAreaUnit === "m2" ? t("form.areaM2") : t("form.areaFt2"),
                        depth: bedDepth.trim(),
                      })}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-2 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                      {t("results.perBed")}
                    </dt>
                    <dd className="mt-1 text-3xl font-bold text-leaf-700 dark:text-leaf-300">
                      {r2(isLiquid ? bedTotalMl : bedTotalG)}{" "}
                      <span className="text-base font-medium">{isLiquid ? "ml" : "g"}</span>
                    </dd>
                    <dd className="mt-1 text-xs text-ink-faint">{t("results.perBedHint")}</dd>
                  </div>
                </>
              )}
            </dl>

            {/* Feeding schedule */}
            <div className="rounded-xl border border-line bg-surface-2 p-4">
              <p className="text-sm font-semibold">{t("results.scheduleTitle")}</p>
              <p className="mt-1 text-xs text-ink-faint leading-relaxed">{t("results.scheduleHint")}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {dates.map((d) => (
                  <li key={d}>
                    <Badge variant="neutral">{d}</Badge>
                  </li>
                ))}
              </ul>
              <Button type="button" onClick={addScheduleToGarden} className="mt-3" size="sm">
                {t("form.addToGarden")}
              </Button>
              {gardenAdded && (
                <p className="mt-2 text-xs font-medium text-leaf-700 dark:text-leaf-300">
                  {t("form.addedToGarden")}
                </p>
              )}
              <p className="mt-2 text-xs text-ink-faint leading-relaxed">{t("form.gardenHint")}</p>
            </div>

            <div className="rounded-xl border border-harvest-200 bg-harvest-100/60 dark:bg-harvest-950/40 dark:border-harvest-800 p-4">
              <p className="text-sm font-semibold text-harvest-800 dark:text-harvest-300">
                {t("results.burnTitle")}
              </p>
              <p className="mt-1 text-sm text-ink-soft leading-relaxed">
                {t("results.burnBody")}
              </p>
            </div>

            <p className="text-xs text-ink-faint leading-relaxed">
              {isLiquid
                ? t("results.formulaNoteLiquid", {
                    grade: gradeLabel,
                    ppm: ppm ?? "",
                    nutrient: nutrientLabel,
                    density: density.trim(),
                  })
                : t("results.formulaNote", {
                    grade: gradeLabel,
                    ppm: ppm ?? "",
                    nutrient: nutrientLabel,
                  })}
              {isBed && " " + t("results.formulaNoteBed", { depth: bedDepth.trim() })}
            </p>
          </CardBody>
        </Card>
      )}
    </form>
  );
}
