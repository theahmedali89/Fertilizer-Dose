import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deleteWindow } from "@/server/actions/admin";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function WindowsAdmin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const rows = isDbConfigured()
    ? await db.plantingWindow
        .findMany({ include: { item: true, region: true }, orderBy: { createdAt: "desc" } })
        .catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="Planting windows" actionHref="/admin/windows/new" actionLabel="+ New window" />
      <AdminTable
        columns={["Item", "Region", "Months", "Status"]}
        rows={rows.map((w) => ({
          id: w.id,
          cells: [
            <span key="i" className="font-semibold">{w.item.name}</span>,
            <span key="r">{w.region.name}</span>,
            <span key="m" className="font-mono text-[13px]">
              {MONTHS[w.startMonth - 1]} – {MONTHS[w.endMonth - 1]}
            </span>,
            <span key="v">{w.verificationStatus === "verified" ? "Verified" : "In review"}</span>,
          ],
        }))}
        editBase="/admin/windows"
        onDelete={deleteWindow}
      />
    </div>
  );
}
