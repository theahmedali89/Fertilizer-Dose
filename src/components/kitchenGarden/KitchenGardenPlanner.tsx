/**
 * Kitchen Garden Planner — interactive planner UI.
 *
 * DATA-INTEGRITY POLICY (binding):
 * - Suggestions are server-fetched from PlantingWindow rows
 *   (see src/server/kitchenGarden.ts). This component never invents crops,
 *   windows, or spacing.
 * - Per Ahmed's 2026-10-08 directive, under_review windows are shown too —
 *   always with a visible "Under Review" badge, never as verified.
 * - Layout math is pure arithmetic on the user's own inputs (plot area,
 *   adjustable bed/path widths). Spacing guidance is explicitly marked as
 *   not verified.
 * - Country/region/month/sunlight live in the URL (shareable), like the
 *   planting calendar. Area/unit start from ?area=&unit= (land-area
 *   integration) and are preserved in the URL on filter changes.
 */
"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/fields";
import { Badge } from "@/components/ui/Badge";
import { monthName } from "@/lib/planting";
import {
  COUNTRY_COOKIE,
  REGION_COOKIE,
  COUNTRY_COOKIE_MAX_AGE,
} from "@/lib/countryCookies";
import {
  loadGarden,
  saveGarden,
  newId,
  type AreaUnit as GardenAreaUnit,
} from "@/lib/garden";
import type { CountryInfo, RegionInfo } from "@/server/country";
import type {
  KitchenGardenSuggestion,
  SunlightPref,
} from "@/server/kitchenGarden";

export interface KitchenGardenInitial {
  country: string; // lowercase code, e.g. "pk"
  region: string; // region slug
  month: number;
  sunlight: SunlightPref;
  area: string;
  unit: "sqm" | "sqft";
}

