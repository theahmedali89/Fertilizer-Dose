"use client";

import { useState } from "react";
import {
  AdminForm, TextField, NumberField, TextAreaField, SelectField, STATUS_OPTIONS,
} from "@/components/admin/ui";
import { upsertRecommendation } from "@/server/actions/admin";

export type RecommendationFormData = {
  id: string | null;
  growingItemId: string; countryId: string; regionId: string;
  variety: string; growthStage: string;
  n: string; p2o5: string; k2o: string;
  micronutrients: string; soilContext: string; irrigationContext: string;
  applicationTiming: string; applicationMethod: string;
  sourceId: string; verificationStatus: string; lastReviewed: string;
};

export type RecOption = { value: string; label: string };
export type RecRegionOption = { value: string; label: string; countryId: string | null };

export function RecommendationForm({
  initial,
  itemOptions,
  countryOptions,
  regionOptions,
  sourceOptions,
}: {
  initial: RecommendationFormData;
  itemOptions: RecOption[];
  countryOptions: RecOption[];
  regionOptions: RecRegionOption[];
  sourceOptions: RecOption[];
}) {
  const action = upsertRecommendation.bind(null, initial.id);
  const [countryId, setCountryId] = useState(initial.countryId);
  const filteredRegions = regionOptions.filter((r) => !countryId || r.countryId === countryId);

  return (
    <AdminForm action={action} backHref="/admin/recommendations" submitLabel={initial.id ? "Save changes" : "Create recommendation"}>
      <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          Recommendations are never auto-verified.
        </p>
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed mt-1">
          Every new or imported recommendation starts as <strong>Draft</strong>. Mark it Verified only
          after checking it against the cited source. A source is required.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <SelectField label="Growing item" name="growingItemId" defaultValue={initial.growingItemId} required options={itemOptions} />
        <SelectField
          label="Country" name="countryId" defaultValue={initial.countryId} required
          options={countryOptions} onChange={(e) => setCountryId(e.target.value)}
        />
        <SelectField
          label="Region (optional)" name="regionId" defaultValue={initial.regionId}
          options={[{ value: "", label: "— Country-wide —" }, ...filteredRegions]}
          hint="Leave empty when the source applies to the whole country."
        />
        <SelectField
          label="Source (required)" name="sourceId" defaultValue={initial.sourceId} required
          options={[{ value: "", label: "— Select source —" }, ...sourceOptions]}
          hint="Create the source first under Admin → Sources."
        />
        <TextField label="Variety" name="variety" defaultValue={initial.variety} hint="Only if the source names one." />
        <TextField label="Growth stage" name="growthStage" defaultValue={initial.growthStage} hint="E.g. Basal, Tillering." />
      </div>

      <div className="rounded-2xl border border-line bg-surface-2/40 p-5">
        <p className="text-[13px] font-semibold text-ink-soft mb-1">Nutrient requirement (kg/ha)</p>
        <p className="text-xs text-ink-faint mb-4">
          Nutrient basis: <strong>N</strong> elemental · <strong>P₂O₅</strong> oxide · <strong>K₂O</strong> oxide.
          Never enter elemental P or K here.
        </p>
        <div className="grid grid-cols-3 gap-5">
          <NumberField label="N (kg/ha)" name="n" defaultValue={initial.n} min={0} step="any" />
          <NumberField label="P₂O₅ (kg/ha)" name="p2o5" defaultValue={initial.p2o5} min={0} step="any" />
          <NumberField label="K₂O (kg/ha)" name="k2o" defaultValue={initial.k2o} min={0} step="any" />
        </div>
        <div className="mt-4">
          <TextAreaField label="Micronutrients" name="micronutrients" defaultValue={initial.micronutrients} hint="Only where the source gives them." />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <TextAreaField label="Soil context" name="soilContext" defaultValue={initial.soilContext} />
        <TextAreaField label="Irrigation context" name="irrigationContext" defaultValue={initial.irrigationContext} />
        <TextAreaField label="Application timing" name="applicationTiming" defaultValue={initial.applicationTiming} />
        <TextAreaField label="Application method" name="applicationMethod" defaultValue={initial.applicationMethod} />
        <SelectField
          label="Verification status" name="verificationStatus" defaultValue={initial.verificationStatus}
          options={[...STATUS_OPTIONS]}
        />
        <TextField label="Last reviewed" name="lastReviewed" type="date" defaultValue={initial.lastReviewed} />
      </div>
    </AdminForm>
  );
}
