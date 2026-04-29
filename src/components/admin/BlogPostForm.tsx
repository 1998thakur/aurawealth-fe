'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogEditor from './BlogEditor';
import { adminBlogApi, type CreateBlogPostRequest, type BlogStatus } from '../../api/adminBlog';
import type { BlogDetail } from '../../types/blog';

interface Props {
  post?: BlogDetail;
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function InputField({
  label,
  value,
  onChange,
  required,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}

export default function BlogPostForm({ post }: Props) {
  const router = useRouter();
  const isEdit = !!post;

  const [form, setForm] = useState<CreateBlogPostRequest>({
    slug: post?.slug ?? '',
    title: post?.title ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    coverImageUrl: post?.coverImageUrl ?? '',
    authorName: post?.authorName ?? '',
    tags: post?.tags ?? [],
    category: post?.category ?? '',
    featured: post?.featured ?? false,
    status: (post?.status as BlogStatus) ?? 'DRAFT',
    metaTitle: post?.metaTitle ?? '',
    metaDescription: post?.metaDescription ?? '',
    keywords: post?.keywords ?? '',
    faqItems: post?.faqItems ?? [],
  });

  const [tagsInput, setTagsInput] = useState((post?.tags ?? []).join(', '));
  const [slugManual, setSlugManual] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setField<K extends keyof CreateBlogPostRequest>(key: K, value: CreateBlogPostRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(title: string) {
    setField('title', title);
    if (!slugManual) {
      setField('slug', toSlug(title));
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const payload: CreateBlogPostRequest = {
        ...form,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (isEdit && post) {
        await adminBlogApi.updatePost(post.id, payload);
      } else {
        await adminBlogApi.createPost(payload);
      }
      router.push('/admin/blogs');
    } catch {
      setError('Failed to save post. Check all required fields and try again.');
    } finally {
      setSaving(false);
    }
  }

  const addFaq = () =>
    setField('faqItems', [...(form.faqItems ?? []), { question: '', answer: '' }]);

  const updateFaq = (i: number, field: 'question' | 'answer', val: string) => {
    const updated = [...(form.faqItems ?? [])];
    updated[i] = { ...updated[i], [field]: val };
    setField('faqItems', updated);
  };

  const removeFaq = (i: number) =>
    setField(
      'faqItems',
      (form.faqItems ?? []).filter((_, idx) => idx !== i)
    );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/blogs')}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Post' : 'New Post'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={form.status}
            onChange={(e) => setField('status', e.target.value as BlogStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Post'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Basic Info</h2>

          <InputField
            label="Title"
            value={form.title}
            onChange={handleTitleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 items-center">
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setField('slug', e.target.value);
                }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              {slugManual && (
                <button
                  type="button"
                  onClick={() => {
                    setSlugManual(false);
                    setField('slug', toSlug(form.title));
                  }}
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                >
                  Auto-generate
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setField('excerpt', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <InputField
            label="Cover Image URL"
            value={form.coverImageUrl ?? ''}
            onChange={(v) => setField('coverImageUrl', v)}
            placeholder="https://..."
          />
          <InputField
            label="Author Name"
            value={form.authorName ?? ''}
            onChange={(v) => setField('authorName', v)}
            placeholder="CreditBrain Team"
          />
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">Content</h2>
          <BlogEditor content={form.content} onChange={(v) => setField('content', v)} />
        </div>

        {/* Classification */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Classification</h2>

          <InputField
            label="Category"
            value={form.category ?? ''}
            onChange={(v) => setField('category', v)}
            placeholder="credit-cards"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags{' '}
              <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="cashback, travel, lounge-access"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured ?? false}
              onChange={(e) => setField('featured', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Featured post</span>
          </label>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">SEO</h2>
          <InputField
            label="Meta Title"
            value={form.metaTitle ?? ''}
            onChange={(v) => setField('metaTitle', v)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea
              value={form.metaDescription ?? ''}
              onChange={(e) => setField('metaDescription', e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <InputField
            label="Keywords"
            value={form.keywords ?? ''}
            onChange={(v) => setField('keywords', v)}
            placeholder="credit card, cashback, travel"
          />
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">FAQ</h2>
            <button
              type="button"
              onClick={addFaq}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add FAQ
            </button>
          </div>

          {(form.faqItems ?? []).length === 0 && (
            <p className="text-sm text-gray-400">No FAQ items. Click "+ Add FAQ" to add one.</p>
          )}

          {(form.faqItems ?? []).map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  FAQ {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFaq(i)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
              <input
                value={faq.question}
                onChange={(e) => updateFaq(i, 'question', e.target.value)}
                placeholder="Question"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                placeholder="Answer"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
