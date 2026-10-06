"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LOCALES } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function setLocaleCookie(code: string) {
  document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Desktop dropdown variant.
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

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

  const switchTo = (code: string) => {
    if (code === locale) return setOpen(false);
    setLocaleCookie(code);
    setOpen(false);
    // Canonical next-intl API: unprefixed pathname + target locale.
    // (usePathname() already strips the locale prefix.)
    router.replace(pathname, { locale: code });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("label")}
        title={t("label")}
        className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="max-w-[5.5rem] truncate">{current.nativeName}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn("transition-transform", open && "rotate-180")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("choose")}
          className="absolute end-0 top-full z-[90] mt-2 max-h-80 w-60 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-lift"
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === locale}
              onClick={() => switchTo(l.code)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-start text-sm transition-colors",
                l.code === locale
                  ? "bg-leaf-100 dark:bg-leaf-950 font-semibold text-leaf-800 dark:text-leaf-300"
                  : "text-ink-soft hover:bg-surface-2 hover:text-ink"
              )}
            >
              <span>
                <span className="block leading-tight">{l.nativeName}</span>
                <span className="block text-[11px] text-ink-faint">{l.name}</span>
              </span>
              {l.code === locale && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact list variant for the mobile drawer.
 */
export function LanguageList() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");

  const switchTo = (code: string) => {
    if (code === locale) return;
    setLocaleCookie(code);
    router.replace(pathname, { locale: code });
  };

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-faint">
        {t("label")}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => switchTo(l.code)}
            aria-pressed={l.code === locale}
            className={cn(
              "rounded-xl border px-3 py-2 text-start text-sm transition-colors",
              l.code === locale
                ? "border-leaf-600 bg-leaf-100 dark:bg-leaf-950 font-semibold text-leaf-800 dark:text-leaf-300"
                : "border-line text-ink-soft hover:border-leaf-500"
            )}
          >
            <span className="block truncate leading-tight">{l.nativeName}</span>
            <span className="block text-[11px] text-ink-faint">{l.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Compact language dropdown for the mobile drawer — replaces the full 18-item grid. */
export function DrawerLanguageSelect() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (code: string) => {
    if (code === locale) return;
    setLocaleCookie(code);
    router.replace(pathname, { locale: code });
  };

  return (
    <select
      value={locale}
      onChange={(e) => switchTo(e.target.value)}
      aria-label="Language"
      className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-leaf-600 focus:outline-none"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.nativeName} ({l.name})
        </option>
      ))}
    </select>
  );
}
