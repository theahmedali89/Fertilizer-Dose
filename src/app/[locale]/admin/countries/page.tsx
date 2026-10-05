import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable, StatusBadge } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deleteCountry } from "@/server/actions/admin";

export default async function CountriesAdmin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const rows = isDbConfigured()
    ? await db.country
        .findMany({
          orderBy: { name: "asc" },
          include: {
            _count: { select: { regions: true, recommendations: true, seasons: true } },
          },
        })
        .catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="Countries" actionHref="/admin/countries/new" actionLabel="+ New country" />
      <AdminTable
        columns={["Name", "Code", "Regions", "Recommendations", "Status"]}
        rows={rows.map((c) => ({
          id: c.id,
          cells: [
            <span key="n" className="font-semibold">{c.name}</span>,
            <span key="c" className="font-mono text-[13px]">{c.code}</span>,
            <span key="r">{c._count.regions}</span>,
            <span key="rec">{c._count.recommendations}</span>,
            <span key="s"><StatusBadge status={c.status === "active" ? "published" : "draft"} /></span>,
          ],
        }))}
        editBase="/admin/countries"
        onDelete={deleteCountry}
        deleteLabel="Delete"
      />
      <p className="mt-4 text-xs text-ink-faint leading-relaxed max-w-2xl">
        A country with linked regions, recommendations or seasons cannot be deleted.
        Deactivate it instead.
      </p>
    </div>
  );
}
