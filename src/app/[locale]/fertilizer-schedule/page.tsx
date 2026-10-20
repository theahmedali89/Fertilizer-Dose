import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { ApplicationTimeline } from "@/components/crop/ApplicationTimeline";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { localizedMetadata } from "@/lib/seo";
import { getScheduleData, type ScheduleRec } from "@/server/schedule";
import { getTranslatedItemNames } from "@/server/i18n-names";
import {
  parseSowingDate,
  stageDateRange,
  formatStageDate,
} from "@/lib/schedule-dates";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "schedule" });
    return localizedMetadata({
      locale,
      path: "/fertilizer-schedule",
      title: t("metaTitle"),
      description: t("metaDescription"),
    });
  } catch {
    return {};
  }
}

function fmtNutrient(v: number | null, mn: number | null, mx: number | null): string {
  if (mn != null && mx != null && mn !== mx) return `${mn}–${mx}`;
  if (v != null) return `${v}`;
  if (mn != null) return `${mn}`;
  return "–";
}

function fmtDose(r: ScheduleRec): string {
  return `${fmtNutrient(r.n, r.nMin, r.nMax)}-${fmtNutrient(r.p2o5, r.p2o5Min, r.p2o5Max)}-${fmtNutrient(r.k2o, r.k2oMin, r.k2oMax)}`;
}

