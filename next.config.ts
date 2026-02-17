import type { NextConfig } from "next";

const TEACHER_API = process.env.TEACHER_API_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      // Proxy REST API calls to teacher backend
      {
        source: "/api/teacher/:path*",
        destination: `${TEACHER_API}/api/:path*`,
      },
      // Proxy WebSocket connections to teacher backend
      {
        source: "/ws",
        destination: `${TEACHER_API}/ws`,
      },
      {
        source: "/ws/:path*",
        destination: `${TEACHER_API}/ws/:path*`,
      },
    ];
  },
};

export default nextConfig;
