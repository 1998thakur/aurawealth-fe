'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import PublicLayout from '../../components/Layout/PublicLayout';
import CardGradient from '../../components/CardGradient';
import SpendInput from '../../components/SpendInput';
import { cardsApi } from '../../api/cards';
import { expenseApi } from '../../api/expense';
import { formatInr, formatNumber } from '../../utils/format';
import type { CardDetail, CardTier, Category, RewardRule } from '../../types/cards';
import { injectJsonLd, removeJsonLd } from '../../hooks/useSeoMeta';
import { SITE_URL } from '../../config';

type Tab = 'overview' | 'calculator' | 'profit';

const TIER_BADGES: Record<CardTier, string> = {
  ENTRY: 'tier-badge-entry',
  STANDARD: 'tier-badge-standard',
  PREMIUM: 'tier-badge-premium',
  ELITE: 'tier-badge-elite',
  SUPER_PREMIUM: 'tier-badge-super_premium',
};

const BENEFIT_ICONS: Record<string, string> = {
  LOUNGE: 'airline_seat_recline_extra',
  DINING: 'restaurant',
  INSURANCE: 'shield',
  FUEL: 'local_gas_station',
  TRAVEL: 'flight',
  SHOPPING: 'shopping_bag',
  ENTERTAINMENT: 'movie',
  GOLF: 'sports_golf',
  WELLNESS: 'spa',
  CONCIERGE: 'support_agent',
  CASHBACK: 'currency_rupee',
  REWARDS: 'stars',
  HOTEL: 'hotel',
  FOREX: 'currency_exchange',
};

function getBenefitIcon(category: string): string {
  return BENEFIT_ICONS[category] ?? 'star';
}

function deriveProsAndCons(card: CardDetail) {
  const pros: string[] = [];
  const cons: string[] = [];

  if (card.hasLoungeAccess) {
    const loungeBenefit = card.benefits.find((b) => b.category === 'LOUNGE');
    pros.push(loungeBenefit?.name ?? 'Complimentary airport lounge access');
  }
  if (card.hasZeroForex) pros.push('Zero forex markup on international transactions');
  if (card.annualFee === 0) pros.push('Lifetime free — no annual fee ever');
  if (card.feeWaiverThresholdInr && card.annualFee > 0) {
    pros.push(`Annual fee waived on ${formatInr(card.feeWaiverThresholdInr)}+ annual spend`);
  }
  card.benefits
    .filter((b) => b.isPrimaryHighlight)
    .slice(0, 3)
    .forEach((b) => {
      if (!pros.includes(b.name)) pros.push(b.name);
    });
  if (card.milestones && card.milestones.length > 0) {
    pros.push('Spending milestone bonuses for high spenders');
  }

  if (card.annualFee > 10000) {
    cons.push(`High annual fee of ${formatInr(card.annualFee)}`);
  } else if (card.annualFee > 0 && !card.feeWaiverThresholdInr) {
    cons.push(`Annual fee of ${formatInr(card.annualFee)} with no waiver option`);
  }
  if (card.minIncomeAnnualInr && card.minIncomeAnnualInr >= 1500000) {
    cons.push('High annual income requirement (₹15 lakh+)');
  } else if (card.minIncomeAnnualInr && card.minIncomeAnnualInr >= 600000) {
    cons.push('Minimum income requirement applies');
  }
  if (card.tier === 'SUPER_PREMIUM') {
    cons.push('May require existing banking relationship or invitation');
  }
  if (!card.hasZeroForex) {
    cons.push('Foreign transaction fee applies on overseas spends');
  }
  if (card.rewardType === 'POINTS') {
    cons.push('Points redemption catalog may limit flexibility');
  }
  if (cons.length === 0) {
    cons.push('Reward rates may vary by spend category');
  }

  return { pros: pros.slice(0, 6), cons: cons.slice(0, 4) };
}

function getIdealFor(card: CardDetail): { icon: string; label: string }[] {
  const segments: { icon: string; label: string }[] = [];
  if (card.hasLoungeAccess) segments.push({ icon: 'flight_takeoff', label: 'Frequent flyers' });
  if (card.hasZeroForex) segments.push({ icon: 'public', label: 'International travelers' });
  if (card.rewardType === 'CASHBACK') segments.push({ icon: 'savings', label: 'Cashback seekers' });
  if (card.rewardType === 'MILES') segments.push({ icon: 'airlines', label: 'Miles collectors' });
  if (card.tier === 'ENTRY' || card.tier === 'STANDARD') {
    segments.push({ icon: 'person_add', label: 'First-time cardholders' });
  }
  if (card.tier === 'PREMIUM' || card.tier === 'ELITE' || card.tier === 'SUPER_PREMIUM') {
    segments.push({ icon: 'diamond', label: 'Premium cardholders' });
  }
  if (card.benefits.some((b) => b.category === 'DINING')) {
    segments.push({ icon: 'restaurant', label: 'Dining enthusiasts' });
  }
  if (card.milestones && card.milestones.length > 0) {
    segments.push({ icon: 'trending_up', label: 'High spenders' });
  }
  return segments.slice(0, 4);
}

