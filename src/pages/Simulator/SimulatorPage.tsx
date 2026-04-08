import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import PublicLayout from '../../components/Layout/PublicLayout';
import CardGradient from '../../components/CardGradient';
import SpendInput from '../../components/SpendInput';
import { cardsApi } from '../../api/cards';
import { expenseApi } from '../../api/expense';
import { formatInr, formatNumber } from '../../utils/format';
import type { CardDetail, CardSummary, RewardRule } from '../../types/cards';

interface SpendCategory {
  id: string;
  name: string;
  icon: string;
}

const SPEND_CATEGORIES: SpendCategory[] = [
  { id: 'travel', name: 'Travel', icon: 'flight' },
  { id: 'dining', name: 'Dining', icon: 'restaurant' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping_bag' },
  { id: 'groceries', name: 'Groceries', icon: 'local_grocery_store' },
  { id: 'utilities', name: 'Utilities', icon: 'bolt' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
];

interface RewardsCalcResult {
  totalAnnualPoints: number;
  cashValueInr: number;
  netProfitInr: number;
  effectiveRatePct: number;
  breakdown: {
    categoryId: string;
    categoryName: string;
    rateLabel: string;
    monthlySpend: number;
    annualPoints: number;
    valueInr: number;
  }[];
}

function computeRewards(
  card: CardDetail,
  spends: Record<string, number>
): RewardsCalcResult {
  const rules: RewardRule[] = card.rewardRules ?? [];
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);
  let totalAnnualPoints = 0;
  const breakdown: RewardsCalcResult['breakdown'] = [];

  for (const cat of SPEND_CATEGORIES) {
    const monthly = spends[cat.id] ?? 0;
    if (monthly <= 0) continue;
    const annualSpend = monthly * 12;

    let bestRule: RewardRule | null = null;
    for (const rule of sortedRules) {
      if (rule.categoryIds && rule.categoryIds.length > 0) {
        if (rule.categoryIds.includes(cat.id)) {
          bestRule = rule;
          break;
        }
      } else if (!bestRule) {
        bestRule = rule;
      }
    }
    if (!bestRule) continue;

    let points =
      bestRule.rateType === 'MULTIPLIER'
        ? (annualSpend / 100) * bestRule.rate
        : annualSpend * (bestRule.rate / 100);

    if (bestRule.capPerYearPoints) {
      points = Math.min(points, bestRule.capPerYearPoints);
    }

    const rateLabel =
      bestRule.rateType === 'MULTIPLIER' ? `${bestRule.rate}x` : `${bestRule.rate}%`;

    totalAnnualPoints += points;
    breakdown.push({
      categoryId: cat.id,
      categoryName: cat.name,
      rateLabel,
      monthlySpend: monthly,
      annualPoints: Math.round(points),
      valueInr: Math.round(points * card.pointValueInr),
    });
  }

  const cashValueInr = Math.round(totalAnnualPoints * card.pointValueInr);
  const netProfitInr = cashValueInr - card.annualFee;
  const totalAnnualSpend = Object.values(spends).reduce((a, b) => a + b * 12, 0);
  const effectiveRatePct =
    totalAnnualSpend > 0 ? (cashValueInr / totalAnnualSpend) * 100 : 0;

  return {
    totalAnnualPoints: Math.round(totalAnnualPoints),
    cashValueInr,
    netProfitInr,
    effectiveRatePct,
    breakdown,
  };
}

interface CardSelectorProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  excludeIds: string[];
}

