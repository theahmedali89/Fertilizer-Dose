import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CalculatorForm } from "@/components/calculator/CalculatorForm";
import { OrganicDoseSection } from "@/components/calculator/OrganicDoseSection";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { localizedMetadata } from "@/lib/seo";
import { getCrops } from "@/server/data";
import { RelatedTools } from "@/components/tools/RelatedTools";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calculator" });
  return localizedMetadata({
    locale,
    path: "/calculator",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function CalculatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ area?: string; unit?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("calculator");
  const methodFaq = t.raw("methodFaq") as { q: string; a: string }[];
  const crops = await getCrops(locale);

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
        <CalculatorForm crops={crops} initialArea={sp.area} initialUnit={sp.unit} />
        {/* Mode A — user-entered organic analysis (pure arithmetic on user inputs) */}
        <OrganicDoseSection />
      </Section>

      <Section
        eyebrow={t("soilTestCard.eyebrow")}
        title={t("soilTestCard.title")}
      >
        <Card className="max-w-2xl border-leaf-200 dark:border-leaf-800 bg-leaf-50/60 dark:bg-leaf-950/30">
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-soft max-w-md leading-relaxed">
              {t("soilTestCard.desc")}
            </p>
            <Link
              href="/soil-test-calculator"
              className="inline-flex items-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-3 text-sm font-bold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
            >
              {t("soilTestCard.cta")}
            </Link>
          </CardBody>
        </Card>
      </Section>

      <Section
        eyebrow={t("plantDoseCard.eyebrow")}
        title={t("plantDoseCard.title")}
      >
        <Card className="max-w-2xl border-leaf-200 dark:border-leaf-800 bg-leaf-50/60 dark:bg-leaf-950/30">
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-soft max-w-md leading-relaxed">
              {t("plantDoseCard.desc")}
            </p>
            <Link
              href="/plant-dose-calculator"
              className="inline-flex items-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-3 text-sm font-bold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
            >
              {t("plantDoseCard.cta")}
            </Link>
          </CardBody>
        </Card>
      </Section>

      <div className="bg-surface border-t border-line">
        <Section
          eyebrow={t("method.eyebrow")}
          title={t("method.title")}
          description={t("method.desc")}
        >
          <div className="max-w-3xl">
            <Accordion items={methodFaq} />
          </div>
        </Section>
      </div>

      <RelatedTools current="/calculator" />
    </>
  );
}
