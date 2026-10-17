"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";

// ── Data ─────────────────────────────────────────────────────────────

type Deficiency = {
  id: string;
  key: string; // nutrient symbol
  symptoms: string[];
};

const DEFICIENCIES: Deficiency[] = [
  { id: "N", key: "N", symptoms: ["old-yellow", "stunted"] },
  { id: "P", key: "P", symptoms: ["purple", "dark-delayed"] },
  { id: "K", key: "K", symptoms: ["scorch", "spots-weak"] },
  { id: "Zn", key: "Zn", symptoms: ["little-leaf", "inter-old"] },
  { id: "Fe", key: "Fe", symptoms: ["new-yellow-veins"] },
  { id: "B", key: "B", symptoms: ["tip-death", "poor-fruit"] },
  { id: "Mg", key: "Mg", symptoms: ["old-yellow", "inter-old"] },
  { id: "S", key: "S", symptoms: ["new-uniform"] },
  { id: "Ca", key: "Ca", symptoms: ["tip-death", "ber", "tip-burn"] },
  { id: "Mn", key: "Mn", symptoms: ["new-yellow-veins"] },
];

type Symptom = {
  id: string;
};

const SYMPTOMS: Symptom[] = [
  { id: "old-yellow" },
  { id: "stunted" },
  { id: "purple" },
  { id: "dark-delayed" },
  { id: "scorch" },
  { id: "spots-weak" },
  { id: "little-leaf" },
  { id: "inter-old" },
  { id: "new-yellow-veins" },
  { id: "new-uniform" },
  { id: "tip-death" },
  { id: "poor-fruit" },
  { id: "ber" },
  { id: "tip-burn" },
];

// ── Component ────────────────────────────────────────────────────────

type Result = {
  def: Deficiency;
  matched: number;
  total: number;
  score: number;
};

export function DeficiencyChecker() {
  const t = useTranslations("deficiencyChecker");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);

  const toggle = (id: string) => {
    setChecked(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const results: Result[] = useMemo(() => {
    if (!checked || selected.size === 0) return [];
    return DEFICIENCIES.map((def) => {
      const matched = def.symptoms.filter((s) => selected.has(s)).length;
      return {
        def,
        matched,
        total: def.symptoms.length,
        score: matched / def.symptoms.length,
      };
    })
      .filter((r) => r.matched > 0)
      .sort((a, b) => b.matched - a.matched || b.score - a.score);
  }, [checked, selected]);

  const reset = () => {
    setSelected(new Set());
    setChecked(false);
  };

  return (
    <div>
      {/* Symptom selection */}
      <h2 className="font-display text-2xl font-semibold mb-2">
        {t("ui.step1Title")}
      </h2>
      <p className="text-sm text-ink-soft mb-6">
        {t("ui.step1Desc")}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {SYMPTOMS.map((s) => {
          const active = selected.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              aria-pressed={active}
              className={`text-left rounded-xl border p-4 transition-colors ${
                active
                  ? "border-leaf-600 bg-leaf-50 dark:bg-leaf-950/40 dark:border-leaf-500"
                  : "border-line bg-surface hover:border-leaf-400"
              }`}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    active
                      ? "border-leaf-600 bg-leaf-600 text-white"
                      : "border-ink-faint"
                  }`}
                  aria-hidden
                >
                  {active && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6.5 4.5 9 10 3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span>
                  <span className="block font-medium text-sm">{t(`symptoms.${s.id}.label`)}</span>
                  <span className="block text-xs text-ink-soft mt-0.5">{t(`symptoms.${s.id}.hint`)}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={selected.size === 0}
          className="rounded-xl bg-leaf-700 dark:bg-leaf-600 px-6 py-3 font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("ui.checkButton", { count: selected.size })}
        </button>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-line px-6 py-3 font-medium hover:bg-surface transition-colors"
          >
            {t("ui.clearAll")}
          </button>
        )}
      </div>

      {/* Results */}
      {checked && (
        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-2">
            {t("ui.step2Title")}
          </h2>
          {results.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-ink-soft">
                  {t("ui.noMatches1")}{" "}
                  <Link href="/plant-doctor" className="font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
                    {t("ui.noMatchesLink")}
                  </Link>{" "}
                  {t("ui.noMatches2")}
                </p>
              </CardBody>
            </Card>
          ) : (
            <>
              <p className="text-sm text-ink-soft mb-6">
                {t("ui.rankedDesc")}
              </p>
              <div className="space-y-4">
                {results.map(({ def, matched, total }, i) => (
                  <Card key={def.id} className={i === 0 ? "border-leaf-600 dark:border-leaf-500" : ""}>
                    <CardBody>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          {i === 0 && (
                            <span className="inline-block text-xs font-bold uppercase tracking-wide text-leaf-700 dark:text-leaf-300 bg-leaf-100 dark:bg-leaf-900 rounded-full px-3 py-1 mb-2">
                              {t("ui.bestMatch")}
                            </span>
                          )}
                          <h3 className="font-display text-xl font-semibold">
                            {t(`deficiencies.${def.id}.name`)}{" "}
                            <span className="text-sm font-normal text-ink-soft">({t(`deficiencies.${def.id}.fullName`)})</span>
                          </h3>
                          <p className="text-xs text-ink-soft mt-1">
                            {t("ui.matchedOf", { matched, total })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-ink-soft">{t("ui.recFert")}</p>
                          <p className="font-semibold text-leaf-700 dark:text-leaf-300">{t(`deficiencies.${def.id}.fertilizer`)}</p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg bg-surface border border-line p-4">
                        <p className="text-sm font-semibold mb-1">{t("ui.howToCorrect")}</p>
                        <p className="text-sm text-ink-soft leading-relaxed">{t(`deficiencies.${def.id}.correction`)}</p>
                      </div>
                      <p className="mt-3 text-xs text-ink-faint italic">{t(`deficiencies.${def.id}.note`)}</p>
                      <div className="mt-4">
                        <Link
                          href="/calculator"
                          className="text-sm font-semibold text-leaf-700 dark:text-leaf-300 hover:underline"
                        >
                          {t("ui.calcDose")}
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reference table */}
      <div className="mt-12">
        <h2 className="font-display text-2xl font-semibold mb-4">
          {t("ui.refTitle")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="py-3 pr-4 font-semibold">{t("ui.thNutrient")}</th>
                <th className="py-3 pr-4 font-semibold">{t("ui.thSymptom")}</th>
                <th className="py-3 font-semibold">{t("ui.thFix")}</th>
              </tr>
            </thead>
            <tbody>
              {DEFICIENCIES.map((d) => (
                <tr key={d.id} className="border-b border-line/60">
                  <td className="py-3 pr-4 font-medium whitespace-nowrap">{t(`deficiencies.${d.id}.fullName`)}</td>
                  <td className="py-3 pr-4 text-ink-soft">
                    {t(`symptoms.${d.symptoms[0]}.label`)}
                  </td>
                  <td className="py-3 text-ink-soft">{t(`deficiencies.${d.id}.fertilizer`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="mt-8">
        <CardBody>
          <p className="text-xs text-ink-soft leading-relaxed">
            <strong className="text-ink">{t("ui.disclaimer")}</strong>{" "}
            {t("ui.disclaimerText")}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
