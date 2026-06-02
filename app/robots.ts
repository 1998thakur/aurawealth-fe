import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://creditbrain.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Standard crawlers — allow public content and the public API (needed for JS rendering)
      {
        userAgent: '*',
        // /api/v1/ must be allowed so Googlebot can fetch card/blog data when rendering JS pages.
        // More specific Allow takes precedence over the broader Disallow: /api/ below.
        allow: ['/', '/cards', '/blog', '/compare', '/simulator', '/expense-profiler', '/api/v1/'],
        disallow: ['/dashboard', '/settings', '/auth', '/api/admin', '/admin'],
      },
      // AI crawler explicit allowlist — same rules
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Googlebot-Image', 'CCBot', 'cohere-ai'],
        allow: ['/', '/cards', '/blog', '/compare', '/simulator', '/expense-profiler', '/api/v1/'],
        disallow: ['/dashboard', '/settings', '/auth', '/api/admin', '/admin'],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/image-sitemap.xml`],
  };
}