function CardSelector({ selectedId, onSelect, excludeIds }: CardSelectorProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['cards', 'simulator-search', query],
    queryFn: () => cardsApi.getCards({ page: 0, size: 10 }),
    enabled: open,
  });

  const results =
    data?.items.filter(
      (c: CardSummary) => !excludeIds.includes(c.id) && c.name.toLowerCase().includes(query.toLowerCase())
    ) ?? [];

  const { data: selectedCard } = useQuery({
    queryKey: ['cards', selectedId],
    queryFn: () => cardsApi.getCard(selectedId!),
    enabled: !!selectedId,
  });

  return (
    <div>
      {selectedCard ? (
        <div className="relative">
          <CardGradient
            name={selectedCard.name}
            issuerName={selectedCard.issuer.name}
            network={selectedCard.network}
            tier={selectedCard.tier}
            imageUrl={selectedCard.cardImageThumbnailUrl}
            className="w-full h-40 mb-3"
          />
          <button
            onClick={() => onSelect(null)}
            className="absolute top-2 right-2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-white text-base">close</span>
          </button>
          <p className="font-body text-xs text-on-surface-variant text-center">
            {selectedCard.name}
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="h-40 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-2 mb-3 bg-surface-container-low">
            <span className="material-symbols-outlined text-2xl text-on-surface-variant">add_card</span>
            <p className="font-body text-xs text-on-surface-variant">Select a card</p>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Search cards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              className="input-field pl-9 text-sm"
            />
          </div>
          {open && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
              {results.map((card: CardSummary) => (
                <button
                  key={card.id}
                  onMouseDown={() => {
                    onSelect(card.id);
                    setQuery('');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-container transition-colors text-left"
                >
                  <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-primary text-sm">credit_card</span>
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium text-on-surface">{card.name}</p>
                    <p className="font-body text-xs text-on-surface-variant">{card.issuer.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ResultPanelProps {
  card: CardDetail;
  result: RewardsCalcResult;
  spends: Record<string, number>;
  label?: string;
}

function ResultPanel({ card, result, spends, label }: ResultPanelProps) {
  return (
    <div className="flex-1 min-w-0">
      {label && (
        <p className="font-body text-xs text-on-surface-variant font-semibold uppercase tracking-wide mb-3">
          {label}
        </p>
      )}

      {/* Summary metrics */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl">
          <span className="font-body text-sm text-on-surface">Annual Points</span>
          <span className="font-headline font-bold text-primary">
            {formatNumber(result.totalAnnualPoints)}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-secondary-container/40 rounded-xl">
          <span className="font-body text-sm text-on-surface">Cash Value</span>
          <span className="font-headline font-bold text-secondary">
            {formatInr(result.cashValueInr)}/yr
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
            result.netProfitInr >= 0
              ? 'bg-secondary-container text-secondary'
              : 'bg-error-container text-error'
          )}
        >
          <span className="font-body text-sm font-semibold">Net Profit</span>
          <span className="font-headline font-bold text-lg">
            {result.netProfitInr >= 0 ? '+' : ''}
            {formatInr(result.netProfitInr)}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl">
          <span className="font-body text-sm text-on-surface">Effective Rate</span>
          <span className="font-headline font-bold text-on-surface">
            {result.effectiveRatePct.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Breakdown table */}
      {result.breakdown.length > 0 && (
        <div>
          <p className="font-body text-xs text-on-surface-variant font-semibold uppercase tracking-wide mb-2">
            Breakdown
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-on-surface-variant text-xs border-b border-outline-variant">
                  <th className="text-left py-2 pr-2">Category</th>
                  <th className="text-right py-2 pr-2">Rate</th>
                  <th className="text-right py-2 pr-2">Points</th>
                  <th className="text-right py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr
                    key={row.categoryId}
                    className="border-b border-outline-variant/50 last:border-0"
                  >
                    <td className="py-2 pr-2 text-on-surface">{row.categoryName}</td>
                    <td className="py-2 pr-2 text-right text-primary font-semibold">
                      {row.rateLabel}
                    </td>
                    <td className="py-2 pr-2 text-right text-on-surface-variant">
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

      {/* Milestones */}
      {card.milestones && card.milestones.length > 0 && (
        <div className="mt-4">
          <p className="font-body text-xs text-on-surface-variant font-semibold uppercase tracking-wide mb-2">
            Milestones
          </p>
          <div className="space-y-1.5">
            {card.milestones.map((milestone) => {
              const annualSpend = Object.values(spends).reduce((a, b) => a + b * 12, 0);
              const willReach = annualSpend >= milestone.spendThresholdInr;
              return (
                <div
                  key={milestone.id}
                  className={clsx(
                    'flex items-center gap-2 p-2.5 rounded-xl text-xs',
                    willReach
                      ? 'bg-secondary-container/40 text-secondary'
                      : 'bg-surface-container text-on-surface-variant'
                  )}
                >
                  <span className="material-symbols-outlined text-sm">
                    {willReach ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className="flex-1 font-body">
                    {formatInr(milestone.spendThresholdInr)}: {milestone.rewardDescription}
                  </span>
                  {milestone.rewardPoints && (
                    <span className="font-semibold">+{formatNumber(milestone.rewardPoints)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SimulatorPage() {
  const [cardId1, setCardId1] = useState<string | null>(null);
  const [cardId2, setCardId2] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [spends, setSpends] = useState<Record<string, number>>({});

  // Pre-fill from active profile
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

  const { data: card1 } = useQuery({
    queryKey: ['cards', cardId1],
    queryFn: () => cardsApi.getCard(cardId1!),
    enabled: !!cardId1,
  });

  const { data: card2 } = useQuery({
    queryKey: ['cards', cardId2],
    queryFn: () => cardsApi.getCard(cardId2!),
    enabled: !!cardId2 && showCompare,
  });

  const result1 = useMemo(
    () => (card1 ? computeRewards(card1, spends) : null),
    [card1, spends]
  );

  const result2 = useMemo(
    () => (card2 ? computeRewards(card2, spends) : null),
    [card2, spends]
  );

  const totalMonthly = Object.values(spends).reduce((a, b) => a + b, 0);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline font-bold text-3xl text-on-surface mb-2">
            Interactive Rewards Simulator
          </h1>
          <p className="font-body text-on-surface-variant">
            Select a card, enter your monthly spending, and see exactly what you'll earn — category
            by category.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Spend inputs */}
          <div className="lg:col-span-4">
            <div className="card-surface p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline font-bold text-lg text-on-surface">
                  Monthly Spending
                </h2>
                {totalMonthly > 0 && (
                  <span className="font-headline font-bold text-sm text-primary">
                    ₹{totalMonthly.toLocaleString('en-IN')}/mo
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {SPEND_CATEGORIES.map((cat) => (
                  <SpendInput
                    key={cat.id}
                    label={cat.name}
                    icon={cat.icon}
                    value={spends[cat.id] ?? 0}
                    onChange={(val) =>
                      setSpends((prev) => ({ ...prev, [cat.id]: val }))
                    }
                  />
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-outline-variant">
                <p className="font-body text-xs text-on-surface-variant">
                  Annual spend:{' '}
                  <span className="font-semibold text-on-surface">
                    ₹{(totalMonthly * 12).toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
            </div>

            {/* Card 1 selector */}
            <div className="card-surface p-5 mt-4">
              <h2 className="font-headline font-bold text-base text-on-surface mb-3">
                {showCompare ? 'Card 1' : 'Select Card'}
              </h2>
              <CardSelector
                selectedId={cardId1}
                onSelect={setCardId1}
                excludeIds={cardId2 ? [cardId2] : []}
              />
            </div>

            {/* Card 2 selector */}
            {showCompare && (
              <div className="card-surface p-5 mt-4">
                <h2 className="font-headline font-bold text-base text-on-surface mb-3">
                  Card 2
                </h2>
                <CardSelector
                  selectedId={cardId2}
                  onSelect={setCardId2}
                  excludeIds={cardId1 ? [cardId1] : []}
                />
              </div>
            )}

            {!showCompare && cardId1 && (
              <button
                onClick={() => setShowCompare(true)}
                className="btn-outlined w-full mt-3 text-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Compare with another card
              </button>
            )}
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-8">
            {!cardId1 ? (
              <div className="h-full min-h-64 flex flex-col items-center justify-center gap-4 bg-surface-container-low rounded-2xl border border-outline-variant p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                  calculate
                </span>
                <div>
                  <p className="font-headline font-bold text-lg text-on-surface mb-1">
                    Select a card to start
                  </p>
                  <p className="font-body text-sm text-on-surface-variant">
                    Choose a card and enter your monthly spend to see your estimated rewards.
                  </p>
                </div>
                <Link to="/cards" className="btn-outlined text-sm">
                  Browse Cards
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row gap-4">
                  {card1 && result1 && (
                    <div className="flex-1 card-surface p-5">
                      <ResultPanel
                        card={card1}
                        result={result1}
                        spends={spends}
                        label={showCompare ? card1.name : undefined}
                      />
                    </div>
                  )}

                  {showCompare && card2 && result2 && (
                    <>
                      {/* VS divider */}
                      <div className="flex items-center sm:flex-col justify-center">
                        <div className="hidden sm:block w-px h-full bg-outline-variant" />
                        <span className="font-headline font-bold text-sm text-on-surface-variant bg-surface-container rounded-full px-3 py-1">
                          VS
                        </span>
                        <div className="hidden sm:block w-px h-full bg-outline-variant" />
                      </div>

                      <div className="flex-1 card-surface p-5">
                        <ResultPanel
                          card={card2}
                          result={result2}
                          spends={spends}
                          label={card2.name}
                        />
                      </div>
                    </>
                  )}

                  {showCompare && !cardId2 && (
                    <div className="flex-1 min-h-40 flex items-center justify-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
                      <p className="font-body text-sm text-on-surface-variant">
                        Select Card 2 to compare
                      </p>
                    </div>
                  )}
                </div>

                {/* Comparison summary */}
                {showCompare && result1 && result2 && card1 && card2 && (
                  <div className="card-surface p-5 mt-4">
                    <h3 className="font-headline font-bold text-base text-on-surface mb-4">
                      Head-to-Head Comparison
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="font-body text-xs text-on-surface-variant mb-1">
                          {card1.name}
                        </p>
                        <p className="font-headline font-bold text-lg text-on-surface">
                          {formatInr(result1.netProfitInr)}/yr
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-on-surface-variant">
                          compare_arrows
                        </span>
                        <p className="font-body text-xs text-on-surface-variant mt-1">Net Profit</p>
                      </div>
                      <div>
                        <p className="font-body text-xs text-on-surface-variant mb-1">
                          {card2.name}
                        </p>
                        <p className="font-headline font-bold text-lg text-on-surface">
                          {formatInr(result2.netProfitInr)}/yr
                        </p>
                      </div>
                    </div>

                    {result1.netProfitInr !== result2.netProfitInr && (
                      <div className="mt-4 p-3 rounded-xl bg-surface-container text-center">
                        <p className="font-body text-sm text-on-surface">
                          <span className="font-semibold text-primary">
                            {result1.netProfitInr > result2.netProfitInr
                              ? card1.name
                              : card2.name}
                          </span>{' '}
                          earns you{' '}
                          <span className="font-semibold text-secondary">
                            {formatInr(
                              Math.abs(result1.netProfitInr - result2.netProfitInr)
                            )}{' '}
                            more
                          </span>{' '}
                          per year with this spending pattern.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {showCompare && (
                  <button
                    onClick={() => { setShowCompare(false); setCardId2(null); }}
                    className="btn-text text-sm mt-2 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">remove</span>
                    Remove comparison
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
