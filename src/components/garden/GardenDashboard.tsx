"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useGarden } from "@/hooks/useGarden";
import { Modal, PlotForm } from "./GardenForms";
import {
  seasonalSuggestions,
  upcomingTasks,
  getItem,
} from "@/lib/garden";
import { getRegion } from "@/lib/planting";

export function GardenDashboard() {
  const t = useTranslations("garden");
  const locale = useLocale();
  const g = useGarden();
  const router = useRouter();
  const [showPlotForm, setShowPlotForm] = useState(false);

  const suggestions = useMemo(
    () => (g.state ? seasonalSuggestions(g.state, new Date().getMonth() + 1, locale) : []),
    [g.state, locale]
  );
  const tasks = useMemo(() => (g.state ? upcomingTasks(g.state) : []), [g.state]);

  const { plots, plantings, calculations } = g.state;
  const openTasks = tasks.length;

  return (
    <div className="space-y-8">
      {/* Local-storage notice */}
      <p className="inline-flex items-center gap-2 text-xs text-ink-faint bg-surface-2 rounded-full px-3.5 py-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        {t("localNote")}
      </p>

      {/* Overview stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { n: plots.length, label: t("statPlots") },
          { n: plantings.length, label: t("statPlantings") },
          { n: openTasks, label: t("statTasks") },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="text-center py-5">
              <p className="font-display text-3xl sm:text-4xl font-semibold text-leaf-800 dark:text-leaf-300">{s.n}</p>
              <p className="text-xs sm:text-sm text-ink-faint mt-1">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Upcoming tasks */}
      <section aria-labelledby="tasks-h">
        <h2 id="tasks-h" className="font-display text-xl font-semibold mb-3">{t("upcomingTasks")}</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-ink-faint">{t("noTasks")}</p>
        ) : (
          <ul className="space-y-2.5">
            {tasks.slice(0, 6).map(({ reminder, overdue }) => {
              const plot = reminder.plotId ? plots.find((p) => p.id === reminder.plotId) : undefined;
              return (
                <li key={reminder.id}>
                  <Card>
                    <CardBody className="flex items-center gap-3 py-3.5">
                      <button
                        onClick={() => g.toggleReminder(reminder.id)}
                        aria-label={t("markDone")}
                        className="grid place-items-center w-6 h-6 rounded-full border-2 border-line hover:border-leaf-600 transition-colors shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[15px] truncate">{reminder.title}</p>
                        <p className="text-xs text-ink-faint mt-0.5">
                          {reminder.dueDate}
                          {plot ? ` · ${plot.name}` : ""}
                        </p>
                      </div>
                      {overdue && <Badge variant="review">{t("overdue")}</Badge>}
                      <button
                        onClick={() => g.removeReminder(reminder.id)}
                        aria-label={t("delete")}
                        className="text-ink-faint hover:text-red-600 transition-colors text-lg leading-none px-1"
                      >
                        ×
                      </button>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Seasonal suggestions */}
      <section aria-labelledby="sugg-h">
        <h2 id="sugg-h" className="font-display text-xl font-semibold mb-3">{t("seasonalSuggestions")}</h2>
        {suggestions.length === 0 ? (
          <p className="text-sm text-ink-faint">{t("noSuggestions")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.slice(0, 6).map((s) => {
              const item = getItem(s.itemSlug);
              const plot = plots.find((p) => p.id === s.plotId);
              if (!item || !plot) return null;
              return (
                <Card key={`${s.plotId}-${s.itemSlug}`}>
                  <CardBody className="py-4">
                    <p className="font-semibold text-[15px]">{item.name}</p>
                    <p className="text-xs text-ink-faint mt-1">
                      {t("suggestionCta", { item: item.name, plot: plot.name })} · {s.reason}
                    </p>
                    <Link
                      href={`/my-garden/plots/${plot.id}`}
                      className="mt-2 inline-block text-xs font-semibold text-leaf-700 dark:text-leaf-300 hover:underline"
                    >
                      {plot.name} →
                    </Link>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Plots */}
      <section aria-labelledby="plots-h">
        <div className="flex items-center justify-between mb-3">
          <h2 id="plots-h" className="font-display text-xl font-semibold">{t("plots")}</h2>
          <button
            onClick={() => setShowPlotForm(true)}
            className="rounded-xl bg-leaf-700 dark:bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
          >
            + {t("newPlot")}
          </button>
        </div>
        {plots.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line p-10 text-center">
            <p className="font-display text-lg font-semibold">{t("noPlots")}</p>
            <p className="text-sm text-ink-soft mt-1.5">{t("noPlotsHint")}</p>
            <button
              onClick={() => setShowPlotForm(true)}
              className="mt-4 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors"
            >
              + {t("newPlot")}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plots.map((plot) => {
              const count = plantings.filter((p) => p.plotId === plot.id).length;
              const region = plot.regionId ? getRegion(plot.regionId) : null;
              return (
                <Link key={plot.id} href={`/my-garden/plots/${plot.id}`}>
                  <Card className="h-full hover:border-leaf-600 transition-colors">
                    <CardBody>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-lg font-semibold">{plot.name}</h3>
                        <Badge variant="neutral">{count} {t("statPlantings")}</Badge>
                      </div>
                      <p className="text-sm text-ink-faint mt-1 capitalize">
                        {plot.area} {plot.unit}
                        {plot.location ? ` · ${plot.location}` : ""}
                      </p>
                      {region && (
                        <p className="text-xs text-ink-faint mt-1">{region.name}, {region.countryName}</p>
                      )}
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Saved calculations */}
      <section aria-labelledby="calc-h">
        <div className="flex items-center justify-between mb-3">
          <h2 id="calc-h" className="font-display text-xl font-semibold">{t("savedCalculations")}</h2>
          <Link href="/calculator" className="text-sm font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
            {t("viewInCalculator")} →
          </Link>
        </div>
        {calculations.length === 0 ? (
          <p className="text-sm text-ink-faint">{t("noCalculations")}</p>
        ) : (
          <ul className="space-y-2.5">
            {calculations.map((c) => {
              const item = getItem(c.cropSlug);
              return (
                <li key={c.id}>
                  <Card>
                    <CardBody className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[15px]">
                            {item ? item.name : c.cropSlug} · {c.area} <span className="capitalize font-normal text-ink-faint">{c.unit}</span>
                          </p>
                          <p className="text-sm text-ink-soft mt-1">
                            {c.products.map((p) => `${p.product}: ${p.kg} kg`).join(" · ")}
                          </p>
                          <p className="text-xs text-ink-faint mt-1">{new Date(c.createdAt).toLocaleDateString(locale)}</p>
                        </div>
                        <button
                          onClick={() => g.removeCalculation(c.id)}
                          aria-label={t("delete")}
                          className="text-ink-faint hover:text-red-600 transition-colors text-lg leading-none px-1"
                        >
                          ×
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {showPlotForm && (
        <Modal title={t("newPlot")} onClose={() => setShowPlotForm(false)}>
          <PlotForm
            onSubmit={(v) => {
              const id = g.addPlot(v);
              setShowPlotForm(false);
              router.push(`/my-garden/plots/${id}`);
            }}
            onCancel={() => setShowPlotForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}
