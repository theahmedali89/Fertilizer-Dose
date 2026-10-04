import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { localizedMetadata } from "@/lib/seo";
import { regionsByCountry, regionHasData } from "@/lib/planting";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";

const COUNTRIES = ["pakistan", "india"] as const;

export function generateStaticParams() {
  return COUNTRIES.map((country) => ({ country }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country } = await params;
  if (!COUNTRIES.includes(country as (typeof COUNTRIES)[number])) return {};
  const t = await getTranslations({ locale, namespace: "calendar" });
  const cp = t.raw("countryPages") as Record<string, string>;
  return localizedMetadata({
    locale,
    path: `/planting-calendar/${country}`,
    title: cp[`${country}Title`],
    description: cp[`${country}Desc`],
  });
}

export default async function CountryCalendarPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country } = await params;
  if (!COUNTRIES.includes(country as (typeof COUNTRIES)[number])) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("calendar");
  const cp = t.raw("countryPages") as Record<string, string>;
  const regions = regionsByCountry(country as "pakistan" | "india");
  const countryName = country === "pakistan" ? "Pakistan" : "India";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Planting Calendar", url: `${siteConfig.url}/planting-calendar` },
          { name: countryName, url: `${siteConfig.url}/planting-calendar/${country}` },
        ]}
      />
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-ink-faint mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span aria-hidden> · </span>
            <Link href="/planting-calendar" className="hover:underline">
              {t("eyebrow")}
            </Link>
            <span aria-hidden> · </span>
            <span className="text-ink-soft">{countryName}</span>
          </nav>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            {cp[`${country}Title`]}
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            {cp[`${country}Desc`]}
          </p>
        </div>
      </section>

      <Section>
        <h2 className="font-display text-2xl font-semibold mb-5">{cp.regionsTitle}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {regions.map((r) => {
            const hasData = regionHasData(r.id);
            return (
              <Card key={r.id} className="h-full">
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold">{r.name}</h3>
                    {hasData ? (
                      <Badge variant="verified">{cp.hasData}</Badge>
                    ) : (
                      <Badge variant="review">{cp.noDataYet}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-ink-faint mt-1">{r.countryName}</p>
                  <Link
                    href="/planting-calendar"
                    className="mt-4 inline-flex text-sm font-semibold text-leaf-700 dark:text-leaf-300 hover:underline"
                  >
                    {cp.openCalendar} →
                  </Link>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Section>
    </>
  );
}
