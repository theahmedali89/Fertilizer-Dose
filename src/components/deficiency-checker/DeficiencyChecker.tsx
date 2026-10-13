"use client";

import { useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";

// ── Data ─────────────────────────────────────────────────────────────

type Deficiency = {
  id: string;
  name: string;
  fullName: string;
  key: string; // nutrient symbol
  symptoms: string[];
  correction: string;
  fertilizer: string;
  note: string;
};

const DEFICIENCIES: Deficiency[] = [
  {
    id: "N",
    name: "Nitrogen Deficiency",
    fullName: "Nitrogen (N)",
    key: "N",
    symptoms: ["old-yellow", "stunted"],
    correction:
      "Apply urea (46% N) at 50–100 kg/ha as a top-dress before irrigation, or spray 2% urea solution on foliage for a quick response.",
    fertilizer: "Urea",
    note: "Most common deficiency worldwide. Responds fast to nitrogen.",
  },
  {
    id: "P",
    name: "Phosphorus Deficiency",
    fullName: "Phosphorus (P)",
    key: "P",
    symptoms: ["purple", "dark-delayed"],
    correction:
      "Apply DAP (18-46-0) or SSP at sowing/transplanting — phosphorus moves slowly in soil, so place it near the root zone. Foliar sprays are a weak fix.",
    fertilizer: "DAP / SSP",
    note: "Common in cold soils and acidic soils.",
  },
  {
    id: "K",
    name: "Potassium Deficiency",
    fullName: "Potassium (K)",
    key: "K",
    symptoms: ["scorch", "spots-weak"],
    correction:
      "Apply SOP (50% K₂O) or MOP (60% K₂O) at 50–75 kg/ha. Split in fruiting crops — half at flowering, half at fruit development.",
    fertilizer: "SOP / MOP",
    note: "Worsens in sandy soils and under drought stress.",
  },
  {
    id: "Zn",
    name: "Zinc Deficiency",
    fullName: "Zinc (Zn)",
    key: "Zn",
    symptoms: ["little-leaf", "inter-old"],
    correction:
      "Apply zinc sulfate (33% Zn) at 20–25 kg/ha to soil, or spray 0.5% zinc sulfate + 0.25% lime on foliage. One soil dose lasts 2–3 seasons.",
    fertilizer: "Zinc sulfate",
    note: "Very common in high-pH (alkaline) and calcareous soils.",
  },
  {
    id: "Fe",
    name: "Iron Deficiency",
    fullName: "Iron (Fe)",
    key: "Fe",
    symptoms: ["new-yellow-veins"],
    correction:
      "Spray 0.5–1% ferrous sulfate solution on foliage (repeat after 10–14 days). Soil application rarely works in alkaline soils — use chelated iron (Fe-EDDHA) if needed.",
    fertilizer: "Ferrous sulfate / Fe-EDDHA",
    note: "Almost always induced by high soil pH, not low iron.",
  },
  {
    id: "B",
    name: "Boron Deficiency",
    fullName: "Boron (B)",
    key: "B",
    symptoms: ["tip-death", "poor-fruit"],
    correction:
      "Apply borax (11% B) at 10–15 kg/ha to soil, or spray 0.2% borax at flowering. Do not over-apply — the gap between deficiency and toxicity is narrow.",
    fertilizer: "Borax",
    note: "Critical at flowering — affects pollen and fruit set.",
  },
  {
    id: "Mg",
    name: "Magnesium Deficiency",
    fullName: "Magnesium (Mg)",
    key: "Mg",
    symptoms: ["old-yellow", "inter-old"],
    correction:
      "Apply magnesium sulfate (Epsom salt, 9.8% Mg) at 25 kg/ha to soil, or spray 2% solution on foliage.",
    fertilizer: "Magnesium sulfate",
    note: "Often confused with nitrogen — check if yellowing is between veins.",
  },
  {
    id: "S",
    name: "Sulphur Deficiency",
    fullName: "Sulphur (S)",
    key: "S",
    symptoms: ["new-uniform"],
    correction:
      "Apply gypsum (18% S) at 200–250 kg/ha, or switch nitrogen source to ammonium sulfate (21% N + 24% S).",
    fertilizer: "Gypsum / Ammonium sulfate",
    note: "Looks like nitrogen deficiency but starts on NEW leaves.",
  },
  {
    id: "Ca",
    name: "Calcium Deficiency",
    fullName: "Calcium (Ca)",
    key: "Ca",
    symptoms: ["tip-death", "ber", "tip-burn"],
    correction:
      "Ensure consistent soil moisture first — most calcium issues are water-related, not soil-related. Apply gypsum (no pH change) or calcium nitrate. For blossom end rot, mulch and regular watering matter more than fertilizer.",
    fertilizer: "Gypsum / Calcium nitrate",
    note: "Blossom end rot is usually uneven watering, not lack of calcium.",
  },
  {
    id: "Mn",
    name: "Manganese Deficiency",
    fullName: "Manganese (Mn)",
    key: "Mn",
    symptoms: ["new-yellow-veins"],
    correction:
      "Spray 0.5% manganese sulfate on foliage. Avoid over-liming — high pH locks manganese up.",
    fertilizer: "Manganese sulfate",
    note: "Similar to iron deficiency — soil pH test helps tell them apart.",
  },
];

type Symptom = {
  id: string;
  label: string;
  hint: string;
};

const SYMPTOMS: Symptom[] = [
  { id: "old-yellow", label: "Older / lower leaves turning yellow", hint: "Starts from the bottom of the plant" },
  { id: "stunted", label: "Stunted growth, pale green plants", hint: "Whole plant looks weak and small" },
  { id: "purple", label: "Purple or reddish leaves / stems", hint: "Unusual coloration, not normal variety color" },
  { id: "dark-delayed", label: "Dark green leaves with delayed maturity", hint: "Slow growth, late flowering" },
  { id: "scorch", label: "Brown, scorched leaf edges", hint: "Margins look burnt, starting on older leaves" },
  { id: "spots-weak", label: "Brown spots on leaves, weak stems", hint: "Stems lodge or break easily" },
  { id: "little-leaf", label: "Abnormally small leaves (little leaf)", hint: "Rosette-like bunched growth" },
  { id: "inter-old", label: "Yellowing between veins on older leaves", hint: "Veins stay green, areas between turn yellow" },
  { id: "new-yellow-veins", label: "New leaves yellow but veins stay green", hint: "Top growth affected first" },
  { id: "new-uniform", label: "New leaves uniformly pale yellow", hint: "Like nitrogen deficiency but on young leaves" },
  { id: "tip-death", label: "Growing tip dies or looks distorted", hint: "New growth is deformed or dead" },
  { id: "poor-fruit", label: "Poor fruit set / flower drop", hint: "Flowers fall without forming fruit" },
  { id: "ber", label: "Blossom end rot on fruits", hint: "Dark sunken spots at the bottom of fruit" },
  { id: "tip-burn", label: "Tip burn on young inner leaves", hint: "Common in lettuce, cabbage, cauliflower" },
];

// ── Component ────────────────────────────────────────────────────────

type Result = {
  def: Deficiency;
  matched: number;
  total: number;
  score: number;
};

export function DeficiencyChecker() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);

  const toggle = (id: string) => {
    setChecked(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const results: Result[] = useMemo(() => {
    if (!checked || selected.size === 0) return [];
    return DEFICIENCIES.map((def) => {
      const matched = def.symptoms.filter((s) => selected.has(s)).length;
      return {
        def,
        matched,
        total: def.symptoms.length,
        score: matched / def.symptoms.length,
      };
    })
      .filter((r) => r.matched > 0)
      .sort((a, b) => b.matched - a.matched || b.score - a.score);
  }, [checked, selected]);

  const reset = () => {
    setSelected(new Set());
    setChecked(false);
  };

  return (
    <div>
      {/* Symptom selection */}
      <h2 className="font-display text-2xl font-semibold mb-2">
        Step 1 — Select the symptoms you see
      </h2>
      <p className="text-sm text-ink-soft mb-6">
        Tap all that apply. You can select more than one.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {SYMPTOMS.map((s) => {
          const active = selected.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              aria-pressed={active}
              className={`text-left rounded-xl border p-4 transition-colors ${
                active
                  ? "border-leaf-600 bg-leaf-50 dark:bg-leaf-950/40 dark:border-leaf-500"
                  : "border-line bg-surface hover:border-leaf-400"
              }`}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    active
                      ? "border-leaf-600 bg-leaf-600 text-white"
                      : "border-ink-faint"
                  }`}
                  aria-hidden
                >
                  {active && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6.5 4.5 9 10 3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span>
                  <span className="block font-medium text-sm">{s.label}</span>
                  <span className="block text-xs text-ink-soft mt-0.5">{s.hint}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={selected.size === 0}
          className="rounded-xl bg-leaf-700 dark:bg-leaf-600 px-6 py-3 font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Check deficiency ({selected.size} selected)
        </button>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-line px-6 py-3 font-medium hover:bg-surface transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results */}
      {checked && (
        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-2">
            Step 2 — Likely deficiencies
          </h2>
          {results.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-ink-soft">
                  No matches found. Try selecting different symptoms, or check
                  the{" "}
                  <Link href="/plant-doctor" className="font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
                    Plant Doctor
                  </Link>{" "}
                  for a photo-based diagnosis.
                </p>
              </CardBody>
            </Card>
          ) : (
            <>
              <p className="text-sm text-ink-soft mb-6">
                Ranked by how many of your symptoms match. This is a guide, not
                a lab test — confirm with a soil test for certainty.
              </p>
              <div className="space-y-4">
                {results.map(({ def, matched, total }, i) => (
                  <Card key={def.id} className={i === 0 ? "border-leaf-600 dark:border-leaf-500" : ""}>
                    <CardBody>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          {i === 0 && (
                            <span className="inline-block text-xs font-bold uppercase tracking-wide text-leaf-700 dark:text-leaf-300 bg-leaf-100 dark:bg-leaf-900 rounded-full px-3 py-1 mb-2">
                              Best match
                            </span>
                          )}
                          <h3 className="font-display text-xl font-semibold">
                            {def.name}{" "}
                            <span className="text-sm font-normal text-ink-soft">({def.fullName})</span>
                          </h3>
                          <p className="text-xs text-ink-soft mt-1">
                            Matched {matched} of {total} key symptoms
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-ink-soft">Recommended fertilizer</p>
                          <p className="font-semibold text-leaf-700 dark:text-leaf-300">{def.fertilizer}</p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg bg-surface border border-line p-4">
                        <p className="text-sm font-semibold mb-1">How to correct it</p>
                        <p className="text-sm text-ink-soft leading-relaxed">{def.correction}</p>
                      </div>
                      <p className="mt-3 text-xs text-ink-faint italic">{def.note}</p>
                      <div className="mt-4">
                        <Link
                          href="/calculator"
                          className="text-sm font-semibold text-leaf-700 dark:text-leaf-300 hover:underline"
                        >
                          Calculate exact dose in the fertilizer calculator →
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reference table */}
      <div className="mt-12">
        <h2 className="font-display text-2xl font-semibold mb-4">
          Quick reference — all deficiencies
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="py-3 pr-4 font-semibold">Nutrient</th>
                <th className="py-3 pr-4 font-semibold">Classic symptom</th>
                <th className="py-3 font-semibold">Fix with</th>
              </tr>
            </thead>
            <tbody>
              {DEFICIENCIES.map((d) => (
                <tr key={d.id} className="border-b border-line/60">
                  <td className="py-3 pr-4 font-medium whitespace-nowrap">{d.fullName}</td>
                  <td className="py-3 pr-4 text-ink-soft">
                    {SYMPTOMS.find((s) => s.id === d.symptoms[0])?.label}
                  </td>
                  <td className="py-3 text-ink-soft">{d.fertilizer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="mt-8">
        <CardBody>
          <p className="text-xs text-ink-soft leading-relaxed">
            <strong className="text-ink">Disclaimer:</strong> Visual symptoms
            overlap between deficiencies, pests, and diseases. This checker is
            an educational guide based on standard agronomic references — it is
            not a substitute for a laboratory soil or tissue test. When in
            doubt, get your soil tested before applying corrective fertilizer.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
