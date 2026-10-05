"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher, LanguageList } from "./LanguageSwitcher";
import { NavDropdown as GrowDropdown } from "./NavDropdown";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const NAV = [
    { href: "/", label: t("home") },
    { href: "/plant-doctor", label: t("plantDoctor") },
    { href: "/fertilizers", label: t("fertilizers") },
    { href: "/blog", label: t("blog") },
    { href: "/faq", label: t("faq") },
  ];

  const GROW_LINKS = [
    { href: "/crops", label: t("crops") },
    { href: "/plants", label: t("plants") },
    { href: "/vegetables", label: t("vegetables") },
    { href: "/planting-calendar", label: t("plantingCalendar") },
    { href: "/my-garden", label: t("myGarden") },
  ];

  const TOOL_LINKS = [
    { href: "/calculator", label: t("calculator") },
    { href: "/profit-calculator", label: t("profitCalculator") },
    { href: "/compare", label: t("compare") },
  ];

  const growActive = GROW_LINKS.some((l) => pathname === l.href || pathname.startsWith(l.href + "/"));
  const toolsActive = TOOL_LINKS.some((l) => pathname === l.href || pathname.startsWith(l.href + "/"));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  const closeDrawer = () => setOpen(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-line bg-canvas/90 backdrop-blur-md shadow-card"
            : "border-transparent bg-canvas"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-4">
            <Logo />
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
              {NAV.slice(0, 1).map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
                      active
                        ? "text-leaf-800 dark:text-leaf-300 bg-leaf-100 dark:bg-leaf-950"
                        : "text-ink-soft hover:text-ink hover:bg-surface-2"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <GrowDropdown
                label={t("grow")}
                links={GROW_LINKS}
                active={growActive}
                pathname={pathname}
              />
              <GrowDropdown
                label={t("tools")}
                links={TOOL_LINKS}
                active={toolsActive}
                pathname={pathname}
              />
              {NAV.slice(1).map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
                      active
                        ? "text-leaf-800 dark:text-leaf-300 bg-leaf-100 dark:bg-leaf-950"
                        : "text-ink-soft hover:text-ink hover:bg-surface-2"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2.5">
              <LanguageSwitcher />
              <ThemeToggle />
              <AuthButtons />
              <Link
                href="/calculator"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors shadow-card"
              >
                {t("calculateDose")}
              </Link>
              <button
                className="lg:hidden grid place-items-center w-10 h-10 rounded-xl border border-line bg-surface"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-label={open ? t("closeMenu") : t("openMenu")}
              >
                <span className="relative block w-5 h-5" aria-hidden>
                  <span className={cn("absolute left-0 top-1 block h-0.5 w-5 bg-ink transition-all duration-300", open && "top-2.5 rotate-45")} />
                  <span className={cn("absolute left-0 top-2.5 block h-0.5 w-5 bg-ink transition-all duration-300", open && "opacity-0")} />
                  <span className={cn("absolute left-0 top-4 block h-0.5 w-5 bg-ink transition-all duration-300", open && "top-2.5 -rotate-45")} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
        <aside
          className={cn(
            "absolute end-0 top-0 h-full w-[86%] max-w-sm bg-surface border-s border-line shadow-lift transition-transform duration-300 flex flex-col",
            open ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
          )}
          role="dialog"
          aria-label={t("mobileNav")}
        >
          <div className="flex items-center justify-between p-5 border-b border-line">
            <Logo />
            <button
              onClick={() => setOpen(false)}
              aria-label={t("closeMenu")}
              className="grid place-items-center w-10 h-10 rounded-xl border border-line"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Mobile">
            {NAV.slice(0, 1).map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors",
                    active
                      ? "bg-leaf-100 dark:bg-leaf-950 text-leaf-800 dark:text-leaf-300"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                  )}
                >
                  {item.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="rtl:rotate-180">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              );
            })}
            {/* Tools group */}
            <p className="px-4 pt-4 pb-1 text-xs font-bold uppercase tracking-widest text-ink-faint">
              {t("tools")}
            </p>
            {TOOL_LINKS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center justify-between ps-6 pe-4 py-3 rounded-xl text-[15px] font-medium transition-colors",
                    active
                      ? "bg-leaf-100 dark:bg-leaf-950 text-leaf-800 dark:text-leaf-300"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                  )}
                >
                  {item.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="rtl:rotate-180">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              );
            })}
            {NAV.slice(1).map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors",
                    active
                      ? "bg-leaf-100 dark:bg-leaf-950 text-leaf-800 dark:text-leaf-300"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                  )}
                >
                  {item.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="rtl:rotate-180">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              );
            })}
            {/* Grow group */}
            <p className="px-4 pt-4 pb-1 text-xs font-bold uppercase tracking-widest text-ink-faint">
              {t("grow")}
            </p>
            {GROW_LINKS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center justify-between ps-6 pe-4 py-3 rounded-xl text-[15px] font-medium transition-colors",
                    active
                      ? "bg-leaf-100 dark:bg-leaf-950 text-leaf-800 dark:text-leaf-300"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                  )}
                >
                  {item.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="rtl:rotate-180">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              );
            })}
          </nav>
          <div className="p-5 border-t border-line space-y-4">
            <LanguageList />
            <Link
              href="/calculator"
              onClick={closeDrawer}
              className="flex items-center justify-center gap-2 rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-3 font-semibold text-white"
            >
              {t("calculateDose")}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
