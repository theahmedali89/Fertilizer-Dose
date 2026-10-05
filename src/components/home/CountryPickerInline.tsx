"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  COUNTRY_COOKIE,
  COUNTRY_COOKIE_MAX_AGE,
} from "@/lib/countryCookies";
import type { CountryInfo } from "@/server/country";

function setCountryCookie(code: string) {
  document.cookie = `${COUNTRY_COOKIE}=${code}; path=/; max-age=${COUNTRY_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Inline country picker shown on the homepage when no country is selected yet. */
export function CountryPickerInline({ countries }: { countries: CountryInfo[] }) {
  const t = useTranslations("home");
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (code: string) => {
    setCountryCookie(code);
    setPicked(code);
    router.refresh();
  };

  return (
    <Card>
      <CardBody className="p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold">{t("planting.noCountryTitle")}</h3>
        <p className="mt-2 text-sm text-ink-soft leading-relaxed max-w-xl">
          {t("planting.noCountryDesc")}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => choose(c.code)}
              aria-pressed={picked === c.code}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                picked === c.code
                  ? "border-leaf-700 bg-leaf-700 text-white dark:border-leaf-500 dark:bg-leaf-600"
                  : "border-line text-ink-soft hover:border-leaf-600 hover:text-ink"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
