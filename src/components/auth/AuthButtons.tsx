"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Header auth area: login link, or account menu for signed-in users. */
export function AuthButtons() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="w-16 h-9 rounded-xl bg-surface-2 animate-pulse" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="hidden sm:inline-flex items-center rounded-xl border border-line px-4 py-2 text-[14px] font-semibold text-ink-soft hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors"
      >
        {t("login")}
      </Link>
    );
  }

  const role = (session.user as { role?: string }).role;
  const isStaff = role === "ADMIN" || role === "EDITOR";

  return (
    <div className="hidden sm:flex items-center gap-1.5">
      {isStaff && (
        <Link
          href="/admin"
          className="inline-flex items-center rounded-xl border border-line px-3.5 py-2 text-[14px] font-semibold text-ink-soft hover:border-leaf-600 transition-colors"
        >
          {t("admin")}
        </Link>
      )}
      <Link
        href="/account"
        className="inline-flex items-center rounded-xl border border-line px-3.5 py-2 text-[14px] font-semibold text-ink-soft hover:border-leaf-600 transition-colors"
        title={session.user.email ?? ""}
      >
        {session.user.name ?? t("account")}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-[13px] font-medium text-ink-faint hover:text-red-600 transition-colors px-1"
      >
        {t("logout")}
      </button>
    </div>
  );
}
