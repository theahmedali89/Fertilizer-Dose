"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { loadGarden, saveGarden, type GardenState } from "@/lib/garden";
import { subscribeToGarden } from "@/hooks/useGarden";

function mergeRecords<T extends { id: string; createdAt: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  for (const r of local) map.set(r.id, r);
  for (const r of remote) {
    const existing = map.get(r.id);
    if (!existing || r.createdAt > existing.createdAt) map.set(r.id, r);
  }
  return [...map.values()];
}

function mergeStates(local: GardenState, remote: GardenState): GardenState {
  return {
    version: 1,
    plots: mergeRecords(local.plots, remote.plots),
    plantings: mergeRecords(local.plantings, remote.plantings),
    calculations: mergeRecords(local.calculations, remote.calculations),
    reminders: mergeRecords(local.reminders, remote.reminders),
  };
}

type Status = "syncing" | "synced" | "error";

/**
 * Cloud sync for My Garden. Mounted on the garden page.
 * - Signed in: merges browser data with the account's cloud copy (newer wins
 *   per record), then keeps pushing local changes (debounced).
 * - Signed out: renders nothing; everything stays in this browser only.
 */
export function GardenSync() {
  const { data: session, status } = useSession();
  const [syncState, setSyncState] = useState<Status>("syncing");
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialDone = useRef(false);
  const signedIn = status === "authenticated" && !!session?.user;

  useEffect(() => {
    if (!signedIn || initialDone.current) return;
    initialDone.current = true;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/garden/state");
        if (!res.ok) throw new Error("fetch failed");
        const remote = (await res.json()) as GardenState;
        const merged = mergeStates(loadGarden(), {
          version: 1,
          plots: remote.plots ?? [],
          plantings: remote.plantings ?? [],
          calculations: remote.calculations ?? [],
          reminders: remote.reminders ?? [],
        });
        saveGarden(merged);
        // Push merged state so records that only existed locally reach the cloud.
        await fetch("/api/garden/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(merged),
        });
        // Notify all useGarden subscribers of the merged state.
        window.dispatchEvent(new StorageEvent("storage", { key: "fertilizer-dose.garden.v1" }));
        if (!cancelled) setSyncState("synced");
      } catch {
        if (!cancelled) setSyncState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  // Debounced push on every local change (only when signed in).
  useEffect(() => {
    if (!signedIn) return;
    const unsub = subscribeToGarden(() => {
      if (!initialDone.current) return;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      setSyncState("syncing");
      pushTimer.current = setTimeout(async () => {
        try {
          await fetch("/api/garden/state", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loadGarden()),
          });
          setSyncState("synced");
        } catch {
          setSyncState("error");
        }
      }, 2000);
    });
    return () => {
      unsub();
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [signedIn]);

  if (!signedIn || syncState === "error") return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint"
      title={syncState === "synced" ? "Garden is synced to your account" : "Syncing garden…"}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${syncState === "synced" ? "bg-leaf-600" : "bg-amber-500 animate-pulse"}`}
        aria-hidden
      />
      {syncState === "synced" ? "Synced" : "Syncing…"}
    </span>
  );
}
