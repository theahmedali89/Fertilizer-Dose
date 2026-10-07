"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/fields";
import { Badge } from "@/components/ui/Badge";
import {
  FEED_PRESETS,
  GRADE_PRESETS,
  POT_SIZES,
  gramsPerLitre,
  totalGrams,
  gramsPerPot,
  kitchenHint,
} from "@/lib/plantDose";

const CUSTOM = "custom";

const r2 = (x: number) => Math.round(x * 100) / 100;

function toNum(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const v = parseFloat(t);
  return Number.isFinite(v) ? v : null;
}

export function PlantDoseForm() {
  const t = useTranslations("plantDose");

  const [gradeId, setGradeId] = useState(GRADE_PRESETS[0].id);
  const [customN, setCustomN] = useState("");
  const [customP, setCustomP] = useState("");
  const [customK, setCustomK] = useState("");
  const [presetId, setPresetId] = useState(FEED_PRESETS[1].id);
  const [customPpm, setCustomPpm] = useState("");
  const [litres, setLitres] = useState("5");
  const [potId, setPotId] = useState(POT_SIZES[1].id);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isCustomGrade = gradeId === CUSTOM;
  const isCustomPpm = presetId === CUSTOM;

  const grade = GRADE_PRESETS.find((g) => g.id === gradeId);
  const pctN = isCustomGrade ? toNum(customN) : grade?.n ?? null;
  const ppmN = isCustomPpm ? toNum(customPpm) : FEED_PRESETS.find((p) => p.id === presetId)?.ppmN ?? null;

  // Pure, cheap arithmetic — computed on every render; no memo needed.
  // (A manual useMemo here trips react-hooks/preserve-manual-memoization.)
  const L = toNum(litres);
  const inputsValid =
    pctN !== null && pctN > 0 && pctN <= 60 &&
    ppmN !== null && ppmN > 0 && ppmN <= 1000 &&
    L !== null && L > 0;
  const gPerL = inputsValid ? gramsPerLitre(ppmN!, pctN!) : 0;
  const total = inputsValid ? totalGrams(gPerL, L!) : 0;
  const pot = POT_SIZES.find((p) => p.id === potId);
  const perPot = inputsValid && pot ? gramsPerPot(gPerL, pot.litres) : null;
  const kitchen = kitchenHint(gPerL);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);
    // Validation errors surface via the invalid flag in `result`.
  };

  const gradeLabel = isCustomGrade
    ? t("form.customGradeLabel", { n: customN || "?", p: customP || "?", k: customK || "?" })
    : grade?.label ?? "";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardBody className="space-y-5">
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
                <Input
                  inputMode="decimal"
                  placeholder="20"
                  value={customN}
                  onChange={(e) => setCustomN(e.target.value)}
                />
              </Field>
              <Field label={t("form.phosphorus")}>
                <Input
                  inputMode="decimal"
                  placeholder="20"
                  value={customP}
                  onChange={(e) => setCustomP(e.target.value)}
                />
              </Field>
              <Field label={t("form.potash")}>
                <Input
                  inputMode="decimal"
                  placeholder="20"
                  value={customK}
                  onChange={(e) => setCustomK(e.target.value)}
                />
              </Field>
            </div>
          )}

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

          {isCustomPpm && (
            <Field label={t("form.targetPpm")} hint={t("form.targetPpmHint")}>
              <Input
                inputMode="decimal"
                placeholder="150"
                value={customPpm}
                onChange={(e) => setCustomPpm(e.target.value)}
              />
            </Field>
          )}

          {!isCustomPpm && (
            <p className="text-xs text-ink-faint leading-relaxed">
              {t("form.presetSource", {
                source: FEED_PRESETS.find((p) => p.id === presetId)?.source ?? "",
              })}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("form.litres")} hint={t("form.litresHint")}>
              <Input
                inputMode="decimal"
                value={litres}
                onChange={(e) => setLitres(e.target.value)}
              />
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
                  {t("results.perLitre")}
                </dt>
                <dd className="mt-1 text-3xl font-bold text-leaf-700 dark:text-leaf-300">
                  {r2(gPerL)} <span className="text-base font-medium">g/L</span>
                </dd>
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
              </div>
              <div className="rounded-xl border border-line bg-surface-2 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  {t("results.total", { litres: litres.trim() })}
                </dt>
                <dd className="mt-1 text-3xl font-bold text-leaf-700 dark:text-leaf-300">
                  {r2(total)} <span className="text-base font-medium">g</span>
                </dd>
                <dd className="mt-1 text-xs text-ink-faint">{t("results.totalHint")}</dd>
              </div>
              <div className="rounded-xl border border-line bg-surface-2 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  {t("results.perPot", { cm: pot?.diameterCm ?? "" })}
                </dt>
                <dd className="mt-1 text-3xl font-bold text-leaf-700 dark:text-leaf-300">
                  {perPot !== null ? r2(perPot) : "–"}{" "}
                  <span className="text-base font-medium">g</span>
                </dd>
                <dd className="mt-1 text-xs text-ink-faint">{t("results.perPotHint")}</dd>
              </div>
            </dl>

            <div className="rounded-xl border border-harvest-200 bg-harvest-100/60 dark:bg-harvest-950/40 dark:border-harvest-800 p-4">
              <p className="text-sm font-semibold text-harvest-800 dark:text-harvest-300">
                {t("results.burnTitle")}
              </p>
              <p className="mt-1 text-sm text-ink-soft leading-relaxed">
                {t("results.burnBody")}
              </p>
            </div>

            <p className="text-xs text-ink-faint leading-relaxed">
              {t("results.formulaNote", { grade: gradeLabel, ppm: ppmN ?? "" })}
            </p>
          </CardBody>
        </Card>
      )}
    </form>
  );
}
