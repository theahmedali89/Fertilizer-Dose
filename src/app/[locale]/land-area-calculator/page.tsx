import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandAreaForm } from "@/components/landArea/LandAreaForm";
import { MapTransferBanner } from "@/components/mapArea/MapTransferBanner";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { localizedMetadata } from "@/lib/seo";
import { AREA_UNITS, formatArea } from "@/lib/landArea";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landArea" });
  return localizedMetadata({
    locale,
    path: "/land-area-calculator",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function LandAreaCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landArea");
  const faq = t.raw("faq") as { q: string; a: string }[];
  const formulas = t.raw("guide.formulas") as { name: string; formula: string; example: string }[];

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
        <Suspense fallback={null}>
          <MapTransferBanner />
        </Suspense>
        <LandAreaForm />
      </Section>

      {/* Formulas */}
      <div className="bg-surface border-t border-line">
        <Section eyebrow={t("guide.eyebrow")} title={t("guide.formulasTitle")}>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-surface-2 text-start">
                  <th className="px-4 py-3 font-semibold">{t("guide.formulasTitle")}</th>
                  <th className="px-4 py-3 font-semibold">Formula</th>
                  <th className="px-4 py-3 font-semibold">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {formulas.map((f) => (
                  <tr key={f.name}>
                    <td className="px-4 py-3 font-medium">{f.name}</td>
                    <td className="px-4 py-3 text-ink-soft">{f.formula}</td>
                    <td className="px-4 py-3 text-ink-soft">{f.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* Educational sections */}
      <Section title={t("guide.sqftTitle")}>
        <p className="max-w-3xl text-ink-soft leading-relaxed">{t("guide.sqftBody")}</p>
      </Section>

      <div className="bg-surface border-t border-line">
        <Section title={t("guide.fourSideTitle")}>
          <p className="max-w-3xl text-ink-soft leading-relaxed">{t("guide.fourSideBody")}</p>
        </Section>
      </div>

      <Section title={t("guide.irregularTitle")}>
        <p className="max-w-3xl text-ink-soft leading-relaxed">{t("guide.irregularBody")}</p>
      </Section>

      {/* Conversion table */}
      <div className="bg-surface border-t border-line">
        <Section title={t("guide.conversionTitle")} description={t("guide.conversionNote")}>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-surface-2 text-start">
                  <th className="px-4 py-3 font-semibold">Unit</th>
                  <th className="px-4 py-3 font-semibold">Equals</th>
                  <th className="px-4 py-3 font-semibold">Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {AREA_UNITS.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium">{u.label} ({u.symbol})</td>
                    <td className="px-4 py-3 text-ink-soft">{formatArea(u.toSqM, "sqm")}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {u.kind === "universal" ? "Exact definition" : u.standard}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      <RelatedTools current="/land-area-calculator" />
    </>
  );
}
