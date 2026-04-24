import apiClient from './client';
import type { BlogSummary, BlogDetail, BlogListParams, FaqItem } from '../types/blog';
import type { PagedResponse } from '../types/cards';

export interface UpdateBlogPostRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  authorName?: string;
  tags?: string[];
  category?: string;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  faqItems?: FaqItem[];
  status?: string;
}

export const blogApi = {
  getPosts: async (params: BlogListParams = {}): Promise<PagedResponse<BlogSummary>> => {
    const sp = new URLSearchParams();
    if (params.page !== undefined) sp.set('page', String(params.page));
    if (params.size !== undefined) sp.set('size', String(params.size));
    if (params.category) sp.set('category', params.category);
    if (params.tag) sp.set('tag', params.tag);
    const res = await apiClient.get<PagedResponse<BlogSummary>>(`/blog?${sp}`);
    return res.data;
  },
  getFeatured: async (): Promise<BlogSummary[]> => {
    const res = await apiClient.get<BlogSummary[]>('/blog/featured');
    return res.data;
  },
  getPost: async (slug: string): Promise<BlogDetail> => {
    const res = await apiClient.get<BlogDetail>(`/blog/${slug}`);
    return res.data;
  },
  updatePost: async (id: string, data: UpdateBlogPostRequest): Promise<BlogDetail> => {
    const res = await apiClient.patch<BlogDetail>(`/blog/${id}`, data);
    return res.data;
  },
};
