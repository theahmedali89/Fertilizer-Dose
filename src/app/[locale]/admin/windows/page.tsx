import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable, StatusBadge, FilterTabs } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deleteWindow } from "@/server/actions/admin";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ACTIVITY_LABELS: Record<string, string> = {
  SOW: "Sow",
  TRANSPLANT: "Transplant",
  PLANT: "Plant",
  HARVEST: "Harvest",
  LAND_PREPARATION: "Land prep",
};

const ONE_YEAR_AGO = () => new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

export default async function WindowsAdmin({
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
  } else if (filter === "missing_source") {
    where.sources = { none: {} };
  } else if (filter === "needs_review") {
    where.OR = [{ lastReviewed: null }, { lastReviewed: { lt: ONE_YEAR_AGO() } }];
  }

  const rows = isDbConfigured()
    ? await db.plantingWindow
        .findMany({
          where,
          include: { item: true, region: true },
          orderBy: { createdAt: "desc" },
        })
        .catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="Planting windows" actionHref="/admin/windows/new" actionLabel="+ New window" />
      <FilterTabs base="/admin/windows" current={filter} />
      <AdminTable
        columns={["Item", "Region", "Activity", "Months", "Status"]}
        rows={rows.map((w) => ({
          id: w.id,
          cells: [
            <span key="i" className="font-semibold">{w.item.name}</span>,
            <span key="r">{w.region.name}</span>,
            <span key="a" className="inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
              {ACTIVITY_LABELS[w.activityType] ?? w.activityType}
            </span>,
            <span key="m" className="font-mono text-[13px]">
              {MONTHS[w.startMonth - 1]} – {MONTHS[w.endMonth - 1]}
            </span>,
            <span key="v"><StatusBadge status={w.verificationStatus} /></span>,
          ],
        }))}
        editBase="/admin/windows"
        onDelete={deleteWindow}
      />
    </div>
  );
}
