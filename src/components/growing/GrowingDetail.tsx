import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  CATEGORY_META,
  PLANT_SUBCATEGORIES,
  type GrowingItem,
} from "@/lib/growing";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";

function NoData({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-4 text-sm">
      <p className="font-semibold text-ink-soft">{title}</p>
      <p className="text-ink-faint text-[13px] mt-1 leading-relaxed">{hint}</p>
    </div>
  );
}

export async function GrowingDetail({
  item,
  related,
}: {
  item: GrowingItem;
  related: GrowingItem[];
}) {
  const t = await getTranslations("growing");
  const meta = CATEGORY_META[item.category];
  const s = t.raw("sections") as Record<string, string>;
  const hasNpk = !!item.npk;

  const conditionRows: [string, string | null][] = [
    [s.soil, item.soil],
    [s.water, item.water],
    [s.sunlight, item.sunlight],
    [s.climate, item.climate],
    [s.season, item.seasonDetail ?? item.season],
    [s.sowingWindow, item.sowingMonths],
    [s.harvestWindow, item.harvestPeriod],
  ];
  const hasConditions = conditionRows.some(([, v]) => v);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: meta.title, url: `${siteConfig.url}${meta.basePath}` },
          { name: item.name, url: `${siteConfig.url}${meta.basePath}/${item.slug}` },
        ]}
      />
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-xs text-ink-faint mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span aria-hidden> · </span>
            <Link href={meta.basePath} className="hover:underline">
              {meta.title}
            </Link>
            <span aria-hidden> · </span>
            <span className="text-ink-soft">{item.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl sm:text-5xl font-semibold">
              {item.name}{" "}
              {item.urdu && (
                <span className="text-2xl font-sans font-normal text-ink-faint" lang="ur">
                  {item.urdu}
                </span>
              )}
            </h1>
            {item.verificationStatus === "verified" ? (
              <Badge variant="verified">{t("verifiedBadge")}</Badge>
            ) : (
              <Badge variant="review">{t("inReviewBadge")}</Badge>
            )}
          </div>
          {item.scientificName && (
            <p className="mt-2 italic text-ink-faint">{item.scientificName}</p>
          )}
          {item.plantSubcategory && (
            <p className="mt-2 text-sm text-ink-faint">
              {PLANT_SUBCATEGORIES.find((p) => p.id === item.plantSubcategory)?.label}
            </p>
          )}
          {(item.season || item.region) && (
            <p className="mt-3 text-lg text-ink-soft">
              {[item.season, item.region].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </section>

      <Section>
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="space-y-6">
            {/* Fertilizer recommendation */}
            <Card>
              <CardBody>
                <h2 className="font-display text-xl font-semibold mb-4">{s.fertilizer}</h2>
                {hasNpk && item.npk ? (
                  <>
                    <div className="inline-flex items-center gap-6 rounded-2xl border border-line bg-surface-2 px-6 py-4 font-mono">
                      <span>
                        <span className="text-ink-faint text-sm font-sans">N </span>
                        <b className="text-xl">{item.npk.n}</b>
                      </span>
                      <span>
                        <span className="text-ink-faint text-sm font-sans">P₂O₅ </span>
                        <b className="text-xl">{item.npk.p}</b>
                      </span>
                      <span>
                        <span className="text-ink-faint text-sm font-sans">K₂O </span>
                        <b className="text-xl">{item.npk.k}</b>
                      </span>
                      <span className="text-sm font-sans text-ink-faint">kg/ha</span>
                    </div>
                    {item.npkSource && (
                      <p className="mt-3 text-xs text-ink-faint">Source: {item.npkSource}</p>
                    )}
                    <div className="mt-4">
                      <Link
                        href="/calculator"
                        className="inline-flex rounded-xl bg-leaf-700 dark:bg-leaf-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
                      >
                        {t("calculateCta")}
                      </Link>
                    </div>
                  </>
                ) : item.category === "crop" ? (
                  <div className="rounded-xl border border-harvest-200 dark:border-harvest-800 bg-harvest-100 dark:bg-harvest-950/40 p-4 text-sm text-ink-soft">
                    {t("inReviewNotice", { name: item.name })}
                  </div>
                ) : (
                  <NoData title={t("noData")} hint={t("noDataHint")} />
                )}
              </CardBody>
            </Card>

            {/* Growing conditions */}
            {hasConditions && (
              <Card>
                <CardBody>
                  <h2 className="font-display text-xl font-semibold mb-4">
                    {s.growingConditions}
                  </h2>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                    {conditionRows.map(
                      ([label, value]) =>
                        value && (
                          <div key={label}>
                            <dt className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-1">
                              {label}
                            </dt>
                            <dd className="text-sm text-ink-soft leading-relaxed">{value}</dd>
                          </div>
                        )
                    )}
                    {item.regions.length > 0 && (
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-1">
                          {s.regions}
                        </dt>
                        <dd className="text-sm text-ink-soft leading-relaxed">
                          {item.regions.join(", ")}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardBody>
              </Card>
            )}

            {/* Growth stages */}
            {item.stages.length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="font-display text-xl font-semibold mb-4">{s.stages}</h2>
                  <div className="space-y-4">
                    {item.stages.map((st, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="shrink-0 w-8 h-8 rounded-full bg-leaf-700 dark:bg-leaf-600 text-white text-sm font-bold grid place-items-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-semibold">
                            {st.name}{" "}
                            <span className="font-normal text-ink-faint text-sm">· {st.timing}</span>
                          </p>
                          <p className="text-sm text-ink-soft mt-0.5">{st.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Deficiencies */}
            {item.deficiencies.length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="font-display text-xl font-semibold mb-3">{s.deficiencies}</h2>
                  <ul className="space-y-2">
                    {item.deficiencies.map((d) => (
                      <li key={d} className="flex gap-2.5 text-sm text-ink-soft">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-harvest-500 shrink-0" aria-hidden />
                        {d}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )}

            {/* Problems */}
            {item.problems.length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="font-display text-xl font-semibold mb-3">{s.problems}</h2>
                  <div className="flex flex-wrap gap-2">
                    {item.problems.map((p) => (
                      <Badge key={p} variant="neutral">
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-sm">
                    <Link
                      href="/plant-doctor"
                      className="font-semibold text-leaf-700 dark:text-leaf-300 hover:underline"
                    >
                      {t("doctorCta")}
                    </Link>
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Related fertilizers */}
            <Card>
              <CardBody>
                <h2 className="font-display text-xl font-semibold mb-3">
                  {t("relatedFertilizers")}
                </h2>
                {hasNpk ? (
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["urea", "Urea"],
                      ["dap", "DAP"],
                      ["mop", "MOP"],
                    ].map(([slug, name]) => (
                      <Link
                        key={slug}
                        href={`/fertilizers/${slug}`}
                        className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink-soft hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors"
                      >
                        {name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">
                    <Link
                      href="/fertilizers"
                      className="font-semibold text-leaf-700 dark:text-leaf-300 hover:underline"
                    >
                      Fertilizer Library →
                    </Link>
                  </p>
                )}
              </CardBody>
            </Card>

            {/* References */}
            {(item.sources.length > 0 || item.lastReviewed) && (
              <Card>
                <CardBody>
                  <h2 className="font-display text-xl font-semibold mb-3">{s.references}</h2>
                  <ul className="space-y-2.5">
                    {item.sources.map((ref, i) => (
                      <li key={i} className="text-sm text-ink-soft leading-relaxed">
                        <span className="font-semibold">{ref.organization}.</span> {ref.title}
                        {ref.region && <span className="text-ink-faint"> — {ref.region}</span>}
                        {ref.url && (
                          <>
                            {" "}
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-leaf-700 dark:text-leaf-300 hover:underline"
                            >
                              Source
                            </a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  {item.lastReviewed && (
                    <p className="mt-3 text-xs text-ink-faint">
                      {s.lastReviewed}: {item.lastReviewed}
                    </p>
                  )}
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardBody>
                <h3 className="font-semibold text-sm mb-2">
                  {t("relatedItems")} · {meta.title}
                </h3>
                <ul className="space-y-1.5">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`${meta.basePath}/${r.slug}`}
                        className="text-sm text-leaf-800 dark:text-leaf-300 hover:underline"
                      >
                        {r.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
