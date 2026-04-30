'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  adminCardsApi,
  type AdminCardDetail,
  type AdminRewardRule,
  type AdminCardBenefit,
  type AdminCardMilestone,
  type UpdateCardRequest,
  type CreateRewardRuleRequest,
  type CreateBenefitRequest,
  type CreateMilestoneRequest,
} from '../../../../../src/api/adminCards';

// ─── Shared helpers ─────────────────────────────────────────────────────────

type Tab = 'basic' | 'rules' | 'benefits' | 'milestones';

function Field({
  label, value, onChange, type = 'text', required, mono, placeholder, as
}: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; required?: boolean; mono?: boolean; placeholder?: string;
  as?: 'textarea';
}) {
  const cls = `w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${mono ? 'font-mono' : ''}`;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          rows={3} placeholder={placeholder} className={cls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          required={required} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function Select({
  label, value, onChange, options, required
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
        <option value="">— Select —</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
      <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

// ─── Basic Info Tab ───────────────────────────────────────────────────────────

function BasicInfoTab({ card, onSaved }: { card: AdminCardDetail; onSaved: (c: AdminCardDetail) => void }) {
  const [form, setForm] = useState<UpdateCardRequest>({
    name: card.name, slug: card.slug, tier: card.tier, network: card.network,
    variant: card.variant ?? '', annualFee: card.annualFee, joiningFee: card.joiningFee,
    renewalFee: card.renewalFee, rewardType: card.rewardType, pointValueInr: card.pointValueInr,
    purchaseAprMin: card.purchaseAprMin, purchaseAprMax: card.purchaseAprMax,
    foreignTransactionFeePct: card.foreignTransactionFeePct,
    minIncomeAnnualInr: card.minIncomeAnnualInr, minCreditScore: card.minCreditScore,
    tagline: card.tagline ?? '', description: card.description ?? '',
    cardImageUrl: card.cardImageUrl ?? '', applyUrl: card.applyUrl ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  function set(key: keyof UpdateCardRequest, val: string) {
    const num = ['annualFee','joiningFee','renewalFee','pointValueInr','purchaseAprMin',
      'purchaseAprMax','foreignTransactionFeePct','minIncomeAnnualInr','minCreditScore'];
    setForm((prev) => ({ ...prev, [key]: num.includes(key) ? (val === '' ? undefined : Number(val)) : val }));
  }

  async function handleSave() {
    setSaving(true); setMsg(null);
    try {
      const updated = await adminCardsApi.updateCard(card.id, form);
      onSaved(updated);
      setMsg({ type: 'ok', text: 'Saved successfully' });
    } catch {
      setMsg({ type: 'err', text: 'Save failed — check required fields' });
    } finally { setSaving(false); }
  }

  const n = (v?: number) => v !== undefined ? String(v) : '';

  return (
    <div className="space-y-6">
      <SectionCard title="Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Card Name" value={form.name ?? ''} onChange={(v) => set('name', v)} required />
          <Field label="Slug" value={form.slug ?? ''} onChange={(v) => set('slug', v)} required mono placeholder="hdfc-regalia-gold" />
        </div>
        <Field label="Tagline" value={form.tagline ?? ''} onChange={(v) => set('tagline', v)} placeholder="India's most rewarding travel card" />
        <Field label="Description" value={form.description ?? ''} onChange={(v) => set('description', v)} as="textarea" />
      </SectionCard>

      <SectionCard title="Card Classification">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Tier" value={form.tier ?? ''} onChange={(v) => set('tier', v)} required
            options={['ENTRY','STANDARD','PREMIUM','ELITE','SUPER_PREMIUM'].map((t) => ({ value: t, label: t }))} />
          <Select label="Network" value={form.network ?? ''} onChange={(v) => set('network', v)} required
            options={['VISA','MASTERCARD','AMEX','RUPAY','DINERS'].map((n) => ({ value: n, label: n }))} />
          <Select label="Reward Type" value={form.rewardType ?? ''} onChange={(v) => set('rewardType', v)} required
            options={['POINTS','CASHBACK','MILES'].map((r) => ({ value: r, label: r }))} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Variant" value={form.variant ?? ''} onChange={(v) => set('variant', v)} placeholder="e.g. Gold, Platinum" />
          <Field label="Point Value (₹)" value={n(form.pointValueInr)} onChange={(v) => set('pointValueInr', v)} type="number" placeholder="0.25" />
        </div>
      </SectionCard>

      <SectionCard title="Fees">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Annual Fee (₹)" value={n(form.annualFee)} onChange={(v) => set('annualFee', v)} type="number" required placeholder="0" />
          <Field label="Joining Fee (₹)" value={n(form.joiningFee)} onChange={(v) => set('joiningFee', v)} type="number" placeholder="0" />
          <Field label="Renewal Fee (₹)" value={n(form.renewalFee)} onChange={(v) => set('renewalFee', v)} type="number" placeholder="0" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Foreign Txn Fee (%)" value={n(form.foreignTransactionFeePct)} onChange={(v) => set('foreignTransactionFeePct', v)} type="number" placeholder="3.5" />
        </div>
      </SectionCard>

      <SectionCard title="APR & Eligibility">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Purchase APR Min (%)" value={n(form.purchaseAprMin)} onChange={(v) => set('purchaseAprMin', v)} type="number" />
          <Field label="Purchase APR Max (%)" value={n(form.purchaseAprMax)} onChange={(v) => set('purchaseAprMax', v)} type="number" />
          <Field label="Min Annual Income (₹)" value={n(form.minIncomeAnnualInr)} onChange={(v) => set('minIncomeAnnualInr', v)} type="number" placeholder="600000" />
          <Field label="Min Credit Score" value={n(form.minCreditScore)} onChange={(v) => set('minCreditScore', v)} type="number" placeholder="750" />
        </div>
      </SectionCard>

      <SectionCard title="Media & Links">
        <Field label="Card Image URL" value={form.cardImageUrl ?? ''} onChange={(v) => set('cardImageUrl', v)} placeholder="https://…" />
        <Field label="Apply URL" value={form.applyUrl ?? ''} onChange={(v) => set('applyUrl', v)} placeholder="https://…" />
      </SectionCard>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ─── Reward Rules Tab ─────────────────────────────────────────────────────────

const RULE_TYPE_OPTIONS = ['GENERAL','CATEGORY','MERCHANT','ACCELERATED','CAPPED'].map((v) => ({ value: v, label: v }));
const RATE_TYPE_OPTIONS = ['POINTS_PER_INR','CASHBACK_PCT','MILES_PER_INR'].map((v) => ({ value: v, label: v }));

const emptyRule = (): CreateRewardRuleRequest => ({
  name: '', ruleType: 'GENERAL', rate: 0, rateType: 'POINTS_PER_INR', priority: 10,
  isBaseRate: false,
});

function RewardRulesTab({ cardId }: { cardId: string }) {
  const [rules, setRules] = useState<AdminRewardRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateRewardRuleRequest>(emptyRule());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminCardsApi.getRewardRules(cardId).then(setRules).catch(() => setError('Failed to load')).finally(() => setLoading(false));
  }, [cardId]);

  function setF(key: keyof CreateRewardRuleRequest, val: string | number | boolean) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleAdd() {
    setSaving(true); setError('');
    try {
      const created = await adminCardsApi.createRewardRule(cardId, form);
      setRules((prev) => [...prev, created]);
      setForm(emptyRule()); setShowForm(false);
    } catch { setError('Failed to add rule'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Reward Rules ({rules.length})</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {showForm ? 'Cancel' : '+ Add Rule'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-blue-100">
          <h4 className="font-semibold text-gray-700 text-sm">New Reward Rule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" value={form.name} onChange={(v) => setF('name', v)} required />
            <Select label="Rule Type" value={form.ruleType} onChange={(v) => setF('ruleType', v)} options={RULE_TYPE_OPTIONS} required />
            <Field label="Rate" value={String(form.rate)} onChange={(v) => setF('rate', Number(v))} type="number" required placeholder="1" />
            <Select label="Rate Type" value={form.rateType} onChange={(v) => setF('rateType', v)} options={RATE_TYPE_OPTIONS} required />
            <Field label="Priority" value={String(form.priority ?? 10)} onChange={(v) => setF('priority', Number(v))} type="number" />
            <Field label="Cap / Month (pts)" value={String(form.capPerMonthPoints ?? '')} onChange={(v) => setF('capPerMonthPoints', Number(v))} type="number" />
            <Field label="Cap / Year (pts)" value={String(form.capPerYearPoints ?? '')} onChange={(v) => setF('capPerYearPoints', Number(v))} type="number" />
            <Field label="Valid From" value={form.validFrom ?? ''} onChange={(v) => setF('validFrom', v)} type="date" />
            <Field label="Valid Until" value={form.validUntil ?? ''} onChange={(v) => setF('validUntil', v)} type="date" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="baseRate" checked={!!form.isBaseRate}
              onChange={(e) => setF('isBaseRate', e.target.checked)} className="rounded border-gray-300" />
            <label htmlFor="baseRate" className="text-sm text-gray-700">Base rate rule</label>
          </div>
          <Field label="Description" value={form.description ?? ''} onChange={(v) => setF('description', v)} as="textarea" />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            <button onClick={handleAdd} disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? 'Adding…' : 'Add Rule'}
            </button>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-gray-400">Loading…</p> : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {rules.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">No reward rules yet. Add the first one.</p>
          ) : (
            <table className="w-full min-w-[540px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Type', 'Rate', 'Rate Type', 'Priority', 'Base', 'Active'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.ruleType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.rate}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.rateType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.priority}</td>
                    <td className="px-4 py-3 text-sm">{r.isBaseRate ? '✓' : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {r.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Benefits Tab ─────────────────────────────────────────────────────────────

const emptyBenefit = (): CreateBenefitRequest => ({
  category: '', name: '', description: '', isPrimaryHighlight: false,
});

function BenefitsTab({ cardId }: { cardId: string }) {
  const [benefits, setBenefits] = useState<AdminCardBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateBenefitRequest>(emptyBenefit());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminCardsApi.getBenefits(cardId).then(setBenefits).catch(() => setError('Failed to load')).finally(() => setLoading(false));
  }, [cardId]);

  function setF(key: keyof CreateBenefitRequest, val: string | number | boolean) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleAdd() {
    setSaving(true); setError('');
    try {
      const created = await adminCardsApi.createBenefit(cardId, form);
      setBenefits((prev) => [...prev, created]);
      setForm(emptyBenefit()); setShowForm(false);
    } catch { setError('Failed to add benefit'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete benefit "${name}"?`)) return;
    try {
      await adminCardsApi.deleteBenefit(id);
      setBenefits((prev) => prev.filter((b) => b.id !== id));
    } catch { alert('Failed to delete benefit'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Benefits ({benefits.length})</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {showForm ? 'Cancel' : '+ Add Benefit'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-blue-100">
          <h4 className="font-semibold text-gray-700 text-sm">New Benefit</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category" value={form.category} onChange={(v) => setF('category', v)} required placeholder="LOUNGE_ACCESS, INSURANCE, DINING…" />
            <Field label="Name" value={form.name} onChange={(v) => setF('name', v)} required placeholder="Airport Lounge Access" />
            <Field label="Est. Annual Value (₹)" value={String(form.estimatedAnnualValueInr ?? '')} onChange={(v) => setF('estimatedAnnualValueInr', Number(v))} type="number" />
            <Field label="Quantity" value={String(form.quantity ?? '')} onChange={(v) => setF('quantity', Number(v))} type="number" />
            <Field label="Quantity Unit" value={form.quantityUnit ?? ''} onChange={(v) => setF('quantityUnit', v)} placeholder="visits/year" />
            <Field label="Sort Order" value={String(form.sortOrder ?? '')} onChange={(v) => setF('sortOrder', Number(v))} type="number" />
          </div>
          <Field label="Description" value={form.description ?? ''} onChange={(v) => setF('description', v)} as="textarea" />
          <Field label="Conditions" value={form.conditions ?? ''} onChange={(v) => setF('conditions', v)} as="textarea" placeholder="Valid on domestic flights only…" />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="highlight" checked={!!form.isPrimaryHighlight}
              onChange={(e) => setF('isPrimaryHighlight', e.target.checked)} className="rounded border-gray-300" />
            <label htmlFor="highlight" className="text-sm text-gray-700">Show as primary highlight</label>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            <button onClick={handleAdd} disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? 'Adding…' : 'Add Benefit'}
            </button>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-gray-400">Loading…</p> : (
        <div className="space-y-3">
          {benefits.length === 0 ? (
            <div className="bg-white rounded-2xl shadow px-6 py-8 text-center text-sm text-gray-400">
              No benefits yet. Add the first one.
            </div>
          ) : benefits.map((b) => (
            <div key={b.id} className="bg-white rounded-xl shadow px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">{b.name}</span>
                  {b.isPrimaryHighlight && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Highlight</span>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{b.category}</span>
                </div>
                {b.description && <p className="text-sm text-gray-500">{b.description}</p>}
                {b.estimatedAnnualValueInr && (
                  <p className="text-xs text-gray-400 mt-1">Est. value: ₹{b.estimatedAnnualValueInr.toLocaleString('en-IN')}/yr</p>
                )}
              </div>
              <button onClick={() => handleDelete(b.id, b.name)}
                className="text-red-400 hover:text-red-600 text-sm shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Milestones Tab ───────────────────────────────────────────────────────────

const PERIOD_OPTIONS = ['MONTHLY','QUARTERLY','HALF_YEARLY','ANNUAL','ONE_TIME'].map((v) => ({ value: v, label: v }));
const MILESTONE_REWARD_TYPES = ['POINTS','VOUCHER','WAIVER','CASHBACK'].map((v) => ({ value: v, label: v }));

const emptyMilestone = (): CreateMilestoneRequest => ({
  spendThresholdInr: 0, period: 'ANNUAL', rewardType: 'POINTS', rewardDescription: '',
});

function MilestonesTab({ cardId }: { cardId: string }) {
  const [milestones, setMilestones] = useState<AdminCardMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateMilestoneRequest>(emptyMilestone());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminCardsApi.getMilestones(cardId).then(setMilestones).catch(() => setError('Failed to load')).finally(() => setLoading(false));
  }, [cardId]);

  function setF(key: keyof CreateMilestoneRequest, val: string | number) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleAdd() {
    setSaving(true); setError('');
    try {
      const created = await adminCardsApi.createMilestone(cardId, form);
      setMilestones((prev) => [...prev, created]);
      setForm(emptyMilestone()); setShowForm(false);
    } catch { setError('Failed to add milestone'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this milestone?')) return;
    try {
      await adminCardsApi.deleteMilestone(id);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch { alert('Failed to delete milestone'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Milestones ({milestones.length})</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {showForm ? 'Cancel' : '+ Add Milestone'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-blue-100">
          <h4 className="font-semibold text-gray-700 text-sm">New Milestone</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Spend Threshold (₹)" value={String(form.spendThresholdInr)} onChange={(v) => setF('spendThresholdInr', Number(v))} type="number" required />
            <Select label="Period" value={form.period} onChange={(v) => setF('period', v)} options={PERIOD_OPTIONS} required />
            <Select label="Reward Type" value={form.rewardType} onChange={(v) => setF('rewardType', v)} options={MILESTONE_REWARD_TYPES} required />
            <Field label="Reward Points" value={String(form.rewardPoints ?? '')} onChange={(v) => setF('rewardPoints', Number(v))} type="number" />
            <Field label="Voucher Value (₹)" value={String(form.rewardVoucherValueInr ?? '')} onChange={(v) => setF('rewardVoucherValueInr', Number(v))} type="number" />
            <Field label="Sort Order" value={String(form.sortOrder ?? '')} onChange={(v) => setF('sortOrder', Number(v))} type="number" />
          </div>
          <Field label="Reward Description" value={form.rewardDescription} onChange={(v) => setF('rewardDescription', v)} required placeholder="Earn 5000 bonus points on ₹5L annual spend" />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            <button onClick={handleAdd} disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? 'Adding…' : 'Add Milestone'}
            </button>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-gray-400">Loading…</p> : (
        <div className="space-y-3">
          {milestones.length === 0 ? (
            <div className="bg-white rounded-2xl shadow px-6 py-8 text-center text-sm text-gray-400">
              No milestones yet. Add the first one.
            </div>
          ) : milestones.map((m) => (
            <div key={m.id} className="bg-white rounded-xl shadow px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">
                    ₹{m.spendThresholdInr.toLocaleString('en-IN')} / {m.period}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{m.rewardType}</span>
                </div>
                <p className="text-sm text-gray-500">{m.rewardDescription}</p>
                {m.rewardPoints && <p className="text-xs text-gray-400 mt-0.5">{m.rewardPoints.toLocaleString()} pts</p>}
              </div>
              <button onClick={() => handleDelete(m.id)}
                className="text-red-400 hover:text-red-600 text-sm shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCardEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [card, setCard] = useState<AdminCardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('basic');

  useEffect(() => {
    if (!id) return;
    adminCardsApi.getCard(id)
      .then(setCard)
      .catch(() => router.push('/admin/cards'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) return null;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'rules', label: 'Reward Rules' },
    { key: 'benefits', label: 'Benefits' },
    { key: 'milestones', label: 'Milestones' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/cards')}
          className="text-gray-400 hover:text-gray-600 text-sm">
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{card.name}</h1>
          <p className="text-sm text-gray-400 font-mono">{card.issuer.name} · {card.tier} · {card.network}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'basic'      && <BasicInfoTab card={card} onSaved={setCard} />}
      {tab === 'rules'      && <RewardRulesTab cardId={card.id} />}
      {tab === 'benefits'   && <BenefitsTab cardId={card.id} />}
      {tab === 'milestones' && <MilestonesTab cardId={card.id} />}
    </div>
  );
}
