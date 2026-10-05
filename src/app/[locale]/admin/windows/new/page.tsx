import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { WindowForm, type WindowOption } from "../WindowForm";
import { db, isDbConfigured } from "@/lib/db";

async function optionLists(): Promise<{ itemOptions: WindowOption[]; regionOptions: WindowOption[] }> {
  if (!isDbConfigured()) return { itemOptions: [], regionOptions: [] };
  const [items, regions] = await Promise.all([
    db.growingItem.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }).catch(() => []),
    db.region.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }).catch(() => []),
  ]);
  return {
    itemOptions: items.map((i) => ({ value: i.id, label: i.name })),
    regionOptions: regions.map((r) => ({ value: r.id, label: r.name })),
  };
}

export default async function NewWindow({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { itemOptions, regionOptions } = await optionLists();

  return (
    <div>
      <AdminHeader title="New planting window" />
      <WindowForm
        initial={{
          id: null, itemId: itemOptions[0]?.value ?? "", regionId: regionOptions[0]?.value ?? "",
          startMonth: 1, endMonth: 12, harvestText: "", notes: "",
          verificationStatus: "under_review",
          sourceOrganization: "", sourceTitle: "", sourceCountry: "", sourceRegion: "",
        }}
        itemOptions={itemOptions}
        regionOptions={regionOptions}
      />
    </div>
  );
}
