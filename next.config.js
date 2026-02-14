/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    return config
  },
  // Disable static optimization for Convex client
  experimental: {
    optimizePackageImports: ["@/components"],
  },
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // number of pages that should be kept simultaneously in memory
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig
