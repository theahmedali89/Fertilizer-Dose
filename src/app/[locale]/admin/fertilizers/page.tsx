import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deleteFertilizer } from "@/server/actions/admin";

export default async function FertilizersAdmin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const rows = isDbConfigured()
    ? await db.fertilizer.findMany({ orderBy: { name: "asc" } }).catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="Fertilizers" actionHref="/admin/fertilizers/new" actionLabel="+ New fertilizer" />
      <AdminTable
        columns={["Name", "NPK", "Slug", "Published"]}
        rows={rows.map((f) => ({
          id: f.id,
          cells: [
            <span key="n" className="font-semibold">{f.name}</span>,
            <span key="npk" className="font-mono text-[13px]">{f.n}–{f.p}–{f.k}</span>,
            <span key="s" className="font-mono text-[13px] text-ink-faint">{f.slug}</span>,
            <span key="p">{f.published ? "Yes" : "No"}</span>,
          ],
        }))}
        editBase="/admin/fertilizers"
        onDelete={deleteFertilizer}
      />
    </div>
  );
}
