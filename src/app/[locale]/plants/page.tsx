import { setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { GrowingIndexPage } from "@/components/growing/GrowingIndexPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/plants",
    title: "Plant Library — Growing Guides for Garden & Home Plants",
    description:
      "Growing guides for garden, flowering, indoor, outdoor and fruit plants. Agronomic data published only after verification.",
  });
}

export default async function PlantsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GrowingIndexPage category="plant" locale={locale} />;
}
