"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { PlantingHitCard, type HitCardLabels } from "@/components/planting/PlantingHitCard";
import { monthName } from "@/lib/planting";
import { cn } from "@/lib/utils";
import type { PlantingHit } from "@/server/country";

type ActivityType = PlantingHit["activityType"];

/** Dominant-activity accent colors for the month cells. */
const ACTIVITY_DOT: Record<ActivityType, string> = {
  SOW: "bg-sky-500",
  TRANSPLANT: "bg-lime-500",
  PLANT: "bg-amber-500",
  HARVEST: "bg-red-500",
  LAND_PREPARATION: "bg-stone-400",
};

/** Deterministic tie-break when a month has several activities. */
const ACTIVITY_PRIORITY: ActivityType[] = [
  "HARVEST",
  "TRANSPLANT",
  "SOW",
  "PLANT",
  "LAND_PREPARATION",
];

function dominantActivity(hits: PlantingHit[]): ActivityType | null {
  if (hits.length === 0) return null;
  const counts = new Map<ActivityType, number>();
  for (const h of hits) counts.set(h.activityType, (counts.get(h.activityType) ?? 0) + 1);
  let best: ActivityType | null = null;
  let bestCount = 0;
  for (const a of ACTIVITY_PRIORITY) {
    const c = counts.get(a) ?? 0;
    if (c > bestCount) {
      bestCount = c;
      best = a;
    }
  }
  return best;
}

/**
 * Visual 12-month planting overview. The server pre-computes all 12 months
 * (`hitsByMonth`) so the client never fetches; month selection lives in the
 * URL (`?month=`) so views are shareable.
 */
export function VisualMonthGrid({
  hitsByMonth,
  locale,
  selectedMonth,
  labels,
  regionName,
  country,
  region,
  category,
}: {
  hitsByMonth: Record<number, PlantingHit[]>;
  locale: string;
  selectedMonth: number;
  labels: HitCardLabels;
  regionName: string;
  country: string;
  region: string;
  category: string;
}) {
  const t = useTranslations("calendar");
  const router = useRouter();
  const pathname = usePathname();

  const selectMonth = (m: number) => {
    const q = new URLSearchParams();
    q.set("country", country);
    q.set("region", region);
    q.set("month", String(m));
    if (category !== "all") q.set("category", category);
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    document.getElementById("visual-month-detail")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const selectedHits = hitsByMonth[selectedMonth] ?? [];
  const legendActivities: ActivityType[] = ["SOW", "TRANSPLANT", "PLANT", "HARVEST"];

  return (
    <section aria-label={t("visualTitle")} className="mt-8">
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <h2 className="font-display text-xl font-semibold">{t("visualTitle")}</h2>
            <p className="text-sm text-ink-soft">{t("visualHint")}</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 mb-4" aria-label={t("legendTitle")}>
            {legendActivities.map((a) => (
              <span key={a} className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <span className={cn("w-2.5 h-2.5 rounded-full", ACTIVITY_DOT[a])} aria-hidden />
                {labels.activity[a]}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
              <span className="w-2.5 h-2.5 rounded-full bg-line" aria-hidden />
              {t("noData")}
            </span>
          </div>

          {/* 12-month grid */}
          <div
            className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2"
            role="group"
            aria-label={t("month")}
          >
            {months.map((m) => {
              const hits = hitsByMonth[m] ?? [];
              const dominant = dominantActivity(hits);
              const isSelected = m === selectedMonth;
              const label = monthName(m, locale);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMonth(m)}
                  aria-pressed={isSelected}
                  aria-label={t("monthCellLabel", { month: label, count: hits.length })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-all",
                    "hover:border-leaf-600 focus-visible:outline-2 focus-visible:outline-leaf-600",
                    isSelected
                      ? "border-leaf-700 dark:border-leaf-400 ring-2 ring-leaf-600/30 dark:ring-leaf-400/30 bg-surface"
                      : "border-line bg-surface hover:bg-leaf-50 dark:hover:bg-leaf-950/40"
                  )}
                >
                  <span
                    className={cn(
                      "text-[13px] font-semibold capitalize",
                      isSelected ? "text-leaf-700 dark:text-leaf-300" : "text-ink"
                    )}
                  >
                    {label.slice(0, 3)}
                  </span>
                  <span
                    className={cn(
                      "w-8 h-1.5 rounded-full",
                      dominant ? ACTIVITY_DOT[dominant] : "bg-line"
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "text-[11px] font-bold tabular-nums rounded-full px-2 py-0.5",
                      hits.length > 0
                        ? "bg-leaf-100 text-leaf-800 dark:bg-leaf-950 dark:text-leaf-300"
                        : "text-ink-faint"
                    )}
                  >
                    {hits.length}
                  </span>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Selected month detail */}
      <div id="visual-month-detail" className="mt-6 scroll-mt-24">
        <div className="flex items-baseline justify-between gap-3 mb-4">
          <h3 className="font-display text-2xl font-semibold capitalize">
            {monthName(selectedMonth, locale)}
          </h3>
          <p className="text-sm text-ink-soft">
            {t("windowsCount", { count: selectedHits.length })}
          </p>
        </div>

        {selectedHits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center max-w-2xl mx-auto">
            <p className="font-display text-xl font-semibold">{t("emptyRegionTitle")}</p>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">{t("emptyHint")}</p>
            <p className="text-xs text-ink-faint mt-3 capitalize">
              {regionName} · {monthName(selectedMonth, locale)}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {selectedHits.map((h) => (
              <PlantingHitCard key={h.windowId} hit={h} locale={locale} labels={labels} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
