"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/fields";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      setError(t("invalid"));
      return;
    }
    router.push("/account");
    router.refresh();
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardBody>
        <h1 className="font-display text-3xl font-semibold">{t("loginTitle")}</h1>
        <p className="text-sm text-ink-soft mt-1.5 mb-6">{t("loginDesc")}</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label={t("email")}>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </Field>
          <Field label={t("password")}>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
          {error && (
            <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-3 font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors disabled:opacity-60"
          >
            {busy ? "…" : t("loginCta")}
          </button>
        </form>
        <p className="text-sm text-ink-soft mt-5 text-center">
          {t("noAccount")}{" "}
          <Link href="/signup" className="font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
            {t("signupTitle")}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
