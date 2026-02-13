import type { NextConfig } from "next";

const TEACHER_API = process.env.TEACHER_API_URL || "http://10.10.64.215:8080";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      // Proxy REST API calls to teacher backend
      {
        source: "/api/teacher/:path*",
        destination: `${TEACHER_API}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
