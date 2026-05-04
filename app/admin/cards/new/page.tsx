'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCardsApi, type CreateCardRequest } from '../../../../src/api/adminCards';
import { CardImageUpload } from '../../../../src/components/admin/CardImageUpload';

const TIERS    = ['ENTRY','STANDARD','PREMIUM','ELITE','SUPER_PREMIUM'];
const NETWORKS = ['VISA','MASTERCARD','AMEX','RUPAY','DINERS'];
const REWARDS  = ['POINTS','CASHBACK','MILES'];

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
}

export default function AdminNewCardPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<CreateCardRequest>>({
    annualFee: 0, tier: 'STANDARD', network: 'VISA', rewardType: 'POINTS',
  });
  const [slugManual, setSlugManual] = useState(false);
  const [issuerId, setIssuerId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key: keyof CreateCardRequest, val: string | number) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function handleName(v: string) {
    set('name', v);
    if (!slugManual) set('slug', toSlug(v));
  }

  async function handleSave() {
    if (!issuerId.trim()) { setError('Issuer ID is required'); return; }
    if (!form.name || !form.slug || !form.tier || !form.network || !form.rewardType) {
      setError('Fill in all required fields'); return;
    }
    setSaving(true); setError('');
    try {
      const card = await adminCardsApi.createCard({ ...(form as CreateCardRequest), issuerId });
      // Upload image if one was selected (card must exist first)
      if (imageFile) {
        try {
          await adminCardsApi.uploadImage(card.id, imageFile);
        } catch {
          // Image upload failed — card was still created, user can retry upload in edit page
        }
      }
      router.push(`/admin/cards/${card.id}/edit`);
    } catch { setError('Failed to create card — check all required fields'); }
    finally { setSaving(false); }
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const lbl = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/admin/cards')} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800">New Card</h1>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identity</h2>

          <div>
            <label className={lbl}>Issuer ID <span className="text-red-500">*</span></label>
            <input value={issuerId} onChange={(e) => setIssuerId(e.target.value)}
              placeholder="UUID of the issuer" className={`${inp} font-mono`} />
          </div>

          <div>
            <label className={lbl}>Card Name <span className="text-red-500">*</span></label>
            <input value={form.name ?? ''} onChange={(e) => handleName(e.target.value)} className={inp} placeholder="HDFC Regalia Gold" />
          </div>

          <div>
            <label className={lbl}>Slug <span className="text-red-500">*</span></label>
            <div className="flex gap-2 items-center">
              <input value={form.slug ?? ''} onChange={(e) => { setSlugManual(true); set('slug', e.target.value); }}
                className={`${inp} font-mono flex-1`} />
              {slugManual && (
                <button type="button" onClick={() => { setSlugManual(false); set('slug', toSlug(form.name ?? '')); }}
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap">Auto</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Tier <span className="text-red-500">*</span></label>
              <select value={form.tier ?? ''} onChange={(e) => set('tier', e.target.value)} className={`${inp} bg-white`}>
                {TIERS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Network <span className="text-red-500">*</span></label>
              <select value={form.network ?? ''} onChange={(e) => set('network', e.target.value)} className={`${inp} bg-white`}>
                {NETWORKS.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Reward Type <span className="text-red-500">*</span></label>
              <select value={form.rewardType ?? ''} onChange={(e) => set('rewardType', e.target.value)} className={`${inp} bg-white`}>
                {REWARDS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Annual Fee (₹) <span className="text-red-500">*</span></label>
              <input type="number" value={form.annualFee ?? 0} onChange={(e) => set('annualFee', Number(e.target.value))} className={inp} />
            </div>
            <div>
              <label className={lbl}>Joining Fee (₹)</label>
              <input type="number" value={form.joiningFee ?? ''} onChange={(e) => set('joiningFee', Number(e.target.value))} className={inp} />
            </div>
          </div>

          <div>
            <label className={lbl}>Tagline</label>
            <input value={form.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} className={inp} placeholder="India's most rewarding travel card" />
          </div>

          <CardImageUpload
            value={form.cardImageUrl ?? ''}
            onChange={(url) => set('cardImageUrl', url)}
            onFileSelected={(file) => setImageFile(file)}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Creating…' : 'Create Card'}
        </button>
      </div>
    </div>
  );
}
