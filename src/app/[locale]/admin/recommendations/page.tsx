import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable, StatusBadge, FilterTabs } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deleteRecommendation } from "@/server/actions/admin";

const ONE_YEAR_AGO = () => new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

function npkLabel(r: { n: number | null; p2o5: number | null; k2o: number | null }): string {
  const f = (v: number | null) => (v === null ? "–" : String(v));
  return `${f(r.n)}–${f(r.p2o5)}–${f(r.k2o)}`;
}

export default async function RecommendationsAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { locale } = await params;
  const { filter = "all" } = await searchParams;
  setRequestLocale(locale);

  const where: any = {};
  if (["draft", "under_review", "verified", "published"].includes(filter)) {
    where.verificationStatus = filter;
  } else if (filter === "needs_review") {
    where.OR = [{ lastReviewed: null }, { lastReviewed: { lt: ONE_YEAR_AGO() } }];
  }

  const rows = isDbConfigured()
    ? await db.fertilizerRecommendation
        .findMany({
          where,
          include: { item: true, country: true, region: true, source: true },
          orderBy: { createdAt: "desc" },
        })
        .catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="Fertilizer recommendations" actionHref="/admin/recommendations/new" actionLabel="+ New recommendation" />
      <FilterTabs base="/admin/recommendations" current={filter} />
      <AdminTable
        columns={["Crop", "Country / Region", "N–P₂O₅–K₂O (kg/ha)", "Source", "Status"]}
        rows={rows.map((r) => ({
          id: r.id,
          cells: [
            <span key="i" className="font-semibold">{r.item.name}</span>,
            <span key="c">{r.country.name}{r.region ? ` · ${r.region.name}` : " · all regions"}</span>,
            <span key="n" className="font-mono text-[13px]">{npkLabel(r)}</span>,
            <span key="s" className="text-[13px]">{r.source.organization}</span>,
            <span key="v"><StatusBadge status={r.verificationStatus} /></span>,
          ],
        }))}
        editBase="/admin/recommendations"
        onDelete={deleteRecommendation}
      />
    </div>
  );
}
