import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});



export const metadata: Metadata = {
  title: "MerchantVault - Multi-Store Retail Inventory & D2C Storefront OS",
  description: "MerchantVault by Seyon Nexa Labs: Unified Retail Inventory, POS Counter & Multi-Store D2C OS",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MerchantVault",
  },
};


export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>


        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
