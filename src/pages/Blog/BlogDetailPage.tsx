import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PublicLayout from '../../components/Layout/PublicLayout';
import { blogApi } from '../../api/blog';
import { useSeoMeta } from '../../hooks/useSeoMeta';
import type { BlogSummary } from '../../types/blog';

// ─── Gradient helper ──────────────────────────────────────────────────────────

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

// ─── Skeletons ────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-72 bg-surface-container-high" />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <div className="h-4 bg-surface-container-high rounded w-1/4" />
        <div className="h-8 bg-surface-container-high rounded w-3/4" />
        <div className="h-8 bg-surface-container-high rounded w-2/3" />
        <div className="h-4 bg-surface-container-high rounded w-full" />
        <div className="h-4 bg-surface-container-high rounded w-5/6" />
        <div className="h-4 bg-surface-container-high rounded w-full" />
      </div>
    </div>
  );
}

// ─── Related card ─────────────────────────────────────────────────────────────

function RelatedCard({ post }: { post: BlogSummary }) {
  const gradient = getCategoryGradient(post.category);
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="card-surface overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 group"
    >
      {post.coverImageUrl ? (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full h-36 object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`w-full h-36 bg-gradient-to-br ${gradient}`} />
      )}
      <div className="p-4 flex flex-col flex-1">
        {post.category && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary bg-primary-fixed/30 rounded-full px-2.5 py-0.5 mb-2 self-start">
            {post.category}
          </span>
        )}
        <h3 className="font-headline font-bold text-on-surface text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {post.title}
        </h3>
        <p className="font-body text-xs text-on-surface-variant mt-auto">{post.readingTimeMin} min read</p>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: () => blogApi.getPost(slug!),
    enabled: !!slug,
    retry: false,
    staleTime: 10 * 60 * 1000,
  });

  // Redirect on 404
  useEffect(() => {
    if (isError) {
      navigate('/blog', { replace: true });
    }
  }, [isError, navigate]);

  // SEO meta
  useSeoMeta({
    title: post?.metaTitle || post?.title || 'CreditBrain Blog',
    description: post?.metaDescription || post?.excerpt,
    ogTitle: post?.metaTitle || post?.title,
    ogDescription: post?.metaDescription || post?.excerpt,
    ogImage: post?.coverImageUrl,
    ogType: 'article',
    canonical: post ? `https://credbrain.in/blog/${post.slug}` : undefined,
  });

  // JSON-LD structured data
  useEffect(() => {
    if (!post) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'blog-jsonld';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: post.coverImageUrl || undefined,
      author: {
        '@type': 'Organization',
        name: post.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: 'CreditBrain',
        url: 'https://credbrain.in',
      },
      datePublished: post.publishedAt,
      dateModified: post.createdAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://credbrain.in/blog/${post.slug}`,
      },
    });
    document.head.appendChild(script);
    return () => {
      document.getElementById('blog-jsonld')?.remove();
    };
  }, [post]);

  if (isLoading) return <PublicLayout><DetailSkeleton /></PublicLayout>;
  if (!post) return null;

  const gradient = getCategoryGradient(post.category);

  return (
    <PublicLayout>
      {/* Cover image */}
      {post.coverImageUrl ? (
        <div className="w-full aspect-video max-h-96 overflow-hidden">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`w-full h-64 md:h-80 bg-gradient-to-br ${gradient}`} />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs text-outline-variant">chevron_right</span>
          <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          {post.category && (
            <>
              <span className="material-symbols-outlined text-xs text-outline-variant">chevron_right</span>
              <Link
                to={`/blog?category=${post.category}`}
                className="hover:text-primary transition-colors"
              >
                {post.category}
              </Link>
            </>
          )}
          <span className="material-symbols-outlined text-xs text-outline-variant">chevron_right</span>
          <span className="text-on-surface line-clamp-1 max-w-xs">{post.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-8">
          {post.category && (
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary bg-primary-fixed/30 rounded-full px-2.5 py-0.5 mb-4">
              {post.category}
            </span>
          )}
          <h1 className="font-headline font-bold text-3xl md:text-4xl text-on-surface leading-tight mb-4">
            {post.title}
          </h1>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed mb-6">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant border-t border-outline-variant pt-5">
            {post.authorAvatarUrl ? (
              <img
                src={post.authorAvatarUrl}
                alt={post.authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-fixed/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-base">person</span>
              </div>
            )}
            <span className="font-medium text-on-surface">{post.authorName}</span>
            <span className="text-outline-variant">·</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span className="text-outline-variant">·</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {post.readingTimeMin} min read
            </span>
          </div>
        </header>

        {/* Article body */}
        <article
          className="blog-content font-body text-on-surface-variant leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            ['--blog-heading-color' as string]: 'var(--color-on-surface)',
            ['--blog-text-color' as string]: 'var(--color-on-surface-variant)',
          }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-outline-variant">
            <p className="font-body text-sm font-semibold text-on-surface mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-xs font-medium bg-surface-container text-on-surface-variant hover:bg-primary-fixed/30 hover:text-primary rounded-full px-3 py-1 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related posts */}
        {post.related && post.related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-headline font-bold text-xl text-on-surface mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {post.related.map((rel) => (
                <RelatedCard key={rel.id} post={rel} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="font-headline font-bold text-2xl text-on-surface mb-3">
            Find Your Best Credit Card
          </h2>
          <p className="font-body text-on-surface-variant mb-6 max-w-md mx-auto">
            Enter your spending habits and CreditBrain will recommend the card that earns you the most rewards.
          </p>
          <Link to="/expense-profiler" className="btn-primary inline-block px-8 py-3">
            Get My Personalised Recommendation
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
