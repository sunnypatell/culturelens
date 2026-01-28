import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  // standalone output for Docker deployments
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/api/docs",
        destination: "/docs/api",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
