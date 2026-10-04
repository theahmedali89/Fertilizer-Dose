import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "harvest" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-leaf-700 text-white hover:bg-leaf-800 dark:bg-leaf-600 dark:hover:bg-leaf-500 shadow-card",
  secondary:
    "border border-line bg-surface text-ink hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300",
  ghost: "text-ink-soft hover:text-ink hover:bg-surface-2",
  harvest:
    "bg-harvest-500 text-white hover:bg-harvest-600 shadow-card",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-[15px]",
  lg: "px-7 py-3.5 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
        "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
