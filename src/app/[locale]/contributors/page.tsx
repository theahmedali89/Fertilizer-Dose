import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { localizedMetadata } from "@/lib/seo";
import { db, isDbConfigured } from "@/lib/db";
import { levelForCount, LEVEL_META, type ContributorLevel } from "@/lib/contributors";
import { MyBadge } from "./MyBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contributors" });
  return localizedMetadata({
    locale,
    path: "/contributors",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

const BADGE_KEY: Record<Exclude<ContributorLevel, "none">, string> = {
  contributor: "badgeContributor",
  trusted: "badgeTrusted",
  expert: "badgeExpert",
};

export default async function ContributorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contributors");

  const leaders = isDbConfigured()
    ? await db.contributor
        .findMany({
          where: { approvedCount: { gt: 0 } },
          orderBy: [{ approvedCount: "desc" }, { updatedAt: "desc" }],
          take: 50,
          select: { name: true, imageUrl: true, approvedCount: true },
        })
        .catch(() => [])
    : [];

  return (
    <Section>
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold">{t("title")}</h1>
        <p className="mt-3 text-ink-soft leading-relaxed">{t("subtitle")}</p>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <Card>
          <CardBody>
            <h2 className="font-display text-xl font-semibold mb-4">{t("leaderboardTitle")}</h2>
            {leaders.length === 0 ? (
              <p className="text-sm text-ink-soft leading-relaxed">{t("empty")}</p>
            ) : (
              <ol className="divide-y divide-line">
                {leaders.map((c, i) => {
                  const level = levelForCount(c.approvedCount);
                  return (
                    <li key={`${c.name}-${i}`} className="flex items-center gap-4 py-3.5">
                      <span className="w-7 text-center font-display text-lg font-semibold text-ink-faint">
                        {i + 1}
                      </span>
                      {c.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.imageUrl}
                          alt={c.name ?? ""}
                          loading="lazy"
                          className="h-12 w-12 rounded-full object-cover border border-line bg-surface-2"
                        />
                      ) : (
                        <span className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface-2 text-2xl" aria-hidden>
                          👤
                        </span>
                      )}
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="font-semibold truncate">{c.name ?? "—"}</p>
                        {level !== "none" && (
                          <p className="text-xs text-ink-faint">
                            {LEVEL_META[level].emoji} {t(BADGE_KEY[level])}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-ink-soft whitespace-nowrap">
                        {c.approvedCount}{" "}
                        {c.approvedCount === 1 ? t("approvedSuggestionOne") : t("approvedSuggestions")}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <MyBadge />
          <Card>
            <CardBody>
              <h2 className="font-display text-lg font-semibold mb-2">{t("howItWorks")}</h2>
              <p className="text-sm text-ink-soft leading-relaxed">{t("howItWorksBody")}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                <li>🌱 {t("badgeContributor")} — {t("badgeContributorDesc")}</li>
                <li>🌾 {t("badgeTrusted")} — {t("badgeTrustedDesc")}</li>
                <li>🏅 {t("badgeExpert")} — {t("badgeExpertDesc")}</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </Section>
  );
}
