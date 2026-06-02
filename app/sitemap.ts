import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://creditbrain.in';

// API base — relative (/api/v1) needs SITE_URL prepended for server-side fetch
function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  const absoluteBase = base.startsWith('/') ? `${SITE_URL}${base}` : base;
  return `${absoluteBase}${path}`;
}

interface CardSummary {
  id: string;
  slug: string;
}

interface BlogSummary {
  slug: string;
  publishedAt: string;
  updatedAt?: string;
}

interface PagedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

async function fetchAllCards(): Promise<CardSummary[]> {
  const all: CardSummary[] = [];
  let page = 0;
  const size = 100;
  while (true) {
    try {
      const res = await fetch(apiUrl(`/cards?page=${page}&size=${size}`), {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json = await res.json();
      // Backend wraps in { success, data: { items, total, hasMore } }
      const data: PagedResponse<CardSummary> = json?.data ?? json;
      all.push(...data.items);
      if (!data.hasMore) break;
      page++;
    } catch {
      break;
    }
  }
  return all;
}

async function fetchAllBlogPosts(): Promise<BlogSummary[]> {
  const all: BlogSummary[] = [];
  let page = 0;
  const size = 100;
  while (true) {
    try {
      const res = await fetch(apiUrl(`/blog?page=${page}&size=${size}`), {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json = await res.json();
      const data: PagedResponse<BlogSummary> = json?.data ?? json;
      all.push(...data.items);
      if (!data.hasMore) break;
      page++;
    } catch {
      break;
    }
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [rawCards, rawPosts] = await Promise.all([fetchAllCards(), fetchAllBlogPosts()]);

  // Deduplicate — backend pagination can return the same slug on multiple pages
  const cards = Array.from(new Map(rawCards.map((c) => [c.slug, c])).values());
  const posts = Array.from(new Map(rawPosts.map((p) => [p.slug, p])).values());

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/cards`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/blog`,           lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE_URL}/compare`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/simulator`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/expense-profiler`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const cardPages: MetadataRoute.Sitemap = cards.map((card) => ({
    url: `${SITE_URL}/cards/${card.slug}`,
    changeFrequency: 'daily',
    lastModified: new Date(),
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...cardPages, ...blogPages];
}
