import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { CalendarFilters, type CalendarCategory } from "@/components/planting/CalendarFilters";
import { type HitCardLabels } from "@/components/planting/PlantingHitCard";
import { VisualMonthGrid } from "@/components/planting/VisualMonthGrid";
import { localizedMetadata } from "@/lib/seo";
import type { PlantingHit } from "@/server/country";
import {
  getCountries,
  getAllRegions,
  getPlantingByMonth,
  getSelectedCountryCode,
  getSelectedRegionSlug,
  type RegionInfo,
} from "@/server/country";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "calendar" });
    return localizedMetadata({
      locale,
      path: "/planting-calendar",
      title: t("metaTitle"),
      description: t("metaDescription"),
    });
  } catch {
    return {};
  }
}

const VALID_CATEGORIES: CalendarCategory[] = [
  "all", "crop", "vegetable", "fruit", "herb", "flower", "other",
];

function categoryLabel(t: Awaited<ReturnType<typeof getTranslations>>, category: string): string {
  switch (category) {
    case "crop": return t("catCrop");
    case "vegetable": return t("catVegetable");
    case "fruit": return t("catFruit");
    case "herb": return t("catHerb");
    case "flower": return t("catFlower");
    default: return t("catOther");
  }
}

export default async function PlantingCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("calendar");

  const countries = await getCountries();
  const allRegions = await getAllRegions();

  // Resolve country: ?country=pk → cookie → PK default.
  const paramCountry = String(sp.country ?? "").toUpperCase();
  let countryCode = countries.some((c) => c.code === paramCountry)
    ? paramCountry
    : await getSelectedCountryCode();
  if (!countries.some((c) => c.code === countryCode)) countryCode = "PK";

  const regions = allRegions.filter((r) => r.countryCode === countryCode);

  // Resolve region: ?region= → cookie (validated) → first region.
  const paramRegion = String(sp.region ?? "");
  let regionSlug = regions.some((r) => r.slug === paramRegion)
    ? paramRegion
    : (await getSelectedRegionSlug(countryCode)) ?? regions[0]?.slug ?? "";
  if (!regions.some((r) => r.slug === regionSlug)) {
    regionSlug = regions[0]?.slug ?? "";
  }

  // Resolve month + category.
  const rawMonth = parseInt(String(sp.month ?? ""), 10);
  const month = rawMonth >= 1 && rawMonth <= 12 ? rawMonth : new Date().getMonth() + 1;
  const rawCat = String(sp.category ?? "all") as CalendarCategory;
  const category: CalendarCategory = VALID_CATEGORIES.includes(rawCat) ? rawCat : "all";

  const hitsByMonth: Record<number, PlantingHit[]> = regionSlug
    ? Object.fromEntries(
        await Promise.all(
          Array.from({ length: 12 }, (_, i) =>
            getPlantingByMonth({ regionSlug, month: i + 1, category, locale })
              .then((hits) => [i + 1, hits] as const)
              .catch(() => [i + 1, []] as const)
          )
        )
      )
    : {};

  const regionsByCountry: Record<string, RegionInfo[]> = {};
  for (const r of allRegions) {
    (regionsByCountry[r.countryCode.toLowerCase()] ??= []).push(r);
  }

  const labels: HitCardLabels = {
    activity: {
      SOW: t("activitySOW"),
      TRANSPLANT: t("activityTRANSPLANT"),
      PLANT: t("activityPLANT"),
      HARVEST: t("activityHARVEST"),
      LAND_PREPARATION: t("activityLAND_PREPARATION"),
    },
    categoryLabel: t("category"),
    category: (c) => categoryLabel(t, c),
    plantingWindow: t("plantingWindow"),
    harvestWindow: t("harvestWindow"),
    appliesTo: t("appliesTo"),
    source: t("source"),
    lastReviewed: t("lastReviewed"),
    verified: t("verified"),
    inReview: t("inReview"),
    viewGuide: t("viewGuide"),
  };

  const regionName = regions.find((r) => r.slug === regionSlug)?.name ?? "";

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            {t("desc")}
          </p>
        </div>
      </section>

      <Section>
        <CalendarFilters
          countries={countries}
          regionsByCountry={regionsByCountry}
          initial={{
            country: countryCode.toLowerCase(),
            region: regionSlug,
            month,
            category,
          }}
        />

        <VisualMonthGrid
          hitsByMonth={hitsByMonth}
          locale={locale}
          selectedMonth={month}
          labels={labels}
          regionName={regionName}
          country={countryCode.toLowerCase()}
          region={regionSlug}
          category={category}
        />
      </Section>
    </>
  );
}
