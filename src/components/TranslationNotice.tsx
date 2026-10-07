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
