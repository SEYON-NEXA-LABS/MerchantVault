import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Extract subdomain or custom hostname (excluding standard app domains & localhost)
  const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1");

  // Allow /admin and proxied ERP /api paths to bypass subdomain rewrites
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api/auth") ||
    url.pathname.startsWith("/api/settings") ||
    url.pathname.startsWith("/api/warehouses") ||
    url.pathname.startsWith("/api/pos")
  ) {
    return NextResponse.next();
  }

  if (!isLocal) {
    const mainAppUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    let mainAppHost = "localhost";
    try {
      if (mainAppUrl) mainAppHost = new URL(mainAppUrl).hostname;
    } catch (e) {}

    const parts = hostname.split(".");
    // If tenant visits via subdomain e.g. wolfcabin.<YOUR_PLATFORM_DOMAIN>
    if (parts.length > 2 && parts[0] !== "www" && !hostname.includes(mainAppHost)) {
      const subdomainSlug = parts[0];
      if (!url.searchParams.has("slug")) {
        url.searchParams.set("slug", subdomainSlug);
        return NextResponse.rewrite(url);
      }
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, _next, favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
