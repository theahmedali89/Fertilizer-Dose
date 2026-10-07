"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";
import { SuggestButton } from "@/components/suggestions/SuggestButton";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const COLS: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: t("tools"),
      links: [
        { href: "/calculator", label: t("links.calculator") },
        { href: "/profit-calculator", label: t("links.profitCalculator") },
        { href: "/compare", label: t("links.compare") },
        { href: "/my-garden", label: t("links.myGarden") },
        { href: "/plant-doctor", label: t("links.plantDoctor") },
        { href: "/planting-calendar", label: t("links.plantingCalendar") },
        { href: "/fertilizer-dose-chart", label: t("links.charts") },
        { href: "/faq", label: t("links.faq") },
      ],
    },
    {
      title: t("library"),
      links: [
        { href: "/fertilizers", label: t("links.fertilizers") },
        { href: "/crops", label: t("links.crops") },
        { href: "/plants", label: t("links.plants") },
        { href: "/vegetables", label: t("links.vegetables") },
        { href: "/blog", label: t("links.blog") },
        { href: "/crops/wheat", label: t("links.wheat") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/about", label: t("links.about") },
        { href: "/contributors", label: t("links.contributors") },
        { href: "/contact", label: t("links.contact") },
        { href: "/privacy", label: t("links.privacy") },
        { href: "/terms", label: t("links.terms") },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-surface mt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-ink-soft leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
            <p className="mt-4 text-xs text-ink-faint leading-relaxed max-w-xs">
              {t("disclaimer")}
            </p>
          </div>
          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-faint mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-soft hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-faint">
            © {year} {siteConfig.name}. {t("rights")}
          </p>
          <div className="flex items-center gap-4">
            <SuggestButton mode="translation" label={t("links.improveTranslation")} />
            <p className="text-xs text-ink-faint">
              {siteConfig.urduFooterLine}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
