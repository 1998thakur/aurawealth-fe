import type { Metadata } from 'next';
import BlogDetailPage from '../../../src/views/Blog/BlogDetailPage';
import { blogApi } from '../../../src/api/blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://credbrain.in';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await blogApi.getPost(params.slug);
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
  } catch {
    return { title: 'Blog Post — CreditBrain' };
  }
}

export default function Page() {
  return <BlogDetailPage />;
}
