"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

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

/**
 * Shown on non-English locales only. The 17 non-English locales are
 * machine-translated drafts (professional review pending).
 * This honest banner tells the reader exactly that.
 *
 * Rendered client-side after mount (useSyncExternalStore) so SSR HTML
 * matches hydration output — no mismatch flash.
 */
export function TranslationNotice() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const [dismissed, setDismissed] = useState(readDismissed);

  if (!mounted || dismissed) return null;

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
        This page is automatically translated and under review — the English
        version is the most accurate.{" "}
        <Link href="/" className="font-semibold underline underline-offset-2">
          Read in English
        </Link>
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss translation notice"
        className="ml-2 rounded px-1 py-0.5 font-semibold text-ink-faint hover:bg-surface hover:text-ink"
      >
        ✕
      </button>
    </div>
  );
}
