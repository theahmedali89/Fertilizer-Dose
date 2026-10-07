/**
 * MapAreaTool — entry point for the Map Area Calculator.
 *
 * The Leaflet bundle (~150 KB + tiles) loads ONLY after the user clicks
 * "Start measuring" (next/dynamic with ssr:false → MapView). Nothing
 * map-related touches the initial page load.
 */
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Select } from "@/components/ui/fields";
import type { LatLon } from "@/lib/geoArea";

const MapView = dynamic(
  () => import("./MapView").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <p className="py-16 text-center text-sm text-ink-soft">…</p>
    ),
  }
);

const COUNTRIES = [
  "PK", "IN", "BD", "CN", "US", "BR", "ID", "TR",
  "MY", "JP", "KR", "ES", "FR", "DE", "IT", "PL", "RU", "AU",
  "INTL",
];

export function MapAreaTool() {
  const t = useTranslations("mapArea");
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [country, setCountry] = useState("PK");
  const [sqm, setSqm] = useState<number | null>(null);

  const handleArea = (value: number | null) => {
    setSqm(value);
  };

  const useThisArea = () => {
    if (sqm === null || sqm <= 0) return;
    // Transfer the measured area (canonical m²) into the land-area tool,
    // which onward-links to the fertilizer / profit calculators.
    // Boundaries are never transferred — coordinates stay on this device.
    const rounded = Math.round(sqm * 100) / 100;
    router.push(`/land-area-calculator?area=${rounded}&unit=sqm`);
  };

  if (!opened) {
    return (
      <Card>
        <CardBody className="py-10 text-center">
          <p className="mx-auto max-w-xl text-ink-soft leading-relaxed">
            {t("gateDescription")}
          </p>
          <div className="mx-auto mt-4 max-w-xs">
            <Field label={t("countryLabel")}>
              <Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`countries.${c}`)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button
            type="button"
            size="lg"
            className="mt-6"
            onClick={() => setOpened(true)}
          >
            {t("openMap")}
          </Button>
          <p className="mt-3 text-xs text-ink-faint">{t("freeNote")}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-48">
          <Field label={t("countryLabel")}>
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {t(`countries.${c}`)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <p className="text-xs text-ink-faint max-w-md">{t("countryHint")}</p>
      </div>

      <MapView country={country} onArea={handleArea} />

      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto"
        disabled={sqm === null || sqm <= 0}
        onClick={useThisArea}
      >
        {t("useThisArea")}
      </Button>
      <p className="text-xs text-ink-faint">{t("privacyNote")}</p>
    </div>
  );
}
