"use client";

/**
 * DAP ↔ TSP Converter: interactive form.
 *
 * Two modes: convert a planned number of DAP bags, or a phosphorus
 * requirement in kg P2O5 (bags are derived at 23 kg P2O5 per bag).
 * Prices are user-editable; defaults are dated in the copy (DAP PBS
 * average, week ended 29 Oct 2026; TSP retailer listing, Nov 2026).
 *
 * Honesty rules: the two options are compared on cost only. Both supply
 * the same phosphorus. DAP's 9 kg N per bag is replaced automatically by
 * 20 kg urea per TSP bag unless the user unchecks it, in which case the
 * nitrogen shortfall is shown as a warning, never hidden.
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/fields";
import { Badge } from "@/components/ui/Badge";
import {
  DEFAULT_DAP_PRICE_RS,
  DEFAULT_TSP_PRICE_RS,
  DEFAULT_UREA_PRICE_RS,
  bagsFromP2O5,
  convertDapTsp,
  formatNum,
  formatRs,
  validateBags,
  validateP2O5,
  validatePrice,
  type DapTspResult,
} from "@/lib/dapTsp";

type Mode = "bags" | "phosphorus";

function toNum(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const v = parseFloat(t);
  return Number.isFinite(v) ? v : null;
}

export function DapTspForm() {
  const t = useTranslations("dapTsp");

  const [mode, setMode] = useState<Mode>("bags");
  const [bags, setBags] = useState("1");
  const [p2o5, setP2o5] = useState("23");
  const [dapPrice, setDapPrice] = useState(String(DEFAULT_DAP_PRICE_RS));
  const [tspPrice, setTspPrice] = useState(String(DEFAULT_TSP_PRICE_RS));
  const [ureaPrice, setUreaPrice] = useState(String(DEFAULT_UREA_PRICE_RS));
  const [includeUrea, setIncludeUrea] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const result: DapTspResult | null = useMemo(() => {
    if (!submitted) return null;
    const dap = toNum(dapPrice);
    const tsp = toNum(tspPrice);
    const urea = toNum(ureaPrice);
    if (dap === null || tsp === null || urea === null) return null;
    let bagCount: number | null = null;
    if (mode === "bags") {
      bagCount = toNum(bags);
      if (bagCount === null || validateBags(bagCount) !== null) return null;
    } else {
      const p = toNum(p2o5);
      if (p === null || validateP2O5(p) !== null) return null;
      bagCount = bagsFromP2O5(p);
      if (bagCount === null) return null;
    }
    if (
      validatePrice(dap) !== null ||
      validatePrice(tsp) !== null ||
      validatePrice(urea) !== null
    ) {
      return null;
    }
    return convertDapTsp({
      bags: bagCount,
      dapPriceRs: dap,
      tspPriceRs: tsp,
      ureaPriceRs: urea,
      includeUrea,
    });
  }, [submitted, mode, bags, p2o5, dapPrice, tspPrice, ureaPrice, includeUrea]);

  const onCompare = () => {
    setError("");
    if (mode === "bags") {
      const b = toNum(bags);
      if (b === null || validateBags(b) !== null) {
        setError(t("errors.enterBags"));
        return;
      }
    } else {
      const p = toNum(p2o5);
      if (p === null || validateP2O5(p) !== null) {
        setError(t("errors.enterP2O5"));
        return;
      }
    }
    const dap = toNum(dapPrice);
    const tsp = toNum(tspPrice);
    const urea = toNum(ureaPrice);
    if (
      dap === null ||
      tsp === null ||
      urea === null ||
      validatePrice(dap) !== null ||
      validatePrice(tsp) !== null ||
      validatePrice(urea) !== null
    ) {
      setError(t("errors.enterPrices"));
      return;
    }
    setSubmitted(true);
  };

  const modes: { id: Mode; label: string }[] = [
    { id: "bags", label: t("modes.bags") },
    { id: "phosphorus", label: t("modes.phosphorus") },
  ];

  const winnerText =
    result === null
      ? ""
      : result.cheaper === "tsp"
        ? t("savingTsp", { amount: formatRs(Math.abs(result.differenceRs)) })
        : result.cheaper === "dap"
          ? t("savingDap", { amount: formatRs(Math.abs(result.differenceRs)) })
          : t("savingEqual");

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("modeLabel")}>
        {modes.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => {
              setMode(m.id);
              setSubmitted(false);
              setError("");
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              mode === m.id
                ? "bg-leaf-700 text-white border-leaf-700 dark:bg-leaf-500 dark:border-leaf-500"
                : "border-line text-ink-soft hover:border-leaf-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <Card>
        <CardBody className="space-y-4">
          {mode === "bags" ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("bagsLabel")}>
                <Input
                  value={bags}
                  onChange={(e) => setBags(e.target.value)}
                  inputMode="decimal"
                  placeholder="1"
                />
              </Field>
              <p className="text-sm text-ink-soft self-end pb-2">{t("bagsHint")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("p2o5Label")}>
                <Input
                  value={p2o5}
                  onChange={(e) => setP2o5(e.target.value)}
                  inputMode="decimal"
                  placeholder="23"
                />
              </Field>
              <p className="text-sm text-ink-soft self-end pb-2">{t("p2o5Hint")}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={t("dapPriceLabel")}>
              <Input
                value={dapPrice}
                onChange={(e) => setDapPrice(e.target.value)}
                inputMode="decimal"
                placeholder={String(DEFAULT_DAP_PRICE_RS)}
              />
            </Field>
            <Field label={t("tspPriceLabel")}>
              <Input
                value={tspPrice}
                onChange={(e) => setTspPrice(e.target.value)}
                inputMode="decimal"
                placeholder={String(DEFAULT_TSP_PRICE_RS)}
              />
            </Field>
            <Field label={t("ureaPriceLabel")}>
              <Input
                value={ureaPrice}
                onChange={(e) => setUreaPrice(e.target.value)}
                inputMode="decimal"
                placeholder={String(DEFAULT_UREA_PRICE_RS)}
              />
            </Field>
          </div>

          <label className="flex items-start gap-2.5 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={includeUrea}
              onChange={(e) => setIncludeUrea(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-leaf-700"
            />
            <span>
              {t("includeUrea")}
              <span className="block text-xs font-normal text-ink-soft mt-0.5">
                {t("includeUreaHint")}
              </span>
            </span>
          </label>

          <p className="text-xs text-ink-soft">{t("priceNote")}</p>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button onClick={onCompare}>{t("calculate")}</Button>
        </CardBody>
      </Card>

      {/* Results */}
      {submitted && result && (
        <Card>
          <CardBody className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400">
                {t("resultsTitle")}
              </p>
              <Badge variant={result.cheaper === "equal" ? "neutral" : "verified"}>
                {winnerText}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Option A: DAP */}
              <div className="border border-line rounded-xl p-4 sm:p-5 space-y-3">
                <h3 className="font-display text-lg font-semibold">{t("optionDap")}</h3>
                <p className="font-display text-3xl font-semibold">{formatRs(result.dap.costRs)}</p>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("dapBags")}</dt>
                    <dd className="font-semibold">{formatNum(result.dap.bags)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("p2o5Supplied")}</dt>
                    <dd className="font-semibold">{formatNum(result.dap.p2o5Kg)} kg</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("nSupplied")}</dt>
                    <dd className="font-semibold">{formatNum(result.dap.nKg)} kg</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("costPerKgP")}</dt>
                    <dd className="font-semibold">{formatRs(result.dap.costPerKgP2O5)}</dd>
                  </div>
                </dl>
              </div>

              {/* Option B: TSP + urea */}
              <div className="border border-line rounded-xl p-4 sm:p-5 space-y-3">
                <h3 className="font-display text-lg font-semibold">{t("optionTsp")}</h3>
                <p className="font-display text-3xl font-semibold">{formatRs(result.tsp.costRs)}</p>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("tspBags")}</dt>
                    <dd className="font-semibold">{formatNum(result.tsp.bags)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("ureaNeeded")}</dt>
                    <dd className="font-semibold">
                      {formatNum(result.tsp.ureaKg)} kg ({formatNum(result.tsp.ureaBags)} {t("ureaBags").toLowerCase()})
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("p2o5Supplied")}</dt>
                    <dd className="font-semibold">{formatNum(result.tsp.p2o5Kg)} kg</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("nSupplied")}</dt>
                    <dd className="font-semibold">{formatNum(result.tsp.nKg)} kg</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("costPerKgP")}</dt>
                    <dd className="font-semibold">{formatRs(result.tsp.costPerKgP2O5)}</dd>
                  </div>
                </dl>
                <p className="text-xs text-ink-soft">{t("tspAvailabilityNote")}</p>
              </div>
            </div>

            {!includeUrea && (
              <p
                className="text-sm text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-lg p-3"
                role="alert"
              >
                {t("nShortfall", { kg: formatNum(result.nShortfallKg) })}
              </p>
            )}

            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-leaf-700 dark:text-leaf-400">
                {t("howCalculated")}
              </summary>
              <p className="mt-2 text-ink-soft">
                {t("methodLine", {
                  bags: formatNum(result.bags),
                  p2o5: formatNum(result.p2o5Kg),
                  dapCost: formatRs(result.dap.costRs),
                  tspBags: formatNum(result.tsp.bags),
                  ureaKg: formatNum(result.tsp.ureaKg),
                  ureaBags: formatNum(result.tsp.ureaBags),
                  ureaPrice: formatRs(toNum(ureaPrice) ?? DEFAULT_UREA_PRICE_RS),
                  tspCost: formatRs(result.tsp.costRs),
                })}
              </p>
              <p className="mt-1 text-ink-soft">{t("nNote")}</p>
            </details>

            <div className="border-t border-line pt-4 flex flex-wrap gap-2">
              <Link
                href="/blog/dap-vs-tsp-pakistan"
                className="inline-flex rounded-xl bg-leaf-700 text-white px-5 py-2.5 text-[15px] font-medium hover:bg-leaf-800 dark:bg-leaf-600 dark:hover:bg-leaf-500 transition-colors"
              >
                {t("readArticle")}
              </Link>
              <Link
                href="/calculator"
                className="inline-flex rounded-xl border border-line bg-surface px-5 py-2.5 text-[15px] font-medium hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors"
              >
                {t("openCalculator")}
              </Link>
              <Link
                href="/fertilizers/dap"
                className="inline-flex rounded-xl border border-line bg-surface px-5 py-2.5 text-[15px] font-medium hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors"
              >
                {t("dapDetails")}
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
