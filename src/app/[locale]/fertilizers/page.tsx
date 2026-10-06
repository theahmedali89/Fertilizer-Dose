import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { FertilizerLibrary } from "@/components/fertilizers/FertilizerLibrary";
import { getFertilizers } from "@/server/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fertilizers" });
  return localizedMetadata({
    locale,
    path: "/fertilizers",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function FertilizersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("fertilizers");
  const fertilizers = await getFertilizers();
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            {t("libraryEyebrow")}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            {t("libraryTitle")}
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            {t("libraryDesc")}
          </p>
        </div>
      </section>

      <Section>
        <FertilizerLibrary fertilizers={fertilizers} />
      </Section>
    </>
  );
}
