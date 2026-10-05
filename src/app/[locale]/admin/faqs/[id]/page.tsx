import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { FaqForm } from "../FaqForm";
import { db } from "@/lib/db";

export default async function EditFaq({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const f = await db.faq.findUnique({ where: { id } });
  if (!f) notFound();

  return (
    <div>
      <AdminHeader title="Edit FAQ" />
      <FaqForm
        initial={{ id: f.id, question: f.question, answer: f.answer, position: f.position, published: f.published }}
      />
    </div>
  );
}
