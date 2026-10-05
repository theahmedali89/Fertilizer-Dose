import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { AdminHeader } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";

async function getCounts() {
  if (!isDbConfigured()) return null;
  try {
    const [fertilizers, growing, windows, regions, posts, faqs, users, diagnoses] = await Promise.all([
      db.fertilizer.count(),
      db.growingItem.count(),
      db.plantingWindow.count(),
      db.region.count(),
      db.post.count(),
      db.faq.count(),
      db.user.count(),
      db.diagnosis.count(),
    ]);
    return { fertilizers, growing, windows, regions, posts, faqs, users, diagnoses };
  } catch {
    return null;
  }
}

async function getCoverage() {
  if (!isDbConfigured()) return null;
  try {
    const [
      countries, regions, items, windows, recs, sources, translations,
      itemGroups, windowGroups, recGroups, sourceGroups,
    ] = await Promise.all([
      db.country.count(),
      db.region.count(),
      db.growingItem.count(),
      db.plantingWindow.count(),
      db.fertilizerRecommendation.count(),
      db.source.count(),
      db.growingItemTranslation.count(),
      db.growingItem.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
      db.plantingWindow.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
      db.fertilizerRecommendation.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
      db.source.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
    ]);
    const total = items + windows + recs + sources;
    const okCount = (
      groups: { verificationStatus: string; _count: { _all: number } }[]
    ) =>
      groups
        .filter((g) => g.verificationStatus === "verified" || g.verificationStatus === "published")
        .reduce((sum, g) => sum + g._count._all, 0);
    const ok = okCount(itemGroups) + okCount(windowGroups) + okCount(recGroups) + okCount(sourceGroups);
    return {
      countries, regions, items, windows, recs, sources, translations,
      pct: total ? Math.round((ok / total) * 100) : 0,
    };
  } catch {
    return null;
  }
}

const CARDS: { key: keyof NonNullable<Awaited<ReturnType<typeof getCounts>>>; label: string; href: string }[] = [
  { key: "fertilizers", label: "Fertilizers", href: "/admin/fertilizers" },
  { key: "growing", label: "Crops · Plants · Vegetables", href: "/admin/growing" },
  { key: "windows", label: "Planting Windows", href: "/admin/windows" },
  { key: "regions", label: "Regions", href: "/admin/regions" },
  { key: "posts", label: "Blog Posts", href: "/admin/posts" },
  { key: "faqs", label: "FAQs", href: "/admin/faqs" },
  { key: "users", label: "Users", href: "/admin/users" },
  { key: "diagnoses", label: "Plant Doctor Diagnoses", href: "/admin" },
];

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const counts = await getCounts();
  const coverage = await getCoverage();

  return (
    <div>
      <AdminHeader title="Dashboard" />
      {coverage && (
        <Card className="mb-6">
          <CardBody>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-4">
              Global data coverage
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
              {[
                { n: coverage.countries, l: "Countries" },
                { n: coverage.regions, l: "Regions" },
                { n: coverage.items, l: "Growing items" },
                { n: coverage.windows, l: "Planting windows" },
                { n: coverage.recs, l: "Recommendations" },
                { n: coverage.sources, l: "Sources" },
                { n: coverage.translations, l: "Translations" },
                { n: `${coverage.pct}%`, l: "Verified" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-2xl font-semibold text-ink">{s.n}</p>
                  <p className="text-xs font-medium text-ink-soft mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-leaf-600 dark:bg-leaf-500 transition-all"
                style={{ width: `${coverage.pct}%` }}
              />
            </div>
            <p className="text-xs text-ink-faint mt-2">
              {coverage.pct}% of verifiable records (items, windows, recommendations, sources) are verified or published. All counts are live from the database.
            </p>
          </CardBody>
        </Card>
      )}
      {!counts ? (
        <Card>
          <CardBody>
            <p className="text-sm text-ink-soft leading-relaxed">
              The database is not configured yet. Set <code className="font-mono">DATABASE_URL</code> in
              your environment, run <code className="font-mono">npx prisma migrate deploy</code> and{" "}
              <code className="font-mono">npx prisma db seed</code>, then this dashboard will show live
              content counts.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {CARDS.map((c) => (
            <Link key={c.key} href={c.href}>
              <Card className="hover:border-leaf-600 transition-colors h-full">
                <CardBody>
                  <p className="font-display text-4xl font-semibold text-leaf-700 dark:text-leaf-300">
                    {counts[c.key]}
                  </p>
                  <p className="text-sm font-medium text-ink-soft mt-1">{c.label}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
