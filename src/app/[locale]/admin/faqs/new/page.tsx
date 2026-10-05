import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { FaqForm } from "../FaqForm";

export default async function NewFaq({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <AdminHeader title="New FAQ" />
      <FaqForm initial={{ id: null, question: "", answer: "", position: 0, published: true }} />
    </div>
  );
}
