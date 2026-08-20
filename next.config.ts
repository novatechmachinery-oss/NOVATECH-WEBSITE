import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gjahhucsamguyeerxbpr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
      {
        source: "/:path*{.:ext(jpg|jpeg|png|webp|avif|gif|ico|svg)}",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=2592000",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // /machines (no ID) → used-machinery listing page
      {
        source: "/machines",
        destination: "/used-machinery",
        permanent: true,
      },
      // Old UUID-format machine URLs → used-machinery (deleted machines)
      {
        source: "/machines/:uuid([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
        destination: "/used-machinery",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
