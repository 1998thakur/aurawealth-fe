import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PublicLayout from '../../components/Layout/PublicLayout';
import { blogApi } from '../../api/blog';
import type { BlogSummary } from '../../types/blog';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Travel', 'Guide', 'Comparison', 'News'] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_GRADIENTS: Record<string, string> = {
  Travel: 'from-blue-500 to-indigo-700',
  Guide: 'from-emerald-500 to-teal-700',
  Comparison: 'from-violet-500 to-purple-700',
};

function getCategoryGradient(category?: string): string {
  return category ? (CATEGORY_GRADIENTS[category] ?? 'from-primary to-primary/60') : 'from-primary to-primary/60';
}

// ─── Date formatter ───────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BlogCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-surface-container-high" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-surface-container-high rounded w-1/4" />
        <div className="h-5 bg-surface-container-high rounded w-full" />
        <div className="h-5 bg-surface-container-high rounded w-3/4" />
        <div className="h-4 bg-surface-container-high rounded w-full" />
        <div className="h-4 bg-surface-container-high rounded w-5/6" />
        <div className="flex gap-2 pt-2">
          <div className="h-3 bg-surface-container-high rounded w-16" />
          <div className="h-3 bg-surface-container-high rounded w-20" />
        </div>
      </div>
    </div>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────

function BlogCard({ post }: { post: BlogSummary }) {
  const gradient = getCategoryGradient(post.category);
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="card-surface overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200 group"
    >
      {/* Cover */}
      {post.coverImageUrl ? (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`w-full h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white/60 text-5xl">article</span>
        </div>
      )}

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {post.category && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary bg-primary-fixed/30 rounded-full px-2.5 py-0.5 mb-3 self-start">
            {post.category}
          </span>
        )}
        <h3 className="font-headline font-bold text-on-surface text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-2 flex-1 mb-4">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span>{post.authorName}</span>
          <span className="text-outline-variant">·</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span className="text-outline-variant">·</span>
          <span>{post.readingTimeMin} min read</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Featured card (larger) ───────────────────────────────────────────────────

function FeaturedCard({ post }: { post: BlogSummary }) {
  const gradient = getCategoryGradient(post.category);
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="card-surface overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-200 group"
    >
      {post.coverImageUrl ? (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`w-full h-56 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white/60 text-6xl">article</span>
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          {post.category && (
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary bg-primary-fixed/30 rounded-full px-2.5 py-0.5">
              {post.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full px-2.5 py-0.5">
            <span className="material-symbols-outlined text-xs">star</span> Featured
          </span>
        </div>
        <h2 className="font-headline font-bold text-on-surface text-xl leading-snug mb-3 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-3 flex-1 mb-4">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span>{post.authorName}</span>
          <span className="text-outline-variant">·</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span className="text-outline-variant">·</span>
          <span>{post.readingTimeMin} min read</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [page, setPage] = useState(0);
  const [allPosts, setAllPosts] = useState<BlogSummary[]>([]);

  const categoryParam = activeCategory === 'All' ? undefined : activeCategory;

  // Featured posts
  const { data: featuredPosts } = useQuery({
    queryKey: ['blog', 'featured'],
    queryFn: () => blogApi.getFeatured(),
    staleTime: 5 * 60 * 1000,
  });

  // Paginated list
  const { data: postsPage, isLoading, isFetching } = useQuery({
    queryKey: ['blog', 'list', categoryParam, page],
    queryFn: async () => {
      const result = await blogApi.getPosts({ page, size: 9, category: categoryParam });
      if (page === 0) {
        setAllPosts(result.items);
      } else {
        setAllPosts((prev) => [...prev, ...result.items]);
      }
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  function handleCategoryChange(cat: Category) {
    setActiveCategory(cat);
    setPage(0);
    setAllPosts([]);
  }

  function handleLoadMore() {
    setPage((p) => p + 1);
  }

  const hasMore = postsPage?.hasMore ?? false;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-surface to-surface-container py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-body text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            AuraWealth Blog
          </p>
          <h1 className="font-headline font-bold text-4xl md:text-5xl text-on-surface mb-4">
            Your Guide to Smarter Credit Cards
          </h1>
          <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto">
            Expert guides, card comparisons, and tips to help you earn more rewards on every rupee you spend in India.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Featured posts */}
        {featuredPosts && featuredPosts.length > 0 && activeCategory === 'All' && (
          <section className="mb-12">
            <h2 className="font-headline font-bold text-xl text-on-surface mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.slice(0, 2).map((post) => (
                <FeaturedCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium font-body transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {isLoading && page === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : allPosts.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">article</span>
            <p className="font-body text-on-surface-variant mt-3">No articles found in this category yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
              {isFetching && page > 0 &&
                Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={`sk-${i}`} />)
              }
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="btn-secondary px-8 py-2.5 disabled:opacity-50"
                >
                  {isFetching ? 'Loading…' : 'Load More Articles'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
