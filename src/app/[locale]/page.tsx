import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { CROPS, FERTILIZERS } from "@/lib/agronomy";
import { getItemsByCategory } from "@/lib/growing";
import { POSTS } from "@/lib/blog";
import { siteConfig } from "@/config/site";
import { localizedMetadata } from "@/lib/seo";
import { FaqJsonLd } from "@/components/seo/JsonLd";

const TOOL_ICONS: Record<string, React.ReactNode> = {
  calculator: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
    </svg>
  ),
  doctor: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c-5 0-8-3.5-8-8 0-5 4-9 12-10-.5 8-1.5 14-4 18Z" />
      <path d="M12 21v-8" />
    </svg>
  ),
  fertilizers: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2M10 12h4" />
    </svg>
  ),
  crops: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22V10" />
      <path d="M12 10C12 6 9 3 4 3c0 5 3 7 8 7ZM12 14c0-4 3-7 8-7 0 5-3 7-8 7Z" />
    </svg>
  ),
  profit: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  ),
  compare: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H4v18h4M16 3h4v18h-4" />
      <path d="M8 8h8M8 12h8M8 16h8" />
    </svg>
  ),
};

const TOOL_HREFS = ["/calculator", "/plant-doctor", "/fertilizers", "/crops", "/profit-calculator", "/compare"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return localizedMetadata({
    locale,
    path: "/",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const faqT = await getTranslations("faq");
  const faqs = faqT.raw("items") as { q: string; a: string }[];
  const stats = t.raw("hero.stats") as { t: string; s: string }[];
  const toolCards = t.raw("tools.cards") as { title: string; desc: string }[];
  const bullets = t.raw("doctor.bullets") as { t: string; d: string }[];
  const whyItems = t.raw("why.items") as { t: string; d: string }[];
  const isEn = locale === "en";
  const urduAccents = ["مقدار کیلکولیٹر", "پودوں کا ڈاکٹر", "کھاد لائبریری", "فصل لائبریری", "منافع کیلکولیٹر", "موازنہ"];

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 field-rows field-rows-fade opacity-70" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgb(var(--canvas))]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-leaf-800 dark:text-leaf-300">
              <span className="w-2 h-2 rounded-full bg-leaf-600 animate-pulse" aria-hidden />
              <span>{siteConfig.name}</span>
              <span aria-hidden className="text-ink-faint">·</span>
              <span>{t("hero.tagline")}</span>
            </p>
            <h1 className="mt-6 font-display text-4xl sm:text-6xl font-semibold leading-[1.05] text-balance">
              {t.rich("hero.title", {
                em: (chunks) => (
                  <span className="text-leaf-700 dark:text-leaf-400 italic">{chunks}</span>
                ),
              })}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-ink-soft leading-relaxed max-w-2xl">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-7 py-3.5 font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors shadow-lift"
              >
                {t("hero.ctaCalc")}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className="rtl:rotate-180">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/plant-doctor"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-7 py-3.5 font-semibold hover:border-leaf-600 transition-colors"
              >
                {t("hero.ctaDoctor")}
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
              {stats.map((s) => (
                <div key={s.t} className="border-s-2 border-leaf-600/60 ps-3">
                  <dt className="font-display font-semibold text-lg leading-tight">{s.t}</dt>
                  <dd className="text-xs text-ink-faint mt-0.5">{s.s}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ============ POPULAR CROPS ============ */}
      <Section
        eyebrow={t("crops.eyebrow")}
        title={t("crops.title")}
        description={t("crops.desc")}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {CROPS.map((crop) => (
            <Link key={crop.slug} href={`/crops/${crop.slug}`} className="group">
              <Card className="h-full transition-all duration-200 group-hover:shadow-lift group-hover:-translate-y-0.5">
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold">
                        {crop.name}{" "}
                        <span className="text-sm font-sans font-normal text-ink-faint" lang="ur">
                          {crop.urdu}
                        </span>
                      </h3>
                      <p className="text-sm text-ink-faint mt-1">{crop.season}</p>
                    </div>
                    {crop.npk ? (
                      <Badge variant="verified">{t("crops.verified")}</Badge>
                    ) : (
                      <Badge variant="review">{t("crops.inReview")}</Badge>
                    )}
                  </div>
                  <p className="mt-4 font-mono text-sm bg-surface-2 border border-line rounded-lg px-3 py-2 inline-block">
                    {crop.npk ? (
                      <>N <b>{crop.npk.n}</b> · P₂O₅ <b>{crop.npk.p}</b> · K₂O <b>{crop.npk.k}</b> <span className="text-ink-faint">{t("crops.perHa")}</span></>
                    ) : (
                      <span className="text-ink-faint font-sans">{t("crops.reviewNote")}</span>
                    )}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-leaf-700 dark:text-leaf-300 flex items-center gap-1.5">
                    {t("crops.openGuide")}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className="group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 transition-transform">
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      {/* ============ GROW: CROPS / PLANTS / VEGETABLES ============ */}
      <div className="bg-surface border-y border-line">
        <Section
          eyebrow={t("grow.eyebrow")}
          title={t("grow.title")}
          description={t("grow.desc")}
        >
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            {(
              [
                { href: "/crops", count: getItemsByCategory("crop").length },
                { href: "/vegetables", count: getItemsByCategory("vegetable").length },
                { href: "/plants", count: getItemsByCategory("plant").length },
              ] as const
            ).map((g, i) => {
              const card = (t.raw("grow.cards") as { title: string; desc: string }[])[i];
              return (
                <Link key={g.href} href={g.href} className="group">
                  <Card className="h-full transition-all duration-200 group-hover:shadow-lift group-hover:-translate-y-0.5">
                    <CardBody>
                      <p className="font-display text-4xl font-semibold text-leaf-700 dark:text-leaf-400">
                        {g.count}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-semibold group-hover:text-leaf-700 dark:group-hover:text-leaf-300 transition-colors">
                        {card.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{card.desc}</p>
                      <p className="mt-3 text-sm font-semibold text-leaf-700 dark:text-leaf-300">
                        {t("grow.browse")} →
                      </p>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ============ WHAT TO GROW THIS MONTH ============ */}
      <Section
        eyebrow={t("planting.eyebrow")}
        title={t("planting.title")}
        description={t("planting.desc")}
      >
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[1fr_auto] items-center gap-6 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const name = new Intl.DateTimeFormat(locale, { month: "short" }).format(
                  new Date(2026, m - 1, 1)
                );
                const isCurrent = m === new Date().getMonth() + 1;
                return (
                  <span
                    key={m}
                    className={
                      isCurrent
                        ? "rounded-full px-3 py-1.5 text-[13px] font-bold bg-leaf-700 text-white dark:bg-leaf-600 capitalize"
                        : "rounded-full px-3 py-1.5 text-[13px] font-medium border border-line text-ink-soft capitalize"
                    }
                  >
                    {name}
                  </span>
                );
              })}
            </div>
            <Link
              href="/planting-calendar"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-7 py-3.5 font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors whitespace-nowrap"
            >
              {t("planting.cta")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className="rtl:rotate-180">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </Card>
      </Section>

      {/* ============ TOOLS ============ */}
      <div className="bg-surface border-y border-line">
        <Section eyebrow={t("tools.eyebrow")} title={t("tools.title")}>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {toolCards.map((card, i) => (
              <Link key={TOOL_HREFS[i]} href={TOOL_HREFS[i]} className="group">
                <Card className="h-full transition-all duration-200 group-hover:shadow-lift group-hover:-translate-y-0.5">
                  <CardBody className="flex gap-4">
                    <span className="shrink-0 grid place-items-center w-14 h-14 rounded-2xl bg-leaf-100 dark:bg-leaf-950 text-leaf-800 dark:text-leaf-300">
                      {TOOL_ICONS[["calculator", "doctor", "fertilizers", "crops", "profit", "compare"][i]]}
                    </span>
                    <span>
                      <span className="font-display text-lg font-semibold flex items-baseline gap-2">
                        {card.title}
                        {isEn && (
                          <span className="text-xs font-sans font-normal text-ink-faint" lang="ur">
                            {urduAccents[i]}
                          </span>
                        )}
                      </span>
                      <span className="block mt-1.5 text-sm text-ink-soft leading-relaxed">{card.desc}</span>
                    </span>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      </div>

      {/* ============ PLANT DOCTOR TEASER ============ */}
      <Section
        eyebrow={t("doctor.eyebrow")}
        title={t("doctor.title")}
        description={t("doctor.desc")}
      >
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2">
            <CardBody className="sm:p-8">
              <ul className="space-y-4">
                {bullets.map((b) => (
                  <li key={b.t} className="flex gap-3">
                    <span className="mt-0.5 grid place-items-center w-6 h-6 rounded-full bg-leaf-700 dark:bg-leaf-600 text-white shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span>
                      <span className="font-semibold block">{b.t}</span>
                      <span className="text-sm text-ink-soft">{b.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/plant-doctor"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-6 py-3 font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
              >
                {t("doctor.cta")}
              </Link>
            </CardBody>
            <div className="relative bg-surface-2 border-t md:border-t-0 md:border-s border-line p-6 sm:p-8 dot-grid">
              <div className="rounded-2xl border-2 border-dashed border-line bg-surface/80 p-8 text-center">
                <svg className="mx-auto text-ink-faint" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M12 16V4m0 0 4 4m-4-4L8 8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" />
                </svg>
                <p className="mt-3 font-semibold">{t("doctor.dropTitle")}</p>
                <p className="text-sm text-ink-faint mt-1">{t("doctor.dropSub")}</p>
              </div>
              <p className="mt-4 text-xs text-ink-faint text-center">
                {t("doctor.serverNote")}
              </p>
            </div>
          </div>
        </Card>
      </Section>

      {/* ============ FERTILIZER INFO ============ */}
      <div className="bg-surface border-y border-line">
        <Section
          eyebrow={t("fertilizers.eyebrow")}
          title={t("fertilizers.title")}
          description={t("fertilizers.desc")}
        >
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2 text-start">
                    <th className="px-5 py-3.5 font-semibold">{t("fertilizers.thName")}</th>
                    <th className="px-5 py-3.5 font-semibold text-end">{t("fertilizers.thN")}</th>
                    <th className="px-5 py-3.5 font-semibold text-end">{t("fertilizers.thP")}</th>
                    <th className="px-5 py-3.5 font-semibold text-end">{t("fertilizers.thK")}</th>
                    <th className="px-5 py-3.5 font-semibold hidden sm:table-cell">{t("fertilizers.thBest")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {FERTILIZERS.map((f) => (
                    <tr key={f.slug} className="hover:bg-surface-2/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href={`/fertilizers/${f.slug}`} className="font-semibold text-leaf-800 dark:text-leaf-300 hover:underline">
                          {f.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-end font-mono">{f.n}</td>
                      <td className="px-5 py-3.5 text-end font-mono">{f.p}</td>
                      <td className="px-5 py-3.5 text-end font-mono">{f.k}</td>
                      <td className="px-5 py-3.5 text-ink-soft hidden sm:table-cell">{f.tagline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="mt-4 text-sm">
            <Link href="/fertilizers" className="font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
              {t("fertilizers.browse")}
            </Link>
          </p>
        </Section>
      </div>

      {/* ============ BLOG ============ */}
      <Section eyebrow={t("blog.eyebrow")} title={t("blog.title")}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <Card className="h-full transition-all duration-200 group-hover:shadow-lift group-hover:-translate-y-0.5">
                <CardBody>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="neutral">{post.category}</Badge>
                    <span className="text-ink-faint">{post.readMinutes} {t("blog.minRead")}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-leaf-700 dark:group-hover:text-leaf-300 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">{post.excerpt}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      {/* ============ WHY + REGIONAL ============ */}
      <div className="bg-leaf-950 dark:bg-black/40 text-white">
        <Section eyebrow={t("why.eyebrow")} title={t("why.title")}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {whyItems.map((w) => (
              <div key={w.t} className="rounded-xl2 border border-white/15 bg-white/5 p-5 sm:p-6 backdrop-blur-sm">
                <h3 className="font-display text-lg font-semibold">{w.t}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{w.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-xl2 border border-white/15 bg-white/5 p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h3 className="font-display text-2xl font-semibold">{t("why.regionTitle")}</h3>
              <p className="mt-2 text-white/70 leading-relaxed max-w-2xl">
                {t("why.regionDesc")}
              </p>
            </div>
            <Link
              href="/calculator"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-harvest-500 px-6 py-3 font-semibold text-white hover:bg-harvest-600 transition-colors"
            >
              {t("why.regionCta")}
            </Link>
          </div>
        </Section>
      </div>

      {/* ============ FAQ ============ */}
      <FaqJsonLd items={faqs} />
      <Section eyebrow={faqT("eyebrow")} title={faqT("title")}>
        <div className="max-w-3xl">
          <Accordion items={faqs} />
        </div>
      </Section>

      {/* ============ FINAL CTA ============ */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-leaf-800 dark:bg-leaf-900 px-6 py-12 sm:p-14 text-center text-white">
            <div className="absolute inset-0 field-rows opacity-20" aria-hidden />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-balance">
                {t("finalCta.title")}
              </h2>
              <p className="mt-3 text-white/80 max-w-xl mx-auto">
                {t("finalCta.desc")}
              </p>
              <Link
                href="/calculator"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white text-leaf-900 px-8 py-3.5 font-bold hover:bg-harvest-100 transition-colors"
              >
                {t("finalCta.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
