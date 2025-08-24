import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {
    domains: ["encrypted-tbn0.gstatic.com"]
  },
  trailingSlash: true,
};

export default nextConfig;
