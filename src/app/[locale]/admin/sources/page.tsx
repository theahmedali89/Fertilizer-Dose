import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deleteSource } from "@/server/actions/admin";

export default async function SourcesAdmin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const rows = isDbConfigured()
    ? await db.source.findMany({ orderBy: { createdAt: "desc" } }).catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="Sources" actionHref="/admin/sources/new" actionLabel="+ New source" />
      <AdminTable
        columns={["Organization", "Title", "Country"]}
        rows={rows.map((s) => ({
          id: s.id,
          cells: [
            <span key="o" className="font-semibold">{s.organization}</span>,
            <span key="t" className="font-medium">
              {s.title.length > 70 ? `${s.title.slice(0, 70)}…` : s.title}
            </span>,
            <span key="c">{s.country ?? "—"}</span>,
          ],
        }))}
        editBase="/admin/sources"
        onDelete={deleteSource}
      />
    </div>
  );
}
