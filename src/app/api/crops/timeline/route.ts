import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { parseApplicationTimeline } from "@/lib/timeline-parse";

/**
 * GET /api/crops/timeline?slug=<crop-slug>&country=<code>
 *
 * Public fertilizer application timeline for one crop in one country.
 * The country comes from the query string on purpose: the caller is a
 * client component that reads the visitor's FD_COUNTRY cookie in the
 * browser. This route must NEVER read cookies() itself — the crop detail
 * page is statically prerendered, and a server-side cookie read on that
 * path crashed it with Next.js "Page changed from static to dynamic at
 * runtime, reason: cookies" (2026-10-25, pigeon-pea in non-English
 * locales). Returns { stages: [] } for unknown slugs/countries and on
 * any failure, so the timeline section simply stays hidden.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "";
  const countryCode = (searchParams.get("country") ?? "PK").toUpperCase();
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[A-Z]{2}$/.test(countryCode)) {
    return NextResponse.json({ stages: [] });
  }
  if (!isDbConfigured()) return NextResponse.json({ stages: [] });
  try {
    const country = await db.country.findUnique({
      where: { code: countryCode },
      select: { id: true },
    });
    if (!country) return NextResponse.json({ stages: [] });
    const rec = await db.fertilizerRecommendation.findFirst({
      where: {
        countryId: country.id,
        item: { slug },
        verificationStatus: { in: ["verified", "published", "under_review"] },
      },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      select: { applicationMethod: true, applicationTiming: true },
    });
    if (!rec?.applicationMethod) return NextResponse.json({ stages: [] });
    return NextResponse.json({
      stages: parseApplicationTimeline(rec.applicationMethod, rec.applicationTiming),
    });
  } catch (e) {
    console.error("[crops/timeline] failed:", (e as Error).message);
    return NextResponse.json({ stages: [] });
  }
}
