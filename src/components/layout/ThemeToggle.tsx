"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

function subscribeTheme(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

/** Ground truth: next-themes toggles class="dark" on <html>. Reading the DOM
 *  directly avoids any resolvedTheme hydration timing mismatch. */
function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const t = useTranslations("common");
  const { setTheme } = useTheme();
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => false);
  // true on client, false during SSR — avoids icon flash without setState-in-effect
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("themeLight") : t("themeDark")}
      title={isDark ? t("themeLight") : t("themeDark")}
      className="grid place-items-center w-10 h-10 rounded-xl border border-line bg-surface text-ink-soft hover:text-ink hover:border-leaf-600 transition-colors"
    >
      {!mounted ? (
        <span className="w-4 h-4" />
      ) : isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
