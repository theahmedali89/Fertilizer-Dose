import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { localizedMetadata } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { getTranslatedItemNames } from "@/server/i18n-names";
import {
  getCountryCropCombos,
  getCountryCropPage,
  type CountryCropRecommendation,
} from "@/server/country-crop";

export async function generateStaticParams() {
  const combos = await getCountryCropCombos();
  return combos.map((c) => ({ country: c.countrySlug, crop: c.cropSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string; crop: string }>;
}) {
  const { locale, country, crop } = await params;
  const data = await getCountryCropPage(country, crop);
  if (!data) return {};
  const title = `${data.item.name} NPK Fertilizer Schedule in ${data.country.name} (Official)`;
  const primary = data.recommendations.find((r) => r.isPrimary) ?? data.recommendations[0];
  const dose = fmtDose(primary);
  return localizedMetadata({
    locale,
    path: `/${data.country.slug}/${data.item.slug}`,
    title,
    description: `Official ${data.item.name} fertilizer recommendation for ${data.country.name}: ${dose} kg/ha NPK. Application method, timing, and sources.`,
  });
}

function fmtDose(r: CountryCropRecommendation): string {
  const f = (v: number | null, mn: number | null, mx: number | null) =>
    mn != null && mx != null && mn !== mx
      ? `${mn}–${mx}`
      : v != null
        ? `${v}`
        : "–";
  return `${f(r.n, r.nMin, r.nMax)}-${f(r.p2o5, r.p2o5Min, r.p2o5Max)}-${f(r.k2o, r.k2oMin, r.k2oMax)}`;
}

function contextLabel(r: CountryCropRecommendation): string | null {
  const parts = [
    r.variety,
    r.soilContext,
    r.irrigationContext,
    r.growthStage,
    r.region?.name,
  ].filter(Boolean) as string[];
  return parts.length ? parts.join(" · ") : null;
}

export default async function CountryCropPage({
  params,
}: {
  params: Promise<{ locale: string; country: string; crop: string }>;
}) {
  const { locale, country, crop } = await params;
  setRequestLocale(locale);
  const data = await getCountryCropPage(country, crop);
  if (!data) notFound();

  const names = await getTranslatedItemNames([data.item.slug], locale);
  const localName = names.get(data.item.slug) ?? null;
  const displayName = localName || data.item.name;
  const h1 = `${displayName} Fertilizer Recommendation in ${data.country.name}`;

  const faqs = [
    {
      q: `What is the recommended NPK dose for ${data.item.name} in ${data.country.name}?`,
      a: `The official recommendation is ${fmtDose(data.recommendations[0])} kg/ha (N-P₂O₅-K₂O)${data.recommendations.length > 1 ? ", with variants for different soil, irrigation, or regional conditions listed below" : ""}. Always follow the application timing for best results.`,
    },
    {
      q: `When should fertilizer be applied to ${data.item.name}?`,
      a: data.recommendations[0].applicationTiming
        ? `${data.item.name}: ${data.recommendations[0].applicationTiming}`
        : `Follow the stage-wise schedule below — typically a basal dose at sowing/planting plus top-dressings at key growth stages.`,
    },
    {
      q: `Which fertilizer products supply this NPK dose?`,
      a: `Use the FertDose calculator to convert this NPK dose into commercial bags (Urea, DAP, SOP/MOP, NPK blends) for your exact field size.`,
    },
    {
      q: `Is this recommendation official?`,
      a: `Yes — doses on this page come from ${data.recommendations
        .map((r) => r.source.organization)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 3)
        .join(", ")}${data.recommendations.some((r) => r.verificationStatus === "under_review") ? ". Records marked under review are shown with an amber badge and should be confirmed with local extension advice" : ""}.`,
    },
  ];

  const calcHref = `/calculator?country=${data.country.code}&crop=${data.item.slug}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Calculator", url: `${siteConfig.url}/calculator` },
          { name: `${data.item.name} in ${data.country.name}`, url: `${siteConfig.url}/${data.country.slug}/${data.item.slug}` },
        ]}
      />
      <FaqJsonLd items={faqs} />

      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-xs text-ink-faint mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span aria-hidden> · </span>
            <span className="text-ink-soft">{data.country.name}</span>
            <span aria-hidden> · </span>
            <span className="text-ink-soft">{data.item.name}</span>
          </nav>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            {h1}
          </h1>
          {data.item.scientificName && (
            <p className="mt-2 italic text-ink-faint">{data.item.scientificName}</p>
          )}
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            Official NPK fertilizer schedule for {displayName} in {data.country.name},
            with application method, timing, and source citations.
          </p>
          <div className="mt-6">
            <Link
              href={calcHref}
              className="inline-flex items-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-6 py-3.5 font-bold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
            >
              Calculate bags for your field →
            </Link>
          </div>
        </div>
      </section>

      <Section>
        <div className="space-y-6 max-w-4xl">
          {data.recommendations.map((r) => {
            const ctx = contextLabel(r);
            return (
              <Card key={r.id}>
                <CardBody className="sm:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h2 className="font-display text-2xl font-semibold">
                      NPK Recommendation{ctx ? ` — ${ctx}` : ""}
                    </h2>
                    {r.verificationStatus === "verified" ||
                    r.verificationStatus === "published" ? (
                      <Badge variant="verified">Verified</Badge>
                    ) : (
                      <Badge variant="review">Under review</Badge>
                    )}
                    {r.isPrimary && <Badge variant="neutral">Primary</Badge>}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-line text-left">
                          <th className="py-2.5 pr-4 font-semibold">Nutrient</th>
                          <th className="py-2.5 pr-4 font-semibold">Dose (kg/ha)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-line/60">
                          <td className="py-2.5 pr-4 font-medium">Nitrogen (N)</td>
                          <td className="py-2.5 pr-4">
                            <b className="text-lg">{fmtDose(r).split("-")[0]}</b>
                          </td>
                        </tr>
                        <tr className="border-b border-line/60">
                          <td className="py-2.5 pr-4 font-medium">Phosphorus (P₂O₅)</td>
                          <td className="py-2.5 pr-4">
                            <b className="text-lg">{fmtDose(r).split("-")[1]}</b>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4 font-medium">Potassium (K₂O)</td>
                          <td className="py-2.5 pr-4">
                            <b className="text-lg">{fmtDose(r).split("-")[2]}</b>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {r.micronutrients && (
                    <p className="mt-4 text-sm text-ink-soft">
                      <span className="font-semibold">Micronutrients: </span>
                      {r.micronutrients}
                    </p>
                  )}
                  {r.applicationMethod && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-1.5">Application method</h3>
                      <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                        {r.applicationMethod}
                      </p>
                    </div>
                  )}
                  {r.applicationTiming && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-1.5">Timing</h3>
                      <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                        {r.applicationTiming}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-line/60">
                    <p className="text-xs text-ink-faint">
                      <span className="font-semibold">Source: </span>
                      {r.source.url ? (
                        <a
                          href={r.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-ink"
                        >
                          {r.source.organization} — {r.source.title}
                        </a>
                      ) : (
                        <span>
                          {r.source.organization} — {r.source.title}
                        </span>
                      )}
                      {r.source.sourceType && (
                        <span className="ml-2">
                          <Badge variant="neutral">{r.source.sourceType}</Badge>
                        </span>
                      )}
                    </p>
                  </div>
                </CardBody>
              </Card>
            );
          })}

          <Card>
            <CardBody className="sm:p-8">
              <h2 className="font-display text-2xl font-semibold mb-4">
                Frequently asked questions
              </h2>
              <Accordion items={faqs} />
            </CardBody>
          </Card>

          <Card className="border-leaf-200 dark:border-leaf-800 bg-leaf-50/60 dark:bg-leaf-950/30">
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-ink-soft max-w-md leading-relaxed">
                Get exact fertilizer bags for your field size with the interactive
                calculator — pre-filled for {displayName} in {data.country.name}.
              </p>
              <Link
                href={calcHref}
                className="inline-flex items-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-3 text-sm font-bold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
              >
                Open calculator →
              </Link>
            </CardBody>
          </Card>
        </div>
      </Section>
    </>
  );
}
