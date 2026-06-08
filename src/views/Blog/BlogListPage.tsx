'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import PublicLayout from '../../components/Layout/PublicLayout';
import { blogApi } from '../../api/blog';
import type { BlogSummary, PostType } from '../../types/blog';
import { useSeoMeta, injectJsonLd, removeJsonLd } from '../../hooks/useSeoMeta';
import { SITE_URL } from '../../config';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Best Cards', 'Cashback', 'Rewards', 'Travel', 'Comparisons', 'Guides', 'Offers', 'News'] as const;
type Category = (typeof CATEGORIES)[number];

interface CategoryMeta {
  title: string;
  description: string;
  keywords: string;
}

const CATEGORY_META: Record<Category, CategoryMeta> = {
  'All': {
    title: 'Credit Card Tips, Guides & Comparisons — CreditBrain Blog',
    description: 'Expert guides on the best credit cards in India, reward optimisation strategies, card comparisons, and tips to maximise cashback and travel benefits.',
    keywords: 'credit card blog India, credit card tips India, best credit card guides, reward points tips, credit card cashback tips, travel card India guide',
  },
  'Best Cards': {
    title: 'Best Credit Cards in India 2026 — CreditBrain',
    description: 'Curated lists of the best credit cards in India for every need — shopping, travel, fuel, dining, and more. Updated monthly.',
    keywords: 'best credit card India 2026, top credit cards India, best credit card for online shopping India, lifetime free credit card India',
  },
  'Cashback': {
    title: 'Best Cashback Credit Cards India — CreditBrain',
    description: 'Find the highest cashback credit cards in India for groceries, shopping, fuel, and everyday spends. Compare rates and earn more.',
    keywords: 'best cashback credit card India, cashback credit card groceries India, highest cashback credit card, cashback vs reward points India',
  },
  'Rewards': {
    title: 'Credit Card Reward Points Guide India — CreditBrain',
    description: 'Learn how to maximise credit card reward points in India. Best cards for reward points, redemption tips, and value calculations.',
    keywords: 'credit card reward points India, maximise reward points, reward points value INR, best reward credit card India, reward points redemption guide',
  },
  'Travel': {
    title: 'Best Travel Credit Cards India — Lounge Access & Forex — CreditBrain',
    description: 'Best credit cards for travel in India. Airport lounge access, zero forex markup, air miles, and hotel benefits compared.',
    keywords: 'best travel credit card India, airport lounge access credit card India, zero forex credit card, air miles credit card India, travel benefits credit card',
  },
  'Comparisons': {
    title: 'Credit Card Comparisons India — Side-by-Side — CreditBrain',
    description: 'Head-to-head credit card comparisons in India. HDFC vs Axis vs ICICI vs SBI — find out which card wins for your spending.',
    keywords: 'HDFC Regalia vs Infinia, Axis Magnus comparison, best credit card comparison India, credit card vs credit card India',
  },
  'Guides': {
    title: 'Credit Card How-To Guides India — CreditBrain',
    description: 'Step-by-step guides on applying for credit cards, improving credit scores, getting fee waivers, and understanding billing cycles in India.',
    keywords: 'how to apply credit card India, credit card annual fee waiver, credit score for credit card India, credit card billing cycle explained',
  },
  'Offers': {
    title: 'Latest Credit Card Offers & Bonuses India — CreditBrain',
    description: 'Current credit card welcome bonuses, joining offers, limited-time promotions, and bank deals in India. Updated regularly.',
    keywords: 'credit card welcome bonus India, credit card joining offer, bank credit card offers India, credit card promotional offers',
  },
  'News': {
    title: 'Credit Card News India — New Launches & Fee Changes — CreditBrain',
    description: 'Latest credit card news in India — new card launches, reward programme changes, bank fee revisions, and industry updates.',
    keywords: 'new credit card launch India 2026, credit card fee revision, credit card reward programme change India, credit card news India',
  },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Travel: 'from-blue-500 to-indigo-700',
  Guides: 'from-emerald-500 to-teal-700',
  Comparisons: 'from-violet-500 to-purple-700',
  Cashback: 'from-orange-500 to-amber-600',
  Rewards: 'from-yellow-500 to-orange-600',
  'Best Cards': 'from-primary to-primary/60',
  Offers: 'from-rose-500 to-pink-600',
  News: 'from-slate-500 to-slate-700',
};

function getCategoryGradient(category?: string): string {
  return category ? (CATEGORY_GRADIENTS[category] ?? 'from-primary to-primary/60') : 'from-primary to-primary/60';
}

