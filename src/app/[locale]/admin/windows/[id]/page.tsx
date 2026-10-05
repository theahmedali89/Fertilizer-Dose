import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { WindowForm } from "../WindowForm";
import { db } from "@/lib/db";

export default async function EditWindow({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [w, items, regions] = await Promise.all([
    db.plantingWindow.findUnique({
      where: { id },
      include: { item: true, region: true, sources: { include: { source: true } } },
    }),
    db.growingItem.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.region.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!w) notFound();
  const src = w.sources[0]?.source;

  return (
    <div>
      <AdminHeader title={`Edit: ${w.item.name} — ${w.region.name}`} />
      <WindowForm
        initial={{
          id: w.id, itemId: w.itemId, regionId: w.regionId,
          startMonth: w.startMonth, endMonth: w.endMonth,
          harvestText: w.harvestText ?? "", notes: w.notes ?? "",
          verificationStatus: w.verificationStatus,
          sourceOrganization: src?.organization ?? "", sourceTitle: src?.title ?? "",
          sourceCountry: src?.country ?? "", sourceRegion: src?.region ?? "",
        }}
        itemOptions={items.map((i) => ({ value: i.id, label: i.name }))}
        regionOptions={regions.map((r) => ({ value: r.id, label: r.name }))}
      />
    </div>
  );
}
