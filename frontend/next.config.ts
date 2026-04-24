import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
