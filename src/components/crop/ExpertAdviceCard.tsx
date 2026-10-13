"use client";

import {
  ADVICE_CATEGORIES,
  tipsForCategory,
  type AdviceCategory,
  type ExpertTip,
} from "@/lib/expert-advice";

function TipCard({ tip }: { tip: ExpertTip }) {
  const warning = tip.tone === "warning";
  return (
    <article
      className={`flex gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md ${
        warning
          ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30"
          : "border-leaf-200 dark:border-leaf-800 bg-leaf-50 dark:bg-leaf-950/30"
      }`}
    >
      <span
        role="img"
        aria-hidden
        className="text-2xl leading-none shrink-0 mt-0.5"
      >
        {tip.icon}
      </span>
      <div className="min-w-0">
        <h3
          className={`text-sm font-semibold ${
            warning
              ? "text-amber-900 dark:text-amber-100"
              : "text-leaf-900 dark:text-leaf-100"
          }`}
        >
          {tip.title}
        </h3>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft">
          {tip.description}
        </p>
      </div>
    </article>
  );
}

export interface ExpertAdviceCardProps {
  /** Show only these categories; omit for all tips */
  categories?: AdviceCategory[];
  /** Custom tip list (overrides category filter) */
  tips?: ExpertTip[];
  /** Section heading */
  title?: string;
  /** Optional subtitle under the heading */
  subtitle?: string;
}

/**
 * Expert Field Advice — reusable "Pro Tips" card grid.
 *
 * Drop under calculator results or on crop pages so farmers learn
 * HOW to apply fertilizer, not just how much.
 *
 * Example:
 *   <ExpertAdviceCard categories={["urea", "dap"]} />
 *   <ExpertAdviceCard tips={customTips} title="Field Advice" />
 */
export function ExpertAdviceCard({
  categories,
  tips,
  title = "Expert Field Advice",
  subtitle = "Practical tips from agronomy extension — apply it right, waste less.",
}: ExpertAdviceCardProps) {
  const list = tips ?? tipsForCategory(...(categories ?? []));

  if (list.length === 0) return null;

  // Group chips only when showing multiple categories without a custom list
  const showGroups = !tips && (!categories || categories.length > 1);

  return (
    <section aria-label={title} className="mt-6">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-ink dark:text-ink">
          💡 {title}
        </h2>
        <p className="mt-0.5 text-sm text-ink-faint">{subtitle}</p>
      </div>

      {showGroups && (
        <div className="mb-3 flex flex-wrap gap-1.5" aria-hidden>
          {Array.from(
            new Set(list.map((t) => t.category))
          ).map((c) => (
            <span
              key={c}
              className="inline-flex items-center rounded-full bg-leaf-100 dark:bg-leaf-950/60 border border-leaf-200 dark:border-leaf-800 px-2.5 py-0.5 text-xs font-medium text-leaf-800 dark:text-leaf-200"
            >
              {ADVICE_CATEGORIES[c].icon} {ADVICE_CATEGORIES[c].label}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((tip, i) => (
          <TipCard key={`${tip.category}-${i}`} tip={tip} />
        ))}
      </div>
    </section>
  );
}
