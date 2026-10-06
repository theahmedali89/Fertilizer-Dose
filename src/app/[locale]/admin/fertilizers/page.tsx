import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable } from "@/components/admin/ui";
import { Link } from "@/i18n/navigation";
import { db, isDbConfigured } from "@/lib/db";
import { deleteFertilizer } from "@/server/actions/admin";

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "mineral", label: "Mineral" },
  { value: "organic", label: "Organic" },
] as const;

export default async function FertilizersAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const { type = "all" } = await searchParams;
  setRequestLocale(locale);

  const where: { fertilizerType?: string } = {};
  if (type === "mineral" || type === "organic") where.fertilizerType = type;

  const rows = isDbConfigured()
    ? await db.fertilizer.findMany({ where, orderBy: { name: "asc" } }).catch(() => [])
    : [];

  const npkCell = (f: { fertilizerType: string; n: number | null; p: number | null; k: number | null; nMin: number | null; nMax: number | null; pMin: number | null; pMax: number | null; kMin: number | null; kMax: number | null }) =>
    f.fertilizerType === "organic"
      ? `${f.nMin ?? "–"}–${f.nMax ?? "–"} / ${f.pMin ?? "–"}–${f.pMax ?? "–"} / ${f.kMin ?? "–"}–${f.kMax ?? "–"}`
      : `${f.n ?? "–"}–${f.p ?? "–"}–${f.k ?? "–"}`;

  return (
    <div>
      <AdminHeader title="Fertilizers" actionHref="/admin/fertilizers/new" actionLabel="+ New fertilizer" />
      <div className="flex flex-wrap gap-1.5 mb-5">
        {TYPE_FILTERS.map((f) => {
          const active = type === f.value;
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/admin/fertilizers" : `/admin/fertilizers?type=${f.value}`}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold border transition-colors ${
                active
                  ? "bg-leaf-700 dark:bg-leaf-600 text-white border-transparent"
                  : "border-line text-ink-soft hover:border-leaf-600"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>
      <AdminTable
        columns={["Name", "Type", "NPK / range", "Slug", "Published"]}
        rows={rows.map((f) => ({
          id: f.id,
          cells: [
            <span key="n" className="font-semibold">{f.name}</span>,
            <span key="t" className="inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
              {f.fertilizerType === "organic" ? "Organic" : "Mineral"}
            </span>,
            <span key="npk" className="font-mono text-[13px]">{npkCell(f)}</span>,
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
