import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { RecommendationForm } from "../RecommendationForm";
import { db, isDbConfigured } from "@/lib/db";

export default async function NewRecommendation({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [items, countries, regions, sources] = isDbConfigured()
    ? await Promise.all([
        db.growingItem.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }).catch(() => []),
        db.country.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }).catch(() => []),
        db.region.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, countryId: true } }).catch(() => []),
        db.source.findMany({ orderBy: { organization: "asc" }, select: { id: true, organization: true, title: true } }).catch(() => []),
      ])
    : [[], [], [], []];

  return (
    <div>
      <AdminHeader title="New fertilizer recommendation" />
      <RecommendationForm
        initial={{
          id: null,
          growingItemId: items[0]?.id ?? "", countryId: countries[0]?.id ?? "", regionId: "",
          variety: "", growthStage: "", n: "", p2o5: "", k2o: "",
          micronutrients: "", soilContext: "", irrigationContext: "",
          applicationTiming: "", applicationMethod: "",
          sourceId: "", verificationStatus: "draft", lastReviewed: "",
        }}
        itemOptions={items.map((i) => ({ value: i.id, label: i.name }))}
        countryOptions={countries.map((c) => ({ value: c.id, label: c.name }))}
        regionOptions={regions.map((r) => ({ value: r.id, label: r.name, countryId: r.countryId }))}
        sourceOptions={sources.map((s) => ({ value: s.id, label: `${s.organization} — ${s.title.slice(0, 50)}` }))}
      />
    </div>
  );
}
