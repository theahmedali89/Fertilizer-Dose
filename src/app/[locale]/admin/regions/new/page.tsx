import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { RegionForm } from "../RegionForm";

export default async function NewRegion({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <AdminHeader title="New region" />
      <RegionForm initial={{ id: null, slug: "", country: "pakistan", name: "" }} />
    </div>
  );
}
