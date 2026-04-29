'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminBlogApi } from '../../../src/api/adminBlog';
import type { BlogDetail } from '../../../src/types/blog';

type StatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

const STATUS_TABS: StatusFilter[] = ['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'];

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
};

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogDetail[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  async function load(filter: StatusFilter, p: number) {
    setLoading(true);
    try {
      const data = await adminBlogApi.listPosts({
        page: p,
        size: 20,
        status: filter === 'ALL' ? undefined : filter,
      });
      setPosts((prev) => (p === 0 ? data.items : [...prev, ...data.items]));
      setHasMore(data.hasMore);
    } catch {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(0);
    load(statusFilter, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminBlogApi.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete post');
    }
  }

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    load(statusFilter, next);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog Posts</h1>
        <Link
          href="/admin/blogs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Post
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 text-sm leading-snug">{post.title}</div>
                    <div className="text-gray-400 text-xs mt-0.5 font-mono">{post.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_BADGE[post.status ?? 'DRAFT'] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {post.status ?? 'DRAFT'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{post.category ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.publishedAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/blogs/${post.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No posts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="px-6 py-4 text-sm text-gray-400 border-t border-gray-100">Loading…</div>
        )}

        {hasMore && !loading && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button onClick={handleLoadMore} className="text-blue-600 text-sm hover:underline">
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
