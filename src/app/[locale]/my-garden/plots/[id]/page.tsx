import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { PlotDetail } from "@/components/garden/PlotDetail";

/**
 * Plot detail pages are user-private (localStorage data) — never indexed,
 * never in the sitemap.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PlotPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <Section>
      <PlotDetail plotId={id} />
    </Section>
  );
}
