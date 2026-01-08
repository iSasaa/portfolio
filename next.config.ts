import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",  // Enables static export
  images: {
    unoptimized: true, // Required for static export
  },
  // When deploying to GitHub Pages, the repo name is usually the base path.
  // We can either rely on process.env.GITHUB_ACTIONS or set it manually.
  basePath: process.env.GITHUB_ACTIONS ? "/portfolio" : "",
  env: {
    // Expose the base path to the client-side code
    NEXT_PUBLIC_BASE_PATH: process.env.GITHUB_ACTIONS ? "/portfolio" : "",
  },
};

export default nextConfig;
