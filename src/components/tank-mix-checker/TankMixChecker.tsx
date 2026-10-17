"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import {
  FERTILIZERS,
  checkCompatibility,
  type Verdict,
} from "@/lib/tank-mix";
import { cn } from "@/lib/utils";

const VERDICT_STYLE: Record<Verdict, { ring: string; bg: string; badge: string; icon: string }> = {
  safe: {
    ring: "border-leaf-300 dark:border-leaf-700",
    bg: "bg-leaf-50 dark:bg-leaf-950/40",
    badge: "bg-leaf-600 text-white",
    icon: "✅",
  },
  caution: {
    ring: "border-amber-300 dark:border-amber-700",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    badge: "bg-amber-500 text-white",
    icon: "⚠️",
  },
  danger: {
    ring: "border-red-300 dark:border-red-700",
    bg: "bg-red-50 dark:bg-red-950/30",
    badge: "bg-red-600 text-white",
    icon: "❌",
  },
  unknown: {
    ring: "border-slate-300 dark:border-slate-600",
    bg: "bg-slate-50 dark:bg-slate-900/40",
    badge: "bg-slate-500 text-white",
    icon: "❓",
  },
};

const QUICK_REF_SLUGS = ["dap-zinc", "dap-calnit", "np-zinc", "ssp-zinc"];

function Select({
  label,
  value,
  onChange,
  placeholder,
  getName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  getName: (id: string) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/30"
      >
        <option value="">{placeholder}</option>
        {FERTILIZERS.map((f) => (
          <option key={f.id} value={f.id}>
            {getName(f.id)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TankMixChecker() {
  const t = useTranslations("tankMix");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [checked, setChecked] = useState(false);

  const result = checked && a && b ? checkCompatibility(a, b) : null;
  const style = result ? VERDICT_STYLE[result.verdict] : null;

  const shortName = (id: string) => t(`fertilizers.${id}.short`);

  const onCheck = () => {
    if (a && b) setChecked(true);
  };

  const resultTitle = result ? t(`rules.${result.ruleKey}.title`) : "";
  const resultExplanation = result
    ? t(`rules.${result.ruleKey}.explanation`, { name: shortName(a) })
    : "";
  const resultInstead = result ? t(`rules.${result.ruleKey}.instead`) : "";

  return (
    <div>
      <Card>
        <CardBody className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label={t("ui.fertA")} value={a} onChange={(v) => { setA(v); setChecked(false); }} placeholder={t("ui.selectPlaceholder")} getName={shortName} />
            <Select label={t("ui.fertB")} value={b} onChange={(v) => { setB(v); setChecked(false); }} placeholder={t("ui.selectPlaceholder")} getName={shortName} />
          </div>
          <button
            onClick={onCheck}
            disabled={!a || !b}
            className={cn(
              "w-full rounded-xl px-6 py-3.5 text-base font-bold text-white transition",
              a && b
                ? "bg-leaf-600 hover:bg-leaf-700 shadow-md"
                : "bg-ink-faint/40 cursor-not-allowed"
            )}
          >
            {t("ui.checkBtn")}
          </button>
        </CardBody>
      </Card>

      {result && style && (
        <Card className={cn("mt-6 border-2", style.ring, style.bg)}>
          <CardBody>
            <div className="flex items-start gap-3">
              <span className="text-4xl leading-none" aria-hidden>
                {style.icon}
              </span>
              <div className="min-w-0">
                <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", style.badge)}>
                  {resultTitle}
                </span>
                <p className="mt-2 text-base font-semibold text-ink">
                  {shortName(a)} + {shortName(b)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {resultExplanation}
                </p>
                {resultInstead && (
                  <div className="mt-4 rounded-xl border border-line bg-surface p-4">
                    <p className="text-sm font-bold text-ink">{t("ui.insteadTitle")}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{resultInstead}</p>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick reference */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-ink">{t("ui.quickRefTitle")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {QUICK_REF_SLUGS.map((slug) => (
            <div key={slug} className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/20 p-4">
              <p className="text-sm font-bold text-red-800 dark:text-red-200">❌ {t(`quickRef.${slug}.pair`)}</p>
              <p className="mt-1 text-xs text-ink-soft">{t(`quickRef.${slug}.why`)}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-faint">
          {t("ui.jarTest")}
        </p>
      </div>
    </div>
  );
}
