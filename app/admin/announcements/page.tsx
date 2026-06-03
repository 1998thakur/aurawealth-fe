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
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Simple CSS toggle switch */
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </div>
      {label && (
        <span className={`text-sm font-medium ${checked ? 'text-green-700' : 'text-gray-500'}`}>
          {checked ? 'Visible' : 'Hidden'}
        </span>
      )}
    </label>
  );
}

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAnnouncementRequest>(EMPTY_FORM);
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setItems(await announcementsApi.list());
    } catch {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormActive(true);
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
    setFormActive(item.active);
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
      const payload = {
        ...form,
        badge: form.badge?.trim() || undefined,
        cta: form.cta?.trim() || undefined,
        startsAt: form.startsAt?.trim() || undefined,
        endsAt: form.endsAt?.trim() || undefined,
      };

      if (editingId) {
        const updated = await announcementsApi.update(editingId, { ...payload, active: formActive });
        setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
      } else {
        const created = await announcementsApi.create(payload);
        // If admin toggled it off in the form before saving, update active
        if (!formActive) {
          const updated = await announcementsApi.setActive(created.id, false);
          setItems((prev) => [updated, ...prev]);
        } else {
          setItems((prev) => [created, ...prev]);
        }
      }
      cancelForm();
    } catch {
      setFormError('Failed to save. Check required fields and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: Announcement) {
    try {
      const updated = await announcementsApi.setActive(item.id, !item.active);
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      alert('Failed to update');
    }
  }

  async function handleDelete(item: Announcement) {
    if (!confirm(`Delete this announcement? This cannot be undone.`)) return;
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
            Banners shown at the top of the home page. Toggle the switch to show or hide.
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

            {/* Show on homepage toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Show on homepage</p>
                <p className="text-xs text-gray-400 mt-0.5">Toggle off to hide without deleting</p>
              </div>
              <ToggleSwitch checked={formActive} onChange={setFormActive} label="" />
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
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                  Announcement
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Show on site
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
                <tr key={item.id} className={`transition-colors ${item.active ? 'hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100/50'}`}>
                  <td className="px-6 py-4">
                    {item.badge && (
                      <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                        {item.badge}
                      </span>
                    )}
                    <div className={`font-medium text-sm leading-snug line-clamp-2 ${item.active ? 'text-gray-900' : 'text-gray-400'}`}>
                      {item.text}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5 truncate">
                      {item.href}{item.external ? ' ↗' : ''}
                      {item.cta && ` · "${item.cta}"`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ToggleSwitch checked={item.active} onChange={() => handleToggle(item)} label="show" />
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
