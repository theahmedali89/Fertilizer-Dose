import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/server/rate-limit";

const schema = z.object({
  email: z.string().email(),
  secret: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? "unknown").trim();
}

/** Constant-time secret comparison — no timing leak, even on length mismatch. */
function secretsMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // Dummy equal-length comparison so a length mismatch costs the same time.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/**
 * POST /api/auth/reset-password
 * Admin password reset via secret token (no email infrastructure).
 * Requires PASSWORD_RESET_SECRET env var to match.
 *
 * Hardened:
 * - 5 attempts/hour per IP (brute-force protection)
 * - Constant-time secret comparison (crypto.timingSafeEqual)
 * - No user enumeration: unknown emails get the same response and the same
 *   timing (dummy bcrypt work on the miss path)
 * - Fail closed (503) when the secret is not configured
 */
export async function POST(req: NextRequest) {
  const resetSecret = process.env.PASSWORD_RESET_SECRET;
  if (!resetSecret) {
    return NextResponse.json(
      { ok: false, message: "Password reset is not configured." },
      { status: 503 }
    );
  }

  const limit = rateLimit(`reset-password:${clientKey(req)}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Please wait a while and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input." }, { status: 400 });
  }

  const { email, secret, newPassword } = parsed.data;

  if (!secretsMatch(secret, resetSecret)) {
    return NextResponse.json({ ok: false, message: "Invalid secret." }, { status: 403 });
  }

  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });

  // Hash is always computed (same cost on both paths) so a miss takes the
  // same time as a hit — the response never reveals whether the email exists.
  const passwordHash = await bcrypt.hash(newPassword, 12);
  if (user) {
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  } else {
    console.error(`[reset-password] unknown email attempt: ${email.toLowerCase()}`);
  }

  return NextResponse.json({ ok: true });
}
