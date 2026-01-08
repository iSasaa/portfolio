import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",  // Enables static export
  images: {
    unoptimized: true, // Required for static export
  },
  // Conditionally apply basePath for GitHub Actions deployment
  basePath: process.env.GITHUB_ACTIONS ? "/portfolio" : "",
  env: {
    BASE_PATH: process.env.GITHUB_ACTIONS ? "/portfolio" : "",
  },
};

export default nextConfig;
