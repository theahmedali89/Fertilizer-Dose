import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
    path: "/sitemap",
    title: "Sitemap",
    description: "Every page on Fertilizer Dose, in one place.",
  });
}

const GROUPS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Tools",
    links: [
      { href: "/calculator", label: "Calculator" },
      { href: "/fertilizers", label: "Fertilizer library" },
      { href: "/crops", label: "Crop guides" },
      { href: "/planting-calendar", label: "Planting calendar" },
      { href: "/my-garden", label: "My Garden" },
      { href: "/profit-calculator", label: "Profit calculator" },
      { href: "/compare", label: "Compare" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default async function SitemapPage({
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
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">Sitemap</h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            Every section of Fertilizer Dose, in one place.
          </p>
        </div>
      </section>
      <Section>
        <div className="max-w-3xl space-y-6">
          {GROUPS.map((g) => (
            <Card key={g.heading}>
              <CardBody className="sm:p-8">
                <h2 className="font-display text-2xl font-semibold mb-4">{g.heading}</h2>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-ink-soft hover:text-leaf-700 dark:hover:text-leaf-300 hover:underline transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
