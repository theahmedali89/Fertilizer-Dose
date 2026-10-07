"use client";

/**
 * Land Area Calculator — interactive form.
 *
 * Modes: Length × Width | 4 Sides | Irregular (sections) | Converter.
 * Country-aware units (verified regional units only), honest math:
 * 4 sides alone => clearly-labeled approximation with warning; 4 sides +
 * diagonal => exact (two triangles). No fertilizer is ever derived from
 * area alone — integrations transfer area/unit/country/region into the
 * real calculators.
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/fields";
import { Badge } from "@/components/ui/Badge";
import { COUNTRY_COOKIE, REGION_COOKIE, COUNTRY_COOKIE_MAX_AGE } from "@/lib/countryCookies";
import { loadGarden, saveGarden, newId, type AreaUnit as GardenAreaUnit } from "@/lib/garden";
import {
  LENGTH_UNITS,
  LAND_COUNTRIES,
  areaUnitsForCountry,
  getAreaUnit,
  toSqM,
  fromSqM,
  rectAreaSqM,
  quadAreaWithDiagonal,
  quadAreaApprox,
  QUAD_APPROX_WARNING,
  sectionAreaSqM,
  formatArea,
  bestDisplayUnit,
  equivalentAreas,
  type LandSection,
  type SectionShape,
} from "@/lib/landArea";

type Mode = "rect" | "fourSides" | "irregular" | "converter";

const PK_REGIONS = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan"];

function toNum(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const v = parseFloat(t);
  return Number.isFinite(v) ? v : null;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

/** Map a sqm value to the fertilizer/profit calculator's unit set. */
function toCalcUnit(sqm: number, countryCode: string): { value: number; unit: "acre" | "kanal" | "marla" | "hectare" } {
  if (countryCode === "PK") {
    const kanal = toSqM(1, "kanal") ?? 505.857;
    const marla = toSqM(1, "marla") ?? 25.2929;
    if (sqm >= kanal) return { value: sqm / kanal, unit: "kanal" };
    return { value: sqm / marla, unit: "marla" };
  }
  if (sqm >= 10000) return { value: sqm / 10000, unit: "hectare" };
  const acre = toSqM(1, "acre") ?? 4046.8564224;
  return { value: sqm / acre, unit: "acre" };
}

/** Map a sqm value to the My Garden plot unit set. */
function toGardenUnit(sqm: number, countryCode: string): { value: number; unit: GardenAreaUnit } {
  const c = toCalcUnit(sqm, countryCode);
  return { value: Math.round(c.value * 100) / 100, unit: c.unit };
}

