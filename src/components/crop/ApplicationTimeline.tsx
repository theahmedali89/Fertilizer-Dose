"use client";

import type { TimelineStage } from "@/lib/timeline-parse";

/** Small inline SVG icons — no extra library needed. */
function StageIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  // 🌱 sowing, 💧 irrigation, 🌿 vegetative, 🌸 flowering, 🍇 fruit
  let emoji = "🌱";
  if (/irrigation|water/.test(l)) emoji = "💧";
  else if (/tillering|vegetative|earthing/.test(l)) emoji = "🌿";
  else if (/flower|bloom|anthesis/.test(l)) emoji = "🌸";
  else if (/fruit|berry|veraison|ripen/.test(l)) emoji = "🍇";
  else if (/top-dress|side-dress/.test(l)) emoji = "🧪";
  else if (/harvest/.test(l)) emoji = "🚜";
  return (
    <span role="img" aria-label={label} className="text-xl leading-none">
      {emoji}
    </span>
  );
}

function FertilizerChips({ stage }: { stage: TimelineStage }) {
  if (stage.fertilizers.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {stage.fertilizers.map((f, i) => (
        <span
          key={i}
          className="inline-flex items-center rounded-full bg-leaf-100 dark:bg-leaf-950/60 border border-leaf-200 dark:border-leaf-800 px-2.5 py-0.5 text-xs font-medium text-leaf-800 dark:text-leaf-200"
        >
          {f.name}
          {f.amount && <span className="ml-1 font-normal opacity-80">{f.amount}</span>}
        </span>
      ))}
    </div>
  );
}

/**
 * Visual application timeline — horizontal on desktop, vertical on mobile.
 * Green (leaf) theme, dark-mode aware.
 */
export function ApplicationTimeline({ stages }: { stages: TimelineStage[] }) {
  if (stages.length === 0) return null;

  return (
    <div className="mt-2" aria-label="Fertilizer application timeline">
      {/* ── Desktop: horizontal ─────────────────────────────── */}
      <ol className="hidden md:flex items-stretch">
        {stages.map((s, i) => (
          <li key={i} className="relative flex-1 px-2 first:pl-0 last:pr-0">
            {/* connector line */}
            {i > 0 && (
              <div
                aria-hidden
                className="absolute top-6 left-0 -translate-x-1/2 w-full h-0.5 bg-leaf-200 dark:bg-leaf-800"
              />
            )}
            <div className="relative flex flex-col items-center text-center">
              <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-leaf-600 dark:bg-leaf-500 text-white shadow-md ring-4 ring-leaf-100 dark:ring-leaf-950">
                <StageIcon label={s.label} />
              </div>
              {s.day && (
                <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-leaf-700 dark:text-leaf-300">
                  {s.day}
                </span>
              )}
              <span className="mt-0.5 text-sm font-semibold text-ink">{s.label}</span>
              <FertilizerChips stage={s} />
              {s.note && (
                <p className="mt-1.5 text-xs leading-relaxed text-ink-faint max-w-[220px]">
                  {s.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* ── Mobile: vertical ────────────────────────────────── */}
      <ol className="md:hidden relative pl-1">
        <div
          aria-hidden
          className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-leaf-200 dark:bg-leaf-800"
        />
        {stages.map((s, i) => (
          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-leaf-600 dark:bg-leaf-500 text-white shadow-md ring-4 ring-leaf-100 dark:ring-leaf-950">
              <StageIcon label={s.label} />
            </div>
            <div className="pt-0.5 min-w-0">
              {s.day && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-leaf-700 dark:text-leaf-300">
                  {s.day}
                </span>
              )}
              <p className="text-sm font-semibold text-ink">{s.label}</p>
              <FertilizerChips stage={s} />
              {s.note && (
                <p className="mt-1 text-xs leading-relaxed text-ink-faint">{s.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
