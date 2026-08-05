'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PublicLayout from '../../components/Layout/PublicLayout';
import { blogApi } from '../../api/blog';
import { useSeoMeta, injectJsonLd, removeJsonLd } from '../../hooks/useSeoMeta';
import type { BlogDetail, BlogSummary, FaqItem, PostType } from '../../types/blog';
import { SITE_URL } from '../../config';

// ─── Gradient helper ──────────────────────────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, string> = {
  Travel: 'from-blue-500 to-indigo-700',
  Guides: 'from-emerald-500 to-teal-700',
  Comparisons: 'from-violet-500 to-purple-700',
  Cashback: 'from-orange-500 to-amber-600',
  Rewards: 'from-yellow-500 to-orange-600',
  'Best Cards': 'from-primary to-primary/60',
};

function getCategoryGradient(category?: string): string {
  return category ? (CATEGORY_GRADIENTS[category] ?? 'from-primary to-primary/60') : 'from-primary to-primary/60';
}

// ─── Post type config ─────────────────────────────────────────────────────────

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
    <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 ${cfg.classes}`}>
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

// ─── Table of Contents ────────────────────────────────────────────────────────

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

function parseToc(html: string): TocEntry[] {
  const matches = Array.from(html.matchAll(/<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi));
  return matches.map((m, idx) => {
    const level = parseInt(m[1], 10);
    const text = m[3].replace(/<[^>]+>/g, '').trim();
    const id = m[2] || `toc-heading-${idx}`;
    return { id, text, level };
  });
}

function TableOfContents({ entries, activeId }: { entries: TocEntry[]; activeId: string }) {
  if (entries.length < 3) return null;
  return (
    <nav className="rounded-xl border border-outline-variant bg-surface-container p-5 mb-8">
      <p className="font-headline font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-base text-primary">list</span>
        Table of Contents
      </p>
      <ol className="space-y-1.5">
        {entries.map((entry) => (
          <li key={entry.id} className={entry.level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${entry.id}`}
              className={`font-body text-sm transition-colors hover:text-primary ${
                activeId === entry.id ? 'text-primary font-medium' : 'text-on-surface-variant'
              }`}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── Key Takeaways box (for listicle / guide) ─────────────────────────────────

