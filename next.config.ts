import type { NextConfig } from "next";

const apiURL =
  process.env.API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.wenjin-zhilu.com"
    : "http://localhost:4002");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiURL}/api/auth/:path*`,
      },
      {
        source: "/api/call/:path*",
        destination: `${apiURL}/api/call/:path*`,
      },
    ];
  },
};

export default nextConfig;
