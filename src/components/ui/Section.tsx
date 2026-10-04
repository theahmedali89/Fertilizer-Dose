import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  eyebrow,
  title,
  description,
  children,
  className,
  id,
}: {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-14 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title) && (
          <div className="max-w-2xl mb-8 sm:mb-12">
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
                <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
                {eyebrow}
              </p>
            )}
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-balance leading-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-3 text-ink-soft text-base sm:text-lg leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
