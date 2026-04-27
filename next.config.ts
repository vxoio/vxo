import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["three"],

  experimental: {
    optimizePackageImports: [
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/postprocessing",
      "framer-motion",
    ],
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
