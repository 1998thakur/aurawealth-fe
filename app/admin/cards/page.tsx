'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminCardsApi } from '../../../src/api/adminCards';
import type { CardSummary } from '../../../src/types/cards';

const TIER_BADGE: Record<string, string> = {
  ENTRY:         'bg-gray-100 text-gray-600',
  STANDARD:      'bg-blue-50 text-blue-700',
  PREMIUM:       'bg-purple-50 text-purple-700',
  ELITE:         'bg-amber-50 text-amber-700',
  SUPER_PREMIUM: 'bg-rose-50 text-rose-700',
};

const PAGE_SIZE = 10;

export default function AdminCardListPage() {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCards = useCallback((p: number, q: string) => {
    setLoading(true);
    setError('');
    adminCardsApi.listCards(p, PAGE_SIZE, q)
      .then((data) => {
        setCards(data.items);
        setTotal(data.total ?? 0);
        setHasMore(data.hasMore);
      })
      .catch(() => setError('Failed to load cards'))
      .finally(() => setLoading(false));
  }, []);

  // Debounce search — reset to page 0 on new query
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      fetchCards(0, search);
    }, 300);
    return () => clearTimeout(t);
  }, [search, fetchCards]);

  // Re-fetch when page changes (but not when search changes — that's handled above)
  useEffect(() => {
    if (page === 0) return; // page 0 is already fetched by the search effect
    fetchCards(page, search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Credit Cards</h1>
          {total > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{total} cards total</p>
          )}
        </div>
        <Link
          href="/admin/cards/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Card
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, issuer, tier, network…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Card', 'Issuer', 'Tier', 'Network', 'Annual Fee', 'Reward Type', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cards.map((card) => (
                <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900 text-sm">{card.name}</div>
                    <div className="text-gray-400 text-xs font-mono mt-0.5">{card.slug}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{card.issuer.name}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE[card.tier] ?? 'bg-gray-100 text-gray-600'}`}>
                      {card.tier}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(card.networks?.length ? card.networks : [card.network]).map((n) => (
                        <span key={n} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                          {n}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {card.annualFee === 0 ? 'Free' : `₹${card.annualFee.toLocaleString('en-IN')}`}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{card.rewardType}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/cards/${card.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}

              {!loading && cards.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    {search ? 'No cards match your search' : 'No cards found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="px-5 py-4 text-sm text-gray-400 border-t border-gray-100">Loading…</div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page + 1} of {totalPages}
              <span className="ml-2 text-gray-400">
                ({page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total})
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
