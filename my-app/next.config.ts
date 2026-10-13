import type { NextConfig } from "next";

const API = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // The browser only ever talks to this origin; API calls and uploaded files
  // are forwarded to the backend so the session cookie stays first-party.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API}/api/:path*` },
      { source: "/uploads/:path*", destination: `${API}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
