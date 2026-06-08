export type PostType = 'listicle' | 'comparison' | 'guide' | 'review' | 'calculator' | 'article';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BlogSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  authorName: string;
  tags: string[];
  category?: string;
  postType?: PostType;
  featured: boolean;
  readingTimeMin: number;
  publishedAt: string;
}

export interface BlogDetail extends BlogSummary {
  content: string;
  authorAvatarUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  faqItems?: FaqItem[];
  createdAt: string;
  updatedAt: string;
  status?: string;
  related: BlogSummary[];
}

export interface BlogListParams {
  page?: number;
  size?: number;
  category?: string;
  tag?: string;
}
