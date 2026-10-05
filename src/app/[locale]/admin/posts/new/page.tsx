import { setRequestLocale } from "next-intl/server";
import { AdminHeader } from "@/components/admin/ui";
import { PostForm } from "../PostForm";

export default async function NewPost({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <AdminHeader title="New post" />
      <PostForm
        initial={{ id: null, slug: "", title: "", excerpt: "", body: "", category: "", published: false }}
      />
    </div>
  );
}
