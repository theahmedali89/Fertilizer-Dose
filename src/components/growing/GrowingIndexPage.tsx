import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { GrowingIndex } from "./GrowingIndex";
import {
  CATEGORY_META,
  type GrowingCategory,
} from "@/lib/growing";
import { getGrowingByCategory } from "@/server/data";
import {
  getCountries,
  getAllRegions,
  getWindowFilterIndex,
} from "@/server/country";

const INDEX_TITLES: Record<GrowingCategory, "cropsTitle" | "plantsTitle" | "vegetablesTitle"> = {
  crop: "cropsTitle",
  plant: "plantsTitle",
  vegetable: "vegetablesTitle",
};

/** Shared server shell for /crops, /plants and /vegetables index pages. */
export async function GrowingIndexPage({
  category,
  locale,
}: {
  category: GrowingCategory;
  locale: string;
}) {
  setRequestLocale(locale);
  const t = await getTranslations("growing");
  const meta = CATEGORY_META[category];
  const [items, countries, regions, windowIndex] = await Promise.all([
    getGrowingByCategory(category),
    getCountries(),
    getAllRegions(),
    getWindowFilterIndex(),
  ]);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            {meta.title}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            {t(`indexable.${INDEX_TITLES[category]}`)}
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            {meta.description}
          </p>
        </div>
      </section>

      <Section>
        <GrowingIndex
          category={category}
          items={items}
          countries={countries}
          regions={regions}
          windowIndex={windowIndex}
        />
      </Section>
    </>
  );
}
