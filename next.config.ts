/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextConfig } from "next";

const config: NextConfig = {
  basePath: "/projects/mymoney",

  assetPrefix: "/projects/mymoney",

  trailingSlash: true,

  images: {
    domains: ["api.placeholder.com"],
    path: "/projects/mymoney/_next/image",
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: "/projects/mymoney",
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },

  // Output configuration for better optimization
  output: "standalone",
};

export default config;