function ScheduleCard({
  rec,
  cropName,
  locale,
  sowing,
  t,
  headingLevel = "h2",
}: {
  rec: ScheduleRec;
  cropName: string;
  locale: string;
  sowing: Date | null;
  t: Awaited<ReturnType<typeof getTranslations<"schedule">>>;
  headingLevel?: "h2" | "h3";
}) {
  const H = headingLevel;
  const datedStages = sowing
    ? rec.timeline
        .map((s) => ({ stage: s, range: stageDateRange(s, sowing) }))
        .filter((x) => x.range != null)
    : [];
  return (
    <Card>
      <CardBody className="sm:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <H className="font-display text-2xl font-semibold">
            {cropName}
            {rec.contextLabel ? ` — ${rec.contextLabel}` : ""}
          </H>
          {rec.verificationStatus === "verified" ||
          rec.verificationStatus === "published" ? (
            <Badge variant="verified">{t("results.badgeVerified")}</Badge>
          ) : (
            <Badge variant="review">{t("results.badgeReview")}</Badge>
          )}
          {rec.isPrimary && <Badge variant="neutral">Primary</Badge>}
        </div>

        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">{t("results.doseTitle")}: </span>
          <b className="text-lg text-ink">{fmtDose(rec)}</b>{" "}
          {t("results.perHa")}
        </p>

        {rec.timeline.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-1">{t("results.scheduleTitle")}</h3>
            <ApplicationTimeline stages={rec.timeline} />
          </div>
        )}

        {sowing && datedStages.length > 0 && (
          <div className="mt-5 rounded-xl border border-line bg-surface px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">
              {t("results.dateLabel")}
            </p>
            <ul className="space-y-1.5 text-sm">
              {datedStages.map((x, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-2">
                  <span className="text-ink-soft">{x.stage.label}</span>
                  <span className="font-semibold">
                    {formatStageDate(x.range!, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {sowing && datedStages.length === 0 && rec.timeline.length > 0 && (
          <p className="mt-4 text-sm text-ink-faint">{t("results.noDateNote")}</p>
        )}

        {rec.applicationMethod && (
          <div className="mt-5">
            <h3 className="font-semibold mb-1.5">Application method</h3>
            <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
              {rec.applicationMethod}
            </p>
          </div>
        )}
        {rec.applicationTiming && (
          <div className="mt-4">
            <h3 className="font-semibold mb-1.5">Timing</h3>
            <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
              {rec.applicationTiming}
            </p>
          </div>
        )}
        {rec.micronutrients && (
          <p className="mt-4 text-sm text-ink-soft">
            <span className="font-semibold">Micronutrients: </span>
            {rec.micronutrients}
          </p>
        )}

        {rec.source && (
          <div className="mt-5 pt-4 border-t border-line/60">
            <p className="text-xs text-ink-faint">
              <span className="font-semibold">{t("results.sourceLabel")} </span>
              {rec.source.url ? (
                <a
                  href={rec.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-ink"
                >
                  {rec.source.organization} — {rec.source.title}
                </a>
              ) : (
                <span>
                  {rec.source.organization} — {rec.source.title}
                </span>
              )}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default async function FertilizerSchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ crop?: string; date?: string; country?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("schedule");
  const faq = t.raw("faq") as { q: string; a: string }[];

  const countryOverride = /^[A-Z]{2}$/.test(sp.country ?? "") ? sp.country : undefined;
  const data = await getScheduleData(countryOverride);
  const names = await getTranslatedItemNames(
    data.crops.map((c) => c.slug),
    locale,
  );
  const displayName = (slug: string, fallback: string) =>
    names.get(slug) ?? fallback;

  const selected =
    data.crops.find((c) => c.slug === sp.crop) ??
    data.crops.find((c) => c.slug === "wheat") ??
    data.crops[0];
  const sowing = parseSowingDate(sp.date);
  const countryName = data.country?.name ?? "";

  return (
    <>
      <FaqJsonLd items={faq} />
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
        <Card className="max-w-3xl">
          <CardBody className="sm:p-8">
            <form method="get" className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-sm font-semibold block mb-1.5">
                    {t("form.crop")}
                  </span>
                  <select
                    name="crop"
                    defaultValue={selected?.slug}
                    className="w-full rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm"
                  >
                    {data.crops.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {displayName(c.slug, c.name)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold block mb-1.5">
                    {t("form.date")}
                  </span>
                  <input
                    type="date"
                    name="date"
                    defaultValue={sp.date ?? ""}
                    className="w-full rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm"
                  />
                  <span className="mt-1.5 block text-xs text-ink-faint leading-relaxed">
                    {t("form.dateHint")}
                  </span>
                </label>
              </div>
              {countryOverride && (
                <input type="hidden" name="country" value={countryOverride} />
              )}
              <button
                type="submit"
                className="rounded-xl bg-leaf-700 dark:bg-leaf-600 px-6 py-3 text-sm font-bold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
              >
                {t("form.submit")}
              </button>
            </form>
            <p className="mt-4 text-xs text-ink-faint">{t("form.countryNote")}</p>
          </CardBody>
        </Card>

        {selected ? (
          <div className="mt-8 space-y-6 max-w-4xl">
            <ScheduleCard
              rec={selected.schedules[0]}
              cropName={displayName(selected.slug, selected.name)}
              locale={locale}
              sowing={sowing}
              t={t}
            />

            <Card className="border-leaf-200 dark:border-leaf-800 bg-leaf-50/60 dark:bg-leaf-950/30">
              <CardBody className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{t("results.calcCtaTitle")}</p>
                  <p className="text-sm text-ink-soft max-w-md leading-relaxed">
                    {t("results.calcCtaDesc")}
                  </p>
                </div>
                <Link
                  href={`/calculator?crop=${selected.slug}${data.country ? `&country=${data.country.code}` : ""}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-3 text-sm font-bold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
                >
                  {t("results.calcCta")}
                </Link>
              </CardBody>
            </Card>

            {selected.schedules.length > 1 && (
              <>
                <h2 className="font-display text-2xl font-semibold pt-2">
                  {t("results.otherTitle")}
                </h2>
                {selected.schedules.slice(1).map((rec) => (
                  <ScheduleCard
                    key={rec.id}
                    rec={rec}
                    cropName={displayName(selected.slug, selected.name)}
                    locale={locale}
                    sowing={sowing}
                    t={t}
                    headingLevel="h3"
                  />
                ))}
              </>
            )}
          </div>
        ) : (
          <Card className="mt-8 max-w-3xl">
            <CardBody className="sm:p-8">
              <h2 className="font-display text-2xl font-semibold mb-2">
                {t("empty.title")}
              </h2>
              <p className="text-ink-soft leading-relaxed">
                {t("empty.desc", { crop: "—", country: countryName })}
              </p>
            </CardBody>
          </Card>
        )}
      </Section>

      <div className="bg-surface border-t border-line">
        <Section title={t("faqTitle")}>
          <div className="max-w-3xl">
            <Accordion items={faq} />
          </div>
        </Section>
      </div>

      <RelatedTools current="/fertilizer-schedule" />
    </>
  );
}
