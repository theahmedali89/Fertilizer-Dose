"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { TRANSLATION_NOTICE_TEXT } from "@/lib/translation-notice-text";

const KEY = "fd-translation-notice-dismissed";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

// English fallback when the locale has no translated notice text yet.
const ENGLISH_NOTICE = {
  notice:
    "This page is automatically translated and under review — the English version is the most accurate.",
  readEnglish: "Read in English",
  dismiss: "Dismiss translation notice",
};

/**
 * Shown on non-English locales only. Non-English pages are
 * machine-translated drafts (professional review pending).
 * This honest banner tells the reader exactly that.
 *
 * The banner text itself is translated per locale (AI draft, same
 * status as the page translations); English is the fallback.
 *
 * Rendered client-side after mount (useSyncExternalStore) so SSR HTML
 * matches hydration output — no mismatch flash.
 */
export function TranslationNotice({ locale }: { locale: string }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const [dismissed, setDismissed] = useState(readDismissed);

  if (!mounted || dismissed) return null;

  const text = TRANSLATION_NOTICE_TEXT[locale] ?? ENGLISH_NOTICE;

  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* storage unavailable — just hide for this visit */
    }
    setDismissed(true);
  };

  return (
    <div
      role="note"
      className="border-b border-line bg-surface-2/70 px-4 py-1.5 text-center text-[11px] text-ink-soft dark:bg-surface-2/40"
    >
      <span>
        {text.notice}{" "}
        <Link href="/" className="font-semibold underline underline-offset-2">
          {text.readEnglish}
        </Link>
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label={text.dismiss}
        className="ml-2 rounded px-1 py-0.5 font-semibold text-ink-faint hover:bg-surface hover:text-ink"
      >
        ✕
      </button>
    </div>
  );
}
