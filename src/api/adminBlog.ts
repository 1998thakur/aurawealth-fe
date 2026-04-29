import adminClient from './adminClient';
import type { BlogDetail, BlogSummary, FaqItem } from '../types/blog';
import type { PagedResponse } from '../types/cards';

export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface CreateBlogPostRequest {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  authorName?: string;
  tags?: string[];
  category?: string;
  featured?: boolean;
  status?: BlogStatus;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  faqItems?: FaqItem[];
}

export type UpdateBlogPostRequest = Partial<CreateBlogPostRequest>;

export const adminBlogApi = {
  listPosts: async (params: { page?: number; size?: number; status?: string } = {}): Promise<PagedResponse<BlogDetail>> => {
    const { page = 0, size = 20, status } = params;
    const response = await adminClient.get<PagedResponse<BlogDetail>>('/admin/v1/blog', {
      params: { page, size, ...(status ? { status } : {}) },
    });
    return response.data;
  },

  getPost: async (id: string): Promise<BlogDetail> => {
    const response = await adminClient.get<BlogDetail>(`/admin/v1/blog/${id}`);
    return response.data;
  },

  createPost: async (data: CreateBlogPostRequest): Promise<BlogSummary> => {
    const response = await adminClient.post<BlogSummary>('/admin/v1/blog', data);
    return response.data;
  },

  updatePost: async (id: string, data: UpdateBlogPostRequest): Promise<BlogDetail> => {
    const response = await adminClient.patch<BlogDetail>(`/admin/v1/blog/${id}`, data);
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await adminClient.delete(`/admin/v1/blog/${id}`);
  },
};
