import { setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Section>
      <ResetPasswordForm />
    </Section>
  );
}