function KeyTakeaways({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-8">
      <p className="font-headline font-bold text-sm text-primary mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-base">lightbulb</span>
        Key Takeaways
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 font-body text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-sm mt-0.5 shrink-0">check_circle</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Extract first 5 <li> texts from HTML (used as key takeaways for listicle/guide posts) */
function extractListItems(html: string, max = 5): string[] {
  const matches = Array.from(html.matchAll(/<li[^>]*>(.*?)<\/li>/gi));
  return matches
    .slice(0, max)
    .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);
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
      href={`/blog/${post.slug}`}
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
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {post.category && (
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary bg-primary-fixed/30 rounded-full px-2.5 py-0.5">
              {post.category}
            </span>
          )}
        </div>
        <h3 className="font-headline font-bold text-on-surface text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {post.title}
        </h3>
        <p className="font-body text-xs text-on-surface-variant mt-auto">{post.readingTimeMin} min read</p>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface BlogDetailPageProps {
  serverPost?: BlogDetail;
}

export default function BlogDetailPage({ serverPost }: BlogDetailPageProps) {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const router = useRouter();
  const [activeHeadingId, setActiveHeadingId] = useState('');

  const { data: clientPost, isLoading, isError } = useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: () => blogApi.getPost(slug!),
    enabled: !!slug && !serverPost,
    retry: false,
    staleTime: 10 * 60 * 1000,
    initialData: serverPost,
  });

  const post = serverPost ?? clientPost;

  // Redirect on 404
  useEffect(() => {
    if (isError && !serverPost) {
      router.replace('/blog');
    }
  }, [isError, serverPost, router]);

  // Parse TOC from content
  const tocEntries = useMemo(() => (post ? parseToc(post.content) : []), [post]);

  // Track active heading via IntersectionObserver
  useEffect(() => {
    if (tocEntries.length < 3) return;
    const observers: IntersectionObserver[] = [];
    tocEntries.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveHeadingId(id); },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [tocEntries]);

  // Key takeaways for listicle / guide posts
  const keyTakeaways = useMemo(() => {
    if (!post || !['listicle', 'guide'].includes(post.postType ?? '')) return [];
    return extractListItems(post.content);
  }, [post]);

  const postUrl = post ? `${SITE_URL}/blog/${post.slug}` : undefined;

  // SEO meta + article OG properties
  useSeoMeta({
    title: post?.metaTitle || post?.title || 'CreditBrain Blog',
    description: post?.metaDescription || post?.excerpt,
    keywords: post?.keywords || (post?.tags?.join(', ')),
    ogTitle: post?.metaTitle || post?.title,
    ogDescription: post?.metaDescription || post?.excerpt,
    ogImage: post?.coverImageUrl,
    ogType: 'article',
    ogUrl: postUrl,
    canonical: postUrl,
    articlePublishedTime: post?.publishedAt,
    articleModifiedTime: post?.updatedAt,
    articleSection: post?.category,
    articleTags: post?.tags,
  });

  // Article JSON-LD
  useEffect(() => {
    if (!post) return;
    const wordCount = post.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
    injectJsonLd('article', {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.coverImageUrl || `${SITE_URL}/og-image.png`,
      keywords: post.keywords || post.tags?.join(', '),
      articleSection: post.category,
      inLanguage: 'en-IN',
      wordCount,
      author: {
        '@type': 'Person',
        name: post.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: 'CreditBrain',
        url: `${SITE_URL}`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
        },
      },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${post.slug}`,
      },
    });
    return () => removeJsonLd('article');
  }, [post]);

  // BreadcrumbList JSON-LD
  useEffect(() => {
    if (!post) return;
    const items: object[] = [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: `${SITE_URL}` },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
    ];
    if (post.category) {
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: post.category,
        item: `${SITE_URL}/blog?category=${encodeURIComponent(post.category)}`,
      });
      items.push({ '@type': 'ListItem', position: 4, name: post.title, item: `${SITE_URL}/blog/${post.slug}` });
    } else {
      items.push({ '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` });
    }
    injectJsonLd('breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    });
    return () => removeJsonLd('breadcrumb');
  }, [post]);

  // FAQPage JSON-LD
  useEffect(() => {
    if (!post?.faqItems?.length) return;
    injectJsonLd('faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faqItems.map((faq: FaqItem) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
    return () => removeJsonLd('faq');
  }, [post]);

  if (isLoading) return <PublicLayout><DetailSkeleton /></PublicLayout>;
  if (!post) return null;

  const gradient = getCategoryGradient(post.category);
  const postTypeCfg = post.postType ? (POST_TYPE_CONFIG[post.postType] ?? null) : null;
  const hasToc = tocEntries.length >= 3;

  return (
    <PublicLayout>
      {/* Cover image / gradient hero */}
      {post.coverImageUrl ? (
        <div className="w-full aspect-video max-h-96 overflow-hidden">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            fetchPriority="high"
            loading="eager"
          />
        </div>
      ) : (
        <div className={`w-full h-52 md:h-72 bg-gradient-to-br ${gradient} flex items-end`}>
          {postTypeCfg && (
            <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6">
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-full px-3 py-1 ${postTypeCfg.classes}`}>
                <span className="material-symbols-outlined text-sm">{postTypeCfg.icon}</span>
                {postTypeCfg.label}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs text-outline-variant">chevron_right</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          {post.category && (
            <>
              <span className="material-symbols-outlined text-xs text-outline-variant">chevron_right</span>
              <Link
                href={`/blog?category=${post.category}`}
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
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {post.category && (
              <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary bg-primary-fixed/30 rounded-full px-2.5 py-0.5">
                {post.category}
              </span>
            )}
            <PostTypeBadge postType={post.postType} />
          </div>
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


        {/* Table of Contents */}
        {hasToc && (
          <TableOfContents entries={tocEntries} activeId={activeHeadingId} />
        )}

        {/* Key takeaways for listicle / guide */}
        {keyTakeaways.length > 0 && (
          <KeyTakeaways items={keyTakeaways} />
        )}

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
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-xs font-medium bg-surface-container text-on-surface-variant hover:bg-primary-fixed/30 hover:text-primary rounded-full px-3 py-1 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQ section */}
        {post.faqItems && post.faqItems.length > 0 && (
          <section className="mt-10 pt-6 border-t border-outline-variant">
            <h2 className="font-headline font-bold text-xl text-on-surface mb-5">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {post.faqItems.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl bg-surface-container border border-outline-variant overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-4 font-body font-semibold text-on-surface text-sm list-none">
                    <span>{faq.question}</span>
                    <span className="material-symbols-outlined text-outline group-open:rotate-180 transition-transform shrink-0">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-5 pb-4 font-body text-sm text-on-surface-variant leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
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
          <Link href="/expense-profiler" className="btn-primary inline-block px-8 py-3">
            Get My Personalised Recommendation
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
