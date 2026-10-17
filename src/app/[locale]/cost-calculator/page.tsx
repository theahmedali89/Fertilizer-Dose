import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { CostCalculator } from "@/components/cost-calculator/CostCalculator";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/cost-calculator",
    title: "Fertilizer Cost Per Nutrient Calculator",
    description:
      "Is that liquid fertilizer a good deal or a rip-off? Enter any product's price and NPK % to see its true cost per kg of nutrient — compared against DAP, Urea, SOP and MOP.",
  });
}

export default async function CostCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("costCalculator");
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            {t("hero.eyebrow")}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            {t("hero.desc")}
          </p>
          <div className="mt-6 max-w-2xl rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
            <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
              <strong>{t("hero.noteTitle")}</strong> {t("hero.noteText")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <CostCalculator />
        </div>
      </section>
    </>
  );
}