// ─── Post type badge ───────────────────────────────────────────────────────────

const POST_TYPE_CONFIG: Record<PostType, { label: string; icon: string; classes: string }> = {
  listicle:   { label: 'List',        icon: 'format_list_numbered', classes: 'text-blue-700 bg-blue-100' },
  comparison: { label: 'Comparison',  icon: 'compare_arrows',       classes: 'text-violet-700 bg-violet-100' },
  guide:      { label: 'Guide',       icon: 'menu_book',             classes: 'text-emerald-700 bg-emerald-100' },
  review:     { label: 'Review',      icon: 'rate_review',           classes: 'text-orange-700 bg-orange-100' },
  calculator: { label: 'Calculator',  icon: 'calculate',             classes: 'text-teal-700 bg-teal-100' },
  article:    { label: 'Article',     icon: 'article',               classes: 'text-slate-600 bg-slate-100' },
};

function PostTypeBadge({ postType }: { postType?: PostType }) {
  if (!postType || postType === 'article') return null;
  const cfg = POST_TYPE_CONFIG[postType] ?? POST_TYPE_CONFIG.article;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${cfg.classes}`}>
      <span className="material-symbols-outlined text-xs">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
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
      href={`/blog/${post.slug}`}
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
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.category && (
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary bg-primary-fixed/30 rounded-full px-2.5 py-0.5">
              {post.category}
            </span>
          )}
          <PostTypeBadge postType={post.postType} />
        </div>
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
      href={`/blog/${post.slug}`}
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
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.category && (
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary bg-primary-fixed/30 rounded-full px-2.5 py-0.5">
              {post.category}
            </span>
          )}
          <PostTypeBadge postType={post.postType} />
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

  const meta = CATEGORY_META[activeCategory];
  const canonicalUrl = activeCategory === 'All'
    ? `${SITE_URL}/blog`
    : `${SITE_URL}/blog?category=${encodeURIComponent(activeCategory)}`;

  useSeoMeta({
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    canonical: canonicalUrl,
    ogUrl: canonicalUrl,
    ogType: 'website',
  });

  const categoryParam = activeCategory === 'All' ? undefined : activeCategory;

  // Featured posts
  const { data: featuredPosts } = useQuery({
    queryKey: ['blog', 'featured'],
    queryFn: () => blogApi.getFeatured(),
    staleTime: 5 * 60 * 1000,
  });

  // ItemList JSON-LD — inject when we have posts to show
  useEffect(() => {
    const posts = allPosts.length > 0 ? allPosts : (featuredPosts ?? []);
    if (posts.length === 0) return;
    injectJsonLd('blog-list', {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: meta.title,
      description: meta.description,
      url: canonicalUrl,
      itemListElement: posts.slice(0, 20).map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    });
    return () => removeJsonLd('blog-list');
  }, [allPosts, featuredPosts, meta, canonicalUrl]);

  // Paginated list
  const { data: postsPage, isLoading, isFetching } = useQuery({
    queryKey: ['blog', 'list', categoryParam, page],
    queryFn: () => blogApi.getPosts({ page, size: 9, category: categoryParam }),
    staleTime: 5 * 60 * 1000,
  });

  // Accumulate posts from query data
  useEffect(() => {
    if (!postsPage) return;
    if (page === 0) {
      setAllPosts(postsPage.items);
    } else {
      setAllPosts((prev) => [...prev, ...postsPage.items]);
    }
  }, [postsPage, page]);

  function handleCategoryChange(cat: Category) {
    const next: Category = activeCategory === cat && cat !== 'All' ? 'All' : cat;
    if (next === activeCategory) return;
    setActiveCategory(next);
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
            CreditBrain Blog
          </p>
          <h1 className="font-headline font-bold text-4xl md:text-5xl text-on-surface mb-4">
            Your Guide to Smarter Credit Cards
          </h1>
          <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto">
            Expert guides, card comparisons, and tips to help you earn more rewards on every rupee you spend in India.
          </p>
          {/* Post type legend */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {(Object.entries(POST_TYPE_CONFIG) as [PostType, typeof POST_TYPE_CONFIG[PostType]][])
              .filter(([t]) => t !== 'article')
              .map(([type, cfg]) => (
                <span key={type} className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${cfg.classes}`}>
                  <span className="material-symbols-outlined text-xs">{cfg.icon}</span>
                  {cfg.label}
                </span>
              ))}
          </div>
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
