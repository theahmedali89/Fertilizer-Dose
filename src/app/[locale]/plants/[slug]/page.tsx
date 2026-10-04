import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { localizedMetadata } from "@/lib/seo";
import { GrowingDetail } from "@/components/growing/GrowingDetail";
import { getItem, getItemsByCategory } from "@/lib/growing";

export function generateStaticParams() {
  return getItemsByCategory("plant").map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const item = getItem(slug);
  if (!item || item.category !== "plant") return {};
  const base = localizedMetadata({
    locale,
    path: `/plants/${slug}`,
    title: `${item.name} — Growing Guide`,
    description: `${item.name}${item.scientificName ? ` (${item.scientificName})` : ""}: growing guide. Agronomic data published only after verification.`,
  });
  if (!item.indexable) {
    return { ...base, robots: { index: false, follow: true } };
  }
  return base;
}

export default async function PlantDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = getItem(slug);
  if (!item || item.category !== "plant") notFound();
  const related = getItemsByCategory("plant").filter((i) => i.slug !== slug);
  return <GrowingDetail item={item} related={related} />;
}
