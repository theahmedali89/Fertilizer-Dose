"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { monthName } from "@/lib/planting";
import {
  COUNTRY_COOKIE,
  REGION_COOKIE,
  COUNTRY_COOKIE_MAX_AGE,
} from "@/lib/countryCookies";
import type { CountryInfo, RegionInfo } from "@/server/country";

export type CalendarCategory =
  | "all" | "crop" | "vegetable" | "fruit" | "herb" | "flower" | "other";

export interface CalendarSelection {
  country: string; // lowercase code: pk
  region: string; // region slug
  month: number;
  category: CalendarCategory;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${COUNTRY_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Country / Region / Month / Category selectors for the planting calendar.
 * State lives in the URL (?country=pk&region=pk-punjab&month=10&category=crop)
 * so results are shareable; the country/region cookies stay in sync for the
 * homepage widget and other surfaces.
 */
export function CalendarFilters({
  countries,
  regionsByCountry,
  initial,
}: {
  countries: CountryInfo[];
  regionsByCountry: Record<string, RegionInfo[]>;
  initial: CalendarSelection;
}) {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [sel, setSel] = useState<CalendarSelection>(initial);

  const apply = (next: CalendarSelection) => {
    setSel(next);
    setCookie(COUNTRY_COOKIE, next.country.toUpperCase());
    setCookie(REGION_COOKIE, next.region);
    const q = new URLSearchParams();
    q.set("country", next.country);
    q.set("region", next.region);
    q.set("month", String(next.month));
    if (next.category !== "all") q.set("category", next.category);
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  const onCountry = (country: string) => {
    const first = regionsByCountry[country]?.[0]?.slug ?? "";
    apply({ ...sel, country, region: first });
  };

  const shiftMonth = (d: number) =>
    apply({ ...sel, month: ((sel.month - 1 + d + 12) % 12) + 1 });

  const selectCls =
    "rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-medium outline-none focus:border-leaf-600 transition-colors w-full sm:w-auto";

  const categories: { id: CalendarCategory; label: string }[] = [
    { id: "all", label: t("catAll") },
    { id: "crop", label: t("catCrop") },
    { id: "vegetable", label: t("catVegetable") },
    { id: "fruit", label: t("catFruit") },
    { id: "herb", label: t("catHerb") },
    { id: "flower", label: t("catFlower") },
    { id: "other", label: t("catOther") },
  ];

  return (
    <Card className="mb-6">
      <CardBody>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
              {t("country")}
            </span>
            <select
              value={sel.country}
              onChange={(e) => onCountry(e.target.value)}
              className={selectCls}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code.toLowerCase()}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
              {t("region")}
            </span>
            <select
              value={sel.region}
              onChange={(e) => apply({ ...sel, region: e.target.value })}
              className={selectCls}
            >
              {(regionsByCountry[sel.country] ?? []).map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
              {t("category")}
            </span>
            <select
              value={sel.category}
              onChange={(e) => apply({ ...sel, category: e.target.value as CalendarCategory })}
              className={selectCls}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => apply({ ...sel, month: new Date().getMonth() + 1 })}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-leaf-700 dark:text-leaf-300 hover:border-leaf-600 transition-colors w-full sm:w-auto"
            >
              {t("currentMonth")}
            </button>
          </div>
        </div>

        {/* Month navigation */}
        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label={t("prevMonth")}
            className="grid place-items-center w-10 h-10 rounded-xl border border-line hover:border-leaf-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className="rtl:rotate-180">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <p className="font-display text-2xl font-semibold capitalize">
            {monthName(sel.month, locale)}
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label={t("nextMonth")}
            className="grid place-items-center w-10 h-10 rounded-xl border border-line hover:border-leaf-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className="rtl:rotate-180">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Month pills */}
        <div className="mt-4 flex flex-wrap gap-1.5 justify-center" role="group" aria-label={t("month")}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => apply({ ...sel, month: m })}
              aria-pressed={m === sel.month}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors capitalize",
                m === sel.month
                  ? "bg-leaf-700 text-white dark:bg-leaf-600"
                  : "border border-line text-ink-soft hover:border-leaf-600"
              )}
            >
              {monthName(m, locale).slice(0, 3)}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
