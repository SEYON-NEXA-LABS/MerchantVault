import React from "react";

export const metadata = {
  title: "Seyon Storefront - Premium Shopping",
  description: "Browse premium apparel products directly synced from Seyon ERP.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Outfit', sans-serif", backgroundColor: "#fbfbfa", color: "#1c1917" }}>
        {children}
      </body>
    </html>
  );
}
