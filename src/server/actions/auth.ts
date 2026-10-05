"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { db, isDbConfigured } from "@/lib/db";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
});

export type SignupResult = { ok: true } | { ok: false; error: string };

export async function signupAction(formData: FormData): Promise<SignupResult> {
  if (!isDbConfigured()) {
    return { ok: false, error: "Accounts are unavailable right now (database not configured)." };
  }
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please check your name, email and password (min 8 characters)." };
  }
  const { name, email, password } = parsed.data;
  const normalized = email.toLowerCase();

  const existing = await db.user.findUnique({ where: { email: normalized } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists. Try logging in." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // First-ever user becomes ADMIN so the site is manageable from day one.
  const userCount = await db.user.count();
  await db.user.create({
    data: {
      name,
      email: normalized,
      passwordHash,
      role: userCount === 0 ? "ADMIN" : "USER",
    },
  });

  try {
    await signIn("credentials", {
      email: normalized,
      password,
      redirect: false,
    });
  } catch {
    return { ok: false, error: "Account created — please log in." };
  }
  redirect("/account");
}
