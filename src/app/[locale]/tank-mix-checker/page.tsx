import { setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { TankMixChecker } from "@/components/tank-mix-checker/TankMixChecker";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/tank-mix-checker",
    title: "Fertilizer Tank-Mix Compatibility Checker",
    description:
      "Can you mix DAP with zinc? Urea with SOP? Check fertilizer tank-mix compatibility before you spray — avoid precipitates, clogged nozzles, and wasted nutrients.",
  });
}

export default async function TankMixCheckerPage({
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
            Tank-Mix Compatibility
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            Fertilizer Tank-Mix Compatibility Checker
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            Mixing two fertilizers in one drum or spray tank? Check first —
            some combinations form insoluble sludge that wastes your money and
            blocks nozzles. Pick two fertilizers and get an instant verdict.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <TankMixChecker />
        </div>
      </section>
    </>
  );
}
