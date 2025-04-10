import type { NextConfig } from "next";
import * as path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    config.resolve.alias["#lodash"] = path.resolve(
      __dirname,
      "node_modules/lodash"
    );
    return config;
  },
};

export default nextConfig;
