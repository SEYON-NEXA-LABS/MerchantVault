import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Extract subdomain or custom hostname (excluding standard app domains & localhost)
  const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1");

  // Allow /admin and proxied ERP /api paths to bypass subdomain rewrites
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/auth") || url.pathname.startsWith("/api/settings") || url.pathname.startsWith("/api/warehouses") || url.pathname.startsWith("/api/pos")) {
    return NextResponse.next();
  }

  if (!isLocal) {
    const parts = hostname.split(".");
    // If tenant visits via subdomain e.g. wolfcabin.fabricvault-storefront.vercel.app
    if (parts.length > 2 && parts[0] !== "www" && parts[0] !== "fabricvault-storefront") {
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
