import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

const LOCALES = new Set(routing.locales as unknown as string[]);

/** Strip a leading locale prefix (/hi/…) so we can match protected paths. */
function unprefixed(pathname: string): { base: string; locale: string } {
  const seg = pathname.split("/");
  if (seg.length > 1 && LOCALES.has(seg[1])) {
    return { base: "/" + seg.slice(2).join("/"), locale: seg[1] };
  }
  return { base: pathname, locale: "en" };
}

/**
 * Composed middleware:
 * 1. Auth protection for /admin/* (staff only) and /account/* (signed in)
 * 2. next-intl locale detection / prefixing / redirects
 * 3. stashes the request pathname in `x-pathname` for canonical/hreflang
 */
export default auth((req: NextRequest & { auth: unknown }) => {
  const { base, locale } = unprefixed(req.nextUrl.pathname);

  if (base.startsWith("/admin") || base.startsWith("/account")) {
    const session = req.auth as { user?: { role?: string } } | null;
    if (!session?.user) {
      const loginPath = locale === "en" ? "/login" : `/${locale}/login`;
      const url = new URL(loginPath, req.url);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (base.startsWith("/admin")) {
      const role = session.user?.role;
      if (role !== "ADMIN" && role !== "EDITOR") {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  const res = intlMiddleware(req) ?? NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  return res;
});

export const config = {
  // Skip API routes, Next internals and static assets
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
