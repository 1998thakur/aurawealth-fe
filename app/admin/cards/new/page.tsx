'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCardsApi, type CreateCardRequest } from '../../../../src/api/adminCards';
import { cardsApi } from '../../../../src/api/cards';
import type { Issuer } from '../../../../src/types/cards';

const TIERS    = ['ENTRY','STANDARD','PREMIUM','ELITE','SUPER_PREMIUM'];
const NETWORKS = ['VISA','MASTERCARD','AMEX','RUPAY','DINERS'];
const REWARDS  = ['POINTS','CASHBACK','MILES','HYBRID'];

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
}

export default function AdminNewCardPage() {
  const router = useRouter();

  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [issuersLoading, setIssuersLoading] = useState(true);
  const [issuersError, setIssuersError] = useState(false);

  const [form, setForm] = useState<Partial<CreateCardRequest>>({
    issuerId: '', name: '', slug: '', tier: 'STANDARD', network: 'VISA',
    rewardType: 'POINTS', annualFee: 0,
  });
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function loadIssuers() {
    setIssuersLoading(true);
    setIssuersError(false);
    cardsApi.getIssuers()
      .then(setIssuers)
      .catch(() => setIssuersError(true))
      .finally(() => setIssuersLoading(false));
  }

  useEffect(() => { loadIssuers(); }, []);

  function set<K extends keyof CreateCardRequest>(key: K, val: CreateCardRequest[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function handleName(v: string) {
    set('name', v);
    if (!slugManual) set('slug', toSlug(v));
  }

  async function handleCreate() {
    if (!form.issuerId) { setError('Please select an issuer'); return; }
    if (!form.name?.trim() || !form.slug?.trim()) { setError('Card name and slug are required'); return; }
    setSaving(true); setError('');
    try {
      const card = await adminCardsApi.createCard(form as CreateCardRequest);
      router.push(`/admin/cards/${card.id}/edit`);
    } catch {
      setError('Failed to create card — check all required fields');
      setSaving(false);
    }
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
  const lbl = 'block text-sm font-medium text-gray-700 mb-1';
  const req = <span className="text-red-500 ml-0.5">*</span>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/admin/cards')} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800">New Card</h1>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

      <div className="space-y-4">

        {/* Identity */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identity</h2>

          <div>
            <label className={lbl}>Issuer {req}</label>
            {issuersError ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600">Failed to load issuers</span>
                <button onClick={loadIssuers} className="text-sm text-blue-600 hover:underline">Retry</button>
              </div>
            ) : (
              <select
                value={form.issuerId ?? ''}
                onChange={(e) => set('issuerId', e.target.value)}
                disabled={issuersLoading}
                className={inp}
              >
                <option value="">{issuersLoading ? 'Loading issuers…' : '— Select issuer —'}</option>
                {issuers.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className={lbl}>Card Name {req}</label>
            <input value={form.name ?? ''} onChange={(e) => handleName(e.target.value)}
              placeholder="HDFC Regalia Gold" className={inp} />
          </div>

          <div>
            <label className={lbl}>Slug {req}</label>
            <div className="flex gap-2 items-center">
              <input value={form.slug ?? ''} onChange={(e) => { setSlugManual(true); set('slug', e.target.value); }}
                className={`${inp} font-mono flex-1`} placeholder="hdfc-regalia-gold" />
              {slugManual && (
                <button type="button"
                  onClick={() => { setSlugManual(false); set('slug', toSlug(form.name ?? '')); }}
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap">Auto</button>
              )}
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Classification</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Tier {req}</label>
              <select value={form.tier ?? ''} onChange={(e) => set('tier', e.target.value)} className={inp}>
                {TIERS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Network {req}</label>
              <select value={form.network ?? ''} onChange={(e) => set('network', e.target.value)} className={inp}>
                {NETWORKS.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Reward Type {req}</label>
              <select value={form.rewardType ?? ''} onChange={(e) => set('rewardType', e.target.value)} className={inp}>
                {REWARDS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fees</h2>
          <div className="max-w-xs">
            <label className={lbl}>Annual Fee (₹) {req}</label>
            <input type="number" value={form.annualFee ?? 0}
              onChange={(e) => set('annualFee', Number(e.target.value))} className={inp} />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-right">
        You can add images, reward rules, benefits and milestones after creation.
      </p>

      <div className="mt-4 flex justify-end">
        <button onClick={handleCreate} disabled={saving || issuersLoading}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Creating…' : 'Create Card →'}
        </button>
      </div>
    </div>
  );
}
