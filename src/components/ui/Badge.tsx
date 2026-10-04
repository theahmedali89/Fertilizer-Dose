import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "verified" | "review" | "neutral" | "harvest";

const styles: Record<Variant, string> = {
  verified:
    "bg-leaf-100 text-leaf-800 border-leaf-200 dark:bg-leaf-950 dark:text-leaf-300 dark:border-leaf-800",
  review:
    "bg-harvest-100 text-harvest-800 border-harvest-200 dark:bg-harvest-950 dark:text-harvest-300 dark:border-harvest-800",
  neutral:
    "bg-surface-2 text-ink-soft border-line",
  harvest:
    "bg-harvest-500 text-white border-harvest-600",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
