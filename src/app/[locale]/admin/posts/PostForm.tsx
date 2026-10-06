"use client";

import { AdminForm, TextField, TextAreaField, CheckField } from "@/components/admin/ui";
import { upsertPost } from "@/server/actions/admin";

export type PostFormData = {
  id: string | null;
  slug: string; title: string; excerpt: string;
  body: string; category: string; published: boolean;
};

export function PostForm({ initial }: { initial: PostFormData }) {
  const action = upsertPost.bind(null, initial.id);
  return (
    <AdminForm action={action} backHref="/admin/posts" submitLabel={initial.id ? "Save changes" : "Create post"}>
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Slug" name="slug" defaultValue={initial.slug} required hint="Lowercase letters, numbers, hyphens. Used in the URL." />
        <TextField label="Category" name="category" defaultValue={initial.category} />
      </div>
      <TextField label="Title" name="title" defaultValue={initial.title} required />
      <TextAreaField label="Excerpt" name="excerpt" defaultValue={initial.excerpt} required />
      <TextAreaField
        label="Body" name="body" defaultValue={initial.body} required
        hint="Separate paragraphs with a blank line. Start a line with ## for a section heading or ### for a subheading."
      />
      <CheckField label="Published" name="published" defaultChecked={initial.published} />
    </AdminForm>
  );
}
