import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { FERTILIZERS } from "@/lib/agronomy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fertilizers" });
  return localizedMetadata({
    locale,
    path: "/fertilizers",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}


export default async function FertilizersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            Fertilizer library
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            Know what&apos;s in the bag.
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            Every percentage below matches the manufacturer&apos;s bag label.
            These are the numbers the dose calculator runs on.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FERTILIZERS.map((f) => (
            <Link key={f.slug} href={`/fertilizers/${f.slug}`} className="group">
              <Card className="h-full transition-all duration-200 group-hover:shadow-lift group-hover:-translate-y-0.5">
                <CardBody>
                  <h2 className="font-display text-xl font-semibold group-hover:text-leaf-700 dark:group-hover:text-leaf-300 transition-colors">
                    {f.name}{" "}
                    <span className="text-sm font-sans font-normal text-ink-faint" lang="ur">{f.urdu}</span>
                  </h2>
                  <p className="mt-2 font-mono text-sm">
                    <span className="text-ink-faint">N</span> {f.n} ·{" "}
                    <span className="text-ink-faint">P₂O₅</span> {f.p} ·{" "}
                    <span className="text-ink-faint">K₂O</span> {f.k}
                  </p>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">{f.tagline}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
