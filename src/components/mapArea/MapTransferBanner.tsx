/**
 * MapTransferBanner — shown on /land-area-calculator when arriving from the
 * Map Area Calculator (?area=<sqm>&unit=sqm).
 *
 * The measured area is displayed with onward transfer buttons (fertilizer /
 * profit calculators). No coordinates are ever transferred — only the area
 * number, which is not location-sensitive.
 */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { formatArea } from "@/lib/landArea";

export function MapTransferBanner() {
  const t = useTranslations("mapArea");
  const router = useRouter();
  const sp = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const raw = sp.get("area");
  const unit = sp.get("unit");
  const sqm = raw !== null && unit === "sqm" ? parseFloat(raw) : NaN;
  if (dismissed || !Number.isFinite(sqm) || sqm <= 0 || sqm > 1e10) return null;

  const rounded = Math.round(sqm * 100) / 100;
  const go = (path: string) =>
    router.push(`${path}?area=${rounded}&unit=sqm`);

  return (
    <Card className="border-leaf-600/40 mb-6">
      <CardBody>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t("bannerTitle")}</p>
            <p className="mt-0.5 text-lg font-display font-semibold">
              {formatArea(sqm, "hectare")} ha
              <span className="ms-2 text-sm font-normal text-ink-soft">
                ({formatArea(sqm, "acre")} ac · {formatArea(sqm, "sqm")} m²)
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => go("/calculator")}>
              {t("bannerFertilizer")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => go("/profit-calculator")}
            >
              {t("bannerProfit")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setDismissed(true)}
            >
              {t("bannerDismiss")}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
