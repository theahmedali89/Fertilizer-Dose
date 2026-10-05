"use client";

import { AdminForm, TextField, NumberField, TextAreaField, SelectField, CheckField } from "@/components/admin/ui";
import { upsertGrowingItem } from "@/server/actions/admin";

export type GrowingFormData = {
  id: string | null;
  slug: string; name: string; urdu: string; scientificName: string;
  category: string; plantSubcategory: string;
  season: string; seasonDetail: string; sowingMonths: string; harvestPeriod: string;
  soil: string; water: string; sunlight: string; climate: string;
  regions: string;
  npkN: number | null; npkP: number | null; npkK: number | null; npkSource: string;
  verificationStatus: string;
  stages: string;
  indexable: boolean; published: boolean;
};

export function GrowingForm({ initial }: { initial: GrowingFormData }) {
  const action = upsertGrowingItem.bind(null, initial.id);
  return (
    <AdminForm action={action} backHref="/admin/growing" submitLabel={initial.id ? "Save changes" : "Create item"}>
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Slug" name="slug" defaultValue={initial.slug} required hint="Lowercase letters, numbers, hyphens. Used in the URL." />
        <TextField label="Name" name="name" defaultValue={initial.name} required />
        <TextField label="Urdu name" name="urdu" defaultValue={initial.urdu} />
        <TextField label="Scientific name" name="scientificName" defaultValue={initial.scientificName} />
        <SelectField
          label="Category" name="category" defaultValue={initial.category}
          options={[
            { value: "crop", label: "Crop" },
            { value: "plant", label: "Plant" },
            { value: "vegetable", label: "Vegetable" },
          ]}
        />
        <TextField label="Plant subcategory" name="plantSubcategory" defaultValue={initial.plantSubcategory} />
        <TextField label="Season" name="season" defaultValue={initial.season} />
        <TextField label="Sowing months" name="sowingMonths" defaultValue={initial.sowingMonths} />
        <TextField label="Harvest period" name="harvestPeriod" defaultValue={initial.harvestPeriod} />
        <TextField label="Sunlight" name="sunlight" defaultValue={initial.sunlight} />
        <div className="grid grid-cols-3 gap-4">
          <NumberField label="NPK N" name="npkN" defaultValue={initial.npkN ?? ""} />
          <NumberField label="NPK P" name="npkP" defaultValue={initial.npkP ?? ""} />
          <NumberField label="NPK K" name="npkK" defaultValue={initial.npkK ?? ""} />
        </div>
        <SelectField
          label="Verification status" name="verificationStatus" defaultValue={initial.verificationStatus}
          options={[
            { value: "draft", label: "Draft" },
            { value: "under_review", label: "Under review" },
            { value: "verified", label: "Verified" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </div>
      <TextField label="NPK source" name="npkSource" defaultValue={initial.npkSource} />
      <TextField label="Regions" name="regions" defaultValue={initial.regions} hint="Comma-separated region names." />
      <TextAreaField label="Season detail" name="seasonDetail" defaultValue={initial.seasonDetail} />
      <TextAreaField label="Soil" name="soil" defaultValue={initial.soil} />
      <TextAreaField label="Water" name="water" defaultValue={initial.water} />
      <TextAreaField label="Climate" name="climate" defaultValue={initial.climate} />
      <TextAreaField
        label="Growth stages" name="stages" defaultValue={initial.stages}
        hint="One per line as: name | timing | note"
      />
      <div className="flex items-center gap-6">
        <CheckField label="Indexable" name="indexable" defaultChecked={initial.indexable} />
        <CheckField label="Published" name="published" defaultChecked={initial.published} />
      </div>
    </AdminForm>
  );
}
