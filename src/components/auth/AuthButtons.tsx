"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Header auth area: login link, or a compact account dropdown for signed-in users. */
export function AuthButtons() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (status === "loading") {
    return <span className="w-16 h-9 rounded-xl bg-surface-2 animate-pulse" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="hidden sm:inline-flex items-center rounded-xl border border-line px-4 py-2 text-[14px] font-semibold text-ink-soft hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors whitespace-nowrap shrink-0"
      >
        {t("login")}
      </Link>
    );
  }

  const role = (session.user as { role?: string }).role;
  const isStaff = role === "ADMIN" || role === "EDITOR";
  const displayName = session.user.name ?? t("account");

  return (
    <div ref={ref} className="hidden sm:block relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        title={session.user.email ?? ""}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl border border-line px-3.5 py-2 text-[14px] font-semibold text-ink-soft hover:border-leaf-600 transition-colors whitespace-nowrap",
          open && "border-leaf-600"
        )}
      >
        <span className="max-w-[120px] truncate">{displayName}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden className={cn("transition-transform", open && "rotate-180")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute end-0 top-full mt-2 w-48 rounded-xl border border-line bg-surface shadow-lift py-1.5 z-50">
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-[14px] font-medium text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors"
          >
            {t("account")}
          </Link>
          {isStaff && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[14px] font-medium text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors"
            >
              {t("admin")}
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full text-start px-4 py-2.5 text-[14px] font-medium text-red-600 hover:bg-surface-2 transition-colors"
          >
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}
