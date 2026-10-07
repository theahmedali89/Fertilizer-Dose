"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/fields";
import { cn } from "@/lib/utils";

type Mode = "translation" | "data";
// UI-level submission kinds (data mode). Mapped to DB SuggestionType on submit:
// OFFICIAL -> DATA_CORRECTION, TAJURBA -> FIELD_EXPERIENCE, REQUEST -> DATA_REQUEST
type DataKind = "OFFICIAL" | "TAJURBA" | "REQUEST";

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

/**
 * "How this works" — transparency box shown at the top of the modal.
 * Compact 3-step timeline always visible; accept/reject rules + the
 * farmer-experience disclaimer behind an expander. No legalese.
 */
function HowItWorks({ dataMode }: { dataMode: boolean }) {
  const t = useTranslations("suggestions");
  const [rulesOpen, setRulesOpen] = useState(false);

  const steps = [
    { title: t("step1Title"), text: t("step1Text") },
    { title: t("step2Title"), text: t("step2Text") },
    { title: t("step3Title"), text: t("step3Approve") + " " + t("step3Reject") },
  ];

  return (
    <div className="rounded-xl border border-leaf-200 bg-leaf-50/70 p-4 dark:border-leaf-900 dark:bg-leaf-950/40">
      <p className="text-sm font-bold text-leaf-900 dark:text-leaf-200 mb-3">
        {t("howItWorksTitle")}
      </p>
      <ol className="space-y-2.5">
        {steps.map((s) => (
          <li key={s.title} className="flex gap-2.5 text-[13px] leading-relaxed">
            <span className="font-bold text-leaf-800 dark:text-leaf-300 shrink-0">
              {s.title}
            </span>
            <span className="text-ink-soft">{s.text}</span>
          </li>
        ))}
      </ol>
      {dataMode && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setRulesOpen((v) => !v)}
            aria-expanded={rulesOpen}
            className="text-[13px] font-semibold text-leaf-800 hover:underline underline-offset-2 dark:text-leaf-300"
          >
            {rulesOpen ? "−" : "+"} {t("rulesToggle")}
          </button>
          {rulesOpen && (
            <div className="mt-3 space-y-3 text-[13px] leading-relaxed">
              <div>
                <p className="font-bold text-ink mb-1">✓ {t("acceptTitle")}</p>
                <ul className="list-disc ps-5 space-y-1 text-ink-soft">
                  <li>{t("accept1")}</li>
                  <li>{t("accept2")}</li>
                  <li>{t("accept3")}</li>
                  <li>{t("accept4")}</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-ink mb-1">✕ {t("rejectTitle")}</p>
                <ul className="list-disc ps-5 space-y-1 text-ink-soft">
                  <li>{t("reject1")}</li>
                  <li>{t("reject2")}</li>
                  <li>{t("reject3")}</li>
                  <li>{t("reject4")}</li>
                </ul>
              </div>
              <div className="rounded-lg bg-harvest-50 border border-harvest-200 p-3 dark:bg-harvest-950/40 dark:border-harvest-800">
                <p className="font-bold text-harvest-900 dark:text-harvest-200 mb-1">
                  {t("tajurbaNoteTitle")}
                </p>
                <p className="text-ink-soft">{t("tajurbaNote")}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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
  const [dataKind, setDataKind] = useState<DataKind>("OFFICIAL");
  const [issueText, setIssueText] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  // Flexible source: URL or written reference (official corrections).
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceText, setSourceText] = useState("");
  // Field-experience structured fields (tajurba).
  const [district, setDistrict] = useState("");
  const [variety, setVariety] = useState("");
  const [appliedText, setAppliedText] = useState("");
  const [yieldText, setYieldText] = useState("");
  const [honeypot, setHoneypot] = useState("");
  // Contributor identity (optional) — shown publicly ONLY if approved.
  const [contributorName, setContributorName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Anonymous stable token so approved suggestions can be counted toward
  // badges without requiring login. Created once, kept in this browser.
  const [contributorToken] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      let tok = window.localStorage.getItem("fd-contributor-token");
      if (!tok) {
        tok = `c_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
        window.localStorage.setItem("fd-contributor-token", tok);
      }
      return tok;
    } catch {
      return "";
    }
  });

  const onImageChange = (f: File | null) => {
    setImageError("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (!f) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) {
      setImageError(t("imageTypeError"));
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setImageError(t("imageSizeError"));
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

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

    // Map UI kind -> DB type, and validate per-kind requirements.
    let dbType: "TRANSLATION" | "DATA_CORRECTION" | "DATA_REQUEST" | "FIELD_EXPERIENCE";
    let finalSubmittedText = submittedText.trim();
    if (mode === "translation") {
      dbType = "TRANSLATION";
    } else if (dataKind === "OFFICIAL") {
      dbType = "DATA_CORRECTION";
      if (!sourceUrl.trim() && !sourceText.trim()) {
        setError(t("errorSourceFlexRequired"));
        return;
      }
    } else if (dataKind === "TAJURBA") {
      dbType = "FIELD_EXPERIENCE";
      if (!appliedText.trim()) {
        setError(t("errorAppliedRequired"));
        return;
      }
      // Compose the free-text body from the structured fields so the admin
      // queue always has a readable summary even without opening fields.
      finalSubmittedText = [
        `Applied: ${appliedText.trim()}`,
        district.trim() && `District: ${district.trim()}`,
        variety.trim() && `Variety: ${variety.trim()}`,
        yieldText.trim() && `Yield: ${yieldText.trim()}`,
      ]
        .filter(Boolean)
        .join("\n");
    } else {
      dbType = "DATA_REQUEST";
    }

    if (finalSubmittedText.length < 3) {
      setError(t("errorTooShort"));
      return;
    }

    setSending(true);
    try {
      // Upload the photo first (if any), then attach its URL to the suggestion.
      let contributorImage: string | null = null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const up = await fetch("/api/suggestions/upload", { method: "POST", body: fd });
        const upBody = await up.json().catch(() => ({}));
        if (!up.ok || !upBody.url) {
          setError(upBody.error ?? t("imageUploadError"));
          return;
        }
        contributorImage = upBody.url;
      }
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: dbType,
          locale: mode === "translation" ? locale : null,
          pageUrl: pageUrl || null,
          issueText: issueText.trim() || null,
          submittedText: finalSubmittedText,
          sourceUrl: sourceUrl.trim() || null,
          sourceText: sourceText.trim() || null,
          district: district.trim() || null,
          variety: variety.trim() || null,
          appliedText: appliedText.trim() || null,
          yieldText: yieldText.trim() || null,
          cropSlug: cropSlug ?? null,
          contributorName: contributorName.trim() || null,
          contributorImage,
          contributorToken: contributorToken || null,
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

  const kindOptions: { v: DataKind; label: string; desc: string }[] = [
    {
      v: "OFFICIAL",
      label: t("dataTypeOfficial"),
      desc: t("accept1"),
    },
    {
      v: "TAJURBA",
      label: t("dataTypeTajurba"),
      desc: t("tajurbaNoteTitle") + " — " + t("accept4"),
    },
    {
      v: "REQUEST",
      label: t("dataTypeRequest"),
      desc: t("dataRequest"),
    },
  ];

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
            <HowItWorks dataMode={mode === "data"} />

            {mode === "data" ? (
              <>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {t("dataIntro", { crop: cropName ?? "" })}
                </p>
                <div role="radiogroup" aria-label={t("dataTypeLabel")} className="grid gap-2">
                  {kindOptions.map((o) => {
                    const active = dataKind === o.v;
                    return (
                      <label
                        key={o.v}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
                          active
                            ? "border-leaf-600 bg-leaf-50 dark:bg-leaf-950/50"
                            : "border-line hover:border-leaf-400"
                        )}
                      >
                        <input
                          type="radio"
                          name="suggestion-kind"
                          value={o.v}
                          checked={active}
                          onChange={() => setDataKind(o.v)}
                          className="mt-1 accent-leaf-700"
                        />
                        <span>
                          <span className="block text-sm font-semibold">{o.label}</span>
                          <span className="block text-xs text-ink-faint mt-0.5 leading-relaxed">
                            {o.desc}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-ink-soft leading-relaxed">{t("translationIntro")}</p>
            )}

            {/* OFFICIAL + REQUEST + TRANSLATION: free-text fields */}
            {(mode === "translation" || dataKind !== "TAJURBA") && (
              <>
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
              </>
            )}

            {/* OFFICIAL: flexible source — URL or written reference */}
            {mode === "data" && dataKind === "OFFICIAL" && (
              <>
                <Field label={t("sourceLabelFlex")} hint={t("sourceHintFlex")}>
                  <Input
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://…"
                    inputMode="url"
                  />
                </Field>
                <Field label={t("sourceTextLabel")}>
                  <Input
                    type="text"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder={t("sourcePlaceholderFlex")}
                    maxLength={1000}
                  />
                </Field>
              </>
            )}

            {/* TAJURBA: structured field-experience report */}
            {mode === "data" && dataKind === "TAJURBA" && (
              <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
                <p className="text-sm text-ink-soft leading-relaxed">{t("tajurbaIntro")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t("districtLabel")}>
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder={t("districtPlaceholder")}
                      maxLength={120}
                    />
                  </Field>
                  <Field label={t("varietyLabel")}>
                    <Input
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      placeholder={t("varietyPlaceholder")}
                      maxLength={120}
                    />
                  </Field>
                </div>
                <Field label={t("appliedLabel")}>
                  <Textarea
                    value={appliedText}
                    onChange={(e) => setAppliedText(e.target.value)}
                    placeholder={t("appliedPlaceholder")}
                    rows={3}
                    required
                  />
                </Field>
                <Field label={t("yieldLabel")}>
                  <Input
                    value={yieldText}
                    onChange={(e) => setYieldText(e.target.value)}
                    placeholder={t("yieldPlaceholder")}
                    maxLength={500}
                  />
                </Field>
              </div>
            )}

            {/* Contributor identity — optional, public only if approved */}
            <div className="rounded-xl border border-line bg-surface-2/60 p-4 space-y-3">
              <p className="text-sm font-semibold">{t("creditTitle")}</p>
              <Field label={t("yourName")}>
                <Input
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder={t("yourNamePlaceholder")}
                  maxLength={80}
                />
              </Field>
              <Field label={t("yourPhoto")} hint={t("photoHint")}>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover border border-line"
                    />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-full border border-dashed border-line text-xl text-ink-faint" aria-hidden>
                      👤
                    </span>
                  )}
                  <label className="cursor-pointer rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-2">
                    {imageFile ? t("changePhoto") : t("choosePhoto")}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {imageFile && (
                    <button
                      type="button"
                      onClick={() => onImageChange(null)}
                      className="text-sm text-ink-faint hover:text-ink underline underline-offset-2"
                    >
                      {t("removePhoto")}
                    </button>
                  )}
                </div>
                {imageError && (
                  <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-400 mt-1.5">
                    {imageError}
                  </p>
                )}
              </Field>
              <p className="text-xs text-ink-faint leading-relaxed">{t("consentNote")}</p>
            </div>

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
