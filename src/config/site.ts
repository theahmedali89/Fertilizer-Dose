/**
 * CENTRALIZED SITE CONFIGURATION
 * The single source of truth for brand identity.
 * A future rebrand = edit this file (and .env), not dozens of files.
 */
export const siteConfig = {
  /** Official brand name — user-facing everywhere */
  name: "Fertilizer Dose",
  tagline: "Fertilizer dose, done right",
  description:
    "Calculate the exact fertilizer dose for wheat, rice, maize and more. Real NPK data, acre/kanal/marla support, AI plant doctor, and crop guides for Pakistan & India.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fertilizerdose.com",
  locale: "en",
  /** Descriptive Urdu line (not the brand name) used as a design accent */
  urduTagline: "کھاد کی صحیح مقدار",
  urduFooterLine: "کھاد صحیح مقدار میں — فصل بہتر پیداوار",
  contactEmail: "hello@fertilizerdose.com",
} as const;

export type SiteConfig = typeof siteConfig;
