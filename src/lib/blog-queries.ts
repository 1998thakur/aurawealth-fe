import type { BlogDetail, BlogSummary } from '../types/blog';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  'https://aurawealth-backend-production-2faa.up.railway.app';

// ─── Public query functions ──────────────────────────────────────────────────
// Uses Next.js extended fetch with `next: { revalidate }` so the Full Route
// Cache (Vercel ISR) is populated. Previously imported @supabase/supabase-js
// whose auth client made `cache: 'no-store'` fetches, opting every blog route
// out of ISR and causing a ~1 s TTFB on every request.

/** Fetch a single published blog post by slug, with related posts. */
export async function getPostBySlug(slug: string): Promise<BlogDetail | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/blog/${slug}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

/** Fetch paginated published blog posts. */
export async function listPosts(
  page = 0,
  size = 9,
  category?: string,
): Promise<{ items: BlogSummary[]; hasMore: boolean; total: number }> {
  try {
    const sp = new URLSearchParams({ page: String(page), size: String(size) });
    if (category) sp.set('category', category);
    const res = await fetch(`${BACKEND_URL}/api/v1/blog?${sp}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { items: [], hasMore: false, total: 0 };
    const json = await res.json();
    const data = json.data ?? json;
    return {
      items: data.items ?? [],
      hasMore: data.hasMore ?? false,
      total: data.total ?? 0,
    };
  } catch {
    return { items: [], hasMore: false, total: 0 };
  }
}

/** Fetch featured published posts. */
export async function getFeaturedPosts(): Promise<BlogSummary[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/blog/featured`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return [];
  }
}

/** Fetch all published slugs — used by generateStaticParams to pre-build pages. */
export async function getAllSlugs(): Promise<string[]> {
  try {
    // Fetch up to 200 posts; adjust size if you have more
    const res = await fetch(`${BACKEND_URL}/api/v1/blog?page=0&size=200`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data ?? json;
    return (data.items ?? []).map((p: { slug: string }) => p.slug);
  } catch {
    return [];
  }
}
