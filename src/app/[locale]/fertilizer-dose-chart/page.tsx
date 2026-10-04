import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CROPS } from "@/lib/agronomy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "chart" });
  return localizedMetadata({
    locale,
    path: "/fertilizer-dose-chart",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}


const PER_ACRE = 0.404686;

export default async function DoseChartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            Reference
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            Fertilizer dose chart
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl leading-relaxed">
            Recommended N–P₂O₅–K₂O per hectare and per acre at a glance. For exact
            product quantities (urea, DAP, MOP), use the calculator.
          </p>
        </div>
      </section>

      <Section>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-surface-2 text-left">
                  <th className="px-5 py-3.5 font-semibold">Crop</th>
                  <th className="px-5 py-3.5 font-semibold text-right">N kg/ha</th>
                  <th className="px-5 py-3.5 font-semibold text-right">P₂O₅ kg/ha</th>
                  <th className="px-5 py-3.5 font-semibold text-right">K₂O kg/ha</th>
                  <th className="px-5 py-3.5 font-semibold text-right">N–P–K / acre</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {CROPS.map((c) => (
                  <tr key={c.slug} className="hover:bg-surface-2/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/crops/${c.slug}`} className="font-semibold text-leaf-800 dark:text-leaf-300 hover:underline">
                        {c.name}
                      </Link>
                      <span className="block text-xs text-ink-faint">{c.region}</span>
                    </td>
                    {c.npk ? (
                      <>
                        <td className="px-5 py-3.5 text-right font-mono">{c.npk.n}</td>
                        <td className="px-5 py-3.5 text-right font-mono">{c.npk.p}</td>
                        <td className="px-5 py-3.5 text-right font-mono">{c.npk.k}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-ink-soft">
                          {Math.round(c.npk.n * PER_ACRE)}–{Math.round(c.npk.p * PER_ACRE)}–{Math.round(c.npk.k * PER_ACRE)}
                        </td>
                        <td className="px-5 py-3.5"><Badge variant="verified">Verified</Badge></td>
                      </>
                    ) : (
                      <>
                        <td colSpan={4} className="px-5 py-3.5 text-ink-faint">—</td>
                        <td className="px-5 py-3.5"><Badge variant="review">In review</Badge></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="mt-4 text-xs text-ink-faint leading-relaxed max-w-3xl">
          Figures: Punjab provincial / PAU package of practices (irrigated). Per-acre values are
          rounded from per-hectare recommendations (1 acre = 0.4047 ha). Always confirm with your
          local agriculture officer and soil test.
        </p>
        <p className="mt-4">
          <Link href="/calculator" className="font-semibold text-leaf-700 dark:text-leaf-300 hover:underline">
            Convert these into exact bag quantities →
          </Link>
        </p>
      </Section>
    </>
  );
}
