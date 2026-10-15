import { setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { DeficiencyChecker } from "@/components/deficiency-checker/DeficiencyChecker";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/deficiency-checker",
    title: "Fertilizer Deficiency Symptom Checker",
    description:
      "Identify nutrient deficiencies in your crops from leaf symptoms — nitrogen, phosphorus, potassium, zinc, iron, boron and more. Get fertilizer correction recommendations.",
  });
}

export default async function DeficiencyCheckerPage({
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
            Nutrient Deficiency
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            Fertilizer Deficiency Symptom Checker
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            Yellow leaves? Purple stems? Scorched edges? Select what you see on
            your plants and we&apos;ll point you to the likely nutrient
            deficiency — with the right fertilizer to fix it.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <DeficiencyChecker />
        </div>
      </section>
    </>
  );
}
