/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Configuration as WebpackConfig } from "webpack";
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

  webpack: (
    config: WebpackConfig,
    { isServer }: { isServer: boolean }
  ): WebpackConfig => {
    // Add any custom webpack configs here
    return config;
  },

  // Output configuration for better optimization
  output: "standalone",

  skipTrailingSlashRedirect: true,
};

export default config;
