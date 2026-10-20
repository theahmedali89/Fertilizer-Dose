import type { TimelineStage } from "@/lib/timeline-parse";

/**
 * Calendar dates for a parsed schedule stage.
 *
 * HONESTY RULE: dates are computed ONLY from a numeric day offset that the
 * source recommendation itself states (surfaced by the timeline parser as
 * stage.day, e.g. "Day 0", "Day 25–30"). Stages whose source gives no numeric
 * offset return null — a date is never guessed.
 */
export interface StageDateRange {
  start: Date;
  end?: Date;
}

function parseDayOffset(day: string | undefined): { from: number; to?: number } | null {
  if (!day) return null;
  const range = day.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) return { from: parseInt(range[1], 10), to: parseInt(range[2], 10) };
  const single = day.match(/(\d+)/);
  if (single) return { from: parseInt(single[1], 10) };
  return null;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Parse an <input type="date"> value (yyyy-mm-dd) as a UTC date, or null. */
export function parseSowingDate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function stageDateRange(stage: TimelineStage, sowing: Date): StageDateRange | null {
  const off = parseDayOffset(stage.day);
  if (!off) return null;
  const start = addDays(sowing, off.from);
  return off.to != null && off.to !== off.from
    ? { start, end: addDays(sowing, off.to) }
    : { start };
}

export function formatStageDate(range: StageDateRange, locale: string): string {
  const fmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return range.end
    ? `${fmt.format(range.start)} – ${fmt.format(range.end)}`
    : fmt.format(range.start);
}
