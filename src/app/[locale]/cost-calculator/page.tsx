import { setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { CostCalculator } from "@/components/cost-calculator/CostCalculator";

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
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            Price vs. Value
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            Fertilizer Cost Per Nutrient Calculator
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            A fancy liquid phosphorus at Rs 3,500 per liter — bargain or scam?
            Enter any product&apos;s price and NPK percentage and we&apos;ll
            reveal its true cost per kg of nutrient, benchmarked against
            standard DAP, Urea, SOP and MOP.
          </p>
          <div className="mt-6 max-w-2xl rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
            <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
              <strong>⚠️ Note:</strong> Reference prices are illustrative and editable — not live market prices. Use your area&apos;s actual rates for accurate comparison.
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
