"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/fields";
import { signupAction } from "@/server/actions/auth";

export function SignupForm() {
  const t = useTranslations("auth");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await signupAction(new FormData(e.currentTarget));
    setBusy(false);
    if (!res.ok) setError(res.error);
    // on success the action redirects to /account
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardBody>
        <h1 className="font-display text-3xl font-semibold">{t("signupTitle")}</h1>
        <p className="text-sm text-ink-soft mt-1.5 mb-6">{t("signupDesc")}</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label={t("name")}>
            <Input name="name" required minLength={2} maxLength={80} autoComplete="name" />
          </Field>
          <Field label={t("email")}>
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label={t("password")}>
            <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
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
            {busy ? "…" : t("signupCta")}
          </button>
        </form>
        <p className="text-sm text-ink-soft mt-5 text-center">
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
            {t("loginTitle")}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
