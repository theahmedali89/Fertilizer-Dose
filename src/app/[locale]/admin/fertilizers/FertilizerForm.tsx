"use client";

import { AdminForm, TextField, NumberField, TextAreaField, CheckField } from "@/components/admin/ui";
import { upsertFertilizer } from "@/server/actions/admin";

export type FertilizerFormData = {
  id: string | null;
  slug: string; name: string; urdu: string | null;
  /** null = no single label value (organics with typical ranges) */
  n: number | null; p: number | null; k: number | null; tagline: string | null;
  description: string; benefits: string[]; precautions: string[];
  application: string; published: boolean;
};

export function FertilizerForm({ initial }: { initial: FertilizerFormData }) {
  const action = upsertFertilizer.bind(null, initial.id);
  return (
    <AdminForm action={action} backHref="/admin/fertilizers" submitLabel={initial.id ? "Save changes" : "Create fertilizer"}>
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Slug" name="slug" defaultValue={initial.slug} required hint="Lowercase letters, numbers, hyphens. Used in the URL." />
        <TextField label="Name" name="name" defaultValue={initial.name} required />
        <TextField label="Urdu name" name="urdu" defaultValue={initial.urdu ?? ""} />
        <div className="grid grid-cols-3 gap-4">
          <NumberField label="N %" name="n" defaultValue={initial.n ?? ""} hint="Blank for organics with ranges" />
          <NumberField label="P₂O₅ %" name="p" defaultValue={initial.p ?? ""} hint="Blank for organics with ranges" />
          <NumberField label="K₂O %" name="k" defaultValue={initial.k ?? ""} hint="Blank for organics with ranges" />
        </div>
      </div>
      <TextField label="Tagline" name="tagline" defaultValue={initial.tagline ?? ""} />
      <TextAreaField label="Description" name="description" defaultValue={initial.description} required />
      <TextAreaField label="Benefits" name="benefits" defaultValue={initial.benefits.join("\n")} hint="One benefit per line." />
      <TextAreaField label="Precautions" name="precautions" defaultValue={initial.precautions.join("\n")} hint="One precaution per line." />
      <TextAreaField label="Application" name="application" defaultValue={initial.application} required />
      <CheckField label="Published" name="published" defaultChecked={initial.published} />
    </AdminForm>
  );
}
