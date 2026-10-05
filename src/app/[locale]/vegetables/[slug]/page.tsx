import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { localizedMetadata } from "@/lib/seo";
import { GrowingDetail } from "@/components/growing/GrowingDetail";
import { getGrowingItem, getGrowingByCategory } from "@/server/data";

export async function generateStaticParams() {
  const items = await getGrowingByCategory("vegetable");
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const item = await getGrowingItem(slug);
  if (!item || item.category !== "vegetable") return {};
  const base = localizedMetadata({
    locale,
    path: `/vegetables/${slug}`,
    title: `${item.name} — Growing Guide & Fertilizer Needs`,
    description: `${item.name}${item.scientificName ? ` (${item.scientificName})` : ""}: growing guide. Agronomic data published only after verification.`,
  });
  if (!item.indexable) {
    return { ...base, robots: { index: false, follow: true } };
  }
  return base;
}

export default async function VegetableDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = await getGrowingItem(slug);
  if (!item || item.category !== "vegetable") notFound();
  const related = (await getGrowingByCategory("vegetable")).filter((i) => i.slug !== slug);
  return <GrowingDetail item={item} related={related} />;
}
