import { setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { localizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/about",
    title: "About",
    description: "What Fertilizer Dose is, who it's for, and the data-integrity promise behind every number.",
  });
}

export default async function AboutPage({
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
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">About Fertilizer Dose</h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            Fertilizer Dose helps farmers apply the
            right fertilizer dose — no more, no less.
          </p>
        </div>
      </section>
      <Section>
        <div className="max-w-3xl space-y-6">
          <Card><CardBody className="sm:p-8">
            <h2 className="font-display text-2xl font-semibold mb-3">Why we exist</h2>
            <p className="text-ink-soft leading-relaxed">
              Across Pakistan and India, fertilizer is often applied by habit: the
              same bags every season, regardless of crop need or soil condition.
              Over-application wastes money and damages soil and water;
              under-application silently cuts yield. Fertilizer Dose exists to replace
              guesswork with arithmetic — the same standard formulas agronomists
              use, made instant and transparent.
            </p>
          </CardBody></Card>
          <Card><CardBody className="sm:p-8">
            <h2 className="font-display text-2xl font-semibold mb-3">Our data promise</h2>
            <ul className="space-y-2.5 text-ink-soft leading-relaxed">
              <li className="flex gap-2.5"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-leaf-600 shrink-0" />Fertilizer compositions match manufacturer bag labels.</li>
              <li className="flex gap-2.5"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-leaf-600 shrink-0" />Crop doses come from published provincial and research-institute recommendations, cited on every page.</li>
              <li className="flex gap-2.5"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-leaf-600 shrink-0" />Figures without a verified source are marked “in review” and disabled — never invented.</li>
              <li className="flex gap-2.5"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-leaf-600 shrink-0" />The calculator shows every step of its math.</li>
            </ul>
          </CardBody></Card>
          <Card><CardBody className="sm:p-8">
            <h2 className="font-display text-2xl font-semibold mb-3">Who it&apos;s for</h2>
            <p className="text-ink-soft leading-relaxed">
              Farmers, agriculture students, input dealers and extension workers —
              anyone who wants a quick, trustworthy fertilizer answer in the units
              they actually use: acre, kanal, marla or hectare.
            </p>
          </CardBody></Card>
          <Card><CardBody className="sm:p-8">
            <h2 className="font-display text-2xl font-semibold mb-3">A note on translations</h2>
            <p className="text-ink-soft leading-relaxed">
              Fertilizer Dose is offered in several languages, but professional
              translations are still in progress — non-English pages may show
              machine-translated text. The English version is the authoritative
              reference. If anything looks off in another language, please check
              the English page.
            </p>
          </CardBody></Card>
        </div>
      </Section>
    </>
  );
}
