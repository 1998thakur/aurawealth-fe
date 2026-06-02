const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/admin/v1/:path*',
        destination: `${BACKEND_URL}/admin/v1/:path*`,
      },
      // /sitemap.xml is handled by app/sitemap.ts (Next.js built-in)
    ];
  },
};

export default nextConfig;
