/**
 * Expert Field Advice — practical fertilizer application tips
 * drawn from agronomy extension guidance (fertigation, broadcast, placement).
 *
 * Tips are shown as "Pro Tips" cards in calculator results and crop pages
 * so farmers learn HOW to apply, not just how much.
 */

export type AdviceCategory =
  | "urea"
  | "dap"
  | "potash"
  | "fertigation"
  | "general";

export interface ExpertTip {
  /** Short, scannable headline */
  title: string;
  /** 1–2 sentence practical explanation */
  description: string;
  category: AdviceCategory;
  /** Emoji used as the card icon — no extra library needed */
  icon: string;
  /** Optional warning tone (amber) instead of info tone (green) */
  tone?: "info" | "warning";
}

/** Category metadata for grouping / filtering */
export const ADVICE_CATEGORIES: Record<
  AdviceCategory,
  { label: string; icon: string }
> = {
  urea: { label: "Urea (Nitrogen)", icon: "⚠️" },
  dap: { label: "DAP (Phosphorus)", icon: "💧" },
  potash: { label: "Potash", icon: "🧪" },
  fertigation: { label: "Fertigation Technique", icon: "🚰" },
  general: { label: "General", icon: "💡" },
};

/** All tips. Filter by category with `tipsForCategory`. */
export const EXPERT_TIPS: ExpertTip[] = [
  {
    title: "Do NOT flood urea with irrigation water",
    description:
      "Flooding urea causes 40–50% loss through leaching and denitrification. Broadcast it 1–3 days after irrigation on moist (tar-wattar) soil for 30%+ better absorption.",
    category: "urea",
    icon: "⚠️",
    tone: "warning",
  },
  {
    title: "Broadcast urea 1–2 days after watering",
    description:
      "Let the field drain, then broadcast urea on moist soil. Never broadcast on dry soil — ammonia volatilization wastes the nitrogen.",
    category: "urea",
    icon: "🌱",
  },
  {
    title: "Flood DAP if you missed it at sowing",
    description:
      "DAP is hard to dissolve, so use a DAP solvent and fertigate with the first or second irrigation. Flooding beats broadcasting for phosphorus recovery.",
    category: "dap",
    icon: "💧",
  },
  {
    title: "Dissolve DAP before flooding",
    description:
      "Undissolved DAP granules settle and distribute unevenly. Dissolve it in a drum with DAP solvent first, then feed it through the irrigation flow.",
    category: "dap",
    icon: "🪣",
  },
  {
    title: "Split potash: 50% at sowing, 50% at flowering",
    description:
      "Potash applied at sowing supports roots; the flowering split improves grain/fruit quality and size. Use SOP for chloride-sensitive crops.",
    category: "potash",
    icon: "🧪",
  },
  {
    title: "Open the drum valve AFTER water covers 25% of the plot",
    description:
      "Opening too early exhausts the fertilizer before water reaches the far end. Wait until 1–1.5 kanal of water has entered, then open the valve for uniform distribution.",
    category: "fertigation",
    icon: "🚰",
  },
  {
    title: "Close the drum 10 minutes before stopping water",
    description:
      "The last flow of water carries the remaining fertilizer to the far end of the field. Closing early leaves fertilizer stuck near the inlet.",
    category: "fertigation",
    icon: "⏱️",
  },
  {
    title: "No laser leveling? Make 2–4 plots per acre",
    description:
      "On unleveled fields, divide one acre into 2 plots (heavy clay) or 3–4 plots (loamy soil) and fertigate each separately for even distribution.",
    category: "fertigation",
    icon: "🗺️",
  },
  {
    title: "Get a soil test every 2–3 years",
    description:
      "Blanket doses waste money. A soil test tells you exactly which nutrient is low, medium, or high — then adjust the NPK recommendation accordingly.",
    category: "general",
    icon: "🧬",
  },
  {
    title: "Match fertilizer to deficiency symptoms",
    description:
      "Yellow lower leaves = nitrogen; purple leaves = phosphorus; scorched leaf edges = potassium. Check symptoms before adding more fertilizer.",
    category: "general",
    icon: "🔍",
  },
];

/** Return tips for one or more categories, preserving original order. */
export function tipsForCategory(
  ...categories: AdviceCategory[]
): ExpertTip[] {
  if (categories.length === 0) return EXPERT_TIPS;
  const set = new Set(categories);
  return EXPERT_TIPS.filter((t) => set.has(t.category));
}
