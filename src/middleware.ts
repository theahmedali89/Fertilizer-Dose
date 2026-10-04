import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Composed middleware:
 * 1. next-intl locale detection / prefixing / redirects
 * 2. stashes the request pathname in `x-pathname` so layouts can build
 *    canonical + hreflang URLs without client JS.
 * (Auth protection will be composed here in the backend phase.)
 */
export default function middleware(req: NextRequest) {
  const res = intlMiddleware(req) ?? NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  return res;
}

export const config = {
  // Skip API routes, Next internals and static assets
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
