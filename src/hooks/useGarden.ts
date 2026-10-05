"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  EMPTY_GARDEN,
  loadGarden,
  saveGarden,
  newId,
  type GardenPlot,
  type Planting,
  type SavedCalculation,
  type GardenReminder,
  type GardenState,
  type AreaUnit,
} from "@/lib/garden";

/* Module-level store so every useGarden() instance shares one subscription. */

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === "fertilizer-dose.garden.v1") cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): GardenState {
  return loadGarden();
}

function getServerSnapshot(): GardenState {
  return EMPTY_GARDEN;
}

function updateStore(fn: (s: GardenState) => GardenState): void {
  const next = fn(getSnapshot());
  saveGarden(next);
  emit();
}

/** Subscribe to garden mutations (same-tab). Used by GardenSync for cloud push. */
export function subscribeToGarden(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * Client-side garden store (localStorage). SSR-safe via useSyncExternalStore:
 * the server renders the empty garden, the client hydrates with stored data.
 * Callers should handle the brief empty state as "loading".
 */
export function useGarden() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addPlot = useCallback((plot: Omit<GardenPlot, "id" | "createdAt">) => {
    const full: GardenPlot = { ...plot, id: newId(), createdAt: new Date().toISOString() };
    updateStore((s) => ({ ...s, plots: [...s.plots, full] }));
    return full.id;
  }, []);

  const updatePlot = useCallback((id: string, patch: Partial<GardenPlot>) => {
    updateStore((s) => ({
      ...s,
      plots: s.plots.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const removePlot = useCallback((id: string) => {
    updateStore((s) => ({
      ...s,
      plots: s.plots.filter((p) => p.id !== id),
      plantings: s.plantings.filter((p) => p.plotId !== id),
      reminders: s.reminders.filter((r) => r.plotId !== id),
    }));
  }, []);

  const addPlanting = useCallback((planting: Omit<Planting, "id" | "createdAt">) => {
    const full: Planting = { ...planting, id: newId(), createdAt: new Date().toISOString() };
    updateStore((s) => ({ ...s, plantings: [...s.plantings, full] }));
    return full.id;
  }, []);

  const updatePlanting = useCallback((id: string, patch: Partial<Planting>) => {
    updateStore((s) => ({
      ...s,
      plantings: s.plantings.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const removePlanting = useCallback((id: string) => {
    updateStore((s) => ({
      ...s,
      plantings: s.plantings.filter((p) => p.id !== id),
      reminders: s.reminders.filter((r) => r.plantingId !== id),
    }));
  }, []);

  const addCalculation = useCallback((calc: Omit<SavedCalculation, "id" | "createdAt">) => {
    const full: SavedCalculation = { ...calc, id: newId(), createdAt: new Date().toISOString() };
    updateStore((s) => ({ ...s, calculations: [full, ...s.calculations].slice(0, 50) }));
    return full.id;
  }, []);

  const removeCalculation = useCallback((id: string) => {
    updateStore((s) => ({
      ...s,
      calculations: s.calculations.filter((c) => c.id !== id),
    }));
  }, []);

  const addReminder = useCallback(
    (reminder: Omit<GardenReminder, "id" | "createdAt" | "done">) => {
      const full: GardenReminder = {
        ...reminder,
        id: newId(),
        done: false,
        createdAt: new Date().toISOString(),
      };
      updateStore((s) => ({ ...s, reminders: [...s.reminders, full] }));
      return full.id;
    },
    []
  );

  const toggleReminder = useCallback((id: string) => {
    updateStore((s) => ({
      ...s,
      reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
    }));
  }, []);

  const removeReminder = useCallback((id: string) => {
    updateStore((s) => ({
      ...s,
      reminders: s.reminders.filter((r) => r.id !== id),
    }));
  }, []);

  return {
    state,
    addPlot,
    updatePlot,
    removePlot,
    addPlanting,
    updatePlanting,
    removePlanting,
    addCalculation,
    removeCalculation,
    addReminder,
    toggleReminder,
    removeReminder,
  };
}

export type { AreaUnit };
