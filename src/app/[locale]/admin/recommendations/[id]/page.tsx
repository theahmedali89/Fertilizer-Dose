import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { RecommendationForm } from "../RecommendationForm";
import { db } from "@/lib/db";

function dateStr(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EditRecommendation({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [r, items, countries, regions, sources] = await Promise.all([
    db.fertilizerRecommendation.findUnique({
      where: { id },
      include: { item: true, country: true },
    }),
    db.growingItem.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.country.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.region.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, countryId: true } }),
    db.source.findMany({ orderBy: { organization: "asc" }, select: { id: true, organization: true, title: true } }),
  ]);
  if (!r) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${r.item.name} — ${r.country.name}`} />
      <RecommendationForm
        initial={{
          id: r.id,
          growingItemId: r.growingItemId, countryId: r.countryId, regionId: r.regionId ?? "",
          variety: r.variety ?? "", growthStage: r.growthStage ?? "",
          n: r.n?.toString() ?? "", p2o5: r.p2o5?.toString() ?? "", k2o: r.k2o?.toString() ?? "",
          micronutrients: r.micronutrients ?? "", soilContext: r.soilContext ?? "",
          irrigationContext: r.irrigationContext ?? "",
          applicationTiming: r.applicationTiming ?? "", applicationMethod: r.applicationMethod ?? "",
          sourceId: r.sourceId, verificationStatus: r.verificationStatus,
          lastReviewed: dateStr(r.lastReviewed),
        }}
        itemOptions={items.map((i) => ({ value: i.id, label: i.name }))}
        countryOptions={countries.map((c) => ({ value: c.id, label: c.name }))}
        regionOptions={regions.map((rg) => ({ value: rg.id, label: rg.name, countryId: rg.countryId }))}
        sourceOptions={sources.map((s) => ({ value: s.id, label: `${s.organization} — ${s.title.slice(0, 50)}` }))}
      />
    </div>
  );
}
