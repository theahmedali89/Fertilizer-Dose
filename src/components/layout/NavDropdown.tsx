"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Desktop hover/click dropdown for grouped navigation (e.g. "Grow"). */
export function NavDropdown({
  label,
  links,
  active,
  pathname,
}: {
  label: string;
  links: { href: string; label: string }[];
  active: boolean;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
          active
            ? "text-leaf-800 dark:text-leaf-300 bg-leaf-100 dark:bg-leaf-950"
            : "text-ink-soft hover:text-ink hover:bg-surface-2"
        )}
      >
        {label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={cn("transition-transform", open && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute start-0 top-full z-[90] pt-1">
          <div className="w-56 rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
            {links.map((l) => {
              const itemActive = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors",
                    itemActive
                      ? "bg-leaf-100 dark:bg-leaf-950 text-leaf-800 dark:text-leaf-300"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
