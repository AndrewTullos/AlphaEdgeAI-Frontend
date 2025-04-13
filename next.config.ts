import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Disable image optimization
  },

  /* config options here */
};

export default nextConfig;
