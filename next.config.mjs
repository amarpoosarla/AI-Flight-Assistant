/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker multi-stage runner stage
  output: 'standalone',

  // Enforce strict React mode
  reactStrictMode: true,

  // Security headers for all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirect bare root to /flights
  async redirects() {
    return [
      {
        source: '/',
        destination: '/flights',
        permanent: false,
      },
    ];
  },

  // Allow images from airline logo sources (add as needed)
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
