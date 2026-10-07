"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/fields";

type Mode = "translation" | "data";

const HONEYPOT = "website"; // must stay empty; bots fill it

/**
 * "Improve this translation" / "Suggest data correction" entry point.
 * Opens a modal with the suggestion form. No login required.
 *
 * SAFETY: submissions go to the admin review queue (UserSuggestion, PENDING).
 * Nothing the user types here can change live agronomic data or translations.
 */
export function SuggestButton({
  mode,
  cropSlug,
  cropName,
  label,
  className,
}: {
  mode: Mode;
  cropSlug?: string;
  cropName?: string;
  label?: string;
  className?: string;
}) {
  const t = useTranslations("suggestions");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "text-[13px] font-medium text-leaf-700 hover:text-leaf-800 hover:underline underline-offset-2 dark:text-leaf-300 dark:hover:text-leaf-200"
        }
      >
        {label ?? (mode === "translation" ? t("improveTranslation") : t("suggestData"))}
      </button>
      {open && (
        <SuggestionModal
          mode={mode}
          cropSlug={cropSlug}
          cropName={cropName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function SuggestionModal({
  mode,
  cropSlug,
  cropName,
  onClose,
}: {
  mode: Mode;
  cropSlug?: string;
  cropName?: string;
  onClose: () => void;
}) {
  const t = useTranslations("suggestions");
  const locale = useLocale();
  const [pageUrl] = useState(() =>
    typeof window === "undefined" ? "" : window.location.href
  );
  const [dataType, setDataType] = useState<"DATA_CORRECTION" | "DATA_REQUEST">("DATA_CORRECTION");
  const [issueText, setIssueText] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (submittedText.trim().length < 3) {
      setError(t("errorTooShort"));
      return;
    }
    if (mode === "data" && dataType === "DATA_CORRECTION" && !/^https?:\/\//i.test(sourceUrl.trim())) {
      setError(t("errorSourceRequired"));
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode === "translation" ? "TRANSLATION" : dataType,
          locale: mode === "translation" ? locale : null,
          pageUrl: pageUrl || null,
          issueText: issueText.trim() || null,
          submittedText: submittedText.trim(),
          sourceUrl: sourceUrl.trim() || null,
          cropSlug: cropSlug ?? null,
          [HONEYPOT]: honeypot,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? t("errorGeneric"));
        return;
      }
      setDone(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "translation" ? t("improveTranslation") : t("suggestData")}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg rounded-2xl border border-line bg-surface shadow-lift max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h2 className="text-lg font-semibold">
            {mode === "translation" ? t("improveTranslation") : t("suggestData")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="grid place-items-center w-9 h-9 rounded-xl border border-line hover:bg-surface-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <p className="text-4xl mb-3" aria-hidden>✓</p>
            <p className="font-semibold text-lg">{t("thanks")}</p>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">{t("thanksDetail")}</p>
            <Button onClick={onClose} className="mt-5">{t("close")}</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            {mode === "data" ? (
              <>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {t("dataIntro", { crop: cropName ?? "" })}
                </p>
                <Field label={t("dataTypeLabel")}>
                  <Select value={dataType} onChange={(e) => setDataType(e.target.value as typeof dataType)}>
                    <option value="DATA_CORRECTION">{t("dataCorrection")}</option>
                    <option value="DATA_REQUEST">{t("dataRequest")}</option>
                  </Select>
                </Field>
              </>
            ) : (
              <p className="text-sm text-ink-soft leading-relaxed">{t("translationIntro")}</p>
            )}

            <Field label={t("whatsWrong")}>
              <Textarea
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
                placeholder={t("whatsWrongPlaceholder")}
                rows={2}
              />
            </Field>
            <Field label={t("yourSuggestion")}>
              <Textarea
                value={submittedText}
                onChange={(e) => setSubmittedText(e.target.value)}
                placeholder={t("yourSuggestionPlaceholder")}
                rows={4}
                required
              />
            </Field>

            {mode === "data" && (
              <Field
                label={`${t("sourceUrl")}${dataType === "DATA_CORRECTION" ? " *" : ""}`}
                hint={t("sourceHint")}
              >
                <Input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://…"
                  required={dataType === "DATA_CORRECTION"}
                />
              </Field>
            )}

            {/* Honeypot — hidden from real users */}
            <input
              type="text"
              name={HONEYPOT}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {error && (
              <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <p className="text-xs text-ink-faint leading-relaxed">{t("reviewNote")}</p>

            <div className="flex gap-3 justify-end">
              <Button type="button" onClick={onClose} className="bg-surface-2 text-ink hover:bg-surface">
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? t("sending") : t("submit")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
