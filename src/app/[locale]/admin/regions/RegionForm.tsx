"use client";

import { AdminForm, TextField, SelectField } from "@/components/admin/ui";
import { upsertRegion } from "@/server/actions/admin";

export type RegionFormData = {
  id: string | null;
  slug: string; country: string; name: string;
};

export function RegionForm({ initial }: { initial: RegionFormData }) {
  const action = upsertRegion.bind(null, initial.id);
  return (
    <AdminForm action={action} backHref="/admin/regions" submitLabel={initial.id ? "Save changes" : "Create region"}>
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Slug" name="slug" defaultValue={initial.slug} required hint="Lowercase letters, numbers, hyphens. Used in the URL." />
        <TextField label="Name" name="name" defaultValue={initial.name} required />
        <SelectField
          label="Country" name="country" defaultValue={initial.country}
          options={[
            { value: "pakistan", label: "Pakistan" },
            { value: "india", label: "India" },
          ]}
        />
      </div>
    </AdminForm>
  );
}
