import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    name: "Merchant Vault Storefront",
    short_name: "MerchantVault",
    description: "Multi-Tenant D2C Storefront & Retail Inventory Suite",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d9488",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400, immutable"
    }
  });
}
