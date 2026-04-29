const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
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
      {
        source: '/sitemap.xml',
        destination: `${BACKEND_URL}/sitemap.xml`,
      },
    ];
  },
};

export default nextConfig;
