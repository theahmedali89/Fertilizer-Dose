"use client";

import { AdminForm, TextField, TextAreaField, SelectField } from "@/components/admin/ui";
import { upsertTranslation } from "@/server/actions/admin";
import { TRANSLATION_STATUSES } from "@/lib/adminLookups";

export type TranslationFormData = {
  id: string | null;
  growingItemId: string; locale: string;
  name: string; localName: string; description: string; growingNotes: string;
  status: string;
};

export function TranslationForm({
  initial,
  itemOptions,
  localeOptions,
  locked,
}: {
  initial: TranslationFormData;
  itemOptions: { value: string; label: string }[];
  localeOptions: { value: string; label: string }[];
  locked: boolean;
}) {
  const action = upsertTranslation.bind(null, initial.id);
  return (
    <AdminForm action={action} backHref="/admin/translations" submitLabel={initial.id ? "Save changes" : "Create translation"}>
      <div className="rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 px-4 py-3">
        <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">
          Presentation text only.
        </p>
        <p className="text-xs text-sky-900 dark:text-sky-200 leading-relaxed mt-1">
          This form edits <strong>names and descriptions</strong> for one language only.
          Never edit agronomic numbers (NPK, months, doses) here — those live in the
          Growing Item, Planting Window and Recommendation records.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {locked && (
          <>
            <input type="hidden" name="growingItemId" value={initial.growingItemId} />
            <input type="hidden" name="locale" value={initial.locale} />
          </>
        )}
        <SelectField
          label="Growing item" name="growingItemId" defaultValue={initial.growingItemId} required
          options={itemOptions} disabled={locked}
        />
        <SelectField
          label="Language" name="locale" defaultValue={initial.locale} required
          options={localeOptions} disabled={locked}
        />
        <TextField label="Name (translated)" name="name" defaultValue={initial.name} required />
        <TextField label="Local name" name="localName" defaultValue={initial.localName} hint="Country-specific common name." />
        <SelectField
          label="Status" name="status" defaultValue={initial.status}
          options={[...TRANSLATION_STATUSES]}
        />
      </div>
      <TextAreaField label="Description (translated)" name="description" defaultValue={initial.description} />
      <TextAreaField label="Growing notes (translated)" name="growingNotes" defaultValue={initial.growingNotes} />
    </AdminForm>
  );
}
