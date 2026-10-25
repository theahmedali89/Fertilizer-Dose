"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { ApplicationTimeline } from "@/components/crop/ApplicationTimeline";
import { readCountryCookie } from "@/lib/countryCookies";
import type { TimelineStage } from "@/lib/timeline-parse";

function noopSubscribe() {
  return () => {};
}

/**
 * Fertilizer application timeline for a crop detail page — client half.
 *
 * The visitor's country lives in the FD_COUNTRY cookie, which only exists
 * in the browser. Reading it here (instead of cookies() on the server)
 * keeps the crop page statically prerendered: the server-side cookie read
 * previously crashed non-English pigeon-pea pages with Next.js "Page
 * changed from static to dynamic at runtime, reason: cookies"
 * (2026-10-25). Same pattern as GrowThisMonthClient / CountrySelectorClient.
 *
 * Renders nothing while loading and nothing when the crop has no timeline
 * stages for the visitor's country (PK fallback when no cookie is set) —
 * exactly like the old server-rendered section, which was conditional on
 * stages.length > 0.
 */
export function CropTimeline({ slug, title }: { slug: string; title: string }) {
  const cookieCountry = useSyncExternalStore(
    noopSubscribe,
    readCountryCookie,
    () => null
  );
  const [stages, setStages] = useState<TimelineStage[] | null>(null);

  useEffect(() => {
    const country = cookieCountry ?? "PK";
    let cancelled = false;
    fetch(
      `/api/crops/timeline?slug=${encodeURIComponent(slug)}&country=${country}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setStages(Array.isArray(d?.stages) ? d.stages : []);
        }
      })
      .catch(() => {
        if (!cancelled) setStages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, cookieCountry]);

  if (!stages || stages.length === 0) return null;

  return (
    <Card>
      <CardBody>
        <h2 className="font-display text-xl font-semibold mb-4">{title}</h2>
        <ApplicationTimeline stages={stages} />
      </CardBody>
    </Card>
  );
}
