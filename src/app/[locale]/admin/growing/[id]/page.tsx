import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { GrowingForm, type GrowingFormData } from "../GrowingForm";
import { db } from "@/lib/db";

export default async function EditGrowingItem({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const g = await db.growingItem.findUnique({
    where: { id },
    include: { stages: { orderBy: { position: "asc" } } },
  });
  if (!g) notFound();

  const initial: GrowingFormData = {
    id: g.id,
    slug: g.slug, name: g.name, urdu: g.urdu ?? "", scientificName: g.scientificName ?? "",
    category: g.category, plantSubcategory: g.plantSubcategory ?? "",
    season: g.season ?? "", seasonDetail: g.seasonDetail ?? "",
    sowingMonths: g.sowingMonths ?? "", harvestPeriod: g.harvestPeriod ?? "",
    soil: g.soil ?? "", water: g.water ?? "", sunlight: g.sunlight ?? "", climate: g.climate ?? "",
    regions: g.regions.join(", "),
    npkN: g.npkN, npkP: g.npkP, npkK: g.npkK, npkSource: g.npkSource ?? "",
    verificationStatus: g.verificationStatus,
    stages: g.stages.map((s) => [s.name, s.timing ?? "", s.note ?? ""].join(" | ")).join("\n"),
    indexable: g.indexable, published: g.published,
  };

  return (
    <div>
      <AdminHeader title={`Edit: ${g.name}`} />
      <GrowingForm initial={initial} />
    </div>
  );
}
