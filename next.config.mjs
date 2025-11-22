/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable image optimization for better performance
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable compression
  compress: true,
  // Optimize production build
  swcMinify: true,
  // React compiler optimization
  reactStrictMode: true,
  // Optimize font loading
  optimizeFonts: true,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
    ],
  },
  // Fix for stack overflow during build trace collection
  // Exclude platform-specific binaries and unnecessary files from tracing
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
      'node_modules/webpack',
    ],
  },
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Tree shaking optimizations
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      sideEffects: false,
    }
    return config
  },
}

export default nextConfig
