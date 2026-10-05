import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { requireUser } from "@/server/require-auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const user = await requireUser();

  return (
    <Section>
      <div className="max-w-2xl mx-auto space-y-5">
        <Card>
          <CardBody>
            <h1 className="font-display text-3xl font-semibold">{t("accountTitle")}</h1>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-24 text-ink-faint">{t("name")}</dt>
                <dd className="font-medium">{user.name ?? "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 text-ink-faint">{t("email")}</dt>
                <dd className="font-medium">{user.email ?? "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 text-ink-faint">{t("role")}</dt>
                <dd className="font-medium capitalize">{user.role?.toLowerCase()}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {(user.role === "ADMIN" || user.role === "EDITOR") && (
                <Link
                  href="/admin"
                  className="rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
                >
                  {t("adminLink")}
                </Link>
              )}
              <Link
                href="/my-garden"
                className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium hover:border-leaf-600 transition-colors"
              >
                My Garden
              </Link>
              <SignOutButton label={t("signOut")} />
            </div>
          </CardBody>
        </Card>
        <p className="text-xs text-ink-faint leading-relaxed">{t("gardenNote")}</p>
      </div>
    </Section>
  );
}
