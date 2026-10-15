import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { GrowingItem } from "@/lib/growing";
import { resolveNpk, hasAnyNpk, translateSeason } from "@/lib/npk-display";

const BASE_PATH: Record<GrowingItem["category"], string> = {
  crop: "/crops",
  plant: "/plants",
  vegetable: "/vegetables",
};

export function GrowingCard({
  item,
  verifiedLabel,
  inReviewLabel,
  locale,
  localName,
  noDataLabel,
  seasonLabels,
}: {
  item: GrowingItem;
  verifiedLabel: string;
  inReviewLabel: string;
  locale: string;
  /** Translated name for the active locale (null → English fallback). */
  localName?: string | null;
  /** Localized "no verified data" string for missing NPK. */
  noDataLabel: string;
  /** Locale's season-label map (growing.seasonLabels). */
  seasonLabels?: Record<string, string>;
}) {
  // Locale-aware name: current locale's translation, English fallback.
  // (Previously this hardcoded the Urdu name for every non-English locale.)
  const displayName = locale === "en" ? item.name : localName || item.name;
  const npk = resolveNpk(item);
  const showNpk = hasAnyNpk(npk);
  const seasonText = translateSeason(seasonLabels, item.season);

  return (
    <Link href={`${BASE_PATH[item.category]}/${item.slug}`} className="group">
      <Card className="h-full transition-all duration-200 group-hover:shadow-lift group-hover:-translate-y-0.5">
        <CardBody>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-xl font-semibold group-hover:text-leaf-700 dark:group-hover:text-leaf-300 transition-colors">
              {displayName}
            </h2>
            {item.verificationStatus === "verified" ? (
              <Badge variant="verified">{verifiedLabel}</Badge>
            ) : (
              <Badge variant="review">{inReviewLabel}</Badge>
            )}
          </div>
          {item.scientificName && (
            <p className="text-sm italic text-ink-faint mt-0.5">{item.scientificName}</p>
          )}
          {(seasonText || item.region) && (
            <p className="text-sm text-ink-faint mt-1">
              {[seasonText, item.region].filter(Boolean).join(" · ")}
            </p>
          )}
          {item.seasonDetail && (
            <p className="mt-3 text-sm text-ink-soft leading-relaxed line-clamp-2">
              {item.seasonDetail}
            </p>
          )}
          {showNpk ? (
            <p className="mt-3 font-mono text-sm">
              N <b>{npk.n ?? "–"}</b> · P₂O₅ <b>{npk.p ?? "–"}</b> · K₂O <b>{npk.k ?? "–"}</b>{" "}
              <span className="text-ink-faint font-sans">kg/ha</span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink-faint">{noDataLabel}</p>
          )}
        </CardBody>
      </Card>
    </Link>
  );
}
