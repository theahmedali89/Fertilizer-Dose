"use client";

import { AdminForm, TextField, NumberField, TextAreaField, SelectField } from "@/components/admin/ui";
import { upsertWindow } from "@/server/actions/admin";

export type WindowFormData = {
  id: string | null;
  itemId: string; regionId: string;
  startMonth: number; endMonth: number;
  harvestText: string; notes: string;
  verificationStatus: string;
  sourceOrganization: string; sourceTitle: string; sourceCountry: string; sourceRegion: string;
};

export type WindowOption = { value: string; label: string };

export function WindowForm({
  initial,
  itemOptions,
  regionOptions,
}: {
  initial: WindowFormData;
  itemOptions: WindowOption[];
  regionOptions: WindowOption[];
}) {
  const action = upsertWindow.bind(null, initial.id);
  return (
    <AdminForm action={action} backHref="/admin/windows" submitLabel={initial.id ? "Save changes" : "Create window"}>
      <div className="grid sm:grid-cols-2 gap-5">
        <SelectField label="Growing item" name="itemId" defaultValue={initial.itemId} required options={itemOptions} />
        <SelectField label="Region" name="regionId" defaultValue={initial.regionId} required options={regionOptions} />
        <NumberField label="Start month" name="startMonth" defaultValue={initial.startMonth} required min={1} max={12} hint="1 = January, 12 = December." />
        <NumberField label="End month" name="endMonth" defaultValue={initial.endMonth} required min={1} max={12} hint="1 = January, 12 = December." />
        <TextField label="Harvest text" name="harvestText" defaultValue={initial.harvestText} />
        <SelectField
          label="Verification status" name="verificationStatus" defaultValue={initial.verificationStatus}
          options={[
            { value: "in_review", label: "In review" },
            { value: "verified", label: "Verified" },
          ]}
        />
      </div>
      <TextAreaField label="Notes" name="notes" defaultValue={initial.notes} />
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Source organization" name="sourceOrganization" defaultValue={initial.sourceOrganization} required />
        <TextField label="Source title" name="sourceTitle" defaultValue={initial.sourceTitle} required />
        <TextField label="Source country" name="sourceCountry" defaultValue={initial.sourceCountry} />
        <TextField label="Source region" name="sourceRegion" defaultValue={initial.sourceRegion} />
      </div>
    </AdminForm>
  );
}
