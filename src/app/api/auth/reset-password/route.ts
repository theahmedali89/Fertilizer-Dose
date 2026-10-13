import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  secret: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

/**
 * POST /api/auth/reset-password
 * Admin password reset via secret token (no email infrastructure).
 * Requires PASSWORD_RESET_SECRET env var to match.
 */
export async function POST(req: NextRequest) {
  const resetSecret = process.env.PASSWORD_RESET_SECRET;
  if (!resetSecret) {
    return NextResponse.json(
      { ok: false, message: "Password reset is not configured." },
      { status: 503 }
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

  // Constant-time-ish comparison to avoid timing leaks
  if (secret.length !== resetSecret.length) {
    return NextResponse.json({ ok: false, message: "Invalid secret." }, { status: 403 });
  }
  let match = 0;
  for (let i = 0; i < secret.length; i++) {
    match |= secret.charCodeAt(i) ^ resetSecret.charCodeAt(i);
  }
  if (match !== 0) {
    return NextResponse.json({ ok: false, message: "Invalid secret." }, { status: 403 });
  }

  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  if (!user) {
    // Don't reveal whether the email exists
    return NextResponse.json({ ok: false, message: "Invalid email or secret." }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
