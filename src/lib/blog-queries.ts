import type { BlogDetail, BlogSummary, FaqItem } from '../types/blog';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const BACKEND_URL =
  process.env.BACKEND_URL ||
  'https://aurawealth-backend-production-2faa.up.railway.app';

// ─── Supabase PostgREST direct fetch ─────────────────────────────────────────
// @supabase/supabase-js is NOT used here: its auth client makes internal
// fetch() calls with cache:'no-store' that opt routes out of Next.js Full
// Route Cache, causing x-vercel-cache:MISS on every request (~1 s TTFB).
// Instead, we call Supabase's PostgREST REST API directly with Next.js fetch()
// + next:{ revalidate } so ISR works and Vercel caches the rendered HTML.

const SUPABASE_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  // NOTE: blog schema must be exposed in Supabase → Settings → API → Exposed schemas
  'Accept-Profile': 'blog',
};

// Only summary columns — avoids fetching large 'content' field in list queries
const SUMMARY_SELECT =
  'id,slug,title,excerpt,cover_image_url,author_name,tags,category,post_type,featured,reading_time_min,published_at';

// ─── Row → TypeScript mappers ─────────────────────────────────────────────────

function toSummary(row: Record<string, unknown>): BlogSummary {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    coverImageUrl: row.cover_image_url as string | undefined,
    authorName: row.author_name as string,
    tags: (row.tags as string[]) ?? [],
    category: row.category as string | undefined,
    postType: row.post_type as BlogSummary['postType'],
    featured: row.featured as boolean,
    readingTimeMin: row.reading_time_min as number,
    publishedAt: row.published_at as string,
  };
}

function toDetail(row: Record<string, unknown>, related: BlogSummary[]): BlogDetail {
  const faqRaw = row.faq_items as Array<{ question: string; answer: string }> | null;
  const faqItems: FaqItem[] = faqRaw?.map((f) => ({ question: f.question, answer: f.answer })) ?? [];
  return {
    ...toSummary(row),
    content: row.content as string,
    authorAvatarUrl: row.author_avatar_url as string | undefined,
    metaTitle: row.meta_title as string | undefined,
    metaDescription: row.meta_description as string | undefined,
    keywords: row.keywords as string | undefined,
    faqItems,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    status: row.status as string | undefined,
    related,
  };
}

// ─── Railway API fallbacks (until blog schema is exposed in Supabase) ─────────

async function apiGetPost(slug: string): Promise<BlogDetail | null> {
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

async function apiListPosts(
  page: number,
  size: number,
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

async function apiFeaturedPosts(): Promise<BlogSummary[]> {
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

// ─── Public query functions ───────────────────────────────────────────────────

/** Fetch a single published blog post by slug, with related posts. */
export async function getPostBySlug(slug: string): Promise<BlogDetail | null> {
  const sp = new URLSearchParams({
    slug: `eq.${slug}`,
    status: 'eq.PUBLISHED',
    select: '*',
    limit: '1',
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?${sp}`, {
    headers: SUPABASE_HEADERS,
    next: { revalidate: 600 },
  });

  if (!res.ok) return apiGetPost(slug);
  const rows = (await res.json()) as unknown[];
  if (!Array.isArray(rows) || rows.length === 0) return apiGetPost(slug);

  const row = rows[0] as Record<string, unknown>;

  // Fetch up to 3 related posts in the same category
  let related: BlogSummary[] = [];
  if (row.category) {
    const rsp = new URLSearchParams({
      status: 'eq.PUBLISHED',
      category: `eq.${row.category as string}`,
      id: `neq.${row.id as string}`,
      select: SUMMARY_SELECT,
      order: 'published_at.desc',
      limit: '3',
    });
    const rRes = await fetch(`${SUPABASE_URL}/rest/v1/posts?${rsp}`, {
      headers: SUPABASE_HEADERS,
      next: { revalidate: 600 },
    });
    if (rRes.ok) {
      const rRows = (await rRes.json()) as unknown[];
      if (Array.isArray(rRows))
        related = rRows.map((r) => toSummary(r as Record<string, unknown>));
    }
  }

  return toDetail(row, related);
}

/** Fetch paginated published blog posts. */
export async function listPosts(
  page = 0,
  size = 9,
  category?: string,
): Promise<{ items: BlogSummary[]; hasMore: boolean; total: number }> {
  const params: Record<string, string> = {
    status: 'eq.PUBLISHED',
    select: SUMMARY_SELECT,
    order: 'published_at.desc',
    offset: String(page * size),
    limit: String(size),
  };
  if (category) params.category = `eq.${category}`;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?${new URLSearchParams(params)}`,
    {
      headers: { ...SUPABASE_HEADERS, Prefer: 'count=exact' },
      next: { revalidate: 300 },
    },
  );

  if (!res.ok) return apiListPosts(page, size, category);
  const rows = (await res.json()) as unknown[];
  if (!Array.isArray(rows)) return apiListPosts(page, size, category);

  // Total count from Content-Range response header: "0-8/42"
  const total = parseInt(
    (res.headers.get('Content-Range') ?? '0/0').split('/')[1] ?? '0',
    10,
  );

  return {
    items: rows.map((r) => toSummary(r as Record<string, unknown>)),
    hasMore: (page + 1) * size < total,
    total,
  };
}

/** Fetch featured published posts. */
export async function getFeaturedPosts(): Promise<BlogSummary[]> {
  const sp = new URLSearchParams({
    status: 'eq.PUBLISHED',
    featured: 'eq.true',
    select: SUMMARY_SELECT,
    order: 'published_at.desc',
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?${sp}`, {
    headers: SUPABASE_HEADERS,
    next: { revalidate: 300 },
  });

  if (!res.ok) return apiFeaturedPosts();
  const rows = (await res.json()) as unknown[];
  if (!Array.isArray(rows)) return apiFeaturedPosts();
  return rows.map((r) => toSummary(r as Record<string, unknown>));
}

/** Fetch all published slugs — used by generateStaticParams to pre-build pages. */
export async function getAllSlugs(): Promise<string[]> {
  const sp = new URLSearchParams({
    status: 'eq.PUBLISHED',
    select: 'slug',
    order: 'published_at.desc',
    limit: '200',
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?${sp}`, {
    headers: SUPABASE_HEADERS,
    next: { revalidate: 3600 },
  });

  if (!res.ok) return []; // graceful: new slugs served via on-demand ISR
  const rows = (await res.json()) as unknown[];
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => (r as { slug: string }).slug);
}
