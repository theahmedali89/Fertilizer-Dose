"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { FertilizerInfo } from "@/lib/agronomy";

type Tab = "all" | "mineral" | "organic";

function NpkLine({ f }: { f: FertilizerInfo }) {
  const t = useTranslations("fertilizers");
  if (f.fertilizerType === "organic") {
    const range = (lo: number | null, hi: number | null) =>
      lo != null && hi != null ? `${lo}–${hi}%` : "—";
    return (
      <>
        <p className="mt-2 font-mono text-sm">
          <span className="text-ink-faint">N</span> {range(f.nMin, f.nMax)} ·{" "}
          <span className="text-ink-faint">P₂O₅</span> {range(f.pMin, f.pMax)} ·{" "}
          <span className="text-ink-faint">K₂O</span> {range(f.kMin, f.kMax)}
        </p>
        <p className="mt-1 text-xs text-ink-faint">{t("typicalRangeLabel")}</p>
      </>
    );
  }
  return (
    <p className="mt-2 font-mono text-sm">
      <span className="text-ink-faint">N</span> {f.n} ·{" "}
      <span className="text-ink-faint">P₂O₅</span> {f.p} ·{" "}
      <span className="text-ink-faint">K₂O</span> {f.k}
    </p>
  );
}

export function FertilizerLibrary({ fertilizers }: { fertilizers: FertilizerInfo[] }) {
  const t = useTranslations("fertilizers");
  const [tab, setTab] = useState<Tab>("all");

  const minerals = fertilizers.filter((f) => f.fertilizerType !== "organic");
  const organics = fertilizers.filter((f) => f.fertilizerType === "organic");
  const shown = tab === "all" ? fertilizers : tab === "mineral" ? minerals : organics;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: t("tabAll"), count: fertilizers.length },
    { key: "mineral", label: t("tabMineral"), count: minerals.length },
    { key: "organic", label: t("tabOrganic"), count: organics.length },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-6" role="tablist" aria-label={t("libraryTitle")}>
        {tabs.map((tb) => (
          <button
            key={tb.key}
            role="tab"
            aria-selected={tab === tb.key}
            onClick={() => setTab(tb.key)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              tab === tb.key
                ? "bg-leaf-700 dark:bg-leaf-600 text-white"
                : "border border-line text-ink-soft hover:border-leaf-600"
            }`}
          >
            {tb.label} <span className="opacity-70 font-normal">({tb.count})</span>
          </button>
        ))}
      </div>

      {tab === "organic" && (
        <div className="mb-6 rounded-2xl border border-leaf-200 dark:border-leaf-800 bg-leaf-50 dark:bg-leaf-950/40 px-5 py-4">
          <p className="text-sm text-ink-soft leading-relaxed">
            <Link href="/fertilizers/organic" className="font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
              {t("organicHubCta")}
            </Link>
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {shown.map((f) => (
          <Link key={f.slug} href={`/fertilizers/${f.slug}`} className="group">
            <Card className="h-full transition-all duration-200 group-hover:shadow-lift group-hover:-translate-y-0.5">
              <CardBody>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge>{f.fertilizerType === "organic" ? t("typeOrganic") : t("typeMineral")}</Badge>
                </div>
                <h2 className="font-display text-xl font-semibold group-hover:text-leaf-700 dark:group-hover:text-leaf-300 transition-colors">
                  {f.name}{" "}
                  <span className="text-sm font-sans font-normal text-ink-faint" lang="ur">{f.urdu}</span>
                </h2>
                <NpkLine f={f} />
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">{f.tagline}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
