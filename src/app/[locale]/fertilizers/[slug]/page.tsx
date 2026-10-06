import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getFertilizers, getFertilizer } from "@/server/data";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { localizedMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export async function generateStaticParams() {
  const fertilizers = await getFertilizers();
  return fertilizers.map((f) => ({ slug: f.slug }));
}

function nutrientSummary(f: { n: number | null; p: number | null; k: number | null; nMin: number | null; nMax: number | null; pMin: number | null; pMax: number | null; kMin: number | null; kMax: number | null; fertilizerType: string }): string {
  if (f.fertilizerType === "organic") {
    const r = (lo: number | null, hi: number | null) => (lo != null && hi != null ? `${lo}–${hi}%` : "—");
    return `typical range N ${r(f.nMin, f.nMax)}, P₂O₅ ${r(f.pMin, f.pMax)}, K₂O ${r(f.kMin, f.kMax)}`;
  }
  return `${f.n}% N, ${f.p}% P₂O₅, ${f.k}% K₂O`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const f = await getFertilizer(slug);
  if (!f) return {};
  return localizedMetadata({
    locale,
    path: `/fertilizers/${slug}`,
    title: `${f.name} — NPK, Uses & Dose Guidance`,
    description: `${f.name}: ${nutrientSummary(f)}. ${f.tagline}`,
  });
}

const CATEGORY_KEYS: Record<string, string> = {
  manure: "detail.categoryManure",
  compost: "detail.categoryCompost",
  green_manure: "detail.categoryGreenManure",
};

export default async function FertilizerDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("fertilizers");
  const f = await getFertilizer(slug);
  if (!f) notFound();
  const fertilizers = await getFertilizers();
  const fertUrl = `${siteConfig.url}/fertilizers/${f.slug}`;
  const isOrganic = f.fertilizerType === "organic";

  const range = (lo: number | null, hi: number | null) =>
    lo != null && hi != null ? `${lo}–${hi}%` : "—";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Fertilizers", url: `${siteConfig.url}/fertilizers` },
          { name: f.name, url: fertUrl },
        ]}
      />
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-xs text-ink-faint mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            <span aria-hidden> · </span>
            <Link href="/fertilizers" className="hover:underline">Fertilizers</Link>
            <span aria-hidden> · </span>
            {isOrganic && (
              <>
                <Link href="/fertilizers/organic" className="hover:underline">{t("organic.eyebrow")}</Link>
                <span aria-hidden> · </span>
              </>
            )}
            <span className="text-ink-soft">{f.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge>{isOrganic ? t("typeOrganic") : t("typeMineral")}</Badge>
            {isOrganic && f.organicCategory && (
              <Badge>{t(CATEGORY_KEYS[f.organicCategory] ?? "detail.categoryCompost")}</Badge>
            )}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">
            {f.name}{" "}
            <span className="text-2xl font-sans font-normal text-ink-faint" lang="ur">{f.urdu}</span>
          </h1>
          <p className="mt-3 text-lg text-ink-soft max-w-2xl">{f.tagline}</p>
          <div className="mt-6 inline-flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line bg-surface-2 px-6 py-4 font-mono">
            {isOrganic ? (
              <>
                <span><span className="text-ink-faint text-sm font-sans">N </span><b className="text-xl">{range(f.nMin, f.nMax)}</b></span>
                <span><span className="text-ink-faint text-sm font-sans">P₂O₅ </span><b className="text-xl">{range(f.pMin, f.pMax)}</b></span>
                <span><span className="text-ink-faint text-sm font-sans">K₂O </span><b className="text-xl">{range(f.kMin, f.kMax)}</b></span>
                <span className="text-xs font-sans text-ink-faint w-full">{t("typicalRangeLabel")}</span>
              </>
            ) : (
              <>
                <span><span className="text-ink-faint text-sm font-sans">N </span><b className="text-xl">{f.n}%</b></span>
                <span><span className="text-ink-faint text-sm font-sans">P₂O₅ </span><b className="text-xl">{f.p}%</b></span>
                <span><span className="text-ink-faint text-sm font-sans">K₂O </span><b className="text-xl">{f.k}%</b></span>
              </>
            )}
          </div>
          {isOrganic && f.nutrientNote && (
            <div className="mt-4 max-w-3xl rounded-2xl border border-harvest-300 dark:border-harvest-800 bg-harvest-50 dark:bg-harvest-950/40 px-5 py-4">
              <p className="text-sm font-bold mb-1">{t("detail.caveatTitle")}</p>
              <p className="text-sm text-ink-soft leading-relaxed">{f.nutrientNote}</p>
              {f.sourceUrl && (
                <p className="mt-2 text-xs text-ink-faint">
                  {t("detail.sourceLabel")}:{" "}
                  <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-leaf-700 dark:text-leaf-300 hover:underline break-all">
                    {f.sourceUrl.replace(/^https?:\/\//, "").split("/")[0]}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <Section>
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="space-y-6">
            <Card><CardBody>
              <h2 className="font-display text-xl font-semibold mb-2">What it is</h2>
              <p className="text-ink-soft leading-relaxed">{f.description}</p>
            </CardBody></Card>
            <Card><CardBody>
              <h2 className="font-display text-xl font-semibold mb-3">Benefits</h2>
              <ul className="space-y-2">
                {f.benefits.map((b, i) => (
                  <li key={i} className="flex gap-2.5 text-ink-soft text-[15px] leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-leaf-600 shrink-0" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            </CardBody></Card>
            <Card><CardBody>
              <h2 className="font-display text-xl font-semibold mb-3">Precautions</h2>
              <ul className="space-y-2">
                {f.precautions.map((p, i) => (
                  <li key={i} className="flex gap-2.5 text-ink-soft text-[15px] leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-harvest-500 shrink-0" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </CardBody></Card>
            <Card><CardBody>
              <h2 className="font-display text-xl font-semibold mb-2">Application guidance</h2>
              <p className="text-ink-soft leading-relaxed">{f.application}</p>
            </CardBody></Card>
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card className="bg-leaf-950 dark:bg-leaf-950 text-white border-leaf-900">
              <CardBody>
                <h3 className="font-display text-lg font-semibold">Calculate with {f.name}</h3>
                <p className="text-sm text-white/70 mt-1.5">See exactly how much you need for your land.</p>
                <Link href="/calculator" className="mt-4 inline-flex rounded-xl bg-white text-leaf-900 px-5 py-2.5 text-sm font-bold hover:bg-harvest-100 transition-colors">
                  Open calculator
                </Link>
              </CardBody>
            </Card>
            <Card><CardBody>
              <h3 className="font-semibold text-sm mb-2">More fertilizers</h3>
              <ul className="space-y-1.5">
                {fertilizers.filter((x) => x.slug !== f.slug).map((x) => (
                  <li key={x.slug}>
                    <Link href={`/fertilizers/${x.slug}`} className="text-sm text-leaf-800 dark:text-leaf-300 hover:underline">
                      {x.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardBody></Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
