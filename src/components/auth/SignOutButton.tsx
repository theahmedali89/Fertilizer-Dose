"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:border-red-500 transition-colors"
    >
      {label}
    </button>
  );
}
