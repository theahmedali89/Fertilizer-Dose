import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { localizedMetadata } from "@/lib/seo";
import { GrowingDetail } from "@/components/growing/GrowingDetail";
import { getItem, getItemsByCategory } from "@/lib/growing";

export function generateStaticParams() {
  return getItemsByCategory("crop").map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const item = getItem(slug);
  if (!item || item.category !== "crop") return {};
  const base = localizedMetadata({
    locale,
    path: `/crops/${slug}`,
    title: `${item.name} — Growing Guide & Fertilizer Dose`,
    description: `${item.name} (${item.season}): soil, water, growth stages, common problems${item.npk ? ` and verified ${item.npk.n}-${item.npk.p}-${item.npk.k} kg/ha NPK dose` : ""}.`,
  });
  if (!item.indexable) {
    return { ...base, robots: { index: false, follow: true } };
  }
  return base;
}

export default async function CropDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = getItem(slug);
  if (!item || item.category !== "crop") notFound();
  const related = getItemsByCategory("crop").filter((i) => i.slug !== slug);
  return <GrowingDetail item={item} related={related} />;
}
