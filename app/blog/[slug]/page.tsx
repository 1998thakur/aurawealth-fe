import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogDetailPage from '../../../src/views/Blog/BlogDetailPage';
import { getPostBySlug, getAllSlugs } from '../../../src/lib/blog-queries';
import type { BlogDetail } from '../../../src/types/blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://creditbrain.in';

export const revalidate = 600; // ISR: revalidate every 10 minutes

/** Pre-build all known blog slugs at build time. New slugs are rendered on
 *  first request and then cached by ISR. */
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Blog Post — CreditBrain' };

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const coverImage = post.coverImageUrl ?? `${SITE_URL}/og-image.png`;

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords || post.tags?.join(', '),
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: 'article',
      url: postUrl,
      images: [{ url: coverImage }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [coverImage],
    },
    alternates: { canonical: postUrl },
  };
}

function buildJsonLd(post: BlogDetail) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const coverImage = post.coverImageUrl ?? `${SITE_URL}/og-image.png`;
  const wordCount = post.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: coverImage,
      keywords: post.keywords || post.tags?.join(', '),
      articleSection: post.category,
      inLanguage: 'en-IN',
      wordCount,
      author: { '@type': 'Person', name: post.authorName },
      publisher: {
        '@type': 'Organization',
        name: 'CreditBrain',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 },
      },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    },
  ];

  // BreadcrumbList
  const breadcrumbItems: object[] = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
  ];
  if (post.category) {
    breadcrumbItems.push({ '@type': 'ListItem', position: 3, name: post.category, item: `${SITE_URL}/blog?category=${encodeURIComponent(post.category)}` });
    breadcrumbItems.push({ '@type': 'ListItem', position: 4, name: post.title, item: postUrl });
  } else {
    breadcrumbItems.push({ '@type': 'ListItem', position: 3, name: post.title, item: postUrl });
  }
  schemas.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems });

  // FAQPage
  if (post.faqItems?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faqItems.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return schemas;
}

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const schemas = buildJsonLd(post);

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <BlogDetailPage serverPost={post} />
    </>
  );
}
