"use client";

import { useTransition } from "react";
import { setSuggestionStatus, deleteSuggestion } from "@/server/actions/admin";

export function SuggestionActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.error ?? "Action failed.");
    });

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setSuggestionStatus(id, "APPROVED"))}
            className="rounded-xl bg-leaf-700 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-800 disabled:opacity-50 dark:bg-leaf-600 dark:hover:bg-leaf-500"
          >
            Approve (mark reviewed)
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setSuggestionStatus(id, "REJECTED"))}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-2 disabled:opacity-50"
          >
            Reject
          </button>
        </>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this suggestion permanently?")) run(() => deleteSuggestion(id));
        }}
        className="rounded-xl px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        Delete
      </button>
    </div>
  );
}
