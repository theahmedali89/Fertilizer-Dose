import { getTranslations, setRequestLocale } from "next-intl/server";
import { DapTspForm } from "@/components/dapTsp/DapTspForm";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { localizedMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dapTsp" });
  return localizedMetadata({
    locale,
    path: "/dap-tsp-converter",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function DapTspConverterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dapTsp");
  const faq = t.raw("faq") as { q: string; a: string }[];

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
        <DapTspForm />
      </Section>

      {/* Educational sections */}
      <div className="bg-surface border-t border-line">
        <Section eyebrow={t("guide.eyebrow")} title={t("guide.equivTitle")}>
          <p className="max-w-3xl text-ink-soft leading-relaxed">{t("guide.equivBody")}</p>
        </Section>
      </div>

      <Section title={t("guide.soilTitle")}>
        <p className="max-w-3xl text-ink-soft leading-relaxed">{t("guide.soilBody")}</p>
      </Section>

      <div className="bg-surface border-t border-line">
        <Section title={t("guide.pricesTitle")}>
          <p className="max-w-3xl text-ink-soft leading-relaxed">{t("guide.pricesBody")}</p>
        </Section>
      </div>

      {/* Sources */}
      <Section title={t("guide.sourcesTitle")}>
        <p className="max-w-3xl text-ink-soft leading-relaxed">{t("guide.sourcesBody")}</p>
      </Section>

      {/* FAQ */}
      <div className="bg-surface border-t border-line">
        <Section title="FAQs">
          <div className="max-w-3xl">
            <Accordion items={faq} />
          </div>
        </Section>
      </div>

      <RelatedTools current="/dap-tsp-converter" />
    </>
  );
}
