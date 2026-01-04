// Next.js configuration
const nextConfig = {
  // Next.js 16 may have different config structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eslint: {
    // Enable ESLint in production build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript checking in production build
    ignoreBuildErrors: false,
  },
  experimental: {
    allowedOrigins: ["192.168.1.101:3003", "localhost:3003", "fit.harirak-int.work"],
  },
} as any;

export default nextConfig;
