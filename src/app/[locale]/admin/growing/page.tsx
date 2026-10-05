import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deleteGrowingItem } from "@/server/actions/admin";

export default async function GrowingAdmin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const rows = isDbConfigured()
    ? await db.growingItem.findMany({ orderBy: { name: "asc" } }).catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="Growing items" actionHref="/admin/growing/new" actionLabel="+ New item" />
      <AdminTable
        columns={["Name", "Category", "Slug", "Status"]}
        rows={rows.map((g) => ({
          id: g.id,
          cells: [
            <span key="n" className="font-semibold">{g.name}</span>,
            <span key="c" className="capitalize">{g.category}</span>,
            <span key="s" className="font-mono text-[13px] text-ink-faint">{g.slug}</span>,
            <span key="v">{g.verificationStatus === "verified" ? "Verified" : "In review"}</span>,
          ],
        }))}
        editBase="/admin/growing"
        onDelete={deleteGrowingItem}
      />
    </div>
  );
}
