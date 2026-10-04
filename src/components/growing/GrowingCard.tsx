import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { GrowingItem } from "@/lib/growing";

const BASE_PATH: Record<GrowingItem["category"], string> = {
  crop: "/crops",
  plant: "/plants",
  vegetable: "/vegetables",
};

export function GrowingCard({
  item,
  verifiedLabel,
  inReviewLabel,
}: {
  item: GrowingItem;
  verifiedLabel: string;
  inReviewLabel: string;
}) {
  const hasNpk = !!item.npk;
  return (
    <Link href={`${BASE_PATH[item.category]}/${item.slug}`} className="group">
      <Card className="h-full transition-all duration-200 group-hover:shadow-lift group-hover:-translate-y-0.5">
        <CardBody>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-xl font-semibold group-hover:text-leaf-700 dark:group-hover:text-leaf-300 transition-colors">
              {item.name}{" "}
              {item.urdu && (
                <span className="text-sm font-sans font-normal text-ink-faint" lang="ur">
                  {item.urdu}
                </span>
              )}
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
          {(item.season || item.region) && (
            <p className="text-sm text-ink-faint mt-1">
              {[item.season, item.region].filter(Boolean).join(" · ")}
            </p>
          )}
          {item.seasonDetail && (
            <p className="mt-3 text-sm text-ink-soft leading-relaxed line-clamp-2">
              {item.seasonDetail}
            </p>
          )}
          {hasNpk && item.npk && (
            <p className="mt-3 font-mono text-sm">
              N <b>{item.npk.n}</b> · P₂O₅ <b>{item.npk.p}</b> · K₂O <b>{item.npk.k}</b>{" "}
              <span className="text-ink-faint font-sans">kg/ha</span>
            </p>
          )}
        </CardBody>
      </Card>
    </Link>
  );
}
