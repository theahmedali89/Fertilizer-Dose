import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives.
 * Use these instead of next/link + next/navigation for ALL internal links
 * so the locale prefix (/hi/…, /ar/…) is preserved automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
