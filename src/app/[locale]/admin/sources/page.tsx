import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable, StatusBadge } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deleteSource } from "@/server/actions/admin";
import { SOURCE_TYPES } from "@/lib/adminLookups";

const TYPE_LABELS = Object.fromEntries(SOURCE_TYPES.map((t) => [t.value, t.label]));

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
        columns={["Organization", "Title", "Type", "Status"]}
        rows={rows.map((s) => ({
          id: s.id,
          cells: [
            <span key="o" className="font-semibold">{s.organization}</span>,
            <span key="t" className="font-medium">
              {s.title.length > 70 ? `${s.title.slice(0, 70)}…` : s.title}
            </span>,
            <span key="ty">
              {s.sourceType ? (
                <span className="inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
                  {TYPE_LABELS[s.sourceType] ?? s.sourceType}
                </span>
              ) : (
                <span className="text-ink-faint">—</span>
              )}
            </span>,
            <span key="v"><StatusBadge status={s.verificationStatus} /></span>,
          ],
        }))}
        editBase="/admin/sources"
        onDelete={deleteSource}
      />
    </div>
  );
}
