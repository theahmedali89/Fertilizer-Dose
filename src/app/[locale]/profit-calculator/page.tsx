import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { ProfitCalculator } from "@/components/tools/ProfitCalculator";
import { localizedMetadata } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/RelatedTools";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools.profit" });
  return localizedMetadata({
    locale,
    path: "/profit-calculator",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function ProfitCalculatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ area?: string; unit?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("tools.profit");

  // FAQ entries exist only for translated locales so far (en, es) — render
  // nothing elsewhere instead of leaking untranslated copy.
  let profitFaq: { q: string; a: string }[] | null = null;
  try {
    const raw = t.raw("faq") as unknown;
    if (Array.isArray(raw) && raw.length > 0) profitFaq = raw as { q: string; a: string }[];
  } catch {
    profitFaq = null;
  }

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
        <ProfitCalculator initialArea={sp.area} initialUnit={sp.unit} />
      </Section>

      {profitFaq && (
        <div className="bg-surface border-t border-line">
          <Section title={t("faqTitle")}>
            <div className="max-w-3xl">
              <Accordion items={profitFaq} />
            </div>
          </Section>
        </div>
      )}

      <RelatedTools current="/profit-calculator" />
    </>
  );
}
