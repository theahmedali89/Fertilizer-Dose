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
    path: "/privacy",
    title: "Privacy Policy",
    description: "How Fertilizer Dose collects, uses and protects your information.",
  });
}

const SECTIONS: [string, string][] = [
  ["Information we collect", "Account information you provide (name, email) and content you submit (plant photos, symptom descriptions, calculator inputs). We do not sell personal data."],
  ["How we use it", "To operate the calculator, provide diagnoses, improve recommendations, and communicate with you. Plant photos are used solely for diagnosis."],
  ["Cookies", "We use essential cookies for sessions and theme preference. Analytics, if enabled, will be disclosed here."],
  ["Data security", "Passwords are hashed with bcrypt. API keys live server-side only and are never exposed to the browser."],
  ["Your rights", "You may request access, correction or deletion of your data at any time via the contact page."],
  ["Changes", "Material changes to this policy will be announced on the site before taking effect."],
];

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Section>
      <div className="max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Privacy Policy</h1>
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
