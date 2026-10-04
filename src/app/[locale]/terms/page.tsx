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
    path: "/terms",
    title: "Terms of Use",
    description: "The terms governing use of Fertilizer Dose.",
  });
}

const SECTIONS: [string, string][] = [
  ["Agricultural disclaimer", "Dose calculations and plant diagnoses are estimates based on published recommendations and AI analysis. They are guidance, not professional agronomic advice. Always confirm with your local agriculture officer and soil test before application."],
  ["Acceptable use", "Do not misuse the service, attempt to access other users' data, upload unlawful content, or scrape the site aggressively."],
  ["Accounts", "You are responsible for activity under your account. We may suspend accounts that violate these terms."],
  ["Intellectual property", "Site content and design belong to Fertilizer Dose. Agronomic data itself remains governed by its cited sources."],
  ["Limitation of liability", "To the maximum extent permitted by law, Fertilizer Dose is not liable for crop outcomes resulting from use of the tools."],
  ["Changes", "We may update these terms; continued use after changes constitutes acceptance."],
];

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Section>
      <div className="max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Terms of Use</h1>
        <p className="mt-3 text-sm text-ink-faint">Last updated: October 2026</p>
        <div className="mt-8 space-y-4">
          {SECTIONS.map(([t, d]) => (
            <Card key={t}><CardBody>
              <h2 className="font-display text-lg font-semibold mb-1.5">{t}</h2>
              <p className="text-ink-soft text-[15px] leading-relaxed">{d}</p>
            </CardBody></Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
