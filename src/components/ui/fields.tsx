import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink mb-1.5">
      {children}
    </label>
  );
}

const fieldClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-faint transition-colors focus:border-leaf-600 focus:ring-2 focus:ring-leaf-600/20 outline-none";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClass, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(fieldClass, "appearance-none pe-10 bg-no-repeat", className)}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23787878' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundPosition: "right 0.9rem center",
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldClass, "min-h-[120px] resize-y", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-faint leading-relaxed">{hint}</p>}
    </div>
  );
}
