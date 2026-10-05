"use client";

import { AdminForm, TextAreaField, NumberField, CheckField } from "@/components/admin/ui";
import { upsertFaq } from "@/server/actions/admin";

export type FaqFormData = {
  id: string | null;
  question: string; answer: string; position: number; published: boolean;
};

export function FaqForm({ initial }: { initial: FaqFormData }) {
  const action = upsertFaq.bind(null, initial.id);
  return (
    <AdminForm action={action} backHref="/admin/faqs" submitLabel={initial.id ? "Save changes" : "Create FAQ"}>
      <TextAreaField label="Question" name="question" defaultValue={initial.question} required />
      <TextAreaField label="Answer" name="answer" defaultValue={initial.answer} required />
      <NumberField label="Position" name="position" defaultValue={initial.position} hint="Lower numbers show first." />
      <CheckField label="Published" name="published" defaultChecked={initial.published} />
    </AdminForm>
  );
}
