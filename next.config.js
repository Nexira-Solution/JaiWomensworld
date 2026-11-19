const r2Host =
  (process.env.R2_PUBLIC_URL && new URL(process.env.R2_PUBLIC_URL).hostname) ||
  'pub-47db167c837a4fb5bfb5f6293791c0d2.r2.dev';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'pub-7f0ff27354b94232931f393c00e102fa.r2.dev' },
      { protocol: 'https', hostname: 'pub-61808a62e9244dbb8b81f5c8b6d67477.r2.dev' },
      { protocol: 'https', hostname: 'pub-47db167c837a4fb5bfb5f6293791c0d2.r2.dev' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1200],
    imageSizes: [64, 128, 256],
    qualities: [50, 75],
    minimumCacheTTL: 31536000,
  },

  optimizeFonts: false,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|gif|ico|woff2)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = nextConfig;
