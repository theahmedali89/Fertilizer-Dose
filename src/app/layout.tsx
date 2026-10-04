import type { ReactNode } from "react";

/**
 * Root layout intentionally renders only children.
 * <html>/<body>, lang and dir live in app/[locale]/layout.tsx
 * because the locale is part of the URL (next-intl pattern).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
