import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deleteFaq } from "@/server/actions/admin";

export default async function FaqsAdmin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const rows = isDbConfigured()
    ? await db.faq.findMany({ orderBy: { position: "asc" } }).catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="FAQs" actionHref="/admin/faqs/new" actionLabel="+ New FAQ" />
      <AdminTable
        columns={["Question", "Position", "Published"]}
        rows={rows.map((f) => ({
          id: f.id,
          cells: [
            <span key="q" className="font-medium">
              {f.question.length > 80 ? `${f.question.slice(0, 80)}…` : f.question}
            </span>,
            <span key="pos" className="font-mono text-[13px]">{f.position}</span>,
            <span key="p">{f.published ? "Yes" : "No"}</span>,
          ],
        }))}
        editBase="/admin/faqs"
        onDelete={deleteFaq}
      />
    </div>
  );
}
