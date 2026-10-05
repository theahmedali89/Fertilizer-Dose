"use client";

import { AdminForm, TextField, SelectField } from "@/components/admin/ui";
import { upsertCountry } from "@/server/actions/admin";

export type CountryFormData = {
  id: string | null;
  code: string; name: string; slug: string;
  defaultUnit: string; status: string;
};

export function CountryForm({ initial }: { initial: CountryFormData }) {
  const action = upsertCountry.bind(null, initial.id);
  return (
    <AdminForm action={action} backHref="/admin/countries" submitLabel={initial.id ? "Save changes" : "Create country"}>
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Code" name="code" defaultValue={initial.code} required hint="2-letter ISO code, uppercase. E.g. PK." />
        <TextField label="Name" name="name" defaultValue={initial.name} required />
        <TextField label="Slug" name="slug" defaultValue={initial.slug} required hint="Lowercase letters, numbers, hyphens. Used in the URL." />
        <SelectField
          label="Default unit" name="defaultUnit" defaultValue={initial.defaultUnit}
          options={[
            { value: "acre", label: "Acre" },
            { value: "hectare", label: "Hectare" },
          ]}
        />
        <SelectField
          label="Status" name="status" defaultValue={initial.status}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </div>
    </AdminForm>
  );
}
