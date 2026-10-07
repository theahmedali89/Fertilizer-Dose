/**
 * MapView — lazy-loaded Leaflet map for the Map Area Calculator.
 *
 * Loaded ONLY when the user opens map mode (next/dynamic ssr:false from
 * MapAreaTool), so the Leaflet bundle + CSS never touch the initial page
 * load. Free tiles: OpenStreetMap standard layer (attribution required by
 * the ODbL — rendered on the map, never hidden).
 *
 * No Google Maps anywhere: no API keys, no billing, no affiliation.
 */
"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  sphericalPolygonAreaSqM,
  polygonPerimeterM,
  type LatLon,
} from "@/lib/geoArea";
import { formatArea, equivalentAreas } from "@/lib/landArea";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

interface MapViewProps {
  country: string;
  onArea: (sqm: number | null, points: LatLon[]) => void;
}

export function MapView({ country, onArea }: MapViewProps) {
  const t = useTranslations("mapArea");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const LRef = useRef<any>(null);
  const [points, setPoints] = useState<LatLon[]>([]);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const pointsRef = useRef<LatLon[]>([]);
  const onAreaRef = useRef(onArea);
  useEffect(() => {
    onAreaRef.current = onArea;
  });

  // ── Init map (Leaflet loads here, lazily, client-only) ──────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        center: [30.3753, 69.3451], // South Asia default view
        zoom: 5,
        worldCopyJump: true,
      });
      L.tileLayer(OSM_TILES, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      // Tap/click places a boundary point (touch-friendly).
      map.on("click", (e: any) => {
        const p: LatLon = {
          lat: Math.round(e.latlng.lat * 1e6) / 1e6,
          lon: Math.round(e.latlng.lng * 1e6) / 1e6,
        };
        pointsRef.current = [...pointsRef.current, p];
        setPoints(pointsRef.current);
      });

      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ── Re-render markers + polygon whenever points change ───────────────
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }
    markersRef.current = [];
    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;

    // Draggable dot markers (divIcon — no image assets needed).
    const dotIcon = L.divIcon({
      className: "map-point-dot",
      html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#15803d;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);cursor:grab;"></span>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    points.forEach((p, i) => {
      const m = L.marker([p.lat, p.lon], { icon: dotIcon, draggable: true })
        .addTo(layer)
        .bindTooltip(`${i + 1}`, {
          permanent: false,
          direction: "top",
          offset: [0, -10],
        });
      m.on("dragend", () => {
        const ll = m.getLatLng();
        const next = [...pointsRef.current];
        next[i] = {
          lat: Math.round(ll.lat * 1e6) / 1e6,
          lon: Math.round(ll.lng * 1e6) / 1e6,
        };
        pointsRef.current = next;
        setPoints(next);
      });
      markersRef.current.push(m);
    });

    if (points.length >= 3) {
      L.polygon(
        points.map((p) => [p.lat, p.lon]),
        { color: "#15803d", weight: 2, fillOpacity: 0.18 }
      ).addTo(layer);
    } else if (points.length === 2) {
      L.polyline(
        points.map((p) => [p.lat, p.lon]),
        { color: "#15803d", weight: 2, dashArray: "6 6" }
      ).addTo(layer);
    }

    const sqm = sphericalPolygonAreaSqM(points);
    onAreaRef.current(sqm, points);
  }, [points]);

  const undoPoint = () => {
    const next = pointsRef.current.slice(0, -1);
    pointsRef.current = next;
    setPoints(next);
  };

  const clearAll = () => {
    pointsRef.current = [];
    setPoints([]);
  };

  const removePoint = (index: number) => {
    const next = pointsRef.current.filter((_, i) => i !== index);
    pointsRef.current = next;
    setPoints(next);
  };

  const locate = () => {
    if (!navigator.geolocation || !mapRef.current) {
      setGeoError(true);
      return;
    }
    setLocating(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        // Center ONLY — the user's location never becomes a boundary point.
        mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 16);
      },
      () => {
        setLocating(false);
        setGeoError(true);
      },
      { timeout: 10000 }
    );
  };

  const sqm = sphericalPolygonAreaSqM(points);
  const perimeter = polygonPerimeterM(points);
  const equivalents = sqm !== null ? equivalentAreas(sqm, country) : [];

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative z-0 h-[380px] sm:h-[480px] w-full overflow-hidden rounded-2xl border border-line bg-surface-2"
        role="application"
        aria-label={t("mapAriaLabel")}
      >
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-ink-soft">{t("loadingMap")}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={undoPoint}
          disabled={points.length === 0}
        >
          {t("undoPoint")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={clearAll}
          disabled={points.length === 0}
        >
          {t("clearAll")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={locate}
          disabled={locating}
        >
          {locating ? t("locating") : t("myLocation")}
        </Button>
        <span className="ms-auto self-center text-xs text-ink-faint">
          {t("pointsCount", { count: points.length })}
        </span>
      </div>

      {geoError && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-line bg-surface-2/70 px-4 py-2.5 text-sm text-ink-soft"
        >
          <p>{t("geoDenied")}</p>
          <button
            type="button"
            onClick={() => setGeoError(false)}
            aria-label={t("dismissHint")}
            className="shrink-0 rounded px-1.5 py-0.5 font-semibold text-ink-faint hover:bg-surface hover:text-ink"
          >
            ✕
          </button>
        </div>
      )}

      {points.length > 0 && (
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{t("boundaryPoints")}</p>
              {points.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => removePoint(i)}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs text-ink-soft hover:border-red-400 hover:text-red-700 dark:hover:text-red-400"
                  title={t("removePoint", { index: i + 1 })}
                  aria-label={t("removePoint", { index: i + 1 })}
                >
                  <span className="font-semibold">{i + 1}</span>
                  <span aria-hidden>×</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-faint">{t("tapHint")}</p>
          </CardBody>
        </Card>
      )}

      {sqm !== null && (
        <Card className="border-leaf-600/40">
          <CardBody>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-leaf-700 dark:text-leaf-400">
                {t("resultTitle")}
              </p>
              <Badge variant="neutral">{t("estimateBadge")}</Badge>
            </div>
            <p className="mt-2 font-display text-3xl font-semibold">
              {formatArea(sqm, "hectare")}{" "}
              <span className="text-lg text-ink-soft">ha</span>
            </p>
            <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {equivalents.map((e) => (
                <div
                  key={e.unitId}
                  className="rounded-lg bg-surface-2 px-3 py-2"
                >
                  <dt className="text-xs text-ink-faint">{e.unitId}</dt>
                  <dd className="font-semibold">{formatArea(e.value, e.unitId)}</dd>
                </div>
              ))}
              {perimeter !== null && (
                <div className="rounded-lg bg-surface-2 px-3 py-2">
                  <dt className="text-xs text-ink-faint">{t("perimeter")}</dt>
                  <dd className="font-semibold">
                    {perimeter >= 1000
                      ? `${(perimeter / 1000).toFixed(2)} km`
                      : `${Math.round(perimeter)} m`}
                  </dd>
                </div>
              )}
            </dl>
            <p className="mt-3 text-xs text-ink-faint leading-relaxed">
              {t("precisionNote")}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
