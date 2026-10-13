"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ALT_FERTILIZERS,
  findAlternatives,
  optionNotes,
  targetNutrients,
  dimLabel,
  type AltOption,
} from "@/lib/alternatives";
import { cn } from "@/lib/utils";

type Dim = "n" | "p" | "k";

function fmtBags(b: number): string {
  return Number.isInteger(b) ? String(b) : b.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function Select({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/30"
      >
        <option value="">— Select fertilizer —</option>
        {ALT_FERTILIZERS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function matchBadge(pct: number) {
  if (pct >= 90)
    return <Badge className="bg-leaf-600 text-white">≈{pct}% match</Badge>;
  if (pct >= 75)
    return <Badge className="bg-amber-500 text-white">≈{pct}% match</Badge>;
  return <Badge className="bg-ink-faint/20 text-ink">≈{pct}% match</Badge>;
}

function OptionCard({ option, rank }: { option: AltOption; rank: number }) {
  const notes = optionNotes(option);
  const dims = (["n", "p", "k"] as Dim[]).filter((d) => option.needed[d] > 0);
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">Option {rank}</h3>
        {matchBadge(option.matchPct)}
      </div>

      <ul className="mt-3 space-y-1.5">
        {option.items.map((it) => (
          <li key={it.fertilizer.id} className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-ink">{it.fertilizer.name}</span>
            <span className="shrink-0 rounded-lg bg-leaf-100 dark:bg-leaf-950/60 border border-leaf-200 dark:border-leaf-800 px-2.5 py-0.5 font-semibold text-leaf-800 dark:text-leaf-200">
              {fmtBags(it.bags)} {it.bags === 1 ? "bag" : "bags"}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="pb-1.5 pr-3 font-semibold">Nutrient</th>
              <th className="pb-1.5 pr-3 font-semibold">Needed</th>
              <th className="pb-1.5 font-semibold">This option gives</th>
            </tr>
          </thead>
          <tbody>
            {dims.map((d) => {
              const need = option.needed[d];
              const got = option.provided[d];
              const ok = Math.abs(got - need) / need <= 0.1;
              return (
                <tr key={d} className="border-t border-line/60">
                  <td className="py-1.5 pr-3 font-medium text-ink">{dimLabel(d)}</td>
                  <td className="py-1.5 pr-3 text-ink-soft">{need.toFixed(1)} kg</td>
                  <td className={cn("py-1.5 font-semibold", ok ? "text-leaf-700 dark:text-leaf-400" : "text-amber-700 dark:text-amber-400")}>
                    {got.toFixed(1)} kg {ok ? "✓" : "≈"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {notes.length > 0 && (
        <ul className="mt-3 space-y-1.5 rounded-xl bg-leaf-50 dark:bg-leaf-950/30 border border-leaf-200 dark:border-leaf-800 p-3.5">
          {notes.map((n, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-soft">
              <span aria-hidden className="shrink-0">💡</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AlternativeFinder() {
  const [fert, setFert] = useState("");
  const [bagsStr, setBagsStr] = useState("1");
  const [searched, setSearched] = useState(false);

  const bags = parseFloat(bagsStr);
  const valid = fert !== "" && Number.isFinite(bags) && bags > 0;
  const options: AltOption[] = searched && valid ? findAlternatives(fert, bags) : [];
  const needed = searched && valid ? targetNutrients(fert, bags) : null;
  const fertName = ALT_FERTILIZERS.find((f) => f.id === fert)?.name ?? "";

  const onFind = () => {
    if (valid) setSearched(true);
  };

  return (
    <div>
      <Card>
        <CardBody className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Fertilizer you need an alternative for"
              value={fert}
              onChange={(v) => {
                setFert(v);
                setSearched(false);
              }}
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Quantity (50 kg bags)
              </span>
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={bagsStr}
                onChange={(e) => {
                  setBagsStr(e.target.value);
                  setSearched(false);
                }}
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/30"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={onFind}
            disabled={!valid}
            className="w-full rounded-xl bg-leaf-600 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Find alternatives
          </button>
        </CardBody>
      </Card>

      {searched && valid && needed && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">
              {fmtBags(bags)} {bags === 1 ? "bag" : "bags"} of {fertName}
            </span>{" "}
            supplies{" "}
            {(["n", "p", "k"] as Dim[])
              .filter((d) => needed[d] > 0)
              .map((d) => `${needed[d].toFixed(1)} kg ${dimLabel(d)}`)
              .join(" + ")}
            . Closest equivalent combinations:
          </p>
          {options.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-sm text-ink-soft">
                  No practical alternative found for this product with common
                  fertilizers. Try the main dose calculator for a full schedule
                  instead.
                </p>
              </CardBody>
            </Card>
          ) : (
            options.map((o, i) => <OptionCard key={i} option={o} rank={i + 1} />)
          )}
          <p className="text-xs leading-relaxed text-ink-faint">
            These are nutrient-equivalent suggestions based on standard product
            grades (50 kg bags). Actual grades vary by brand — always check the
            label. Prices and availability are not tracked here; confirm with
            your local dealer before buying.
          </p>
        </div>
      )}
    </div>
  );
}
