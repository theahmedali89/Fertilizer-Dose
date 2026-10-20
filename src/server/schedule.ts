/**
 * Schedule Builder data — stage-wise fertilizer schedules built ONLY from
 * FertilizerRecommendation rows that carry application timing/method text
 * (the verified split schedules researched per crop × country). Nothing is
 * synthesized: a crop appears here only when a sourced recommendation with
 * timing/method exists for the visitor's country.
 */
import { db } from "@/lib/db";
import { parseApplicationTimeline, type TimelineStage } from "@/lib/timeline-parse";

export interface ScheduleRec {
  id: string;
  n: number | null;
  p2o5: number | null;
  k2o: number | null;
  nMin: number | null;
  nMax: number | null;
  p2o5Min: number | null;
  p2o5Max: number | null;
  k2oMin: number | null;
  k2oMax: number | null;
  applicationTiming: string | null;
  applicationMethod: string | null;
  micronutrients: string | null;
  timeline: TimelineStage[];
  verificationStatus: string;
  isPrimary: boolean;
  contextLabel: string | null;
  regionName: string | null;
  source: { organization: string; title: string; url: string | null } | null;
}

export interface ScheduleCrop {
  slug: string;
  name: string;
  category: string;
  schedules: ScheduleRec[];
}

export interface ScheduleData {
  country: { code: string; name: string; slug: string } | null;
  crops: ScheduleCrop[];
}

const EMPTY: ScheduleData = { country: null, crops: [] };

/**
 * Pick the richest stage parse for a recommendation. The method prose and
 * the timing text carry the split in different shapes (the veg-dose records
 * state the stages in the timing text; older batches state them in the
 * method). Both parses come from the SAME source texts — nothing added.
 */
function bestTimeline(
  method: string | null,
  timing: string | null,
): TimelineStage[] {
  const fromMethod = parseApplicationTimeline(method, timing);
  const fromTiming = timing
    ? parseApplicationTimeline(timing, null)
    : [];
  // Score: more stages wins; then more stages carrying a day offset; then a
  // schedule that starts at Day 0 (the method parse can inherit the LAST
  // stage's offset onto stage 1 via the timing hint — the timing parse
  // attributes offsets to the right stages).
  const score = (stages: TimelineStage[]) =>
    stages.length * 4 +
    stages.filter((s) => s.day).length * 2 +
    (stages[0]?.day === "Day 0" ? 1 : 0);
  const picked =
    score(fromTiming) > score(fromMethod) ? fromTiming : fromMethod;
  // Drop exact duplicate stages (same label + day) the chunker can produce.
  const seen = new Set<string>();
  return picked.filter((s) => {
    const key = `${s.label}|${s.day ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getScheduleData(
  countryCodeOverride?: string,
): Promise<ScheduleData> {
  // Static build phase renders from fallbacks (same contract as data.ts).
  const { isDbConfigured } = await import("@/lib/db");
  if (!isDbConfigured()) return EMPTY;
  try {
    const { getSelectedCountryCode } = await import("@/server/country");
    const countryCode =
      countryCodeOverride ??
      (await getSelectedCountryCode().catch(() => "PK"));
    const country = await db.country.findUnique({
      where: { code: countryCode },
      select: { id: true, code: true, name: true, slug: true },
    });
    if (!country) return EMPTY;

    const recs = await db.fertilizerRecommendation.findMany({
      where: {
        countryId: country.id,
        verificationStatus: { in: ["verified", "published", "under_review"] },
        OR: [
          { applicationTiming: { not: null } },
          { applicationMethod: { not: null } },
        ],
      },
      include: {
        item: { select: { slug: true, name: true, category: true } },
        region: { select: { name: true } },
        source: { select: { organization: true, title: true, url: true } },
      },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });

    const byCrop = new Map<string, ScheduleCrop>();
    for (const r of recs) {
      // Parse the source texts into stages (richest parse wins).
      const timeline = bestTimeline(r.applicationMethod, r.applicationTiming);
      const contextParts = [
        r.variety,
        r.soilContext,
        r.irrigationContext,
        r.growthStage,
        r.region?.name,
      ].filter(Boolean) as string[];
      const rec: ScheduleRec = {
        id: r.id,
        n: r.n,
        p2o5: r.p2o5,
        k2o: r.k2o,
        nMin: r.nMin,
        nMax: r.nMax,
        p2o5Min: r.p2o5Min,
        p2o5Max: r.p2o5Max,
        k2oMin: r.k2oMin,
        k2oMax: r.k2oMax,
        applicationTiming: r.applicationTiming,
        applicationMethod: r.applicationMethod,
        micronutrients: r.micronutrients,
        timeline,
        verificationStatus: r.verificationStatus,
        isPrimary: r.isPrimary,
        contextLabel: contextParts.length ? contextParts.join(" · ") : null,
        regionName: r.region?.name ?? null,
        source: r.source
          ? { organization: r.source.organization, title: r.source.title, url: r.source.url }
          : null,
      };
      const slug = r.item.slug;
      if (!byCrop.has(slug)) {
        byCrop.set(slug, {
          slug,
          name: r.item.name,
          category: r.item.category,
          schedules: [],
        });
      }
      byCrop.get(slug)!.schedules.push(rec);
    }

    // Verified/published schedules before under_review ones within each crop
    // (primaries already first via orderBy; stable sort keeps that).
    for (const crop of byCrop.values()) {
      crop.schedules.sort((a, b) => {
        const rank = (s: string) => (s === "under_review" ? 1 : 0);
        return rank(a.verificationStatus) - rank(b.verificationStatus);
      });
    }

    const crops = [...byCrop.values()].sort((a, b) => a.name.localeCompare(b.name));
    return {
      country: { code: country.code, name: country.name, slug: country.slug },
      crops,
    };
  } catch (e) {
    console.error("[schedule] database read failed:", (e as Error).message);
    return EMPTY;
  }
}
