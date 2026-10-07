import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, isDbConfigured } from "@/lib/db";
import { rateLimit } from "@/server/rate-limit";

const TYPES = ["TRANSLATION", "DATA_CORRECTION", "DATA_REQUEST", "FIELD_EXPERIENCE"] as const;

const bodySchema = z.object({
  type: z.enum(TYPES),
  locale: z.string().trim().max(10).optional().nullable(),
  pageUrl: z.string().trim().max(500).optional().nullable(),
  fieldKey: z.string().trim().max(200).optional().nullable(),
  issueText: z.string().trim().max(2000).optional().nullable(),
  submittedText: z.string().trim().min(3).max(5000),
  sourceUrl: z.string().trim().max(1000).optional().nullable(),
  sourceText: z.string().trim().max(1000).optional().nullable(),
  // Field-experience report fields (FIELD_EXPERIENCE only)
  district: z.string().trim().max(120).optional().nullable(),
  variety: z.string().trim().max(120).optional().nullable(),
  appliedText: z.string().trim().max(2000).optional().nullable(),
  yieldText: z.string().trim().max(500).optional().nullable(),
  cropSlug: z.string().trim().max(120).optional().nullable(),
  // Contributor identity (optional — shown publicly ONLY after admin approval)
  contributorName: z.string().trim().max(80).optional().nullable(),
  contributorImage: z
    .string()
    .trim()
    .max(300)
    .regex(/^\/uploads\/contributors\/[a-f0-9]{32}\.(jpg|png|webp|gif)$/, "Invalid image reference.")
    .optional()
    .nullable(),
  contributorToken: z.string().trim().max(100).optional().nullable(),
  // Honeypot — real users never fill this; bots do.
  website: z.string().max(200).optional().nullable(),
}).superRefine((v, ctx) => {
  // DATA_CORRECTION must cite a source — a link OR a written reference
  // (e.g. "PAU Package of Practices 2024, p.23"). One of them is required.
  if (v.type === "DATA_CORRECTION") {
    const u = (v.sourceUrl ?? "").trim();
    const st = (v.sourceText ?? "").trim();
    if (!u && !st) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sourceUrl"], message: "A source is required for data corrections: a link or a written reference." });
    } else if (u && !/^https?:\/\//i.test(u)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sourceUrl"], message: "Source URL must start with http(s)://" });
    }
  }
  // FIELD_EXPERIENCE must say what was actually applied.
  if (v.type === "FIELD_EXPERIENCE") {
    if (!(v.appliedText ?? "").trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["appliedText"], message: "Please tell us what you applied." });
    }
  }
});

function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? "unknown").trim();
}

/**
 * Crowd-sourced suggestion intake.
 * - Rate-limited: 10 submissions / hour per IP (no login required).
 * - Honeypot rejects bots silently (returns 201 to avoid tipping them off).
 * - SAFETY: submissions land in UserSuggestion as PENDING. Nothing here
 *   writes to GrowingItem, FertilizerRecommendation, locale files, or any
 *   other live table — admin review is the only path to publication.
 */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`suggestions:${clientKey(req)}`, 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many suggestions. Please wait a while and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0] ?? "field")))];
    return NextResponse.json(
      { error: `Please check these fields: ${fields.join(", ")}.` },
      { status: 400 }
    );
  }

  const v = parsed.data;

  // Honeypot: pretend success so bots learn nothing.
  if (v.website && v.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Suggestions are temporarily unavailable." }, { status: 503 });
  }

  try {
    // Trusted-tier fast-track: contributors with 5+ approved suggestions get
    // priority queue placement. Queue prioritization only — approval standards
    // are unchanged.
    let priority = false;
    const token = v.contributorToken?.trim() || null;
    if (token) {
      try {
        const c = await db.contributor.findUnique({ where: { token }, select: { approvedCount: true } });
        if (c && c.approvedCount >= 5) priority = true;
      } catch {
        /* contributor lookup failure must not block the suggestion */
      }
    }

    await db.userSuggestion.create({
      data: {
        type: v.type,
        locale: v.locale?.trim() || null,
        pageUrl: v.pageUrl?.trim() || null,
        fieldKey: v.fieldKey?.trim() || null,
        issueText: v.issueText?.trim() || null,
        submittedText: v.submittedText.trim(),
        sourceUrl: v.sourceUrl?.trim() || null,
        sourceText: v.sourceText?.trim() || null,
        district: v.district?.trim() || null,
        variety: v.variety?.trim() || null,
        appliedText: v.appliedText?.trim() || null,
        yieldText: v.yieldText?.trim() || null,
        cropSlug: v.cropSlug?.trim() || null,
        contributorName: v.contributorName?.trim() || null,
        contributorImage: v.contributorImage?.trim() || null,
        contributorToken: token,
        priority,
        // status defaults to PENDING — never set anything else here.
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not save your suggestion. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
