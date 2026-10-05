import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { monthName } from "@/lib/planting";
import { cn } from "@/lib/utils";
import type { PlantingHit } from "@/server/country";

const ACTIVITY_BADGE: Record<PlantingHit["activityType"], string> = {
  SOW: "bg-leaf-100 text-leaf-800 dark:bg-leaf-950 dark:text-leaf-300",
  TRANSPLANT: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  PLANT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  HARVEST: "bg-harvest-100 text-harvest-800 dark:bg-harvest-950/50 dark:text-harvest-300",
  LAND_PREPARATION: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

const CATEGORY_BASE: Record<string, string> = {
  crop: "/crops",
  vegetable: "/vegetables",
  fruit: "/vegetables",
  herb: "/plants",
  flower: "/plants",
  plant: "/plants",
  garden_plant: "/plants",
  indoor_plant: "/plants",
  outdoor_plant: "/plants",
};

export interface HitCardLabels {
  activity: Record<PlantingHit["activityType"], string>;
  categoryLabel: string;
  category: (category: string) => string;
  plantingWindow: string;
  harvestWindow: string;
  appliesTo: string;
  source: string;
  lastReviewed: string;
  verified: string;
  inReview: string;
  viewGuide: string;
}

/** Server-rendered result card for one verified planting window. */
export function PlantingHitCard({
  hit,
  locale,
  labels,
}: {
  hit: PlantingHit;
  locale: string;
  labels: HitCardLabels;
}) {
  const base = CATEGORY_BASE[hit.category] ?? "/crops";
  const monthLabel =
    hit.startMonth === hit.endMonth
      ? monthName(hit.startMonth, locale)
      : `${monthName(hit.startMonth, locale)} – ${monthName(hit.endMonth, locale)}`;

  return (
    <Card className="h-full">
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">
              <Link
                href={`${base}/${hit.itemSlug}`}
                className="hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors"
              >
                {hit.itemName}
              </Link>{" "}
              {hit.itemUrdu && (
                <span className="text-sm font-sans font-normal text-ink-faint" lang="ur">
                  {hit.itemUrdu}
                </span>
              )}
            </h3>
            {hit.scientificName && (
              <p className="text-xs italic text-ink-faint mt-0.5">{hit.scientificName}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5",
                ACTIVITY_BADGE[hit.activityType]
              )}
            >
              {labels.activity[hit.activityType]}
            </span>
            {hit.verificationStatus === "verified" || hit.verificationStatus === "published" ? (
              <Badge variant="verified">{labels.verified}</Badge>
            ) : (
              <Badge variant="review">{labels.inReview}</Badge>
            )}
          </div>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-ink-faint text-[13px]">{labels.plantingWindow}</dt>
            <dd className="font-semibold capitalize">{monthLabel}</dd>
          </div>
          {hit.harvestText && (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink-faint text-[13px]">{labels.harvestWindow}</dt>
              <dd className="text-ink-soft">{hit.harvestText}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-ink-faint text-[13px]">{labels.appliesTo}</dt>
            <dd className="text-ink-soft">
              {hit.regionName}, {hit.countryName}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-ink-faint text-[13px]">{labels.categoryLabel}</dt>
            <dd className="text-ink-soft capitalize">{labels.category(hit.category)}</dd>
          </div>
        </dl>

        {hit.notes && <p className="mt-3 text-sm text-ink-soft">{hit.notes}</p>}

        <div className="mt-4 pt-3 border-t border-line text-xs text-ink-faint leading-relaxed">
          <p>
            {labels.source}: {hit.sourceOrg} — {hit.sourceTitle}
          </p>
          {hit.lastReviewed && (
            <p className="mt-0.5">
              {labels.lastReviewed}: {hit.lastReviewed}
            </p>
          )}
        </div>

        <Link
          href={`${base}/${hit.itemSlug}`}
          className="mt-3 inline-block text-xs font-semibold text-leaf-700 dark:text-leaf-300 hover:underline"
        >
          {labels.viewGuide} →
        </Link>
      </CardBody>
    </Card>
  );
}
