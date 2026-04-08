import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import PublicLayout from '../../components/Layout/PublicLayout';
import CardGradient from '../../components/CardGradient';
import SpendInput from '../../components/SpendInput';
import { cardsApi } from '../../api/cards';
import { expenseApi } from '../../api/expense';
import { formatInr, formatNumber } from '../../utils/format';
import type { CardTier, RewardRule } from '../../types/cards';

type Tab = 'overview' | 'calculator' | 'profit';

const TIER_BADGES: Record<CardTier, string> = {
  ENTRY: 'tier-badge-entry',
  STANDARD: 'tier-badge-standard',
  PREMIUM: 'tier-badge-premium',
  ELITE: 'tier-badge-elite',
  SUPER_PREMIUM: 'tier-badge-super_premium',
};

const DEFAULT_CATEGORIES = [
  { id: 'travel', name: 'Travel', icon: 'flight' },
  { id: 'dining', name: 'Dining', icon: 'restaurant' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping_bag' },
  { id: 'groceries', name: 'Groceries', icon: 'local_grocery_store' },
  { id: 'utilities', name: 'Utilities', icon: 'bolt' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
];

function computeRewards(
  rules: RewardRule[],
  spends: Record<string, number>,
  pointValueInr: number,
  annualFee: number
) {
  let totalAnnualPoints = 0;
  const breakdown: { categoryId: string; categoryName: string; rateLabel: string; monthlySpend: number; annualPoints: number; valueInr: number }[] = [];

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
        // base rule
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
      bestRule.rateType === 'MULTIPLIER'
        ? `${bestRule.rate}x`
        : `${bestRule.rate}%`;

    totalAnnualPoints += points;
    breakdown.push({
      categoryId,
      categoryName: DEFAULT_CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId,
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

  return { totalAnnualPoints: Math.round(totalAnnualPoints), cashValueInr, netProfitInr, effectiveRatePct, breakdown };
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} />;
}

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
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

  useEffect(() => {
    if (activeProfile) {
      const prefilled: Record<string, number> = {};
      activeProfile.lineItems.forEach((item) => {
        prefilled[item.categoryId] = item.monthlyAmountInr;
      });
      setSpends(prefilled);
    }
  }, [activeProfile]);

  const rewards = card
    ? computeRewards(card.rewardRules ?? [], spends, card.pointValueInr, card.annualFee)
    : null;

  const breakEvenMonthly =
    card && card.pointValueInr > 0
      ? card.annualFee / card.pointValueInr / 12
      : 0;

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
          <Link to="/cards" className="btn-primary text-sm">
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

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-body text-sm text-on-surface-variant mb-6">
          <Link to="/cards" className="hover:text-primary transition-colors">
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
                    <span className="material-symbols-outlined text-sm">airline_seat_recline_extra</span>
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
                <a
                  href="#apply"
                  className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Apply Now
                </a>
                <Link
                  to={`/compare?cards=${card.id}`}
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

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Description */}
            {card.description && (
              <div className="card-surface p-5">
                <p className="font-body text-on-surface-variant leading-relaxed">
                  {card.description}
                </p>
              </div>
            )}

            {/* Reward Rules */}
            {card.rewardRules && card.rewardRules.length > 0 && (
              <div className="card-surface p-5">
                <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
                  Rewards Structure
                </h2>
                <div className="flex flex-wrap gap-2">
                  {card.rewardRules.map((rule) => (
                    <span
                      key={rule.id}
                      className="flex items-center gap-1.5 bg-primary-fixed/30 text-primary text-sm font-semibold px-3 py-1.5 rounded-full"
                    >
                      <span className="font-headline font-black">
                        {rule.rateType === 'MULTIPLIER' ? `${rule.rate}x` : `${rule.rate}%`}
                      </span>
                      {rule.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {card.benefits && card.benefits.length > 0 && (
              <div className="card-surface p-5">
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
                          {benefit.category === 'LOUNGE'
                            ? 'airline_seat_recline_extra'
                            : benefit.category === 'DINING'
                            ? 'restaurant'
                            : benefit.category === 'INSURANCE'
                            ? 'shield'
                            : benefit.category === 'FUEL'
                            ? 'local_gas_station'
                            : 'star'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-body font-semibold text-on-surface text-sm">{benefit.name}</p>
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

            {/* Milestones */}
            {card.milestones && card.milestones.length > 0 && (
              <div className="card-surface p-5">
                <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
                  Spending Milestones
                </h2>
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
                          Spend {formatInr(milestone.spendThresholdInr)} ({milestone.period})
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

            {/* Fee Transparency */}
            <div className="card-surface p-5">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
                Fee & Eligibility
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-surface-container-low rounded-xl p-4">
                  <p className="font-body text-xs text-on-surface-variant mb-1">Annual Fee</p>
                  <p className="font-headline font-bold text-on-surface">
                    {card.annualFee === 0 ? 'FREE' : formatInr(card.annualFee)}
                  </p>
                </div>
                {card.feeWaiverThresholdInr && (
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <p className="font-body text-xs text-on-surface-variant mb-1">Fee Waiver At</p>
                    <p className="font-headline font-bold text-secondary">
                      {formatInr(card.feeWaiverThresholdInr)}/yr
                    </p>
                  </div>
                )}
                {card.minIncomeAnnualInr && (
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <p className="font-body text-xs text-on-surface-variant mb-1">Min Income</p>
                    <p className="font-headline font-bold text-on-surface">
                      {formatInr(card.minIncomeAnnualInr)}/yr
                    </p>
                  </div>
                )}
                {card.minCreditScore && (
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <p className="font-body text-xs text-on-surface-variant mb-1">Min Credit Score</p>
                    <p className="font-headline font-bold text-on-surface">
                      {card.minCreditScore}+
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Rewards Calculator */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="card-surface p-5">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-1">
                Your Monthly Spend
              </h2>
              <p className="font-body text-sm text-on-surface-variant mb-5">
                {activeProfile ? 'Pre-filled from your expense profile.' : 'Enter your monthly spending by category.'}
              </p>
              <div className="space-y-4">
                {DEFAULT_CATEGORIES.map((cat) => (
                  <SpendInput
                    key={cat.id}
                    label={cat.name}
                    icon={cat.icon}
                    value={spends[cat.id] ?? 0}
                    onChange={(val) => setSpends((prev) => ({ ...prev, [cat.id]: val }))}
                  />
                ))}
              </div>
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

        {/* Tab: Profit Analysis */}
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
                <p className="font-body text-sm text-on-surface-variant mb-1">
                  Net Annual Profit
                </p>
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
                    const pct = rewards.cashValueInr > 0
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