function generateFAQs(card: CardDetail): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];

  faqs.push({
    q: `What is the annual fee for ${card.name}?`,
    a:
      card.annualFee === 0
        ? `The ${card.name} is a lifetime free credit card — there is no annual or joining fee.`
        : `The ${card.name} has an annual fee of ${formatInr(card.annualFee)}${
            card.feeWaiverThresholdInr
              ? `. The fee is waived if you spend ${formatInr(card.feeWaiverThresholdInr)} or more in the card anniversary year.`
              : '.'
          }`,
  });

  if (card.rewardRules && card.rewardRules.length > 0) {
    const topRule = card.rewardRules.reduce(
      (max, r) => (r.rate > max.rate ? r : max),
      card.rewardRules[0]
    );
    faqs.push({
      q: `How are reward points earned on ${card.name}?`,
      a: `${card.name} offers up to ${topRule.rateType === 'MULTIPLIER' ? `${topRule.rate}x reward points` : `${topRule.rate}% ${card.rewardType === 'CASHBACK' ? 'cashback' : 'back'}`} on eligible spends. Each point is valued at ₹${card.pointValueInr.toFixed(2)}, giving an effective return rate of ${card.pointValueInr.toFixed(2)}%. Points are typically credited within 2–3 business days of the transaction.`,
    });
  }

  if (card.hasLoungeAccess) {
    const loungeBenefit = card.benefits.find((b) => b.category === 'LOUNGE');
    faqs.push({
      q: `Does ${card.name} provide airport lounge access?`,
      a: loungeBenefit?.description
        ? `Yes. ${loungeBenefit.description}`
        : `Yes, ${card.name} includes complimentary airport lounge access for the primary cardholder at domestic and select international airports. Check the ${card.issuer.name} app or welcome kit for participating lounges and visit limits.`,
    });
  }

  if (card.hasZeroForex) {
    faqs.push({
      q: `Is there a foreign transaction fee on ${card.name}?`,
      a: `No — ${card.name} charges zero forex markup, making it an excellent choice for international travel, overseas online shopping, and foreign currency transactions. You pay the standard Mastercard/Visa exchange rate with no extra surcharge.`,
    });
  } else {
    faqs.push({
      q: `What is the foreign transaction fee on ${card.name}?`,
      a: `${card.name} levies a foreign transaction fee on international purchases. Please refer to the official ${card.issuer.name} Key Fact Statement (KFS) or the cardholder agreement for the exact markup percentage.`,
    });
  }

  if (card.feeWaiverThresholdInr && card.annualFee > 0) {
    faqs.push({
      q: `How can I get the ${card.name} annual fee waived?`,
      a: `Spend ${formatInr(card.feeWaiverThresholdInr)} or more in your card anniversary year to receive an automatic fee reversal of ${formatInr(card.annualFee)}. The reversal is typically credited within 30–45 days of crossing the threshold.`,
    });
  }

  if (card.minIncomeAnnualInr) {
    faqs.push({
      q: `What is the income eligibility for ${card.name}?`,
      a: `${card.name} requires a minimum annual income of ${formatInr(card.minIncomeAnnualInr)} for salaried applicants. Self-employed individuals may need to demonstrate equivalent annual turnover via ITR.${card.minCreditScore ? ` A CIBIL score of ${card.minCreditScore}+ is also recommended.` : ''}`,
    });
  }

  faqs.push({
    q: `How do I apply for ${card.name}?`,
    a: `You can apply for ${card.name} online through the official ${card.issuer.name} website${card.applyUrl ? '' : ' or by visiting your nearest branch'}. Keep your PAN card, Aadhaar, recent salary slips (last 3 months) or latest ITR, and 3 months' bank statements ready. Most applications receive a decision within 7–10 working days.`,
  });

  return faqs;
}

