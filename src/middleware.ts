import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  // Handle consultant subdomain (e.g. consultant.keralavedics.com)
  const isConsultantSubdomain =
    host.startsWith("consultant.keralavedics.com") ||
    host.startsWith("consultant.localhost") ||
    host.startsWith("consultant.");

  if (isConsultantSubdomain) {
    // If root of consultant subdomain, rewrite to /consultant login page
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/consultant";
      return NextResponse.rewrite(url);
    }

    // Top-level paths that exist in the app and MUST NOT be prefixed with /consultant:
    const EXCLUDED_PREFIXES = [
      "/consultant",     // already prefixed
      "/consultation",   // video consultation room (/consultation/[id])
      "/doctors",        // public doctors directory
      "/appointments",   // patient appointments
      "/api",            // all api routes
      "/_next",          // Next.js chunks & RSC
    ];

    const isExcluded =
      EXCLUDED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
      url.pathname.includes(".");

    if (!isExcluded) {
      url.pathname = `/consultant${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, and public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
