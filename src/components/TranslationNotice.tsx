"use client";

import Link from "next/link";
import { useState } from "react";

const KEY = "fd-translation-notice-dismissed";

function initiallyVisible(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !window.localStorage.getItem(KEY);
  } catch {
    return true;
  }
}

/**
 * Shown on non-English locales only. The 17 non-English locales are
 * machine-translated drafts (professional review pending, pages noindexed).
 * This honest banner tells the reader exactly that.
 */
export function TranslationNotice() {
  const [visible, setVisible] = useState(initiallyVisible);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* storage unavailable — just hide for this visit */
    }
    setVisible(false);
  };

  return (
    <div
      role="note"
      className="border-b border-harvest-200 bg-harvest-50 px-4 py-2 text-center text-xs text-harvest-900 dark:border-harvest-800 dark:bg-harvest-950/40 dark:text-harvest-200"
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
        className="ml-3 rounded px-1.5 py-0.5 font-semibold hover:bg-harvest-100 dark:hover:bg-harvest-900"
      >
        ✕
      </button>
    </div>
  );
}
