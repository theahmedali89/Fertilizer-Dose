"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useGarden } from "@/hooks/useGarden";
import { Modal, PlotForm, PlantingForm, ReminderForm } from "./GardenForms";
import {
  daysSince,
  harvestWindowFor,
  getItem,
} from "@/lib/garden";
import { getRegion } from "@/lib/planting";

export function PlotDetail({ plotId }: { plotId: string }) {
  const t = useTranslations("garden");
  const router = useRouter();
  const g = useGarden();
  const [editOpen, setEditOpen] = useState(false);
  const [plantingOpen, setPlantingOpen] = useState(false);
  const [reminderFor, setReminderFor] = useState<string | null>(null);

  const plot = g.state.plots.find((p) => p.id === plotId);
  if (!plot) {
    return (
      <div className="rounded-3xl border border-dashed border-line p-10 text-center">
        <p className="font-display text-lg font-semibold">{t("noPlots")}</p>
        <Link href="/my-garden" className="mt-3 inline-block text-sm font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
          ← {t("backToGarden")}
        </Link>
      </div>
    );
  }

  const plantings = g.state.plantings.filter((p) => p.plotId === plot.id);
  const region = plot.regionId ? getRegion(plot.regionId) : null;

  return (
    <div className="space-y-8">
      <Link href="/my-garden" className="inline-block text-sm font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
        ← {t("backToGarden")}
      </Link>

      {/* Plot header */}
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-semibold">{plot.name}</h1>
              <p className="text-ink-soft mt-1.5 capitalize">
                {plot.area} {plot.unit}
                {plot.location ? ` · ${plot.location}` : ""}
                {region ? ` · ${region.name}, ${region.countryName}` : ""}
              </p>
              {plot.soilType && (
                <p className="text-sm text-ink-faint mt-1">{t("soilType")}: {plot.soilType}</p>
              )}
              {plot.notes && <p className="text-sm text-ink-soft mt-2">{plot.notes}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium hover:border-leaf-600 transition-colors"
              >
                {t("editPlot")}
              </button>
              <button
                onClick={() => {
                  if (window.confirm(t("confirmDeletePlot"))) {
                    g.removePlot(plot.id);
                    router.push("/my-garden");
                  }
                }}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:border-red-500 transition-colors"
              >
                {t("deletePlot")}
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Plantings */}
      <section aria-labelledby="plantings-h">
        <div className="flex items-center justify-between mb-3">
          <h2 id="plantings-h" className="font-display text-xl font-semibold">
            {t("activePlantings")} ({plantings.length})
          </h2>
          <button
            onClick={() => setPlantingOpen(true)}
            className="rounded-xl bg-leaf-700 dark:bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
          >
            + {t("addPlanting")}
          </button>
        </div>
        {plantings.length === 0 ? (
          <p className="text-sm text-ink-faint">{t("noPlotsHint")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {plantings.map((pl) => {
              const item = getItem(pl.itemSlug);
              const harvest = harvestWindowFor(pl, plot.regionId);
              return (
                <Card key={pl.id}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold">
                          {item ? item.name : pl.itemSlug}
                        </h3>
                        <p className="text-xs text-ink-faint mt-0.5">
                          {pl.plantedOn} · {t("plantedDaysAgo", { days: daysSince(pl.plantedOn) })}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(t("confirmDeletePlanting"))) g.removePlanting(pl.id);
                        }}
                        aria-label={t("delete")}
                        className="text-ink-faint hover:text-red-600 transition-colors text-lg leading-none px-1"
                      >
                        ×
                      </button>
                    </div>
                    <dl className="mt-3 space-y-1.5 text-sm">
                      {pl.stage && (
                        <div className="flex gap-2">
                          <dt className="w-28 shrink-0 text-ink-faint text-[13px]">{t("stage")}</dt>
                          <dd><Badge variant="neutral">{pl.stage}</Badge></dd>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <dt className="w-28 shrink-0 text-ink-faint text-[13px]">{t("harvestWindow")}</dt>
                        <dd className="text-ink-soft">{harvest ?? t("notAvailable")}</dd>
                      </div>
                    </dl>
                    {pl.notes && <p className="mt-2.5 text-sm text-ink-soft">{pl.notes}</p>}
                    <button
                      onClick={() => setReminderFor(pl.id)}
                      className="mt-3 text-xs font-semibold text-leaf-700 dark:text-leaf-300 hover:underline"
                    >
                      + {t("addReminder")}
                    </button>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {editOpen && (
        <Modal title={t("editPlot")} onClose={() => setEditOpen(false)}>
          <PlotForm
            initial={plot}
            onSubmit={(v) => {
              g.updatePlot(plot.id, v);
              setEditOpen(false);
            }}
            onCancel={() => setEditOpen(false)}
          />
        </Modal>
      )}
      {plantingOpen && (
        <Modal title={t("addPlanting")} onClose={() => setPlantingOpen(false)}>
          <PlantingForm
            plotId={plot.id}
            onSubmit={(v) => {
              g.addPlanting(v);
              setPlantingOpen(false);
            }}
            onCancel={() => setPlantingOpen(false)}
          />
        </Modal>
      )}
      {reminderFor && (
        <Modal title={t("addReminder")} onClose={() => setReminderFor(null)}>
          <ReminderForm
            plotId={plot.id}
            plantingId={reminderFor}
            onSubmit={(v) => {
              g.addReminder(v);
              setReminderFor(null);
            }}
            onCancel={() => setReminderFor(null)}
          />
        </Modal>
      )}
    </div>
  );
}
