/**
 * Non-monetary contributor reward levels.
 * Levels are computed from the APPROVED suggestion count — never from
 * submissions, so gaming the queue earns nothing.
 */
export type ContributorLevel = "none" | "contributor" | "trusted" | "expert";

export const LEVEL_THRESHOLDS = {
  contributor: 1, // 🌱 Contributor
  trusted: 5, // 🌾 Trusted Farmer — earns priority review
  expert: 20, // 🏅 Agri Expert — earns a printable certificate
} as const;

export function levelForCount(approvedCount: number): ContributorLevel {
  if (approvedCount >= LEVEL_THRESHOLDS.expert) return "expert";
  if (approvedCount >= LEVEL_THRESHOLDS.trusted) return "trusted";
  if (approvedCount >= LEVEL_THRESHOLDS.contributor) return "contributor";
  return "none";
}

export const LEVEL_META: Record<
  Exclude<ContributorLevel, "none">,
  { emoji: string; key: string }
> = {
  contributor: { emoji: "🌱", key: "contributor" },
  trusted: { emoji: "🌾", key: "trusted" },
  expert: { emoji: "🏅", key: "expert" },
};

/** Trusted tier and above get fast-track queue placement (priority review). */
export function hasPriorityReview(approvedCount: number): boolean {
  return levelForCount(approvedCount) === "trusted" || levelForCount(approvedCount) === "expert";
}
