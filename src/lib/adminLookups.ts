/**
 * Shared admin lookup lists.
 *
 * NOTE: these live here (not in `@/server/actions/admin`) because a
 * `"use server"` module may only export async functions. Client components
 * and server actions both import from this module.
 */
export const SOURCE_TYPES = [
  { value: "government", label: "Government" },
  { value: "university", label: "University" },
  { value: "extension", label: "Extension service" },
  { value: "research", label: "Research institute" },
  { value: "international", label: "International organization" },
  { value: "peer_reviewed", label: "Peer-reviewed research" },
  { value: "other", label: "Other" },
] as const;

export const TRANSLATION_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "machine_translated", label: "Machine translated" },
  { value: "review_required", label: "Review required" },
  { value: "reviewed", label: "Reviewed" },
  { value: "published", label: "Published" },
] as const;
