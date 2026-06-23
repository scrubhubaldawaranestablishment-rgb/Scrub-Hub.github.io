import type { NextConfig } from "next";

const API_ORIGIN = process.env.API_PROXY_TARGET || "http://localhost:4000";

const nextConfig: NextConfig = {
  outputFileTracingRoot: require("path").join(__dirname, "../../"),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
