import { setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Section>
      <LoginForm />
    </Section>
  );
}
