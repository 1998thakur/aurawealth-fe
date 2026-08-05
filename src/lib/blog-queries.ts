import { supabase } from './supabase-server';
import type { BlogDetail, BlogSummary, FaqItem } from '../types/blog';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  'https://aurawealth-backend-production-2faa.up.railway.app';

// ─── Column list (avoids fetching the large 'content' field for summaries) ────

const SUMMARY_COLUMNS =
  'id, slug, title, excerpt, cover_image_url, author_name, tags, category, post_type, featured, reading_time_min, published_at';

// ─── Row → TypeScript mappers ────────────────────────────────────────────────

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

// ─── API fallbacks (used when Supabase schema is not yet exposed) ─────────────

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

// ─── Public query functions ──────────────────────────────────────────────────

/** Fetch a single published blog post by slug, with related posts. */
export async function getPostBySlug(slug: string): Promise<BlogDetail | null> {
  const { data: row, error } = await supabase
    .schema('blog')
    .from('posts')
    .select('*, faq_items')
    .eq('slug', slug)
    .eq('status', 'PUBLISHED')
    .single();

  if (error || !row) {
    // Supabase schema not exposed yet — fall back to API
    return apiGetPost(slug);
  }

  let related: BlogSummary[] = [];
  if (row.category) {
    const { data: relRows } = await supabase
      .schema('blog')
      .from('posts')
      .select(SUMMARY_COLUMNS)
      .eq('status', 'PUBLISHED')
      .eq('category', row.category)
      .neq('id', row.id)
      .order('published_at', { ascending: false })
      .limit(3);
    if (relRows) related = relRows.map((r: Record<string, unknown>) => toSummary(r));
  }

  return toDetail(row as Record<string, unknown>, related);
}

/** Fetch paginated published blog posts. */
export async function listPosts(
  page: number = 0,
  size: number = 9,
  category?: string,
): Promise<{ items: BlogSummary[]; hasMore: boolean; total: number }> {
  let query = supabase
    .schema('blog')
    .from('posts')
    .select(SUMMARY_COLUMNS, { count: 'exact' })
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .range(page * size, (page + 1) * size - 1);

  if (category) query = query.eq('category', category);

  const { data: rows, count, error } = await query;

  if (error || !rows) {
    // Supabase schema not exposed yet — fall back to API
    return apiListPosts(page, size, category);
  }

  const total = count ?? 0;
  return {
    items: rows.map((r: Record<string, unknown>) => toSummary(r)),
    hasMore: (page + 1) * size < total,
    total,
  };
}

/** Fetch featured published posts. */
export async function getFeaturedPosts(): Promise<BlogSummary[]> {
  const { data: rows, error } = await supabase
    .schema('blog')
    .from('posts')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'PUBLISHED')
    .eq('featured', true)
    .order('published_at', { ascending: false });

  if (error || !rows) {
    // Supabase schema not exposed yet — fall back to API
    return apiFeaturedPosts();
  }

  return rows.map((r: Record<string, unknown>) => toSummary(r));
}
