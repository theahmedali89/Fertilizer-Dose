"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GrowingCard } from "./GrowingCard";
import { PLANT_SUBCATEGORIES, type GrowingItem, type PlantSubcategory } from "@/lib/growing";
import { monthName } from "@/lib/planting";
import {
  type CountryInfo,
  type RegionInfo,
  type WindowFilterRow,
} from "@/server/country";
import { cn } from "@/lib/utils";

/** Cross-year aware month match: Nov→Feb matches Jan. */
function monthMatches(month: number, startMonth: number, endMonth: number): boolean {
  if (startMonth <= endMonth) return month >= startMonth && month <= endMonth;
  return month >= startMonth || month <= endMonth;
}

export function GrowingIndex({
  category,
  items,
  countries,
  regions,
  windowIndex,
}: {
  category: GrowingItem["category"];
  items: GrowingItem[];
  countries: CountryInfo[];
  regions: RegionInfo[];
  windowIndex: WindowFilterRow[];
}) {
  const t = useTranslations("growing");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "verified" | "under_review">("all");
  const [subcat, setSubcat] = useState<PlantSubcategory | "all">("all");
  const [country, setCountry] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [month, setMonth] = useState<number>(0); // 0 = any month

  const regionsForCountry = useMemo(
    () => (country === "all" ? regions : regions.filter((r) => r.countryCode === country)),
    [regions, country]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (status !== "all" && i.verificationStatus !== status) return false;
      if (category === "plant" && subcat !== "all" && i.plantSubcategory !== subcat) return false;
      if (!q) {
        // fall through to geo filters
      } else if (
        ![i.name, i.urdu ?? "", i.scientificName ?? "", i.slug]
          .join(" ")
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      // Country / region / planting-month filters from verified windows.
      if (country !== "all" || region !== "all" || month !== 0) {
        const match = windowIndex.some((w) => {
          if (w.itemSlug !== i.slug) return false;
          if (country !== "all" && w.countryCode !== country) return false;
          if (region !== "all" && w.regionSlug !== region) return false;
          if (month !== 0 && !monthMatches(month, w.startMonth, w.endMonth)) return false;
          return true;
        });
        if (!match) return false;
      }
      return true;
    });
  }, [items, query, status, subcat, category, country, region, month, windowIndex]);

  const statusBtn = (id: "all" | "verified" | "under_review", label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setStatus(id)}
      aria-pressed={status === id}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        status === id
          ? "border-leaf-700 bg-leaf-700 text-white dark:border-leaf-500 dark:bg-leaf-600"
          : "border-line text-ink-soft hover:border-leaf-600"
      )}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="w-full rounded-xl border border-line bg-surface ps-10 pe-4 py-2.5 text-sm outline-none focus:border-leaf-600 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusBtn("all", t("filterAll"))}
          {statusBtn("verified", t("filterVerified"))}
          {statusBtn("under_review", t("filterInReview"))}
        </div>
      </div>

      {/* Country / region / planting-month filters (verified windows only) */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
            {t("filterCountry")}
          </span>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setRegion("all");
            }}
            className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-medium outline-none focus:border-leaf-600 transition-colors w-full"
          >
            <option value="all">{t("allCountries")}</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
            {t("filterRegion")}
          </span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-medium outline-none focus:border-leaf-600 transition-colors w-full"
          >
            <option value="all">{t("allRegions")}</option>
            {regionsForCountry.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name} ({r.countryName})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
            {t("filterMonth")}
          </span>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-medium outline-none focus:border-leaf-600 transition-colors w-full capitalize"
          >
            <option value={0}>{t("anyMonth")}</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {monthName(m, locale)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {category === "plant" && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSubcat("all")}
            aria-pressed={subcat === "all"}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              subcat === "all"
                ? "border-harvest-600 bg-harvest-500 text-white"
                : "border-line text-ink-soft hover:border-harvest-600"
            )}
          >
            {t("subcategoryAll")}
          </button>
          {PLANT_SUBCATEGORIES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubcat(s.id)}
              aria-pressed={subcat === s.id}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                subcat === s.id
                  ? "border-harvest-600 bg-harvest-500 text-white"
                  : "border-line text-ink-soft hover:border-harvest-600"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-faint mb-4" role="status">
        {t("resultsCount", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="font-semibold">{t("noResults")}</p>
          <p className="text-sm text-ink-faint mt-1">{t("noResultsHint")}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((item) => (
            <GrowingCard
              key={item.slug}
              item={item}
              verifiedLabel={t("verifiedBadge")}
              inReviewLabel={t("inReviewBadge")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
