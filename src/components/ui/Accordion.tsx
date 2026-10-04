"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Accordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line rounded-xl2 border border-line bg-surface overflow-hidden">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 sm:px-6 py-4 text-start hover:bg-surface-2 transition-colors"
            >
              <span className="font-semibold text-[15px] sm:text-base">{item.q}</span>
              <span
                className={cn(
                  "shrink-0 grid place-items-center w-8 h-8 rounded-full border border-line transition-transform duration-300",
                  isOpen && "rotate-45 bg-leaf-700 border-leaf-700 text-white"
                )}
                aria-hidden
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 sm:px-6 pb-5 text-ink-soft leading-relaxed text-[15px]">
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
