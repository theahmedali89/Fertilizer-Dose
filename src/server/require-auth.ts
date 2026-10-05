import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Current session user, or null. Never throws. */
export async function currentUser() {
  try {
    const session = await auth();
    return session?.user ?? null;
  } catch {
    return null;
  }
}

/** Require any signed-in user; redirect to /login otherwise. */
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require EDITOR or ADMIN; redirect to /login, or 404 for signed-in non-staff. */
export async function requireStaff() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return user;
}

/** Require ADMIN. */
export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return user;
}
