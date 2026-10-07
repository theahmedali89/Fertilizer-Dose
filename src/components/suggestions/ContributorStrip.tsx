import { getTranslations } from "next-intl/server";
import { db, isDbConfigured } from "@/lib/db";
import { levelForCount, LEVEL_META } from "@/lib/contributors";

/**
 * "Community contributors" strip for crop/plant/vegetable detail pages.
 * SAFETY: only APPROVED suggestions surface here — pending/rejected rows
 * are never queried. Name/photo appear only because the contributor opted in
 * and an admin approved their suggestion.
 */
export async function ContributorStrip({ cropSlug }: { cropSlug: string }) {
  if (!isDbConfigured()) return null;

  const rows = await db.userSuggestion
    .findMany({
      where: {
        cropSlug,
        status: "APPROVED",
        type: { in: ["DATA_CORRECTION", "DATA_REQUEST"] },
        contributorName: { not: null },
      },
      select: { contributorName: true, contributorImage: true, contributorToken: true },
    })
    .catch(() => []);

  if (rows.length === 0) return null;

  // De-dupe by token (fallback: name), preferring rows that carry a photo.
  const byKey = new Map<string, { name: string; image: string | null; token: string | null }>();
  for (const r of rows) {
    const name = (r.contributorName ?? "").trim();
    if (!name) continue;
    const key = r.contributorToken?.trim() || `name:${name.toLowerCase()}`;
    const cur = byKey.get(key);
    if (!cur || (!cur.image && r.contributorImage)) {
      byKey.set(key, { name, image: r.contributorImage, token: r.contributorToken });
    }
  }
  if (byKey.size === 0) return null;

  // Badge levels from the Contributor aggregate (approved counts).
  const tokens = [...byKey.values()].map((c) => c.token).filter((t): t is string => !!t);
  const contributors = tokens.length
    ? await db.contributor.findMany({ where: { token: { in: tokens } }, select: { token: true, approvedCount: true } }).catch(() => [])
    : [];
  const countByToken = new Map(contributors.map((c) => [c.token, c.approvedCount]));

  const t = await getTranslations("contributors");
  const BADGE_KEY = {
    contributor: "badgeContributor",
    trusted: "badgeTrusted",
    expert: "badgeExpert",
  } as const;
  const people = [...byKey.values()].map((p) => {
    const count = p.token ? countByToken.get(p.token) ?? 1 : 1;
    const level = levelForCount(count);
    return { ...p, level };
  });

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface-2/50 p-4">
      <p className="text-sm font-semibold mb-1">{t("communityContributors")}</p>
      <p className="text-xs text-ink-faint mb-3">{t("communityContributorsHint")}</p>
      <div className="flex flex-wrap gap-4">
        {people.map((p, i) => (
          <div key={`${p.name}-${i}`} className="flex items-center gap-2.5">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="h-10 w-10 rounded-full object-cover border border-line bg-surface"
              />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-lg" aria-hidden>
                👤
              </span>
            )}
            <div className="leading-tight">
              <p className="text-sm font-semibold">{p.name}</p>
              {p.level !== "none" && (
                <p className="text-xs text-ink-faint">
                  {LEVEL_META[p.level].emoji} {t(BADGE_KEY[p.level])}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