export function LandAreaForm() {
  const t = useTranslations("landArea");
  const router = useRouter();

  const [country, setCountry] = useState(() => {
    const c = readCookie(COUNTRY_COOKIE);
    return c && LAND_COUNTRIES.some((x) => x.code === c) ? c : "INTL";
  });
  const [pkRegion, setPkRegion] = useState(PK_REGIONS[0]);
  const [mode, setMode] = useState<Mode>("rect");

  // rect
  const [len, setLen] = useState("");
  const [lenUnit, setLenUnit] = useState("m");
  const [wid, setWid] = useState("");
  const [widUnit, setWidUnit] = useState("m");

  // four sides
  const [sides, setSides] = useState(["", "", "", ""]);
  const [sideUnit, setSideUnit] = useState("m");
  const [diag, setDiag] = useState("");

  // irregular sections
  const [sections, setSections] = useState<LandSection[]>([
    { id: "sec-1", name: "Section A", shape: "rectangle", dims: ["", ""], unit: "m" } as unknown as LandSection,
  ]);

  // converter
  const [convVal, setConvVal] = useState("");
  const [convFrom, setConvFrom] = useState("acre");

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [savedPlot, setSavedPlot] = useState(false);

  const units = useMemo(() => areaUnitsForCountry(country), [country]);
  const countryObj = LAND_COUNTRIES.find((c) => c.code === country);

  type CalcResult = {
    sqm: number;
    method: string;
    approx: boolean;
    note?: string;
  } | null;

  const result: CalcResult = useMemo(() => {
    if (!submitted) return null;
    if (mode === "rect") {
      const l = toNum(len);
      const w = toNum(wid);
      if (l === null || w === null) return null;
      const sqm = rectAreaSqM(l, lenUnit, w, widUnit);
      if (sqm === null) return null;
      return {
        sqm,
        method: `${l} ${lenUnit} × ${w} ${widUnit}`,
        approx: false,
      };
    }
    if (mode === "fourSides") {
      const vs = sides.map(toNum);
      if (vs.some((v) => v === null)) return null;
      const [a, b, c, d] = vs as number[];
      const dg = toNum(diag);
      if (dg !== null && dg > 0) {
        const sqm = quadAreaWithDiagonal(a, b, c, d, dg, sideUnit);
        if (sqm === null) return null;
        return {
          sqm,
          method: t("method.quadDiag", { a, b, c, d, diag: dg, unit: sideUnit }),
          approx: false,
        };
      }
      const sqm = quadAreaApprox(a, b, c, d, sideUnit);
      if (sqm === null) return null;
      return { sqm, method: t("method.quadApprox", { a, b, c, d, unit: sideUnit }), approx: true, note: QUAD_APPROX_WARNING };
    }
    if (mode === "irregular") {
      let total = 0;
      const parts: string[] = [];
      for (const s of sections) {
        const dims = (s.dims as unknown as string[]).map(toNum);
        if (dims.some((v) => v === null)) return null;
        const sqm = sectionAreaSqM({ ...s, dims: dims as number[] });
        if (sqm === null) return null;
        total += sqm;
        parts.push(`${s.name}: ${formatArea(sqm, bestDisplayUnit(sqm, country))}`);
      }
      if (parts.length === 0) return null;
      return { sqm: total, method: parts.join(" + "), approx: false };
    }
    // converter
    const v = toNum(convVal);
    if (v === null) return null;
    const sqm = toSqM(v, convFrom);
    if (sqm === null) return null;
    return { sqm, method: `${v} ${getAreaUnit(convFrom)?.label ?? convFrom}`, approx: false };
  }, [submitted, mode, len, lenUnit, wid, widUnit, sides, sideUnit, diag, sections, convVal, convFrom, country, t]);

  const onCalculate = () => {
    setError("");
    setSavedPlot(false);
    // basic presence validation for friendly errors
    if (mode === "rect" && (toNum(len) === null || toNum(wid) === null)) {
      setError(t("errors.enterDimensions"));
      return;
    }
    if (mode === "fourSides" && sides.map(toNum).some((v) => v === null)) {
      setError(t("errors.enterSides"));
      return;
    }
    if (mode === "converter" && toNum(convVal) === null) {
      setError(t("errors.enterValue"));
      return;
    }
    setSubmitted(true);
    if (mode === "rect") {
      const l = toNum(len) as number;
      const w = toNum(wid) as number;
      if (rectAreaSqM(l, lenUnit, w, widUnit) === null) setError(t("errors.invalid"));
    }
  };

  const transfer = (path: "/calculator" | "/profit-calculator") => {
    if (!result) return;
    const { value, unit } = toCalcUnit(result.sqm, country);
    document.cookie = `${COUNTRY_COOKIE}=${country}; path=/; max-age=${COUNTRY_COOKIE_MAX_AGE}; SameSite=Lax`;
    if (country === "PK") {
      document.cookie = `${REGION_COOKIE}=${encodeURIComponent(pkRegion)}; path=/; max-age=${COUNTRY_COOKIE_MAX_AGE}; SameSite=Lax`;
    }
    const rounded = Math.round(value * 100) / 100;
    router.push(`${path}?area=${rounded}&unit=${unit}`);
  };

  const savePlot = () => {
    if (!result) return;
    const { value, unit } = toGardenUnit(result.sqm, country);
    const state = loadGarden();
    state.plots.push({
      id: newId(),
      name: t("savedPlotName", { date: new Date().toLocaleDateString() }),
      location: country === "PK" ? pkRegion : null,
      regionId: null,
      area: value,
      unit,
      soilType: null,
      notes: t("savedPlotNote", { sqm: formatArea(result.sqm, "sqm") }),
      createdAt: new Date().toISOString(),
    });
    saveGarden(state);
    setSavedPlot(true);
  };

  const planKitchenGarden = () => {
    // Dedicated Kitchen Gardening page exists — transfer the measured area
    // (as m²) and keep the saved plot for continuity in My Garden.
    if (!result) return;
    savePlot();
    const rounded = Math.round(result.sqm * 100) / 100;
    router.push(`/kitchen-garden?area=${rounded}&unit=sqm`);
  };

  const primaryUnit = result ? bestDisplayUnit(result.sqm, country) : "sqm";
  const equivalents = result ? equivalentAreas(result.sqm, country) : [];

  const modes: { id: Mode; label: string }[] = [
    { id: "rect", label: t("modes.rect") },
    { id: "fourSides", label: t("modes.fourSides") },
    { id: "irregular", label: t("modes.irregular") },
    { id: "converter", label: t("modes.converter") },
  ];

  return (
    <div className="space-y-6">
      {/* Country + region */}
      <Card>
        <CardBody>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("country")}>
              <Select value={country} onChange={(e) => { setCountry(e.target.value); setSubmitted(false); }}>
                {LAND_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Select>
            </Field>
            {country === "PK" && (
              <Field label={t("region")}>
                <Select value={pkRegion} onChange={(e) => setPkRegion(e.target.value)}>
                  {PK_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
          {country !== "PK" && country !== "INTL" && (
            <p className="mt-3 text-sm text-ink-soft">{t("noRegionalUnits")}</p>
          )}
          {country === "PK" && (
            <p className="mt-3 text-sm text-ink-soft">{t("pkUnitNote")}</p>
          )}
        </CardBody>
      </Card>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("modeLabel")}>
        {modes.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => { setMode(m.id); setSubmitted(false); setError(""); }}
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
          {mode === "rect" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("length")}>
                <div className="flex gap-2">
                  <Input value={len} onChange={(e) => setLen(e.target.value)} inputMode="decimal" placeholder="100" className="flex-1" />
                  <Select value={lenUnit} onChange={(e) => setLenUnit(e.target.value)} className="w-28">
                    {LENGTH_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label} ({u.symbol})</option>)}
                  </Select>
                </div>
              </Field>
              <Field label={t("width")}>
                <div className="flex gap-2">
                  <Input value={wid} onChange={(e) => setWid(e.target.value)} inputMode="decimal" placeholder="50" className="flex-1" />
                  <Select value={widUnit} onChange={(e) => setWidUnit(e.target.value)} className="w-28">
                    {LENGTH_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label} ({u.symbol})</option>)}
                  </Select>
                </div>
              </Field>
            </div>
          )}

          {mode === "fourSides" && (
            <div className="space-y-4">
              <p className="text-sm text-ink-soft">{t("fourSideExplainer")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["A", "B", "C", "D"].map((lbl, i) => (
                  <Field key={lbl} label={t("side", { n: lbl })}>
                    <Input
                      value={sides[i]}
                      onChange={(e) => { const n = [...sides]; n[i] = e.target.value; setSides(n); }}
                      inputMode="decimal"
                      placeholder="0"
                    />
                  </Field>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("sideUnit")}>
                  <Select value={sideUnit} onChange={(e) => setSideUnit(e.target.value)}>
                    {LENGTH_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label} ({u.symbol})</option>)}
                  </Select>
                </Field>
                <Field label={t("diagonalOptional")}>
                  <Input value={diag} onChange={(e) => setDiag(e.target.value)} inputMode="decimal" placeholder={t("diagonalPlaceholder")} />
                </Field>
              </div>
              {!diag && <p className="text-sm text-amber-700 dark:text-amber-400">{t("noDiagonalWarning")}</p>}
            </div>
          )}

          {mode === "irregular" && (
            <div className="space-y-4">
              {sections.map((s, idx) => (
                <div key={s.id} className="border border-line rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      value={s.name}
                      onChange={(e) => { const n = [...sections]; n[idx] = { ...s, name: e.target.value }; setSections(n); }}
                      className="font-medium max-w-48"
                      aria-label={t("sectionName")}
                    />
                    {sections.length > 1 && (
                      <Button variant="ghost" onClick={() => setSections(sections.filter((x) => x.id !== s.id))}>
                        {t("remove")}
                      </Button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field label={t("shape")}>
                      <Select
                        value={s.shape}
                        onChange={(e) => { const n = [...sections]; n[idx] = { ...s, shape: e.target.value as SectionShape, dims: ["", "", ""] } as unknown as LandSection; setSections(n); }}
                      >
                        <option value="rectangle">{t("shapes.rectangle")}</option>
                        <option value="square">{t("shapes.square")}</option>
                        <option value="triangle">{t("shapes.triangle")}</option>
                        <option value="trapezoid">{t("shapes.trapezoid")}</option>
                      </Select>
                    </Field>
                    <Field label={t("dimensions")}>
                      <div className="flex gap-2">
                        {(s.dims as unknown as string[]).slice(0, s.shape === "square" ? 1 : s.shape === "trapezoid" ? 3 : 2).map((d, di) => (
                          <Input
                            key={di}
                            value={d}
                            onChange={(e) => {
                              const n = [...sections];
                              const dims = [...(n[idx].dims as unknown as string[])];
                              dims[di] = e.target.value;
                              n[idx] = { ...s, dims: dims as unknown as number[] };
                              setSections(n);
                            }}
                            inputMode="decimal"
                            placeholder={t("dimPlaceholder", { n: di + 1 })}
                            className="flex-1"
                          />
                        ))}
                      </div>
                    </Field>
                    <Field label={t("unit")}>
                      <Select value={s.unit} onChange={(e) => { const n = [...sections]; n[idx] = { ...s, unit: e.target.value }; setSections(n); }}>
                        {LENGTH_UNITS.map((u) => <option key={u.id} value={u.id}>{u.symbol}</option>)}
                      </Select>
                    </Field>
                  </div>
                  <p className="text-xs text-ink-soft">{t("shapeHint." + s.shape)}</p>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() =>
                  setSections([
                    ...sections,
                    { id: `sec-${Date.now()}`, name: `Section ${String.fromCharCode(65 + sections.length)}`, shape: "rectangle", dims: ["", ""], unit: "m" } as unknown as LandSection,
                  ])
                }
              >
                {t("addSection")}
              </Button>
            </div>
          )}

          {mode === "converter" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("value")}>
                <Input value={convVal} onChange={(e) => setConvVal(e.target.value)} inputMode="decimal" placeholder="5" />
              </Field>
              <Field label={t("fromUnit")}>
                <Select value={convFrom} onChange={(e) => setConvFrom(e.target.value)}>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.label} ({u.symbol}){u.kind === "regional" ? ` — ${countryObj?.name}` : ""}</option>
                  ))}
                </Select>
              </Field>
            </div>
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}

          <Button onClick={onCalculate}>{t("calculate")}</Button>
        </CardBody>
      </Card>

      {/* Results */}
      {submitted && result && (
        <Card>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400">{t("totalArea")}</p>
              {result.approx && <Badge variant="review">{t("approximate")}</Badge>}
            </div>
            <p className="font-display text-4xl sm:text-5xl font-semibold">{formatArea(result.sqm, primaryUnit)}</p>
            {result.approx && (
              <p className="text-sm text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-lg p-3" role="note">
                {t("approxWarning")}
              </p>
            )}
            <div>
              <p className="text-sm font-medium mb-2">{t("equivalents")}</p>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {equivalents.map((e) => {
                  const u = getAreaUnit(e.unitId);
                  return (
                    <div key={e.unitId} className="border border-line rounded-lg px-3 py-2">
                      <dt className="text-xs text-ink-soft">{u?.label}{u?.kind === "regional" ? ` (${u.standard})` : ""}</dt>
                      <dd className="font-semibold">{formatArea(e.value, e.unitId)}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-leaf-700 dark:text-leaf-400">{t("howCalculated")}</summary>
              <p className="mt-2 text-ink-soft">{result.method}</p>
              <p className="mt-1 text-ink-soft">{t("precisionNote")}</p>
            </details>

            {/* Agricultural next actions */}
            <div className="border-t border-line pt-4">
              <p className="text-sm font-medium mb-3">{t("nextActions")}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => transfer("/calculator")}>{t("useInFertilizer")}</Button>
                <Button variant="secondary" onClick={() => transfer("/profit-calculator")}>{t("estimateProfit")}</Button>
                <Button variant="secondary" onClick={savePlot}>{t("savePlot")}</Button>
                <Button variant="secondary" onClick={planKitchenGarden}>{t("planKitchenGarden")}</Button>
              </div>
              {savedPlot && (
                <p className="mt-3 text-sm text-leaf-700 dark:text-leaf-400">
                  {t("plotSaved")} <Link href="/my-garden" className="underline">{t("openMyGarden")}</Link>
                </p>
              )}
              <p className="mt-2 text-xs text-ink-soft">{t("noFertilizerNote")}</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
