import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { FertilizerForm } from "../FertilizerForm";
import { db } from "@/lib/db";

export default async function EditFertilizer({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const f = await db.fertilizer.findUnique({ where: { id } });
  if (!f) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${f.name}`} />
      <FertilizerForm initial={{ ...f, id: f.id }} />
    </div>
  );
}
