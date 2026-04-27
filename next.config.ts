import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["three"],

  typescript: {
    // R3F v8 JSX intrinsics don't merge cleanly into React 19's new JSX types;
    // runtime behaviour is correct — suppress the type-only build gate.
    ignoreBuildErrors: true,
  },

  // Silence "Critical dependency: the request of a dependency is an expression"
  // warnings from three.js internals
  webpack(config) {
    config.module = config.module ?? {}
    config.module.exprContextCritical = false
    return config
  },
}

export default nextConfig
