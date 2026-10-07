"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/fields";
import { ORGANIC_FERTILIZERS } from "@/lib/agronomy";
import { useGarden } from "@/hooks/useGarden";

const CUSTOM = "__custom__";

/**
 * Calculator Mode A — organic dose from USER-ENTERED analysis.
 * Pure arithmetic on user inputs: the app holds no organic nutrient data
 * of its own. kg/ha = rate (t/ha) × 1,000 × (percentage ÷ 100).
 *
 * Phase 4 expansion:
 *  - Lab-analysis record: optional lab name / analysis date / moisture %,
 *    recorded for transparency (prompt §9: show the source of the analysis).
 *  - Mineral top-up offset: the user enters their crop's nutrient need
 *    (kg N–P₂O₅–K₂O/ha) and sees how much mineral fertilizer is still
 *    required after the organic application. remaining = max(0, need − applied).
 *    Honest bound: organic N mineralizes slowly (~30% of FYM N available to
 *    the first crop per TNAU), so the offset is a MAXIMUM — the note says so.
 */
export function OrganicDoseSection() {
  const t = useTranslations("calculator.organic");
  const tg = useTranslations("garden");
  const { addCalculation } = useGarden();
  const [material, setMaterial] = useState(ORGANIC_FERTILIZERS[0].slug);
  const [nPct, setNPct] = useState("");
  const [pPct, setPPct] = useState("");
  const [kPct, setKPct] = useState("");
  const [rate, setRate] = useState("");
  const [warnDismissed, setWarnDismissed] = useState(false);
  // Phase 4 — lab analysis record (optional, informational)
  const [labName, setLabName] = useState("");
  const [labDate, setLabDate] = useState("");
  const [moisture, setMoisture] = useState("");
  // Phase 4 — crop nutrient need for top-up offset (kg/ha)
  const [needN, setNeedN] = useState("");
  const [needP, setNeedP] = useState("");
  const [needK, setNeedK] = useState("");
  const [saved, setSaved] = useState(false);

  const selected = ORGANIC_FERTILIZERS.find((m) => m.slug === material);

  const num = (v: string): number | null => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  const r1 = (x: number) => Math.round(x * 10) / 10;

  const result = useMemo(() => {
    const n = num(nPct), p = num(pPct), k = num(kPct), r = num(rate);
    if (n === null || p === null || k === null || r === null) return null;
    if (n > 100 || p > 100 || k > 100) return null;
    // 1 t/ha = 1,000 kg/ha → kg nutrient/ha = rate × 1,000 × (pct / 100)
    const kgHa = (pct: number) => r1(r * 1000 * (pct / 100));
    return { n: kgHa(n), p: kgHa(p), k: kgHa(k), rateT: r };
  }, [nPct, pPct, kPct, rate]);

  const topup = useMemo(() => {
    if (!result) return null;
    const bn = num(needN), bp = num(needP), bk = num(needK);
    if (bn === null && bp === null && bk === null) return null;
    const rem = (need: number | null, applied: number) =>
      need === null ? null : r1(Math.max(0, need - applied));
    return { n: rem(bn, result.n), p: rem(bp, result.p), k: rem(bk, result.k) };
  }, [result, needN, needP, needK]);

  const rangeText = selected && selected.nMin != null && selected.nMax != null
    ? `N ${selected.nMin}–${selected.nMax}%, P₂O₅ ${selected.pMin}–${selected.pMax}%, K₂O ${selected.kMin}–${selected.kMax}%`
    : null;

  const materialName = material === CUSTOM ? t("customOption") : (selected?.name ?? material);

  const handleSave = () => {
    if (!result) return;
    const labBits = [
      labName.trim() ? `${t("labNameLabel")}: ${labName.trim()}` : null,
      labDate ? `${t("labDateLabel")}: ${labDate}` : null,
      moisture.trim() ? `${t("moistureLabel")}: ${moisture.trim()}%` : null,
    ].filter(Boolean);
    const notes = [
      `${t("analysisSummary", {
        n: nPct, p: pPct, k: kPct,
        nKg: result.n, pKg: result.p, kKg: result.k,
      })}`,
      labBits.length > 0 ? labBits.join(" · ") : t("noLabRecord"),
      topup && (topup.n !== null || topup.p !== null || topup.k !== null)
        ? t("topupSummary", {
            n: topup.n ?? "—", p: topup.p ?? "—", k: topup.k ?? "—",
          })
        : null,
      t("saveDisclaimer"),
    ].filter(Boolean).join("\n");
    addCalculation({
      cropSlug: "organic-application",
      area: 1,
      unit: "hectare",
      products: [{ product: materialName, kg: r1(result.rateT * 1000) }],
      notes,
    });
    setSaved(true);
  };

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

        {/* Phase 4 — lab analysis record (optional, for transparency) */}
        <div className="mt-6 rounded-2xl border border-line bg-surface-2 px-5 py-4">
          <p className="text-sm font-bold mb-1">{t("labTitle")}</p>
          <p className="text-xs text-ink-faint leading-relaxed mb-4">{t("labDesc")}</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={t("labNameLabel")}>
              <Input type="text" value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder={t("labNamePlaceholder")} />
            </Field>
            <Field label={t("labDateLabel")}>
              <Input type="date" value={labDate}
                onChange={(e) => setLabDate(e.target.value)} />
            </Field>
            <Field label={t("moistureLabel")} hint={t("moistureHint")}>
              <Input type="number" min="0" max="100" step="any" inputMode="decimal" value={moisture}
                onChange={(e) => setMoisture(e.target.value)} placeholder="—" />
            </Field>
          </div>
        </div>

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

        {/* Phase 4 — mineral top-up offset */}
        <div className="mt-5 rounded-2xl border border-line bg-surface-2 px-5 py-4">
          <p className="text-sm font-bold mb-1">{t("topupTitle")}</p>
          <p className="text-xs text-ink-faint leading-relaxed mb-4">{t("topupDesc")}</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={t("baseNLabel")}>
              <Input type="number" min="0" step="any" inputMode="decimal" value={needN}
                onChange={(e) => setNeedN(e.target.value)} placeholder="120" />
            </Field>
            <Field label={t("basePLabel")}>
              <Input type="number" min="0" step="any" inputMode="decimal" value={needP}
                onChange={(e) => setNeedP(e.target.value)} placeholder="60" />
            </Field>
            <Field label={t("baseKLabel")}>
              <Input type="number" min="0" step="any" inputMode="decimal" value={needK}
                onChange={(e) => setNeedK(e.target.value)} placeholder="40" />
            </Field>
          </div>
          {topup ? (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-1">{t("formulaOffsetLabel")}</p>
              <p className="font-mono text-sm mb-4">{t("formulaOffset")}</p>
              <p className="text-sm font-bold mb-2">{t("topupResultsTitle")}</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: t("topupN"), v: topup.n },
                  { label: t("topupP"), v: topup.p },
                  { label: t("topupK"), v: topup.k },
                ].map((r) => (
                  <div key={r.label} className="rounded-xl border border-line bg-surface px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">{r.label}</p>
                    <p className="mt-1 font-display text-2xl font-semibold">
                      {r.v === null ? "—" : r.v}
                      <span className="text-sm font-sans font-normal text-ink-faint"> {t("perHa")}</span>
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-faint leading-relaxed">{t("topupNote")}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-faint">{t("enterBase")}</p>
          )}
        </div>

        {/* Phase 5a — save organic application to My Garden */}
        <div className="mt-5">
          {saved ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-leaf-700 dark:text-leaf-300">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {tg("savedToGarden")}
              {" · "}
              <Link href="/my-garden" className="underline underline-offset-2">
                {tg("viewGarden")}
              </Link>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!result}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3.5 py-2 text-sm font-semibold text-ink-soft hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                <path d="M17 21v-8H7v8M7 3v5h8" />
              </svg>
              {tg("saveCalculation")}
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
