import { setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminTable } from "@/components/admin/ui";
import { db, isDbConfigured } from "@/lib/db";
import { deletePost } from "@/server/actions/admin";

export default async function PostsAdmin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const rows = isDbConfigured()
    ? await db.post.findMany({ orderBy: { createdAt: "desc" } }).catch(() => [])
    : [];

  return (
    <div>
      <AdminHeader title="Blog posts" actionHref="/admin/posts/new" actionLabel="+ New post" />
      <AdminTable
        columns={["Title", "Slug", "Published"]}
        rows={rows.map((p) => ({
          id: p.id,
          cells: [
            <span key="t" className="font-semibold">{p.title}</span>,
            <span key="s" className="font-mono text-[13px] text-ink-faint">{p.slug}</span>,
            <span key="p">{p.published ? "Yes" : "No"}</span>,
          ],
        }))}
        editBase="/admin/posts"
        onDelete={deletePost}
      />
    </div>
  );
}
