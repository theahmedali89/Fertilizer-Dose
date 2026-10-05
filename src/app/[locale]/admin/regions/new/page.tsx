import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { RegionForm } from "../RegionForm";
import { db, isDbConfigured } from "@/lib/db";

export default async function NewRegion({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const countries = isDbConfigured()
    ? await db.country.findMany({ orderBy: { name: "asc" } }).catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="New region" />
      <RegionForm
        initial={{ id: null, slug: "", countryId: countries[0]?.id ?? "", name: "" }}
        countryOptions={countries.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
      />
    </div>
  );
}
