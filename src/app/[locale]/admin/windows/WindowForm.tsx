"use client";

import { useState } from "react";
import { AdminForm, TextField, NumberField, TextAreaField, SelectField, STATUS_OPTIONS } from "@/components/admin/ui";
import { upsertWindow } from "@/server/actions/admin";

export type WindowFormData = {
  id: string | null;
  itemId: string; regionId: string;
  activityType: string; seasonId: string;
  startMonth: number; endMonth: number;
  harvestText: string; notes: string;
  verificationStatus: string;
  sourceOrganization: string; sourceTitle: string; sourceCountry: string; sourceRegion: string;
};

export type WindowOption = { value: string; label: string };
export type RegionOption = { value: string; label: string; countryId: string | null };
export type SeasonOption = { value: string; label: string; countryId: string };

const ACTIVITY_OPTIONS = [
  { value: "SOW", label: "Sow" },
  { value: "TRANSPLANT", label: "Transplant" },
  { value: "PLANT", label: "Plant" },
  { value: "HARVEST", label: "Harvest" },
  { value: "LAND_PREPARATION", label: "Land preparation" },
];

export function WindowForm({
  initial,
  itemOptions,
  regionOptions,
  seasonOptions,
}: {
  initial: WindowFormData;
  itemOptions: WindowOption[];
  regionOptions: RegionOption[];
  seasonOptions: SeasonOption[];
}) {
  const action = upsertWindow.bind(null, initial.id);
  const [regionId, setRegionId] = useState(initial.regionId);
  const regionCountry = regionOptions.find((r) => r.value === regionId)?.countryId ?? null;
  const filteredSeasons = seasonOptions.filter((s) => !regionCountry || s.countryId === regionCountry);

  return (
    <AdminForm action={action} backHref="/admin/windows" submitLabel={initial.id ? "Save changes" : "Create window"}>
      <div className="grid sm:grid-cols-2 gap-5">
        <SelectField label="Growing item" name="itemId" defaultValue={initial.itemId} required options={itemOptions} />
        <SelectField
          label="Region" name="regionId" defaultValue={initial.regionId} required
          options={regionOptions} onChange={(e) => setRegionId(e.target.value)}
        />
        <SelectField
          label="Activity" name="activityType" defaultValue={initial.activityType} required
          options={ACTIVITY_OPTIONS}
          hint="What the farmer should do in this window."
        />
        <SelectField
          label="Season (optional)" name="seasonId" defaultValue={initial.seasonId}
          options={[{ value: "", label: "— None —" }, ...filteredSeasons]}
          hint="Filtered by the selected region's country."
        />
        <NumberField label="Start month" name="startMonth" defaultValue={initial.startMonth} required min={1} max={12} hint="1 = January, 12 = December." />
        <NumberField label="End month" name="endMonth" defaultValue={initial.endMonth} required min={1} max={12} hint="1 = January, 12 = December." />
        <TextField label="Harvest text" name="harvestText" defaultValue={initial.harvestText} />
        <SelectField
          label="Verification status" name="verificationStatus" defaultValue={initial.verificationStatus}
          options={[...STATUS_OPTIONS]}
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
