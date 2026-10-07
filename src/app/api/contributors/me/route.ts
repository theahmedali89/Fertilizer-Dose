import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { levelForCount } from "@/lib/contributors";

/**
 * Look up the current browser's contributor record by its anonymous token.
 * Used by the "My badge" widget on /contributors — no login required.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  if (!token || token.length > 100 || !isDbConfigured()) {
    return NextResponse.json({ contributor: null });
  }
  try {
    const c = await db.contributor.findUnique({
      where: { token },
      select: { name: true, imageUrl: true, approvedCount: true },
    });
    if (!c) return NextResponse.json({ contributor: null });
    return NextResponse.json({
      contributor: {
        name: c.name,
        imageUrl: c.imageUrl,
        approvedCount: c.approvedCount,
        level: levelForCount(c.approvedCount),
      },
    });
  } catch {
    return NextResponse.json({ contributor: null });
  }
}
