import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  // -- Admin subdomain (admin.keralavedics.com) ------------------
  const isAdminSubdomain =
    host.startsWith("admin.keralavedics.com") ||
    host.startsWith("admin.localhost") ||
    host.startsWith("admin.");

  if (isAdminSubdomain) {
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/admin/login";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // -- Consultant subdomain (consultant.keralavedics.com) --------
  const isConsultantSubdomain =
    host.startsWith("consultant.keralavedics.com") ||
    host.startsWith("consultant.localhost") ||
    host.startsWith("consultant.");

  if (isConsultantSubdomain) {
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/consultant";
      return NextResponse.rewrite(url);
    }

    const EXCLUDED_PREFIXES = [
      "/consultant",
      "/consultation",
      "/doctors",
      "/appointments",
      "/api",
      "/_next",
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
