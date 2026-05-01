import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://creditbrain.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Standard crawlers — allow public content, block private routes
      {
        userAgent: '*',
        allow: ['/', '/cards/', '/cards', '/blog/', '/blog', '/compare', '/simulator', '/expense-profiler'],
        disallow: ['/dashboard', '/dashboard/', '/settings', '/settings/', '/auth', '/auth/', '/api/', '/admin', '/admin/'],
      },
      // AI crawler explicit allowlist — same rules, ensures they aren't blocked
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Googlebot-Image', 'CCBot', 'cohere-ai'],
        allow: ['/', '/cards/', '/blog/', '/compare', '/simulator', '/expense-profiler'],
        disallow: ['/dashboard', '/settings', '/auth', '/api/', '/admin'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
