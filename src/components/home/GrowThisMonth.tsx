import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { monthName } from "@/lib/planting";
import {
  getCountries,
  getRegionsByCountry,
  getPlantingByMonth,
  getSelectedCountryCode,
  getSelectedRegionSlug,
  hasCountryCookie,
  type PlantingHit,
} from "@/server/country";
import { CountryPickerInline } from "./CountryPickerInline";

const ACTIVITY_BADGE: Record<PlantingHit["activityType"], string> = {
  SOW: "bg-leaf-100 text-leaf-800 dark:bg-leaf-950 dark:text-leaf-300",
  TRANSPLANT: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  PLANT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  HARVEST: "bg-harvest-100 text-harvest-800 dark:bg-harvest-950/50 dark:text-harvest-300",
  LAND_PREPARATION: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

/**
 * Homepage "What to Grow This Month" — driven by the FD_COUNTRY / FD_REGION
 * cookies (country selector in the header), current month, verified data only.
 */
export async function GrowThisMonth({ locale }: { locale: string }) {
  const t = await getTranslations("home");
  const calT = await getTranslations("calendar");
  const countries = await getCountries();

  if (!(await hasCountryCookie())) {
    return (
      <Section eyebrow={t("planting.eyebrow")} title={t("planting.title")} description={t("planting.desc")}>
        <CountryPickerInline countries={countries} />
      </Section>
    );
  }

  const countryCode = await getSelectedCountryCode();
  const country = countries.find((c) => c.code === countryCode);
  const regions = await getRegionsByCountry(countryCode);
  const regionSlug = (await getSelectedRegionSlug(countryCode)) ?? regions[0]?.slug ?? "";
  const region = regions.find((r) => r.slug === regionSlug);
  const month = new Date().getMonth() + 1;

  const hits = regionSlug
    ? await getPlantingByMonth({ regionSlug, month, limit: 6 })
    : [];

  const activityLabel: Record<PlantingHit["activityType"], string> = {
    SOW: calT("activitySOW"),
    TRANSPLANT: calT("activityTRANSPLANT"),
    PLANT: calT("activityPLANT"),
    HARVEST: calT("activityHARVEST"),
    LAND_PREPARATION: calT("activityLAND_PREPARATION"),
  };

  return (
    <Section
      eyebrow={t("planting.eyebrow")}
      title={t("planting.title")}
      description={t("planting.desc")}
    >
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <span className="text-ink-faint">{t("planting.showingFor")}</span>
        <Badge variant="verified">
          {country?.name ?? countryCode}
          {region ? ` · ${region.name}` : ""}
        </Badge>
        <span className="text-ink-faint capitalize">· {monthName(month, locale)}</span>
        <Link
          href="/planting-calendar"
          className="ms-1 text-[13px] font-semibold text-leaf-700 dark:text-leaf-300 hover:underline"
        >
          {t("planting.changeCountry")}
        </Link>
      </div>

      {hits.length === 0 ? (
        <Card>
          <CardBody className="p-8 text-center">
            <p className="font-display text-lg font-semibold">{t("planting.noItemsTitle")}</p>
            <p className="mt-2 text-sm text-ink-soft">{t("planting.noItemsHint")}</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {hits.map((h) => (
            <Card key={h.windowId} className="h-full">
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold">{h.itemName}</h3>
                  <span
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 shrink-0",
                      ACTIVITY_BADGE[h.activityType]
                    )}
                  >
                    {activityLabel[h.activityType]}
                  </span>
                </div>
                {h.scientificName && (
                  <p className="text-xs italic text-ink-faint mt-0.5">{h.scientificName}</p>
                )}
                <p className="mt-2 text-sm text-ink-soft capitalize">
                  {new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2026, h.startMonth - 1, 1))}
                  {h.startMonth !== h.endMonth &&
                    ` – ${new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2026, h.endMonth - 1, 1))}`}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/planting-calendar"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-7 py-3.5 font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
        >
          {t("planting.viewCalendar")}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className="rtl:rotate-180">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </Link>
      </div>
    </Section>
  );
}
