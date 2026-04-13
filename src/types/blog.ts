export interface BlogSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  authorName: string;
  tags: string[];
  category?: string;
  featured: boolean;
  readingTimeMin: number;
  publishedAt: string;
}

export interface BlogDetail extends BlogSummary {
  content: string;
  authorAvatarUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  related: BlogSummary[];
}

export interface BlogListParams {
  page?: number;
  size?: number;
  category?: string;
  tag?: string;
}
