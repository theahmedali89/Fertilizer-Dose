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
    path: "/crops",
    title: "Crop Library — Growing Guides & Fertilizer Doses",
    description:
      "Growing guides for wheat, rice, maize, cotton, sugarcane and potato — season, soil, water, growth stages and verified fertilizer needs.",
  });
}

export default async function CropsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GrowingIndexPage category="crop" locale={locale} />;
}
