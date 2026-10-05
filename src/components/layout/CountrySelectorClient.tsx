"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  COUNTRY_COOKIE,
  REGION_COOKIE,
  COUNTRY_COOKIE_MAX_AGE,
} from "@/lib/countryCookies";
import type { CountryInfo } from "@/server/country";

function setCountryCookie(code: string) {
  document.cookie = `${COUNTRY_COOKIE}=${code}; path=/; max-age=${COUNTRY_COOKIE_MAX_AGE}; SameSite=Lax`;
  // Region belongs to the old country — clear it so pages recompute a default.
  document.cookie = `${REGION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Global country selector. Country and UI language are independent:
 * selecting a country never changes the locale.
 */
export function CountrySelectorClient({
  countries,
  selectedCode,
}: {
  countries: CountryInfo[];
  selectedCode: string;
}) {
  const t = useTranslations("country");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(selectedCode);
  const ref = useRef<HTMLDivElement>(null);

  const selected = countries.find((c) => c.code === current) ?? countries[0];

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

  const select = (code: string) => {
    setOpen(false);
    if (code === current) return;
    setCountryCookie(code);
    setCurrent(code);
    // Re-render server components that read the cookie (calendar, homepage…).
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("selectCountry")}
        title={t("selectCountry")}
        className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="max-w-[5.5rem] truncate">{selected.name}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn("transition-transform", open && "rotate-180")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("selectCountry")}
          className="absolute end-0 top-full z-[90] mt-2 max-h-80 w-56 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-lift"
        >
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              role="option"
              aria-selected={c.code === current}
              onClick={() => select(c.code)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-start text-sm transition-colors",
                c.code === current
                  ? "bg-leaf-100 dark:bg-leaf-950 font-semibold text-leaf-800 dark:text-leaf-300"
                  : "text-ink-soft hover:bg-surface-2 hover:text-ink"
              )}
            >
              <span className="block leading-tight">{c.name}</span>
              {c.code === current && (
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
