'use client';

import { useEffect, useState } from 'react';
import { announcementsApi } from '../../../src/api/announcements';
import type { Announcement, CreateAnnouncementRequest } from '../../../src/types/announcements';

const BG_COLOR_OPTIONS = [
  { value: 'amber',  label: 'Amber (default)' },
  { value: 'blue',   label: 'Blue' },
  { value: 'green',  label: 'Green' },
  { value: 'red',    label: 'Red' },
  { value: 'purple', label: 'Purple' },
];

const EMPTY_FORM: CreateAnnouncementRequest = {
  badge: '',
  text: '',
  cta: '',
  href: '',
  external: false,
  bgColor: 'amber',
  sortOrder: 0,
  startsAt: '',
  endsAt: '',
};

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAnnouncementRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await announcementsApi.list();
      setItems(data);
    } catch {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(item: Announcement) {
    setEditingId(item.id);
    setForm({
      badge: item.badge ?? '',
      text: item.text,
      cta: item.cta ?? '',
      href: item.href,
      external: item.external,
      bgColor: item.bgColor ?? 'amber',
      sortOrder: item.sortOrder,
      startsAt: item.startsAt ?? '',
      endsAt: item.endsAt ?? '',
    });
    setFormError('');
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.text.trim()) { setFormError('Text is required'); return; }
    if (!form.href.trim()) { setFormError('Link URL is required'); return; }

    setSaving(true);
    setFormError('');
    try {
      const payload: CreateAnnouncementRequest = {
        ...form,
        badge: form.badge?.trim() || undefined,
        cta: form.cta?.trim() || undefined,
        startsAt: form.startsAt?.trim() || undefined,
        endsAt: form.endsAt?.trim() || undefined,
      };

      if (editingId) {
        const updated = await announcementsApi.update(editingId, payload);
        setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
      } else {
        const created = await announcementsApi.create(payload);
        setItems((prev) => [created, ...prev]);
      }
      cancelForm();
    } catch {
      setFormError('Failed to save. Check required fields and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(item: Announcement) {
    try {
      const updated = await announcementsApi.setActive(item.id, !item.active);
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      alert('Failed to update status');
    }
  }

  async function handleDelete(item: Announcement) {
    if (!confirm(`Delete announcement "${item.text.slice(0, 60)}..."? This cannot be undone.`)) return;
    try {
      await announcementsApi.delete(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      alert('Failed to delete');
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage the banner shown at the top of the home page. Only active announcements are shown.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Announcement
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Announcement' : 'New Announcement'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Offer"
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <select
                  value={form.bgColor}
                  onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BG_COLOR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Announcement Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC Infinia Credit Card — Earn 5x points on all spends..."
                value={form.text}
                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Button Text <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Check Eligibility"
                  value={form.cta}
                  onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 items-start">
                <input
                  type="text"
                  required
                  placeholder="/cards/hdfc-infinia or https://example.com/offer"
                  value={form.href}
                  onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={form.external}
                    onChange={(e) => setForm((f) => ({ ...f, external: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">External link</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Show From <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Show Until <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {formError && <p className="text-red-600 text-sm">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Announcement
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 max-w-xs">
                    {item.badge && (
                      <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                        {item.badge}
                      </span>
                    )}
                    <div className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
                      {item.text}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5 truncate">
                      {item.href}{item.external ? ' ↗' : ''}
                      {item.cta && ` · CTA: "${item.cta}"`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        item.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-green-500' : 'bg-gray-400'}`}
                      />
                      {item.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 space-y-0.5">
                    {item.startsAt && <div>From: {formatDate(item.startsAt)}</div>}
                    {item.endsAt   && <div>Until: {formatDate(item.endsAt)}</div>}
                    {!item.startsAt && !item.endsAt && <div className="text-gray-400">Always</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No announcements yet. Create one to show a banner on the home page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="px-6 py-4 text-sm text-gray-400 border-t border-gray-100">Loading…</div>
        )}
      </div>
    </div>
  );
}
