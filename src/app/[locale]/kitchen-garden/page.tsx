import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { localizedMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import {
  KitchenGardenPlanner,
  type KitchenGardenInitial,
} from "@/components/kitchenGarden/KitchenGardenPlanner";
import {
  getCountries,
  getAllRegions,
  getSelectedCountryCode,
  getSelectedRegionSlug,
  type RegionInfo,
} from "@/server/country";
import {
  getKitchenGardenSuggestions,
  VALID_SUNLIGHT,
  type SunlightPref,
} from "@/server/kitchenGarden";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kitchenGarden" });
  return localizedMetadata({
    locale,
    path: "/kitchen-garden",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

const VALID_UNITS = ["sqm", "sqft"] as const;

export default async function KitchenGardenPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("kitchenGarden");
  const faq = t.raw("faq") as { q: string; a: string }[];

  const countries = await getCountries();
  const allRegions = await getAllRegions();

  // Resolve country: ?country=pk → cookie → PK default.
  const paramCountry = String(sp.country ?? "").toLowerCase();
  let countryCode = countries.some((c) => c.code.toLowerCase() === paramCountry)
    ? paramCountry.toUpperCase()
    : await getSelectedCountryCode();
  if (!countries.some((c) => c.code === countryCode)) countryCode = "PK";

  const regions = allRegions.filter((r) => r.countryCode === countryCode);

  // Resolve region: ?region= → cookie (validated) → first region.
  const paramRegion = String(sp.region ?? "");
  let regionSlug = regions.some((r) => r.slug === paramRegion)
    ? paramRegion
    : (await getSelectedRegionSlug(countryCode)) ?? regions[0]?.slug ?? "";
  if (!regions.some((r) => r.slug === regionSlug)) {
    regionSlug = regions[0]?.slug ?? "";
  }

  // Resolve month + sunlight.
  const rawMonth = parseInt(String(sp.month ?? ""), 10);
  const month = rawMonth >= 1 && rawMonth <= 12 ? rawMonth : new Date().getMonth() + 1;
  const rawSun = String(sp.sunlight ?? "any") as SunlightPref;
  const sunlight: SunlightPref = VALID_SUNLIGHT.includes(rawSun) ? rawSun : "any";

  // Land Area Calculator integration: ?area=&unit= (validated).
  const rawArea = parseFloat(String(sp.area ?? ""));
  const area = Number.isFinite(rawArea) && rawArea > 0 ? String(Math.round(rawArea * 100) / 100) : "";
  const rawUnit = String(sp.unit ?? "sqm");
  const unit: "sqm" | "sqft" = (VALID_UNITS as readonly string[]).includes(rawUnit)
    ? (rawUnit as "sqm" | "sqft")
    : "sqm";

  const suggestions = regionSlug
    ? await getKitchenGardenSuggestions({ regionSlug, month, sunlight, locale })
    : [];

  const regionsByCountry: Record<string, RegionInfo[]> = {};
  for (const r of allRegions) {
    (regionsByCountry[r.countryCode.toLowerCase()] ??= []).push(r);
  }

  const regionName = regions.find((r) => r.slug === regionSlug)?.name ?? "";
  const initial: KitchenGardenInitial = {
    country: countryCode.toLowerCase(),
    region: regionSlug,
    month,
    sunlight,
    area,
    unit,
  };

  const pageUrl = `${siteConfig.url}/kitchen-garden`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: t("metaTitle"), url: pageUrl },
        ]}
      />
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-ink-faint mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span aria-hidden> · </span>
            <span className="text-ink-soft">{t("metaTitle")}</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            {t("metaTitle")}
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            {t("desc")}
          </p>
        </div>
      </section>

      <Section>
        <KitchenGardenPlanner
          countries={countries}
          regionsByCountry={regionsByCountry}
          suggestions={suggestions}
          regionName={regionName}
          initial={initial}
        />
      </Section>

      {/* FAQ */}
      <div className="bg-surface border-t border-line">
        <Section title={t("faqTitle")}>
          <div className="max-w-3xl">
            <Accordion items={faq} />
          </div>
        </Section>
      </div>

      <RelatedTools current="/kitchen-garden" />
    </>
  );
}
