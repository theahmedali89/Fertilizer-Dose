import type { MetadataRoute } from "next";
import { FERTILIZERS, ORGANIC_FERTILIZERS } from "@/lib/agronomy";
import { GROWING_ITEMS } from "@/lib/growing";
import { POSTS } from "@/lib/blog";
import { siteConfig } from "@/config/site";
import { hreflangAlternates } from "@/lib/i18n-utils";

/**
 * Localized sitemap: every URL carries hreflang alternates for all 18 locales.
 * English URLs are unprefixed; other locales are prefixed (/hi/…, /ar/…).
 * Growing items with indexable=false (thin/in-review pages) are excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticPages = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/calculator", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/plant-doctor", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/fertilizers", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/fertilizers/organic", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/crops", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/plants", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/vegetables", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/planting-calendar", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/planting-calendar/pakistan", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/planting-calendar/india", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/my-garden", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/profit-calculator", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/plant-dose-calculator", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/land-area-calculator", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/kitchen-garden", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/compare", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/fertilizer-dose-chart", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
  ];

  const entry = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly", lastModified: Date) => {
    const languages = hreflangAlternates(base, path);
    return {
      url: languages["en"],
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    };
  };

  const growingPaths: Record<string, string> = {
    crop: "/crops",
    plant: "/plants",
    vegetable: "/vegetables",
  };

  return [
    ...staticPages.map((p) => entry(p.path, p.priority, p.changeFrequency, now)),
    ...GROWING_ITEMS.filter((i) => i.indexable).map((i) =>
      entry(`${growingPaths[i.category]}/${i.slug}`, 0.7, "monthly", now)
    ),
    ...FERTILIZERS.map((f) => entry(`/fertilizers/${f.slug}`, 0.7, "monthly", now)),
    ...ORGANIC_FERTILIZERS.map((f) => entry(`/fertilizers/${f.slug}`, 0.7, "monthly", now)),
    ...POSTS.map((p) => entry(`/blog/${p.slug}`, 0.6, "monthly", new Date(p.date))),
  ];
}
