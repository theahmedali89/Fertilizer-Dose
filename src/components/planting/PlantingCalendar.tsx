"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  REGIONS,
  PLANTING_WINDOWS,
  monthInWindow,
  monthName,
  windowLabel,
  type PlantingWindow,
} from "@/lib/planting";
import { getItem, type GrowingCategory } from "@/lib/growing";
import { cn } from "@/lib/utils";

const CATEGORY_BASE: Record<GrowingCategory, string> = {
  crop: "/crops",
  plant: "/plants",
  vegetable: "/vegetables",
};

const CATEGORY_BADGE: Record<GrowingCategory, string> = {
  crop: "bg-leaf-100 text-leaf-800 dark:bg-leaf-950 dark:text-leaf-300",
  vegetable: "bg-harvest-100 text-harvest-800 dark:bg-harvest-950/50 dark:text-harvest-300",
  plant: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
};

function WindowCard({ w, t, locale }: { w: PlantingWindow; t: ReturnType<typeof useTranslations>; locale: string }) {
  const item = getItem(w.itemSlug);
  if (!item) return null;
  const region = REGIONS.find((r) => r.id === w.regionId)!;
  return (
    <Card className="h-full">
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">
              <Link
                href={`${CATEGORY_BASE[item.category]}/${item.slug}`}
                className="hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors"
              >
                {item.name}
              </Link>{" "}
              {item.urdu && (
                <span className="text-sm font-sans font-normal text-ink-faint" lang="ur">
                  {item.urdu}
                </span>
              )}
            </h3>
            {item.scientificName && (
              <p className="text-xs italic text-ink-faint mt-0.5">{item.scientificName}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5",
                CATEGORY_BADGE[item.category]
              )}
            >
              {item.category}
            </span>
            {w.verificationStatus === "verified" ? (
              <Badge variant="verified">{t("verified")}</Badge>
            ) : (
              <Badge variant="review">{t("inReview")}</Badge>
            )}
          </div>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-ink-faint text-[13px]">{t("sowingWindow")}</dt>
            <dd className="font-semibold">{windowLabel(w, locale)}</dd>
          </div>
          {w.harvestText && (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink-faint text-[13px]">{t("harvestWindow")}</dt>
              <dd className="text-ink-soft">{w.harvestText}</dd>
            </div>
          )}
          {item.season && (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink-faint text-[13px]">{t("season")}</dt>
              <dd className="text-ink-soft">{item.season}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-ink-faint text-[13px]">{t("regionLabel")}</dt>
            <dd className="text-ink-soft">
              {region.name}, {region.countryName}
            </dd>
          </div>
        </dl>

        {w.notes && <p className="mt-3 text-sm text-ink-soft">{w.notes}</p>}

        <div className="mt-4 pt-3 border-t border-line text-xs text-ink-faint leading-relaxed">
          <p>
            {t("source")}: {w.source.organization} — {w.source.title}
          </p>
          {w.lastReviewed && (
            <p className="mt-0.5">
              {t("lastReviewed")}: {w.lastReviewed}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export function PlantingCalendar({
  initialCountry = "pakistan",
  initialRegion = "pk-punjab",
}: {
  initialCountry?: "pakistan" | "india";
  initialRegion?: string;
}) {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const [country, setCountry] = useState<"pakistan" | "india">(initialCountry);
  const [regionId, setRegionId] = useState(initialRegion);
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [category, setCategory] = useState<GrowingCategory | "all">("all");

  const regions = useMemo(() => REGIONS.filter((r) => r.country === country), [country]);

  const onCountry = (c: "pakistan" | "india") => {
    setCountry(c);
    const first = REGIONS.find((r) => r.country === c)!;
    setRegionId(first.id);
  };

  const results = useMemo(() => {
    return PLANTING_WINDOWS.filter((w) => {
      if (w.regionId !== regionId) return false;
      if (!monthInWindow(month, w)) return false;
      if (category === "all") return true;
      return getItem(w.itemSlug)?.category === category;
    });
  }, [regionId, month, category]);

  const shiftMonth = (d: number) => setMonth((m) => ((m - 1 + d + 12) % 12) + 1);

  const selectCls =
    "rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-medium outline-none focus:border-leaf-600 transition-colors w-full sm:w-auto";

  return (
    <div>
      {/* Controls */}
      <Card className="mb-6">
        <CardBody>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                {t("country")}
              </span>
              <select value={country} onChange={(e) => onCountry(e.target.value as "pakistan" | "india")} className={selectCls}>
                <option value="pakistan">Pakistan</option>
                <option value="india">India</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                {t("region")}
              </span>
              <select value={regionId} onChange={(e) => setRegionId(e.target.value)} className={selectCls}>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                {t("category")}
              </span>
              <select value={category} onChange={(e) => setCategory(e.target.value as GrowingCategory | "all")} className={selectCls}>
                <option value="all">{t("catAll")}</option>
                <option value="crop">{t("catCrop")}</option>
                <option value="vegetable">{t("catVegetable")}</option>
                <option value="plant">{t("catPlant")}</option>
              </select>
            </label>
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
            <div className="text-center">
              <p className="font-display text-2xl font-semibold capitalize">{monthName(month, locale)}</p>
              <button
                type="button"
                onClick={() => setMonth(new Date().getMonth() + 1)}
                className="text-xs font-semibold text-leaf-700 dark:text-leaf-300 hover:underline mt-0.5"
              >
                {t("currentMonth")}
              </button>
            </div>
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
                onClick={() => setMonth(m)}
                aria-pressed={m === month}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors capitalize",
                  m === month
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

      {/* Results */}
      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center max-w-2xl mx-auto">
          <p className="font-display text-xl font-semibold">{t("emptyTitle")}</p>
          <p className="text-sm text-ink-soft mt-2 leading-relaxed">{t("emptyHint")}</p>
          <p className="text-xs text-ink-faint mt-3">
            {REGIONS.find((r) => r.id === regionId)?.name} · {monthName(month, locale)}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {results.map((w) => (
            <WindowCard key={`${w.itemSlug}-${w.startMonth}`} w={w} t={t} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
