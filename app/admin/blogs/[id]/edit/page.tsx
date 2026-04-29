'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminBlogApi } from '../../../../../src/api/adminBlog';
import BlogPostForm from '../../../../../src/components/admin/BlogPostForm';
import type { BlogDetail } from '../../../../../src/types/blog';

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminBlogApi
      .getPost(id)
      .then(setPost)
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading post…
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center py-24 text-red-500 text-sm">
        {error || 'Post not found'}
      </div>
    );
  }

  return <BlogPostForm post={post} />;
}
