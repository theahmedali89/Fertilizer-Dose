import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { deepMerge } from "@/lib/i18n-utils";

/**
 * English is the fallback: each locale's dictionary is deep-merged over
 * the complete English dictionary, so untranslated keys gracefully
 * render in English instead of crashing or showing raw keys.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const en = (await import("../messages/en.json")).default;
  let messages: Record<string, unknown> = en;

  if (locale !== "en") {
    try {
      const mod = (await import(`../messages/${locale}.json`)).default;
      messages = deepMerge(en, mod) as Record<string, unknown>;
    } catch {
      // keep English fallback
    }
  }

  return { locale, messages };
});
