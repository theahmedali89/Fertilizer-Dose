import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { WindowForm, type WindowOption, type RegionOption, type SeasonOption } from "../WindowForm";
import { db, isDbConfigured } from "@/lib/db";

async function optionLists(): Promise<{
  itemOptions: WindowOption[];
  regionOptions: RegionOption[];
  seasonOptions: SeasonOption[];
}> {
  if (!isDbConfigured()) return { itemOptions: [], regionOptions: [], seasonOptions: [] };
  const [items, regions, seasons] = await Promise.all([
    db.growingItem.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }).catch(() => []),
    db.region.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, countryId: true } }).catch(() => []),
    db.season.findMany({ orderBy: { name: "asc" }, include: { country: { select: { name: true } } } }).catch(() => []),
  ]);
  return {
    itemOptions: items.map((i) => ({ value: i.id, label: i.name })),
    regionOptions: regions.map((r) => ({ value: r.id, label: r.name, countryId: r.countryId })),
    seasonOptions: seasons.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.country.name})`,
      countryId: s.countryId,
    })),
  };
}

export default async function NewWindow({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { itemOptions, regionOptions, seasonOptions } = await optionLists();

  return (
    <div>
      <AdminHeader title="New planting window" />
      <WindowForm
        initial={{
          id: null, itemId: itemOptions[0]?.value ?? "", regionId: regionOptions[0]?.value ?? "",
          activityType: "SOW", seasonId: "",
          startMonth: 1, endMonth: 12, harvestText: "", notes: "",
          verificationStatus: "under_review",
          sourceOrganization: "", sourceTitle: "", sourceCountry: "", sourceRegion: "",
        }}
        itemOptions={itemOptions}
        regionOptions={regionOptions}
        seasonOptions={seasonOptions}
      />
    </div>
  );
}
