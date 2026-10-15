import { setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { AlternativeFinder } from "@/components/alternative-finder/AlternativeFinder";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/alternative-finder",
    title: "Fertilizer Alternative Finder",
    description:
      "DAP out of stock or too expensive? Find nutrient-equivalent fertilizer combinations — SSP + urea for DAP, MOP for SOP and more. Bags, match %, and practical notes.",
  });
}

export default async function AlternativeFinderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            Shortage Helper
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            Fertilizer Alternative Finder
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            DAP missing from the market, or SOP priced out of reach? Pick the
            fertilizer you wanted and how many bags you needed — we&apos;ll show
            the closest nutrient-equivalent combinations from products that are
            usually available.
          </p>
          <div className="mt-6 max-w-2xl rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
            <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
              <strong>⚠️ Important:</strong> Nutrient-equivalent math does not prove chemical compatibility, salt-index safety, or timing suitability. Confirm any substitution with your local agronomist before applying.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AlternativeFinder />
        </div>
      </section>
    </>
  );
}
