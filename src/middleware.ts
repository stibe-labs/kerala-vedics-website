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

    // If path is not already prefixed with /consultant and not internal assets or api
    if (
      !url.pathname.startsWith("/consultant") &&
      !url.pathname.startsWith("/api") &&
      !url.pathname.startsWith("/_next") &&
      !url.pathname.includes(".")
    ) {
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
