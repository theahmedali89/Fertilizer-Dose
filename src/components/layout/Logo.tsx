import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label={`${siteConfig.name} home`}>
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-leaf-700 dark:bg-leaf-600 shadow-card group-hover:scale-105 transition-transform">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21c-5 0-8-3.5-8-8 0-5 4-9 12-10-.5 8-1.5 14-4 18Z"
            fill="#fff"
            opacity="0.95"
          />
          <path
            d="M12 21c2.5-4 3.5-10 4-18 5 2 8 6 8 10"
            stroke="#fff"
            strokeWidth="1.4"
            opacity="0.55"
            strokeLinecap="round"
          />
          <path d="M9 13.5h.01M11.5 15.5h.01M10 10.8h.01" stroke="#2f7039" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display font-bold text-xl tracking-tight">
            Fertilizer<span className="text-leaf-700 dark:text-leaf-400 font-light"> Dose</span>
          </span>
          <span className="block text-[11px] font-medium text-ink-faint tracking-wide mt-0.5">
            Fertilizer Dose Calculator for Crops, Plants &amp; Vegetables
          </span>
        </span>
      )}
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid place-items-center w-10 h-10 rounded-xl bg-leaf-700 dark:bg-leaf-600", className)}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 21c-5 0-8-3.5-8-8 0-5 4-9 12-10-.5 8-1.5 14-4 18Z" fill="#fff" opacity="0.95" />
      </svg>
    </span>
  );
}
