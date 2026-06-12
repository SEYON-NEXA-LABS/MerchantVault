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
      <body style={{ margin: 0, fontFamily: "sans-serif", backgroundColor: "#fafaf9" }}>
        {children}
      </body>
    </html>
  );
}
