import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { SourceForm } from "../SourceForm";
import { db } from "@/lib/db";

export default async function EditSource({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const s = await db.source.findUnique({ where: { id } });
  if (!s) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${s.organization}`} />
      <SourceForm
        initial={{
          id: s.id, organization: s.organization, title: s.title, url: s.url ?? "",
          country: s.country ?? "", region: s.region ?? "",
          sourceType: s.sourceType ?? "", verificationStatus: s.verificationStatus,
          notes: s.notes ?? "",
        }}
      />
    </div>
  );
}
