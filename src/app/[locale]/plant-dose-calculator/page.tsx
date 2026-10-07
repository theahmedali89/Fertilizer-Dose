import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlantDoseForm } from "@/components/plantDose/PlantDoseForm";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { localizedMetadata } from "@/lib/seo";
import { RelatedTools } from "@/components/tools/RelatedTools";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plantDose" });
  return localizedMetadata({
    locale,
    path: "/plant-dose-calculator",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function PlantDoseCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("plantDose");
  const faq = t.raw("faq") as { q: string; a: string }[];
  const steps = t.raw("method.steps") as { t: string; d: string }[];
  const sources = t.raw("sources.items") as string[];

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
        <PlantDoseForm />
      </Section>

      <div className="bg-surface border-t border-line">
        <Section
          eyebrow={t("method.eyebrow")}
          title={t("method.title")}
          description={t("method.desc")}
        >
          <ol className="max-w-3xl space-y-4">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-sm font-bold text-leaf-800 dark:bg-leaf-950 dark:text-leaf-300"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{s.t}</p>
                  <p className="mt-1 text-sm text-ink-soft leading-relaxed">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <Section eyebrow={t("sources.eyebrow")} title={t("sources.title")}>
        <ul className="max-w-3xl space-y-2 text-sm text-ink-soft leading-relaxed list-disc pl-5">
          {sources.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        <p className="mt-3 max-w-3xl text-xs text-ink-faint leading-relaxed">
          {t("sources.note")}
        </p>
      </Section>

      <div className="bg-surface border-t border-line">
        <Section title={t("faqTitle")}>
          <div className="max-w-3xl">
            <Accordion items={faq} />
          </div>
        </Section>
      </div>

      <RelatedTools current="/plant-dose-calculator" />
    </>
  );
}
