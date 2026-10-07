import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapAreaTool } from "@/components/mapArea/MapAreaTool";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { localizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mapArea" });
  return localizedMetadata({
    locale,
    path: "/map-area-calculator",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function MapAreaCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mapArea");
  const faq = t.raw("faq") as { q: string; a: string }[];
  const steps = t.raw("howSteps") as string[];

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
        <MapAreaTool />
      </Section>

      {/* How it works */}
      <div className="bg-surface border-t border-line">
        <Section title={t("howTitle")}>
          <ol className="max-w-3xl space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-ink-soft leading-relaxed">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf-600 text-sm font-bold text-white"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      {/* Map attribution note */}
      <Section title={t("mapNoteTitle")}>
        <p className="max-w-3xl text-ink-soft leading-relaxed">
          {t("mapNoteBody")}
        </p>
      </Section>

      {/* FAQ */}
      <div className="bg-surface border-t border-line">
        <Section title={t("faqTitle")}>
          <div className="max-w-3xl">
            <Accordion items={faq} />
          </div>
        </Section>
      </div>

      <RelatedTools current="/map-area-calculator" />
    </>
  );
}
