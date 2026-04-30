'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminCardsApi, type AdminCardDetail } from '../../../src/api/adminCards';

const TIER_BADGE: Record<string, string> = {
  ENTRY:         'bg-gray-100 text-gray-600',
  STANDARD:      'bg-blue-50 text-blue-700',
  PREMIUM:       'bg-purple-50 text-purple-700',
  ELITE:         'bg-amber-50 text-amber-700',
  SUPER_PREMIUM: 'bg-rose-50 text-rose-700',
};

export default function AdminCardListPage() {
  const [cards, setCards] = useState<AdminCardDetail[]>([]);
  const [filtered, setFiltered] = useState<AdminCardDetail[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminCardsApi.listCards()
      .then((data) => { setCards(data); setFiltered(data); })
      .catch(() => setError('Failed to load cards'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? cards.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.issuer.name.toLowerCase().includes(q) ||
        c.tier.toLowerCase().includes(q) ||
        c.network.toLowerCase().includes(q)
      ) : cards
    );
  }, [search, cards]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Credit Cards</h1>
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
              {filtered.map((card) => (
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
                  <td className="px-5 py-4 text-sm text-gray-600">{card.network}</td>
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

              {!loading && filtered.length === 0 && (
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
      </div>
    </div>
  );
}
