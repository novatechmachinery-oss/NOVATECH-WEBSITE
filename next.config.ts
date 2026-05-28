import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gjahhucsamguyeerxbpr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
