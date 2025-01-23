/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextConfig } from "next";

const config: NextConfig = {
  basePath: "/projects/mymoney",

  assetPrefix: "/projects/mymoney",

  trailingSlash: true,

  images: {
    domains: ["res.cloudinary.com"],
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: "/projects/mymoney",
  },

  // Output configuration for better optimization
  output: "standalone",
};

export default config;
