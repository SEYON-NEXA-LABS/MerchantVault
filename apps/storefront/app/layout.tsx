import React from "react";
import { headers } from "next/headers";
import "./globals.css";

export const metadata = {
  title: "FABRIC VAULT — D2C Premium Apparel Storefront",
  description: "Browse artisanal handloom sarees, premium linen shirts, and D2C apparel catalog directly synced from FABRIC VAULT ERP.",
  keywords: ["Apparel", "Fashion", "Handloom", "D2C Storefront", "Linen Shirts", "Sarees", "Fabric Vault"],
  openGraph: {
    title: "FABRIC VAULT — D2C Apparel Storefront",
    description: "Discover handcrafted textiles, premium apparel, and streetwear collections.",
    type: "website",
    siteName: "FABRIC VAULT",
  },
  twitter: {
    card: "summary_large_image",
    title: "FABRIC VAULT — D2C Apparel Storefront",
    description: "Browse artisanal apparel and streetwear catalog.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const host = headersList.get("host") || "fabricvault-storefront.vercel.app";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const activeStorefrontUrl = `${protocol}://${host}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FABRIC VAULT",
    "url": activeStorefrontUrl,
    "logo": `${activeStorefrontUrl}/logo.png`,
    "description": "Multi-tenant D2C apparel storefront and retail operations platform.",
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

