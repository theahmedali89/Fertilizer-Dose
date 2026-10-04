import { setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/contact/ContactForm";
import { localizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/contact",
    title: "Contact",
    description: "Contact the Fertilizer Dose team.",
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Section>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Contact us</h1>
        <p className="mt-4 text-lg text-ink-soft">
          Questions, corrections to our data, or partnership ideas — we read everything.
        </p>
        <ContactForm />
      </div>
    </Section>
  );
}