const SQFT_PER_SQM = 10.7639;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${COUNTRY_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Map a sqm value to the My Garden plot unit set (mirrors LandAreaForm). */
function toGardenUnit(
  sqm: number,
  countryCode: string
): { value: number; unit: GardenAreaUnit } {
  const kanal = 505.857; // Punjab revenue standard
  const marla = 25.2929;
  if (countryCode === "PK") {
    if (sqm >= kanal) return { value: sqm / kanal, unit: "kanal" };
    return { value: sqm / marla, unit: "marla" };
  }
  if (sqm >= 10000) return { value: sqm / 10000, unit: "hectare" };
  return { value: sqm / 4046.8564224, unit: "acre" };
}

function windowLabelText(s: KitchenGardenSuggestion, locale: string): string {
  const a = monthName(s.startMonth, locale);
  const b = monthName(s.endMonth, locale);
  return s.startMonth === s.endMonth ? a : `${a} – ${b}`;
}

export function KitchenGardenPlanner({
  countries,
  regionsByCountry,
  suggestions,
  regionName,
  initial,
}: {
  countries: CountryInfo[];
  regionsByCountry: Record<string, RegionInfo[]>;
  suggestions: KitchenGardenSuggestion[];
  regionName: string;
  initial: KitchenGardenInitial;
}) {
  const t = useTranslations("kitchenGarden");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [sel, setSel] = useState({
    country: initial.country,
    region: initial.region,
    month: initial.month,
    sunlight: initial.sunlight,
  });
  const [area, setArea] = useState(initial.area);
  const [unit, setUnit] = useState<"sqm" | "sqft">(initial.unit);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shares, setShares] = useState<Record<string, number>>({});
  const [bedWidth, setBedWidth] = useState("1");
  const [pathWidth, setPathWidth] = useState("0.4");
  const [saved, setSaved] = useState(false);

  const apply = (next: typeof sel) => {
    setSel(next);
    setCookie(COUNTRY_COOKIE, next.country.toUpperCase());
    setCookie(REGION_COOKIE, next.region);
    const q = new URLSearchParams();
    q.set("country", next.country);
    q.set("region", next.region);
    q.set("month", String(next.month));
    if (next.sunlight !== "any") q.set("sunlight", next.sunlight);
    const a = parseFloat(area);
    if (Number.isFinite(a) && a > 0) {
      q.set("area", String(Math.round(a * 100) / 100));
      q.set("unit", unit);
    }
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  const onCountry = (country: string) => {
    const first = regionsByCountry[country]?.[0]?.slug ?? "";
    apply({ ...sel, country, region: first });
  };

  const areaSqm = useMemo(() => {
    const a = parseFloat(area);
    if (!Number.isFinite(a) || a <= 0) return 0;
    return unit === "sqft" ? a / SQFT_PER_SQM : a;
  }, [area, unit]);

  const toggleSelect = (id: string) => {
    setSaved(false);
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      // Redistribute shares equally on every selection change.
      const share = next.length > 0 ? Math.round((100 / next.length) * 10) / 10 : 0;
      const ns: Record<string, number> = {};
      next.forEach((x, i) => {
        ns[x] = i === next.length - 1 ? Math.round((100 - share * (next.length - 1)) * 10) / 10 : share;
      });
      setShares(ns);
      return next;
    });
  };

  const selected = useMemo(
    () => suggestions.filter((s) => selectedIds.includes(s.windowId)),
    [suggestions, selectedIds]
  );

  const shareTotal = useMemo(
    () => Object.values(shares).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0),
    [shares]
  );

  const bedStats = useMemo(() => {
    const bw = parseFloat(bedWidth);
    const pw = parseFloat(pathWidth);
    if (!Number.isFinite(bw) || bw <= 0 || !Number.isFinite(pw) || pw < 0 || areaSqm <= 0)
      return null;
    const plantablePct = (bw / (bw + pw)) * 100;
    const bedMeters = (areaSqm * (bw / (bw + pw))) / bw;
    return {
      pct: Math.round(plantablePct),
      bedMeters: Math.round(bedMeters * 10) / 10,
    };
  }, [bedWidth, pathWidth, areaSqm]);

  const savePlan = () => {
    if (areaSqm <= 0 || selected.length === 0) return;
    const { value, unit: gUnit } = toGardenUnit(areaSqm, sel.country.toUpperCase());
    const now = new Date();
    const state = loadGarden();
    const plotId = newId();
    state.plots.push({
      id: plotId,
      name: t("savedPlotName", { date: now.toLocaleDateString() }),
      location: null,
      regionId: sel.region,
      area: Math.round(value * 100) / 100,
      unit: gUnit,
      soilType: null,
      notes: t("savedPlotNote", {
        sqm: String(Math.round(areaSqm * 100) / 100),
        month: monthName(sel.month, locale),
        region: regionName,
        count: selected.length,
      }),
      createdAt: now.toISOString(),
    });
    for (const s of selected) {
      state.plantings.push({
        id: newId(),
        plotId,
        itemSlug: s.itemSlug,
        plantedOn: now.toISOString().slice(0, 10),
        stage: null,
        notes: `${activityLabel(s.activityType)} · ${windowLabelText(s, locale)}`,
        createdAt: now.toISOString(),
      });
    }
    saveGarden(state);
    setSaved(true);
  };

  const activityLabel = (a: string) =>
    a === "TRANSPLANT" ? t("activityTRANSPLANT") : a === "PLANT" ? t("activityPLANT") : t("activitySOW");

  const sunlightOpts: { id: SunlightPref; label: string }[] = [
    { id: "any", label: t("sunlightAny") },
    { id: "full", label: t("sunlightFull") },
    { id: "partial", label: t("sunlightPartial") },
    { id: "shade", label: t("sunlightShade") },
  ];

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const regions = regionsByCountry[sel.country] ?? [];
  const hasSunlightData = suggestions.some((s) => s.sunlight);
  const monthLabel = monthName(sel.month, locale);

  return (
    <div className="space-y-8">
      {/* Plot & conditions */}
      <Card>
        <CardBody>
          <h2 className="font-display text-xl font-semibold mb-4">{t("plotTitle")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex gap-2">
              <Field label={t("area")} className="flex-1">
                <Input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="25"
                />
              </Field>
              <Field label={t("areaUnit")} className="w-36">
                <Select value={unit} onChange={(e) => setUnit(e.target.value as "sqm" | "sqft")}>
                  <option value="sqm">{t("unitSqm")}</option>
                  <option value="sqft">{t("unitSqft")}</option>
                </Select>
              </Field>
            </div>
            <Field label={t("country")}>
              <Select value={sel.country} onChange={(e) => onCountry(e.target.value)}>
                {countries.map((c) => (
                  <option key={c.code} value={c.code.toLowerCase()}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("region")}>
              <Select
                value={sel.region}
                onChange={(e) => apply({ ...sel, region: e.target.value })}
              >
                {regions.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("month")}>
              <Select
                value={sel.month}
                onChange={(e) => apply({ ...sel, month: parseInt(e.target.value, 10) })}
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthName(m, locale)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("sunlight")}>
              <Select
                value={sel.sunlight}
                onChange={(e) => apply({ ...sel, sunlight: e.target.value as SunlightPref })}
              >
                {sunlightOpts.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </CardBody>
      </Card>

      {/* Suggestions */}
      <div>
        <div className="flex flex-wrap items-baseline gap-3 mb-1">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            {t("suggestionsTitle")}
          </h2>
          <Badge variant="neutral">
            {t("suggestionsCount", { n: suggestions.length, month: monthLabel, region: regionName })}
          </Badge>
        </div>
        <p className="text-sm text-ink-soft mb-5">{t("selectHint")}</p>

        {sel.sunlight !== "any" && !hasSunlightData && suggestions.length > 0 && (
          <p className="mb-4 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-soft">
            {t("sunlightGapNote")}
          </p>
        )}

        {suggestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center max-w-2xl mx-auto">
            <p className="font-display text-xl font-semibold">{t("emptyTitle")}</p>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">
              {t("emptyBody", { region: regionName, month: monthLabel })}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((s) => {
              const checked = selectedIds.includes(s.windowId);
              return (
                <label
                  key={s.windowId}
                  className={`block cursor-pointer rounded-xl2 border bg-surface shadow-card transition-colors p-5 ${
                    checked ? "border-leaf-600 ring-2 ring-leaf-600/20" : "border-line hover:border-leaf-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(s.windowId)}
                      className="mt-1 h-5 w-5 shrink-0 accent-leaf-600"
                      aria-label={s.itemName}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-ink leading-snug">
                        {s.localName ?? s.itemName}
                        {s.itemUrdu && <span className="font-normal text-ink-soft"> · {s.itemUrdu}</span>}
                      </p>
                      {s.scientificName && (
                        <p className="text-xs italic text-ink-faint mt-0.5">{s.scientificName}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {s.verificationStatus === "under_review" ? (
                          <Badge variant="review">{t("underReview")}</Badge>
                        ) : (
                          <Badge variant="verified">{t("verified")}</Badge>
                        )}
                        <Badge variant="neutral">{activityLabel(s.activityType)}</Badge>
                        <Badge variant="neutral">
                          {s.category === "herb" ? t("categoryHerb") : t("categoryVegetable")}
                        </Badge>
                      </div>
                      <dl className="mt-3 space-y-1.5 text-sm">
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                            {t("plantingWindow")}
                          </dt>
                          <dd className="text-ink">{windowLabelText(s, locale)}</dd>
                        </div>
                        {s.notes && (
                          <div>
                            <dd className="text-ink-soft text-[13px] leading-relaxed">{s.notes}</dd>
                          </div>
                        )}
                        <div className="text-xs text-ink-faint pt-1">
                          {t("source")}: {s.sourceOrg} — {s.sourceTitle}
                        </div>
                      </dl>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan */}
      {selected.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="font-display text-xl font-semibold mb-1">{t("planTitle")}</h2>
            <p className="text-sm text-ink-soft mb-4">
              {t("suggestionsCount", { n: selected.length, month: monthLabel, region: regionName })}
            </p>

            <div className="overflow-x-auto rounded-xl border border-line mb-6">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="bg-surface-2 text-start">
                    <th className="px-4 py-3 font-semibold">{t("planCrop")}</th>
                    <th className="px-4 py-3 font-semibold">{t("plantingWindow")}</th>
                    <th className="px-4 py-3 font-semibold w-36">{t("planShare")}</th>
                    <th className="px-4 py-3 font-semibold">{t("planArea")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {selected.map((s) => {
                    const share = shares[s.windowId] ?? 0;
                    const shareSqm = areaSqm > 0 ? (areaSqm * share) / 100 : 0;
                    return (
                      <tr key={s.windowId}>
                        <td className="px-4 py-3 font-medium">
                          {s.localName ?? s.itemName}
                          {s.verificationStatus === "under_review" && (
                            <Badge variant="review" className="ml-2">{t("underReview")}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ink-soft">{windowLabelText(s, locale)}</td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            inputMode="decimal"
                            value={String(share)}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              setShares((p) => ({ ...p, [s.windowId]: Number.isFinite(v) ? v : 0 }));
                              setSaved(false);
                            }}
                            className="!py-1.5"
                            aria-label={`${t("planShare")} — ${s.itemName}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                          {areaSqm > 0
                            ? `${(Math.round(shareSqm * 10) / 10).toLocaleString(locale)} m² (${(
                                Math.round(shareSqm * SQFT_PER_SQM * 10) / 10
                              ).toLocaleString(locale)} ft²)`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {Math.round(shareTotal * 10) / 10 !== 100 && (
              <p className="text-sm text-harvest-700 dark:text-harvest-400 mb-4">
                {t("shareTotal", { total: Math.round(shareTotal * 10) / 10 })}
              </p>
            )}

            {/* Layout estimate */}
            <h3 className="font-semibold text-ink mb-3">{t("bedTitle")}</h3>
            <div className="grid sm:grid-cols-2 gap-4 max-w-md mb-3">
              <Field label={t("bedWidth")}>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  inputMode="decimal"
                  value={bedWidth}
                  onChange={(e) => setBedWidth(e.target.value)}
                />
              </Field>
              <Field label={t("pathWidth")}>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={pathWidth}
                  onChange={(e) => setPathWidth(e.target.value)}
                />
              </Field>
            </div>
            {bedStats && (
              <p className="text-sm text-ink-soft leading-relaxed mb-3">
                {t("bedAssumptionNote", {
                  bedWidth: bedWidth,
                  pathWidth: pathWidth,
                  pct: bedStats.pct,
                  bedMeters: bedStats.bedMeters,
                })}
              </p>
            )}
            <p className="text-sm text-ink-soft leading-relaxed mb-5 rounded-xl border border-dashed border-line px-4 py-3">
              {t("spacingNote")}
            </p>

            <Button onClick={savePlan} disabled={areaSqm <= 0 || selected.length === 0}>
              {t("savePlan")}
            </Button>
            {saved && (
              <p className="mt-3 text-sm text-leaf-700 dark:text-leaf-400">
                {t("saved")}{" "}
                <Link href="/my-garden" className="underline">
                  {t("openMyGarden")}
                </Link>
              </p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
