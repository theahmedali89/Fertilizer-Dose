"use client";

import { AdminForm, TextField, TextAreaField } from "@/components/admin/ui";
import { upsertSource } from "@/server/actions/admin";

export type SourceFormData = {
  id: string | null;
  organization: string; title: string; url: string;
  country: string; region: string; notes: string;
};

export function SourceForm({ initial }: { initial: SourceFormData }) {
  const action = upsertSource.bind(null, initial.id);
  return (
    <AdminForm action={action} backHref="/admin/sources" submitLabel={initial.id ? "Save changes" : "Create source"}>
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Organization" name="organization" defaultValue={initial.organization} required />
        <TextField label="Title" name="title" defaultValue={initial.title} required />
        <TextField label="URL" name="url" defaultValue={initial.url} hint="Full link to the publication or page." />
        <TextField label="Country" name="country" defaultValue={initial.country} />
        <TextField label="Region" name="region" defaultValue={initial.region} />
      </div>
      <TextAreaField label="Notes" name="notes" defaultValue={initial.notes} />
    </AdminForm>
  );
}
