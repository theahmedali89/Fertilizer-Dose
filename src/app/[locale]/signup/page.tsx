import { setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SignupForm } from "@/components/auth/SignupForm";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Section>
      <SignupForm />
    </Section>
  );
}
