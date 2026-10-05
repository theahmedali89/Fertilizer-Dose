import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { RegionForm } from "../RegionForm";
import { db } from "@/lib/db";

export default async function EditRegion({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const r = await db.region.findUnique({ where: { id } });
  if (!r) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${r.name}`} />
      <RegionForm initial={{ id: r.id, slug: r.slug, country: r.country, name: r.name }} />
    </div>
  );
}
