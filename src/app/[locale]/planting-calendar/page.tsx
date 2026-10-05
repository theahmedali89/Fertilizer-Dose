import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { PlantingCalendar } from "@/components/planting/PlantingCalendar";
import { localizedMetadata } from "@/lib/seo";
import { getRegions, getPlantingWindows, getGrowingItems } from "@/server/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calendar" });
  return localizedMetadata({
    locale,
    path: "/planting-calendar",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function PlantingCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("calendar");
  const [regions, windows, items] = await Promise.all([
    getRegions(),
    getPlantingWindows(),
    getGrowingItems(),
  ]);

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
        <PlantingCalendar regions={regions} windows={windows} items={items} />
      </Section>
    </>
  );
}
