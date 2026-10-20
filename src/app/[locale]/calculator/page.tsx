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
import { FaqJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "calculator" });
    return localizedMetadata({
      locale,
      path: "/calculator",
      title: t("metaTitle"),
      description: t("metaDescription"),
    });
  } catch {
    return {};
  }
}

export default async function CalculatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ area?: string; unit?: string; crop?: string; country?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("calculator");
  const methodFaq = t.raw("methodFaq") as { q: string; a: string }[];
  const perAcreFaq = t.raw("perAcreFaq") as { q: string; a: string }[];
  // ?country= (e.g. from /[country]/[crop] programmatic pages) overrides the
  // cookie-selected country for the crop list. Validate against known codes.
  const countryOverride = /^[A-Z]{2}$/.test(sp.country ?? "") ? sp.country : undefined;
  const crops = await getCrops(locale, countryOverride);

  // Per-acre table: verified per-hectare recommendations converted by the
  // exact unit factor (÷ 2.471). Ranges stay ranges — never midpoints.
  const ACRE_ORDER = [
    "wheat", "rice", "maize", "cotton", "sugarcane",
    "potato", "sunflower", "mustard", "barley", "soybean",
  ];
  const perAcreFmt = (kgHa: number) => {
    const r = Math.round((kgHa / 2.471) * 10) / 10;
    return Number.isInteger(r) ? `${r}` : r.toFixed(1);
  };
  const perAcreRows: { name: string; dose: string; underReview: boolean }[] = [];
  const seenSlugs = new Set<string>();
  const pushRow = (slug: string) => {
    const c = crops.find((x) => x.slug === slug);
    if (!c || seenSlugs.has(c.slug) || (!c.npk && !c.npkRange)) return;
    seenSlugs.add(c.slug);
    const dose = c.npk
      ? `${perAcreFmt(c.npk.n)}-${perAcreFmt(c.npk.p)}-${perAcreFmt(c.npk.k)}`
      : (["n", "p", "k"] as const)
          .map((key) => {
            const [lo, hi] = c.npkRange![key];
            return lo === hi ? perAcreFmt(lo) : `${perAcreFmt(lo)}–${perAcreFmt(hi)}`;
          })
          .join("-");
    perAcreRows.push({ name: c.localName || c.name, dose, underReview: c.underReview });
  };
  for (const slug of ACRE_ORDER) {
    if (perAcreRows.length >= 8) break;
    pushRow(slug);
  }
  if (perAcreRows.length < 8) {
    for (const c of crops) {
      if (perAcreRows.length >= 8) break;
      pushRow(c.slug);
    }
  }

  return (
    <>
      <FaqJsonLd items={[...methodFaq, ...perAcreFaq]} />
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
        <CalculatorForm crops={crops} initialArea={sp.area} initialUnit={sp.unit} initialCrop={sp.crop} />
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

      <Section
        eyebrow={t("scheduleCard.eyebrow")}
        title={t("scheduleCard.title")}
      >
        <Card className="max-w-2xl border-leaf-200 dark:border-leaf-800 bg-leaf-50/60 dark:bg-leaf-950/30">
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-soft max-w-md leading-relaxed">
              {t("scheduleCard.desc")}
            </p>
            <Link
              href="/fertilizer-schedule"
              className="inline-flex items-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-3 text-sm font-bold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
            >
              {t("scheduleCard.cta")}
            </Link>
          </CardBody>
        </Card>
      </Section>

      {perAcreRows.length > 0 && (
        <Section
          eyebrow={t("perAcre.eyebrow")}
          title={t("perAcre.title")}
          description={t("perAcre.desc")}
        >
          <div className="max-w-3xl space-y-6">
            <Card>
              <CardBody className="sm:p-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line text-left">
                        <th className="py-2.5 pr-4 font-semibold">{t("perAcre.cropHeader")}</th>
                        <th className="py-2.5 pr-4 font-semibold">{t("perAcre.doseHeader")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perAcreRows.map((row) => (
                        <tr key={row.name} className="border-b border-line/60 last:border-0">
                          <td className="py-2.5 pr-4 font-medium">
                            {row.name}
                            {row.underReview && (
                              <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                                {t("form.underReviewBadge")}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 pr-4"><b>{row.dose}</b></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs text-ink-faint leading-relaxed">
                  {t("perAcre.note")}
                </p>
              </CardBody>
            </Card>
            <div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {t("perAcre.faqTitle")}
              </h3>
              <Accordion items={perAcreFaq} />
            </div>
          </div>
        </Section>
      )}

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
