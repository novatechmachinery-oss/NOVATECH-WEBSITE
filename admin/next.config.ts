import type { NextConfig } from "next";
import path from "node:path";

// Shared admin deployment marker: image-upload-proxy-v1 (2026-08-01)
const projectRoot = path.resolve(__dirname, "..");
const adminNodeModules = path.resolve(__dirname, "node_modules");
const rootNodeModules = path.resolve(projectRoot, "node_modules");

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  turbopack: {
    root: projectRoot,
  },
  webpack(config, { isServer }) {
    config.resolve = config.resolve ?? {};
    config.resolve.modules = [
      adminNodeModules,
      rootNodeModules,
      ...(config.resolve.modules ?? ["node_modules"]),
    ];

    if (isServer) {
      config.externals = config.externals ?? [];
      if (Array.isArray(config.externals)) {
        config.externals.push("sharp");
      }
    }

    return config;
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
