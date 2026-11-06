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
  const prosDapGood = t.raw("guide.prosDapGood") as string[];
  const prosDapBad = t.raw("guide.prosDapBad") as string[];
  const prosTspGood = t.raw("guide.prosTspGood") as string[];
  const prosTspBad = t.raw("guide.prosTspBad") as string[];
  const methodSteps = t.raw("guide.methodSteps") as string[];

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

      {/* Pros and cons */}
      <div className="bg-surface border-t border-line">
        <Section title={t("guide.prosTitle")}>
          <p className="max-w-3xl text-ink-soft leading-relaxed">{t("guide.prosIntro")}</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 max-w-4xl">
            <div>
              <h3 className="font-display text-2xl font-semibold">{t("guide.prosDapLabel")}</h3>
              <h4 className="mt-5 font-semibold text-leaf-700 dark:text-leaf-400">{t("guide.prosGoodLabel")}</h4>
              <ul className="mt-2.5 space-y-2.5">
                {prosDapGood.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-ink-soft leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-leaf-600 shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <h4 className="mt-5 font-semibold text-harvest-700 dark:text-harvest-300">{t("guide.prosBadLabel")}</h4>
              <ul className="mt-2.5 space-y-2.5">
                {prosDapBad.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-ink-soft leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-harvest-500 shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold">{t("guide.prosTspLabel")}</h3>
              <h4 className="mt-5 font-semibold text-leaf-700 dark:text-leaf-400">{t("guide.prosGoodLabel")}</h4>
              <ul className="mt-2.5 space-y-2.5">
                {prosTspGood.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-ink-soft leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-leaf-600 shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <h4 className="mt-5 font-semibold text-harvest-700 dark:text-harvest-300">{t("guide.prosBadLabel")}</h4>
              <ul className="mt-2.5 space-y-2.5">
                {prosTspBad.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-ink-soft leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-harvest-500 shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </div>

      {/* Per-acre method */}
      <Section title={t("guide.methodTitle")}>
        <p className="max-w-3xl text-ink-soft leading-relaxed">{t("guide.methodIntro")}</p>
        <ol className="mt-6 max-w-3xl list-decimal space-y-2.5 pl-6 text-ink-soft leading-relaxed">
          {methodSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
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
