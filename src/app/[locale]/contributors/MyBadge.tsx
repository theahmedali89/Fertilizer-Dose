"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LEVEL_META } from "@/lib/contributors";

type Me = {
  name: string | null;
  imageUrl: string | null;
  approvedCount: number;
  level: "none" | "contributor" | "trusted" | "expert";
} | null;

const BADGE_KEY = {
  contributor: "badgeContributor",
  trusted: "badgeTrusted",
  expert: "badgeExpert",
} as const;

/**
 * "My badge" widget — reads the anonymous contributor token from this
 * browser's localStorage (no login) and shows the earned badge.
 * Agri Experts (20+ approvals) get a printable certificate.
 */
export function MyBadge() {
  const t = useTranslations("contributors");
  const [me, setMe] = useState<Me | "loading">("loading");
  const [showCert, setShowCert] = useState(false);
  // Token read lazily once (initializer, not an effect — avoids set-state-in-effect).
  const [token] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem("fd-contributor-token");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!token) {
      // No token yet — resolve after mount via microtask to keep the
      // effect async (lint: no synchronous setState in effects).
      Promise.resolve().then(() => setMe(null));
      return;
    }
    let cancelled = false;
    fetch(`/api/contributors/me?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((b) => {
        if (!cancelled) setMe(b.contributor ?? null);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Card>
      <CardBody>
        <h2 className="font-display text-lg font-semibold mb-1">{t("myBadge")}</h2>
        <p className="text-xs text-ink-faint mb-3">{t("myBadgeHint")}</p>

        {me === "loading" ? (
          <p className="text-sm text-ink-faint">…</p>
        ) : !me || me.level === "none" ? (
          <p className="text-sm text-ink-soft leading-relaxed">{t("noBadgeYet")}</p>
        ) : (
          <div className="flex items-center gap-3">
            {me.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={me.imageUrl}
                alt={me.name ?? ""}
                className="h-14 w-14 rounded-full object-cover border border-line"
              />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full border border-line bg-surface-2 text-2xl" aria-hidden>
                👤
              </span>
            )}
            <div className="leading-tight">
              <p className="font-semibold">{me.name ?? "—"}</p>
              <p className="text-sm text-ink-soft">
                {LEVEL_META[me.level].emoji} {t(BADGE_KEY[me.level])} · {me.approvedCount}{" "}
                {me.approvedCount === 1 ? t("approvedSuggestionOne") : t("approvedSuggestions")}
              </p>
            </div>
          </div>
        )}

        {me && me !== "loading" && me.level === "expert" && (
          <div className="mt-4">
            <Button type="button" onClick={() => setShowCert(true)}>
              {t("printCertificate")}
            </Button>
          </div>
        )}
      </CardBody>

      {showCert && me && me !== "loading" && me.level === "expert" && (
        <CertificateModal
          name={me.name ?? "Contributor"}
          count={me.approvedCount}
          onClose={() => setShowCert(false)}
        />
      )}
    </Card>
  );
}

function CertificateModal({
  name,
  count,
  onClose,
}: {
  name: string;
  count: number;
  onClose: () => void;
}) {
  const t = useTranslations("contributors");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4 print:static print:p-0" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] print:hidden" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-2xl rounded-2xl border-4 border-harvest-400 bg-surface p-10 text-center shadow-lift print:shadow-none print:border-2">
        <p className="text-5xl mb-4" aria-hidden>🏅</p>
        <h3 className="font-display text-2xl font-semibold">{t("certificateTitle")}</h3>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-ink-faint">
          Fertilizer Dose
        </p>
        <p className="mt-6 text-lg leading-relaxed">
          {t("certificateBody", { name, count })}
        </p>
        <p className="mt-6 font-semibold">{t("certificateLevel")}</p>
        <p className="mt-2 text-xs text-ink-faint">
          {new Date().toLocaleDateString()}
        </p>
        <div className="mt-8 flex gap-3 justify-center print:hidden">
          <Button type="button" onClick={() => window.print()}>
            {t("printCertificate")}
          </Button>
          <Button type="button" onClick={onClose} className="bg-surface-2 text-ink hover:bg-surface">
            {t("close")}
          </Button>
        </div>
      </div>
      <style>{`@media print { body * { visibility: hidden; } body [role="dialog"] * { visibility: visible; } }`}</style>
    </div>
  );
}
