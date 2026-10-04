"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GrowingCard } from "./GrowingCard";
import { PLANT_SUBCATEGORIES, type GrowingItem, type PlantSubcategory } from "@/lib/growing";
import { cn } from "@/lib/utils";

export function GrowingIndex({
  category,
  items,
}: {
  category: GrowingItem["category"];
  items: GrowingItem[];
}) {
  const t = useTranslations("growing");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "verified" | "in_review">("all");
  const [subcat, setSubcat] = useState<PlantSubcategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (status !== "all" && i.verificationStatus !== status) return false;
      if (category === "plant" && subcat !== "all" && i.plantSubcategory !== subcat) return false;
      if (!q) return true;
      return [i.name, i.urdu ?? "", i.scientificName ?? "", i.slug]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, status, subcat, category]);

  const statusBtn = (id: "all" | "verified" | "in_review", label: string) => (
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
          {statusBtn("in_review", t("filterInReview"))}
        </div>
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
