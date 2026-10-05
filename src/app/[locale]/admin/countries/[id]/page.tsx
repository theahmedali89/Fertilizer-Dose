import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { CountryForm } from "../CountryForm";
import { db } from "@/lib/db";

export default async function EditCountry({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const c = await db.country.findUnique({ where: { id } });
  if (!c) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${c.name}`} />
      <CountryForm
        initial={{
          id: c.id, code: c.code, name: c.name, slug: c.slug,
          defaultUnit: c.defaultUnit, status: c.status,
        }}
      />
    </div>
  );
}
