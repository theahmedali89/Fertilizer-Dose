import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { GrowingForm, type GrowingFormData } from "../GrowingForm";

const empty: GrowingFormData = {
  id: null, slug: "", name: "", urdu: "", scientificName: "",
  category: "crop", plantSubcategory: "",
  season: "", seasonDetail: "", sowingMonths: "", harvestPeriod: "",
  soil: "", water: "", sunlight: "", climate: "",
  regions: "",
  npkN: null, npkP: null, npkK: null, npkSource: "",
  verificationStatus: "under_review",
  stages: "",
  indexable: false, published: true,
};

export default async function NewGrowingItem({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <AdminHeader title="New growing item" />
      <GrowingForm initial={empty} />
    </div>
  );
}
