import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { PostForm } from "../PostForm";
import { db } from "@/lib/db";

export default async function EditPost({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const p = await db.post.findUnique({ where: { id } });
  if (!p) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${p.title}`} />
      <PostForm
        initial={{
          id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt,
          body: p.body, category: p.category ?? "", published: p.published,
        }}
      />
    </div>
  );
}
