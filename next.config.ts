import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/boards",
        destination: "http://168.107.43.221:8080/dcs/api/boards",
      },
      {
        source: "/api/posts/:path*",
        destination: "http://168.107.43.221:8080/dcs/api/posts/:path*",
      },
      {
        source: "/api/auction-history",
        destination: "http://168.107.43.221:8080/oab/api/auction-history",
      },
      {
        source: "/api/items/categories",
        destination: "http://168.107.43.221:8080/oab/api/items/categories",
      },
    ];
  },
};

export default nextConfig;
