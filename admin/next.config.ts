import type { NextConfig } from "next";
import path from "node:path";

const projectRoot = path.resolve(__dirname, "..");

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
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
