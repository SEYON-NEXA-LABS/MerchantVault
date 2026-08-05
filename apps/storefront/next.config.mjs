/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const adminUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return [
      {
        source: "/admin/:path*",
        destination: `${adminUrl}/dashboard/:path*`,
      },
      {
        source: "/admin",
        destination: `${adminUrl}/dashboard`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${adminUrl}/api/auth/:path*`,
      },
      {
        source: "/api/settings",
        destination: `${adminUrl}/api/settings`,
      },
      {
        source: "/api/warehouses",
        destination: `${adminUrl}/api/warehouses`,
      },
      {
        source: "/api/pos/:path*",
        destination: `${adminUrl}/api/pos/:path*`,
      },
    ];
  },
};

export default nextConfig;
