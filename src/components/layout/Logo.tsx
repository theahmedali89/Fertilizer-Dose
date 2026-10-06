import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label={`${siteConfig.name} home`}>
      <img
        src="/logo.png"
        alt="Fertilizer Dose logo"
        width={40}
        height={40}
        className="w-10 h-10 rounded-xl shadow-card group-hover:scale-105 transition-transform"
      />
      {!compact && (
        <span className="leading-none min-w-0">
          <span className="block font-display font-bold text-xl tracking-tight whitespace-nowrap">
            Fertilizer<span className="text-leaf-700 dark:text-leaf-400 font-light"> Dose</span>
          </span>
          <span className="hidden sm:block text-[11px] font-medium text-ink-faint tracking-wide mt-0.5">
            Fertilizer Dose Calculator for Crops, Plants &amp; Vegetables
          </span>
        </span>
      )}
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Fertilizer Dose logo"
      width={40}
      height={40}
      className={cn("w-10 h-10 rounded-xl", className)}
    />
  );
}
