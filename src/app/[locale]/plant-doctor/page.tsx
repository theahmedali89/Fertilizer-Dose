import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { DiagnosisForm } from "@/components/plant-doctor/DiagnosisForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plantDoctor" });
  return localizedMetadata({
    locale,
    path: "/plant-doctor",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}


export default async function PlantDoctorPage({
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
            Plant Doctor
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            Show us the leaf. We&apos;ll help read it.
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            Upload a clear photo, describe the symptoms, and get a structured
            assessment — possible issues with honest confidence levels, likely
            causes, and what to do next.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <DiagnosisForm />
        </div>
      </section>
    </>
  );
}
