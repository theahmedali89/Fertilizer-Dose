import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
    path: "/fertilizers/organic",
    title: t("organic.metaTitle"),
    description: t("organic.metaDescription"),
  });
}

type CompareRow = { aspect: string; mineral: string; organic: string };

export default async function OrganicHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("fertilizers");
  const organics = (await getFertilizers()).filter((f) => f.fertilizerType === "organic");
  const compareRows = t.raw("organic.compareRows") as CompareRow[];
  const uses = t.raw("organic.uses") as string[];
  const limits = t.raw("organic.limits") as string[];

  const range = (lo: number | null, hi: number | null) =>
    lo != null && hi != null ? `${lo}–${hi}%` : "—";

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            {t("organic.eyebrow")}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            {t("organic.title")}
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-3xl leading-relaxed">
            {t("organic.intro")}
          </p>
        </div>
      </section>

      <Section eyebrow={t("organic.whatTitle")}>
        <div className="max-w-3xl space-y-4 text-ink-soft leading-relaxed">
          <p>{t("organic.whatBody1")}</p>
          <p>{t("organic.whatBody2")}</p>
        </div>
      </Section>

      <div className="bg-surface border-y border-line">
        <Section eyebrow={t("typeOrganic")} title={t("organic.typesTitle")} description={t("organic.typesIntro")}>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {organics.map((f) => (
              <Card key={f.slug} className="h-full">
                <CardBody>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{t("typeOrganic")}</Badge>
                  </div>
                  <h3 className="font-display text-xl font-semibold">
                    {f.name}{" "}
                    <span className="text-sm font-sans font-normal text-ink-faint" lang="ur">{f.urdu}</span>
                  </h3>
                  <p className="mt-2 font-mono text-sm">
                    <span className="text-ink-faint">N</span> {range(f.nMin, f.nMax)} ·{" "}
                    <span className="text-ink-faint">P₂O₅</span> {range(f.pMin, f.pMax)} ·{" "}
                    <span className="text-ink-faint">K₂O</span> {range(f.kMin, f.kMax)}
                  </p>
                  <p className="mt-1 text-xs text-ink-faint">{t("typicalRangeLabel")}</p>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">{f.tagline}</p>
                  <Link
                    href={`/fertilizers/${f.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-leaf-700 dark:text-leaf-300 hover:underline"
                  >
                    {t("organic.detailCta")} →
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      <Section title={t("organic.compareTitle")} description={t("organic.compareIntro")}>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 text-start">
                  <th className="px-5 py-3.5 font-semibold w-40" />
                  <th className="px-5 py-3.5 font-semibold">{t("tabMineral")}</th>
                  <th className="px-5 py-3.5 font-semibold">{t("tabOrganic")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {compareRows.map((r) => (
                  <tr key={r.aspect} className="align-top">
                    <td className="px-5 py-3.5 font-semibold whitespace-nowrap">{r.aspect}</td>
                    <td className="px-5 py-3.5 text-ink-soft leading-relaxed">{r.mineral}</td>
                    <td className="px-5 py-3.5 text-ink-soft leading-relaxed">{r.organic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      <div className="bg-surface border-y border-line">
        <Section title={t("organic.usesTitle")} description={t("organic.usesIntro")}>
          <ul className="max-w-3xl space-y-2.5">
            {uses.map((u, i) => (
              <li key={i} className="flex gap-2.5 text-ink-soft leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-leaf-600 shrink-0" aria-hidden />
                {u}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title={t("organic.limitsTitle")} description={t("organic.limitsIntro")}>
        <ul className="max-w-3xl space-y-2.5">
          {limits.map((l, i) => (
            <li key={i} className="flex gap-2.5 text-ink-soft leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-harvest-500 shrink-0" aria-hidden />
              {l}
            </li>
          ))}
        </ul>
      </Section>

      <div className="bg-surface border-t border-line">
        <Section title={t("organic.warnTitle")}>
          <div className="max-w-3xl rounded-2xl border border-harvest-300 dark:border-harvest-800 bg-harvest-50 dark:bg-harvest-950/40 px-5 py-4">
            <p className="text-sm text-ink-soft leading-relaxed">{t("organic.warnBody")}</p>
            <Link
              href="/calculator"
              className="mt-3 inline-flex rounded-xl bg-leaf-700 dark:bg-leaf-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
            >
              {t("organic.exploreCta")}
            </Link>
          </div>
        </Section>
      </div>
    </>
  );
}
