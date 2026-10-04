"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GROWING_ITEMS, type GrowingItem } from "@/lib/growing";
import { REGIONS } from "@/lib/planting";
import type { GardenPlot, Planting, AreaUnit } from "@/lib/garden";
import { cn } from "@/lib/utils";

export const UNITS: AreaUnit[] = ["acre", "kanal", "marla", "hectare"];
export const SOIL_TYPES = ["Sandy", "Loamy", "Clay", "Silty", "Saline"];

/* ---------- Modal shell ---------- */

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-lift max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center w-9 h-9 rounded-xl border border-line hover:border-leaf-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- shared field styles ---------- */

const labelCls = "block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5";
const inputCls =
  "w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-leaf-600 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function FormActions({ t, onCancel }: { t: ReturnType<typeof useTranslations>; onCancel: () => void }) {
  return (
    <div className="flex gap-2.5 pt-2">
      <button
        type="submit"
        className="flex-1 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-3 font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
      >
        {t("save")}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-line px-5 py-3 font-medium text-ink-soft hover:border-leaf-600 transition-colors"
      >
        {t("cancel")}
      </button>
    </div>
  );
}

/* ---------- Plot form ---------- */

export function PlotForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: GardenPlot;
  onSubmit: (v: Omit<GardenPlot, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("garden");
  const [name, setName] = useState(initial?.name ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [regionId, setRegionId] = useState(initial?.regionId ?? "");
  const [area, setArea] = useState(initial ? String(initial.area) : "");
  const [unit, setUnit] = useState<AreaUnit>(initial?.unit ?? "acre");
  const [soilType, setSoilType] = useState(initial?.soilType ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const valid = name.trim().length > 0 && Number(area) > 0;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({
          name: name.trim(),
          location: location.trim() || null,
          regionId: regionId || null,
          area: Number(area),
          unit,
          soilType: soilType || null,
          notes: notes.trim() || null,
        });
      }}
    >
      <Field label={t("plotName")}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("plotNamePh")} className={inputCls} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("area")}>
          <input value={area} onChange={(e) => setArea(e.target.value)} type="number" min="0" step="any" className={inputCls} required />
        </Field>
        <Field label="Unit">
          <select value={unit} onChange={(e) => setUnit(e.target.value as AreaUnit)} className={cn(inputCls, "capitalize")}>
            {UNITS.map((u) => (
              <option key={u} value={u} className="capitalize">
                {u}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label={t("location")}>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("locationPh")} className={inputCls} />
      </Field>
      <Field label={t("region")}>
        <select value={regionId} onChange={(e) => setRegionId(e.target.value)} className={inputCls}>
          <option value="">{t("regionNone")}</option>
          <optgroup label="Pakistan">
            {REGIONS.filter((r) => r.country === "pakistan").map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </optgroup>
          <optgroup label="India">
            {REGIONS.filter((r) => r.country === "india").map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </optgroup>
        </select>
      </Field>
      <Field label={t("soilType")}>
        <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className={inputCls}>
          <option value="">{t("soilUnknown")}</option>
          {SOIL_TYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field label={t("notes")}>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notesPh")} rows={2} className={inputCls} />
      </Field>
      <FormActions t={t} onCancel={onCancel} />
    </form>
  );
}

/* ---------- Planting form ---------- */

export function PlantingForm({
  plotId,
  onSubmit,
  onCancel,
}: {
  plotId: string;
  onSubmit: (v: Omit<Planting, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("garden");
  const [itemSlug, setItemSlug] = useState(GROWING_ITEMS[0].slug);
  const [plantedOn, setPlantedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [stage, setStage] = useState("");
  const [notes, setNotes] = useState("");

  const item: GrowingItem | undefined = GROWING_ITEMS.find((i) => i.slug === itemSlug);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          plotId,
          itemSlug,
          plantedOn,
          stage: stage.trim() || null,
          notes: notes.trim() || null,
        });
      }}
    >
      <Field label={t("plantingWhat")}>
        <select value={itemSlug} onChange={(e) => setItemSlug(e.target.value)} className={inputCls}>
          {(["crop", "vegetable", "plant"] as const).map((cat) => (
            <optgroup key={cat} label={cat[0].toUpperCase() + cat.slice(1) + "s"}>
              {GROWING_ITEMS.filter((i) => i.category === cat).map((i) => (
                <option key={i.slug} value={i.slug}>
                  {i.name}
                  {i.urdu ? ` (${i.urdu})` : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("plantedOn")}>
          <input type="date" value={plantedOn} onChange={(e) => setPlantedOn(e.target.value)} className={inputCls} required />
        </Field>
        <Field label={t("stage")}>
          {item && item.stages.length > 0 ? (
            <select value={stage} onChange={(e) => setStage(e.target.value)} className={inputCls}>
              <option value="">{t("stagePh")}</option>
              {item.stages.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          ) : (
            <input value={stage} onChange={(e) => setStage(e.target.value)} placeholder={t("stagePh")} className={inputCls} />
          )}
        </Field>
      </div>
      <Field label={t("notes")}>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notesPh")} rows={2} className={inputCls} />
      </Field>
      <FormActions t={t} onCancel={onCancel} />
    </form>
  );
}

/* ---------- Reminder form ---------- */

export function ReminderForm({
  plotId,
  plantingId,
  onSubmit,
  onCancel,
}: {
  plotId?: string;
  plantingId?: string;
  onSubmit: (v: { title: string; dueDate: string; plotId: string | null; plantingId: string | null }) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("garden");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !dueDate) return;
        onSubmit({ title: title.trim(), dueDate, plotId: plotId ?? null, plantingId: plantingId ?? null });
      }}
    >
      <Field label={t("reminderTitle")}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("reminderTitlePh")} className={inputCls} required />
      </Field>
      <Field label={t("dueDate")}>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} required />
      </Field>
      <FormActions t={t} onCancel={onCancel} />
    </form>
  );
}
