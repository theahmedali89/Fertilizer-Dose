import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deleteRegion } from "@/server/actions/admin";

export default async function RegionsAdmin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const rows = isDbConfigured()
    ? await db.region.findMany({ orderBy: { name: "asc" } }).catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="Regions" actionHref="/admin/regions/new" actionLabel="+ New region" />
      <AdminTable
        columns={["Name", "Country", "Slug"]}
        rows={rows.map((r) => ({
          id: r.id,
          cells: [
            <span key="n" className="font-semibold">{r.name}</span>,
            <span key="c" className="capitalize">{r.country}</span>,
            <span key="s" className="font-mono text-[13px] text-ink-faint">{r.slug}</span>,
          ],
        }))}
        editBase="/admin/regions"
        onDelete={deleteRegion}
      />
    </div>
  );
}
