"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useGarden, type AreaUnit } from "@/hooks/useGarden";

/** Saves a dose-calculator result into the My Garden store (localStorage). */
export function SaveCalcButton({
  cropSlug,
  area,
  unit,
  products,
}: {
  cropSlug: string;
  area: number;
  unit: string;
  products: { product: string; kg: number }[];
}) {
  const t = useTranslations("garden");
  const { addCalculation } = useGarden();
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-leaf-700 dark:text-leaf-300">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {t("savedToGarden")}
        {" · "}
        <Link href="/my-garden" className="underline underline-offset-2">
          {t("viewGarden")}
        </Link>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        addCalculation({
          cropSlug,
          area,
          unit: unit as AreaUnit,
          products: products.map((p) => ({ product: p.product, kg: p.kg })),
          notes: null,
        });
        setSaved(true);
      }}
      className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3.5 py-2 text-sm font-semibold text-ink-soft hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="M17 21v-8H7v8M7 3v5h8" />
      </svg>
      {t("saveCalculation")}
    </button>
  );
}
