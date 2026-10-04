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
    path: "/vegetables",
    title: "Vegetable Library — Growing Guides",
    description:
      "Growing guides for tomato, onion, chili, okra and more. Agronomic data published only after verification.",
  });
}

export default async function VegetablesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GrowingIndexPage category="vegetable" locale={locale} />;
}