function computeRewards(
  rules: RewardRule[],
  spends: Record<string, number>,
  pointValueInr: number,
  annualFee: number,
  categories: Category[]
) {
  let totalAnnualPoints = 0;
  const breakdown: {
    categoryId: string;
    categoryName: string;
    rateLabel: string;
    monthlySpend: number;
    annualPoints: number;
    valueInr: number;
  }[] = [];

  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

  for (const [categoryId, monthly] of Object.entries(spends)) {
    if (monthly <= 0) continue;
    const annualSpend = monthly * 12;
    let bestRule: RewardRule | null = null;

    for (const rule of sortedRules) {
      if (rule.categoryIds && rule.categoryIds.length > 0) {
        if (rule.categoryIds.includes(categoryId)) {
          bestRule = rule;
          break;
        }
      } else {
        if (!bestRule) bestRule = rule;
      }
    }

    if (!bestRule) continue;

    let points = 0;
    if (bestRule.rateType === 'MULTIPLIER') {
      points = (annualSpend / 100) * bestRule.rate;
    } else if (bestRule.rateType === 'FLAT_PCT') {
      points = annualSpend * (bestRule.rate / 100);
    } else {
      points = (annualSpend / 100) * bestRule.rate;
    }

    if (bestRule.capPerYearPoints) {
      points = Math.min(points, bestRule.capPerYearPoints);
    }

    const rateLabel =
      bestRule.rateType === 'MULTIPLIER' ? `${bestRule.rate}x` : `${bestRule.rate}%`;

    const backendCat = categories.find((c) => c.id === categoryId);
    totalAnnualPoints += points;
    breakdown.push({
      categoryId,
      categoryName: backendCat?.displayName ?? backendCat?.name ?? categoryId,
      rateLabel,
      monthlySpend: monthly,
      annualPoints: Math.round(points),
      valueInr: Math.round(points * pointValueInr),
    });
  }

  const cashValueInr = Math.round(totalAnnualPoints * pointValueInr);
  const netProfitInr = cashValueInr - annualFee;
  const totalAnnualSpend = Object.values(spends).reduce((a, b) => a + b * 12, 0);
  const effectiveRatePct = totalAnnualSpend > 0 ? (cashValueInr / totalAnnualSpend) * 100 : 0;

  return {
    totalAnnualPoints: Math.round(totalAnnualPoints),
    cashValueInr,
    netProfitInr,
    effectiveRatePct,
    breakdown,
  };
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} />;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant last:border-0">
      <button
        className="flex items-center justify-between w-full py-4 text-left gap-4"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="font-body font-semibold text-on-surface text-sm">{q}</span>
        <span
          className={clsx(
            'material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>
      {open && (
        <p className="font-body text-sm text-on-surface-variant pb-4 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function CardDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [spends, setSpends] = useState<Record<string, number>>({});

  const { data: card, isLoading } = useQuery({
    queryKey: ['cards', id],
    queryFn: () => cardsApi.getCard(id!),
    enabled: !!id,
  });

  const { data: activeProfile } = useQuery({
    queryKey: ['expense-profiles', 'active'],
    queryFn: expenseApi.getActiveProfile,
    retry: false,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: cardsApi.getCategories,
  });

  useEffect(() => {
    if (activeProfile) {
      const prefilled: Record<string, number> = {};
      activeProfile.lineItems.forEach((item) => {
        prefilled[item.categoryId] = item.monthlyAmountInr;
      });
      setSpends(prefilled);
    }
  }, [activeProfile]);

  // SEO meta is handled server-side via generateMetadata in app/cards/[id]/page.tsx
  // Do not inject duplicate meta tags from the client component.

  // Breadcrumb + Product JSON-LD are injected server-side (app/cards/[id]/page.tsx).
  // Only inject FAQ JSON-LD here as it depends on dynamic card data computed client-side.
  useEffect(() => {
    if (!card) return;
    const faqs = generateFAQs(card);
    injectJsonLd('card-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
    return () => {
      removeJsonLd('card-faq');
    };
  }, [card]);

  const rewards = card
    ? computeRewards(card.rewardRules ?? [], spends, card.pointValueInr, card.annualFee, categories ?? [])
    : null;

  const breakEvenMonthly =
    card && card.pointValueInr > 0 ? card.annualFee / card.pointValueInr / 12 : 0;

  const totalMonthlySpend = Object.values(spends).reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <SkeletonBlock className="h-48 rounded-2xl" />
          <SkeletonBlock className="h-8 w-1/2 rounded" />
          <SkeletonBlock className="h-64 rounded-2xl" />
        </div>
      </PublicLayout>
    );
  }

  if (!card) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
            credit_card_off
          </span>
          <p className="font-headline font-bold text-xl text-on-surface mb-2">Card not found</p>
          <Link href="/cards" className="btn-primary text-sm">
            Back to Catalog
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'info' },
    { id: 'calculator', label: 'Rewards Calculator', icon: 'calculate' },
    { id: 'profit', label: 'Profit Analysis', icon: 'trending_up' },
  ];

  const { pros, cons } = deriveProsAndCons(card);
  const idealFor = getIdealFor(card);
  const faqs = generateFAQs(card);

  // Build reward rules with category context
  const baseRules = (card.rewardRules ?? []).filter(
    (r) => !r.categoryIds || r.categoryIds.length === 0
  );
  const categoryRules = (card.rewardRules ?? []).filter(
    (r) => r.categoryIds && r.categoryIds.length > 0
  );

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-body text-sm text-on-surface-variant mb-6">
          <Link href="/cards" className="hover:text-primary transition-colors">
            Card Catalog
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-on-surface">{card.name}</span>
        </div>

        {/* Card Hero */}
        <div className="card-surface overflow-hidden mb-6">
          <div className="flex flex-col lg:flex-row gap-0">
            {/* Gradient panel */}
            <div className="lg:w-72 shrink-0 p-6">
              <CardGradient
                name={card.name}
                issuerName={card.issuer.name}
                network={card.network}
                tier={card.tier}
                imageUrl={card.cardImageUrl ?? card.cardImageThumbnailUrl}
                className="w-full h-44"
              />
            </div>

            {/* Info panel */}
            <div className="flex-1 p-6 lg:pl-2">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-headline font-bold text-2xl text-on-surface mb-1">
                    {card.name}
                  </h1>
                  <p className="font-body text-on-surface-variant">{card.issuer.name}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className={TIER_BADGES[card.tier]}>{card.tier.replace('_', ' ')}</span>
                  <span
                    className={clsx(
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      card.rewardType === 'CASHBACK'
                        ? 'bg-secondary-container text-secondary'
                        : card.rewardType === 'MILES'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-primary-fixed/60 text-primary'
                    )}
                  >
                    {card.rewardType}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                <div>
                  <p className="font-body text-xs text-on-surface-variant mb-0.5">Annual Fee</p>
                  <p className="font-headline font-bold text-on-surface">
                    {card.annualFee === 0 ? 'FREE' : formatInr(card.annualFee)}
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-on-surface-variant mb-0.5">Effective Rate</p>
                  <p className="font-headline font-bold text-on-surface">
                    {card.pointValueInr.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-on-surface-variant mb-0.5">Network</p>
                  <p className="font-headline font-bold text-on-surface">{card.network}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-on-surface-variant mb-0.5">Point Value</p>
                  <p className="font-headline font-bold text-on-surface">
                    ₹{card.pointValueInr.toFixed(2)}/pt
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {card.hasLoungeAccess && (
                  <span className="flex items-center gap-1 bg-primary-fixed/30 text-primary text-xs px-2.5 py-1 rounded-full font-semibold">
                    <span className="material-symbols-outlined text-sm">
                      airline_seat_recline_extra
                    </span>
                    Lounge Access
                  </span>
                )}
                {card.hasZeroForex && (
                  <span className="flex items-center gap-1 bg-secondary-container text-secondary text-xs px-2.5 py-1 rounded-full font-semibold">
                    <span className="material-symbols-outlined text-sm">currency_exchange</span>
                    0% Forex
                  </span>
                )}
                {card.primaryHighlights.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-surface-container text-on-surface-variant text-xs px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                {card.applyUrl ? (
                  <a
                    href={card.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    Apply Now
                  </a>
                ) : (
                  <button
                    disabled
                    className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 opacity-40 cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    Apply Now
                  </button>
                )}
                <Link
                  href={`/compare?cards=${card.id}`}
                  className="btn-outlined text-sm py-2.5 px-5 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">balance</span>
                  Compare
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant mb-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-5 py-3 font-body text-sm font-semibold whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              )}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* Tab: Overview                                  */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* About */}
            <div className="card-surface p-6">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-3">
                About {card.name}
              </h2>
              {card.description ? (
                <p className="font-body text-on-surface-variant leading-relaxed mb-4">
                  {card.description}
                </p>
              ) : (
                <p className="font-body text-on-surface-variant leading-relaxed mb-4">
                  The {card.name} is a {card.tier.replace('_', '-').toLowerCase()}-tier{' '}
                  {card.rewardType === 'CASHBACK'
                    ? 'cashback'
                    : card.rewardType === 'MILES'
                    ? 'travel miles'
                    : 'reward points'}{' '}
                  credit card issued by {card.issuer.name} on the {card.network} network.
                  {card.annualFee === 0
                    ? ' It is a lifetime free card with no annual or joining fee.'
                    : ` It carries an annual fee of ${formatInr(card.annualFee)}${
                        card.feeWaiverThresholdInr
                          ? `, waived on annual spending of ${formatInr(card.feeWaiverThresholdInr)} or more`
                          : ''
                      }.`}
                  {card.hasLoungeAccess
                    ? ' The card includes complimentary airport lounge access, making it well suited for frequent flyers.'
                    : ''}
                  {card.hasZeroForex
                    ? ' With zero foreign transaction charges, it is a strong companion for international travel.'
                    : ''}
                </p>
              )}

              {/* Best For chips */}
              {idealFor.length > 0 && (
                <div>
                  <p className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                    Best For
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {idealFor.map(({ icon, label }) => (
                      <span
                        key={label}
                        className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full"
                      >
                        <span className="material-symbols-outlined text-sm">{icon}</span>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pros & Cons */}
            {(pros.length > 0 || cons.length > 0) && (
              <div className="card-surface p-6">
                <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
                  Pros &amp; Cons
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {pros.length > 0 && (
                    <div>
                      <p className="font-body text-sm font-semibold text-secondary mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">thumb_up</span>
                        Pros
                      </p>
                      <ul className="space-y-2.5">
                        {pros.map((pro) => (
                          <li key={pro} className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">
                              check_circle
                            </span>
                            <span className="font-body text-sm text-on-surface">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cons.length > 0 && (
                    <div>
                      <p className="font-body text-sm font-semibold text-error mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">thumb_down</span>
                        Cons
                      </p>
                      <ul className="space-y-2.5">
                        {cons.map((con) => (
                          <li key={con} className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">
                              cancel
                            </span>
                            <span className="font-body text-sm text-on-surface">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reward Earning Structure */}
            {card.rewardRules && card.rewardRules.length > 0 && (
              <div className="card-surface p-6">
                <h2 className="font-headline font-bold text-lg text-on-surface mb-1">
                  Reward Earning Structure
                </h2>
                <p className="font-body text-sm text-on-surface-variant mb-4">
                  Each point is worth{' '}
                  <strong>₹{card.pointValueInr.toFixed(2)}</strong> — an effective return of{' '}
                  <strong>{card.pointValueInr.toFixed(2)}%</strong> on spend.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full font-body text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant text-xs text-on-surface-variant uppercase tracking-wide">
                        <th className="text-left py-2.5 pr-4">Category</th>
                        <th className="text-center py-2.5 pr-4">Earn Rate</th>
                        <th className="text-right py-2.5">Per ₹10,000 Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryRules.map((rule) => {
                        const catNames = (rule.categoryIds ?? [])
                          .map((cid) => {
                            const bc = (categories ?? []).find((c) => c.id === cid);
                            return bc?.displayName ?? bc?.name ?? cid;
                          })
                          .join(', ');
                        const perTenK =
                          rule.rateType === 'MULTIPLIER'
                            ? (10000 / 100) * rule.rate
                            : (10000 * rule.rate) / 100;
                        const valuePerTenK = Math.round(perTenK * card.pointValueInr);
                        return (
                          <tr
                            key={rule.id}
                            className="border-b border-outline-variant/50 hover:bg-surface-container-low/50"
                          >
                            <td className="py-3 pr-4 text-on-surface capitalize">{catNames || rule.name}</td>
                            <td className="py-3 pr-4 text-center">
                              <span className="font-headline font-bold text-primary">
                                {rule.rateType === 'MULTIPLIER'
                                  ? `${rule.rate}x`
                                  : `${rule.rate}%`}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <span className="text-on-surface-variant">
                                {Math.round(perTenK)} pts
                              </span>
                              <span className="text-secondary font-semibold ml-2">
                                ≈ {formatInr(valuePerTenK)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {baseRules.map((rule) => {
                        const perTenK =
                          rule.rateType === 'MULTIPLIER'
                            ? (10000 / 100) * rule.rate
                            : (10000 * rule.rate) / 100;
                        const valuePerTenK = Math.round(perTenK * card.pointValueInr);
                        return (
                          <tr
                            key={rule.id}
                            className="border-b border-outline-variant/50 last:border-0 bg-surface-container-low/30"
                          >
                            <td className="py-3 pr-4 text-on-surface-variant italic">
                              All other spends
                            </td>
                            <td className="py-3 pr-4 text-center">
                              <span className="font-headline font-bold text-on-surface">
                                {rule.rateType === 'MULTIPLIER'
                                  ? `${rule.rate}x`
                                  : `${rule.rate}%`}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <span className="text-on-surface-variant">
                                {Math.round(perTenK)} pts
                              </span>
                              <span className="text-secondary font-semibold ml-2">
                                ≈ {formatInr(valuePerTenK)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {card.rewardType === 'POINTS' && (
                  <p className="font-body text-xs text-on-surface-variant mt-3 border-t border-outline-variant pt-3">
                    Points can typically be redeemed for flight tickets, hotel bookings, cashback,
                    gift vouchers, or merchandise via the {card.issuer.name} rewards portal.
                    Redemption value may vary by option.
                  </p>
                )}
                {card.rewardType === 'CASHBACK' && (
                  <p className="font-body text-xs text-on-surface-variant mt-3 border-t border-outline-variant pt-3">
                    Cashback is credited directly to your statement, reducing your outstanding
                    balance. No redemption required.
                  </p>
                )}
                {card.rewardType === 'MILES' && (
                  <p className="font-body text-xs text-on-surface-variant mt-3 border-t border-outline-variant pt-3">
                    Miles can be transferred to partner airlines and hotel loyalty programs.
                    Transfer ratios vary by partner — check the {card.issuer.name} website for
                    current transfer partners and ratios.
                  </p>
                )}
              </div>
            )}

            {/* Card Benefits */}
            {card.benefits && card.benefits.length > 0 && (
              <div className="card-surface p-6">
                <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
                  Card Benefits
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {card.benefits.map((benefit) => (
                    <div
                      key={benefit.id}
                      className={clsx(
                        'flex gap-3 p-4 rounded-xl border',
                        benefit.isPrimaryHighlight
                          ? 'bg-primary-fixed/20 border-primary/20'
                          : 'bg-surface-container-low border-outline-variant'
                      )}
                    >
                      <div
                        className={clsx(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                          benefit.isPrimaryHighlight ? 'bg-primary' : 'bg-surface-container'
                        )}
                      >
                        <span
                          className={clsx(
                            'material-symbols-outlined text-base',
                            benefit.isPrimaryHighlight ? 'text-on-primary' : 'text-on-surface-variant'
                          )}
                        >
                          {getBenefitIcon(benefit.category)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-body font-semibold text-on-surface text-sm">
                          {benefit.name}
                        </p>
                        <p className="font-body text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                          {benefit.description}
                        </p>
                        {benefit.estimatedAnnualValueInr && (
                          <p className="font-body text-xs text-secondary font-semibold mt-1">
                            ~{formatInr(benefit.estimatedAnnualValueInr)}/yr value
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spending Milestones */}
            {card.milestones && card.milestones.length > 0 && (
              <div className="card-surface p-6">
                <h2 className="font-headline font-bold text-lg text-on-surface mb-1">
                  Spending Milestones
                </h2>
                <p className="font-body text-sm text-on-surface-variant mb-4">
                  Unlock bonus rewards when your annual spend crosses these thresholds.
                </p>
                <div className="space-y-3">
                  {card.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant"
                    >
                      <div className="w-10 h-10 bg-primary-fixed/40 rounded-xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-xl">
                          military_tech
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-body font-semibold text-on-surface text-sm">
                          Spend {formatInr(milestone.spendThresholdInr)}{' '}
                          <span className="text-on-surface-variant font-normal">
                            ({milestone.period})
                          </span>
                        </p>
                        <p className="font-body text-xs text-on-surface-variant mt-0.5">
                          {milestone.rewardDescription}
                        </p>
                      </div>
                      {milestone.rewardPoints && (
                        <span className="font-headline font-bold text-primary text-sm shrink-0">
                          +{formatNumber(milestone.rewardPoints)} pts
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fees & Charges */}
            <div className="card-surface p-6">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-1">
                Fees &amp; Charges
              </h2>
              <p className="font-body text-sm text-on-surface-variant mb-4">
                Key fees at a glance. For the complete schedule refer to the official Key Fact
                Statement (KFS) on the {card.issuer.name} website.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full font-body text-sm">
                  <tbody className="divide-y divide-outline-variant">
                    <tr>
                      <td className="py-3 pr-4 text-on-surface-variant w-1/2">Annual Fee</td>
                      <td className="py-3 font-semibold text-on-surface">
                        {card.annualFee === 0 ? (
                          <span className="text-secondary">Lifetime Free</span>
                        ) : (
                          formatInr(card.annualFee)
                        )}
                      </td>
                    </tr>
                    {card.feeWaiverThresholdInr && card.annualFee > 0 && (
                      <tr>
                        <td className="py-3 pr-4 text-on-surface-variant">Fee Waiver</td>
                        <td className="py-3 font-semibold text-secondary">
                          On {formatInr(card.feeWaiverThresholdInr)}+ annual spend
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-3 pr-4 text-on-surface-variant">Forex Markup</td>
                      <td className="py-3 font-semibold text-on-surface">
                        {card.hasZeroForex ? (
                          <span className="text-secondary">0% (Zero Markup)</span>
                        ) : (
                          'As per issuer schedule'
                        )}
                      </td>
                    </tr>
                    {card.minIncomeAnnualInr && (
                      <tr>
                        <td className="py-3 pr-4 text-on-surface-variant">Min. Income Required</td>
                        <td className="py-3 font-semibold text-on-surface">
                          {formatInr(card.minIncomeAnnualInr)} per year
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-3 pr-4 text-on-surface-variant">Interest Rate (APR)</td>
                      <td className="py-3 text-on-surface-variant">Refer to KFS</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-on-surface-variant">Late Payment Charges</td>
                      <td className="py-3 text-on-surface-variant">Refer to KFS</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-on-surface-variant">Cash Advance Fee</td>
                      <td className="py-3 text-on-surface-variant">Refer to KFS</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Eligibility & Documents */}
            <div className="card-surface p-6">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
                Eligibility &amp; Documents Required
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Eligibility */}
                <div>
                  <p className="font-body text-sm font-semibold text-on-surface mb-3">
                    Eligibility Criteria
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                        check
                      </span>
                      <span className="font-body text-sm text-on-surface-variant">
                        Age: 18–70 years (primary cardholder)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                        check
                      </span>
                      <span className="font-body text-sm text-on-surface-variant">
                        Minimum annual income:{' '}
                        {card.minIncomeAnnualInr
                          ? formatInr(card.minIncomeAnnualInr)
                          : 'As per bank norms'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                        check
                      </span>
                      <span className="font-body text-sm text-on-surface-variant">
                        CIBIL score:{' '}
                        {card.minCreditScore ? `${card.minCreditScore}+` : '750+ recommended'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                        check
                      </span>
                      <span className="font-body text-sm text-on-surface-variant">
                        Employment: Salaried or self-employed Indian resident
                      </span>
                    </li>
                  </ul>
                </div>
                {/* Documents */}
                <div>
                  <p className="font-body text-sm font-semibold text-on-surface mb-3">
                    Documents Required
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      'PAN Card (mandatory)',
                      'Aadhaar / Passport / Voter ID (address proof)',
                      'Salary slips — last 3 months (salaried)',
                      'Latest ITR or Form 16 (self-employed / salaried)',
                      'Bank statements — last 3 months',
                      'Passport-size photograph',
                    ].map((doc) => (
                      <li key={doc} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-on-surface-variant text-base shrink-0 mt-0.5">
                          description
                        </span>
                        <span className="font-body text-sm text-on-surface-variant">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ */}
            {faqs.length > 0 && (
              <div className="card-surface p-6">
                <h2 className="font-headline font-bold text-lg text-on-surface mb-2">
                  Frequently Asked Questions
                </h2>
                <p className="font-body text-sm text-on-surface-variant mb-4">
                  Common questions about {card.name}.
                </p>
                <div>
                  {faqs.map((faq) => (
                    <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            )}

            {/* Apply CTA */}
            <div className="card-surface p-6 bg-primary/5 border border-primary/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-headline font-bold text-on-surface mb-1">
                    Ready to apply for {card.name}?
                  </p>
                  <p className="font-body text-sm text-on-surface-variant">
                    Apply directly on the {card.issuer.name} website. Most decisions within
                    7–10 working days.
                  </p>
                  <p className="font-body text-xs text-on-surface-variant/60 mt-1">
                    Affiliate disclosure: CreditBrain may earn a referral fee if you apply via our
                    link. This does not affect our editorial independence.
                  </p>
                </div>
                {card.applyUrl ? (
                  <a
                    href={card.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="btn-primary text-sm py-3 px-6 flex items-center gap-2 shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    Apply Now
                  </a>
                ) : (
                  <Link
                    href={`/compare?cards=${card.id}`}
                    className="btn-outlined text-sm py-3 px-6 flex items-center gap-2 shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">balance</span>
                    Compare Similar Cards
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* Tab: Rewards Calculator                        */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="card-surface p-5">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-1">
                Your Monthly Spend
              </h2>
              <p className="font-body text-sm text-on-surface-variant mb-5">
                {activeProfile
                  ? 'Pre-filled from your expense profile.'
                  : 'Enter your monthly spending by category.'}
              </p>
              {categoriesLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton h-14 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(categories ?? []).map((cat) => (
                    <SpendInput
                      key={cat.id}
                      label={cat.displayName || cat.name}
                      icon={cat.icon ?? 'category'}
                      value={spends[cat.id] ?? 0}
                      onChange={(val) => setSpends((prev) => ({ ...prev, [cat.id]: val }))}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="card-surface p-5">
                <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
                  Your Estimated Rewards
                </h2>
                {rewards ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl">
                      <span className="font-body text-sm text-on-surface">Total Annual Points</span>
                      <span className="font-headline font-bold text-primary">
                        {formatNumber(rewards.totalAnnualPoints)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary-container/40 rounded-xl">
                      <span className="font-body text-sm text-on-surface">Cash Value</span>
                      <span className="font-headline font-bold text-secondary">
                        {formatInr(rewards.cashValueInr)}/yr
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl">
                      <span className="font-body text-sm text-on-surface">Annual Fee</span>
                      <span className="font-headline font-bold text-error">
                        -{formatInr(card.annualFee)}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        'flex items-center justify-between p-3 rounded-xl',
                        rewards.netProfitInr >= 0
                          ? 'bg-secondary-container text-secondary'
                          : 'bg-error-container text-error'
                      )}
                    >
                      <span className="font-body text-sm font-semibold">Net Annual Profit</span>
                      <span className="font-headline font-bold text-xl">
                        {rewards.netProfitInr >= 0 ? '+' : ''}
                        {formatInr(rewards.netProfitInr)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl">
                      <span className="font-body text-sm text-on-surface">Effective Rate</span>
                      <span className="font-headline font-bold text-on-surface">
                        {rewards.effectiveRatePct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-on-surface-variant font-body text-sm">
                    Enter your spend to see results.
                  </p>
                )}
              </div>

              {/* Breakdown table */}
              {rewards && rewards.breakdown.length > 0 && (
                <div className="card-surface p-5">
                  <h3 className="font-headline font-bold text-base text-on-surface mb-3">
                    Category Breakdown
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-body">
                      <thead>
                        <tr className="text-on-surface-variant text-xs border-b border-outline-variant">
                          <th className="text-left py-2 pr-3">Category</th>
                          <th className="text-right py-2 pr-3">Rate</th>
                          <th className="text-right py-2 pr-3">Points/yr</th>
                          <th className="text-right py-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rewards.breakdown.map((row) => (
                          <tr
                            key={row.categoryId}
                            className="border-b border-outline-variant/50 last:border-0"
                          >
                            <td className="py-2 pr-3 text-on-surface capitalize">
                              {row.categoryName}
                            </td>
                            <td className="py-2 pr-3 text-right text-primary font-semibold">
                              {row.rateLabel}
                            </td>
                            <td className="py-2 pr-3 text-right text-on-surface-variant">
                              {formatNumber(row.annualPoints)}
                            </td>
                            <td className="py-2 text-right text-secondary font-semibold">
                              {formatInr(row.valueInr)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Milestones in calculator */}
              {card.milestones && card.milestones.length > 0 && (
                <div className="card-surface p-5">
                  <h3 className="font-headline font-bold text-base text-on-surface mb-3">
                    Milestone Progress
                  </h3>
                  <div className="space-y-2">
                    {card.milestones.map((milestone) => {
                      const annualSpend = totalMonthlySpend * 12;
                      const willReach = annualSpend >= milestone.spendThresholdInr;
                      return (
                        <div
                          key={milestone.id}
                          className={clsx(
                            'flex items-center gap-3 p-3 rounded-xl',
                            willReach
                              ? 'bg-secondary-container/40 border border-secondary/20'
                              : 'bg-surface-container-low border border-outline-variant'
                          )}
                        >
                          <span
                            className={clsx(
                              'material-symbols-outlined text-xl',
                              willReach ? 'text-secondary' : 'text-on-surface-variant'
                            )}
                          >
                            {willReach ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-semibold text-on-surface">
                              {formatInr(milestone.spendThresholdInr)} ({milestone.period})
                            </p>
                            <p className="font-body text-xs text-on-surface-variant">
                              {milestone.rewardDescription}
                            </p>
                          </div>
                          {milestone.rewardPoints && (
                            <span
                              className={clsx(
                                'font-headline font-bold text-sm shrink-0',
                                willReach ? 'text-secondary' : 'text-on-surface-variant'
                              )}
                            >
                              +{formatNumber(milestone.rewardPoints)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* Tab: Profit Analysis                           */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'profit' && (
          <div className="space-y-6">
            {/* Fee + Break-even */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card-surface p-5 text-center">
                <span className="material-symbols-outlined text-3xl text-error mb-2 block">
                  receipt
                </span>
                <p className="font-body text-sm text-on-surface-variant mb-1">Annual Fee</p>
                <p className="font-headline font-bold text-2xl text-on-surface">
                  {card.annualFee === 0 ? 'FREE' : formatInr(card.annualFee)}
                </p>
              </div>
              <div className="card-surface p-5 text-center">
                <span className="material-symbols-outlined text-3xl text-primary mb-2 block">
                  swap_horiz
                </span>
                <p className="font-body text-sm text-on-surface-variant mb-1">Break-even Spend</p>
                <p className="font-headline font-bold text-2xl text-on-surface">
                  {card.annualFee === 0
                    ? 'Already free!'
                    : `${formatInr(Math.round(breakEvenMonthly * 100) / 100)}/mo`}
                </p>
              </div>
              <div className="card-surface p-5 text-center">
                <span
                  className={clsx(
                    'material-symbols-outlined text-3xl mb-2 block',
                    rewards && rewards.netProfitInr >= 0 ? 'text-secondary' : 'text-error'
                  )}
                >
                  {rewards && rewards.netProfitInr >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                <p className="font-body text-sm text-on-surface-variant mb-1">Net Annual Profit</p>
                <p
                  className={clsx(
                    'font-headline font-bold text-2xl',
                    rewards && rewards.netProfitInr >= 0 ? 'text-secondary' : 'text-error'
                  )}
                >
                  {rewards
                    ? `${rewards.netProfitInr >= 0 ? '+' : ''}${formatInr(rewards.netProfitInr)}`
                    : '—'}
                </p>
              </div>
            </div>

            {/* Progress gauge */}
            <div className="card-surface p-6">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-2">
                Break-even Progress
              </h2>
              <p className="font-body text-sm text-on-surface-variant mb-4">
                {totalMonthlySpend === 0
                  ? 'Enter your monthly spending in the Rewards Calculator tab to see your break-even status.'
                  : rewards && rewards.cashValueInr >= card.annualFee
                  ? `At ₹${totalMonthlySpend.toLocaleString('en-IN')}/month, you're above break-even. This card earns you money!`
                  : `At ₹${totalMonthlySpend.toLocaleString('en-IN')}/month, you haven't broken even yet.`}
              </p>

              {card.annualFee > 0 && rewards && (
                <div>
                  <div className="flex justify-between text-xs font-body text-on-surface-variant mb-1">
                    <span>₹0</span>
                    <span>Break-even: {formatInr(card.annualFee)}/yr</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-3 mb-2">
                    <div
                      className={clsx(
                        'h-3 rounded-full transition-all duration-500',
                        rewards.cashValueInr >= card.annualFee ? 'bg-secondary' : 'bg-primary'
                      )}
                      style={{
                        width: `${Math.min(100, (rewards.cashValueInr / card.annualFee) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="font-body text-xs text-on-surface-variant text-right">
                    {Math.round((rewards.cashValueInr / card.annualFee) * 100)}% of fee recovered
                  </p>
                </div>
              )}
            </div>

            {/* Value composition */}
            {rewards && rewards.breakdown.length > 0 && (
              <div className="card-surface p-6">
                <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
                  Value Composition
                </h2>
                <div className="space-y-3">
                  {rewards.breakdown.map((row) => {
                    const pct =
                      rewards.cashValueInr > 0
                        ? (row.valueInr / rewards.cashValueInr) * 100
                        : 0;
                    return (
                      <div key={row.categoryId}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-body text-sm text-on-surface capitalize">
                            {row.categoryName}
                          </span>
                          <span className="font-body text-sm font-semibold text-secondary">
                            {formatInr(row.valueInr)}
                          </span>
                        </div>
                        <div className="w-full bg-surface-container rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fee waiver */}
            {card.feeWaiverThresholdInr && (
              <div className="card-surface p-5 bg-secondary-container/20 border-secondary/20">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl shrink-0">
                    info
                  </span>
                  <div>
                    <p className="font-body font-semibold text-on-surface mb-1">
                      Fee Waiver Available
                    </p>
                    <p className="font-body text-sm text-on-surface-variant">
                      Spend {formatInr(card.feeWaiverThresholdInr)} annually and get the annual fee
                      of {formatInr(card.annualFee)} waived completely.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
