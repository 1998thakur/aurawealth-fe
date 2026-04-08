import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import PublicLayout from '../../components/Layout/PublicLayout';
import CardGradient from '../../components/CardGradient';
import { cardsApi } from '../../api/cards';
import type { CardSummary, CardTier, RewardType } from '../../types/cards';
import { formatInr } from '../../utils/format';

const TIER_BADGES: Record<CardTier, string> = {
  ENTRY: 'tier-badge-entry',
  STANDARD: 'tier-badge-standard',
  PREMIUM: 'tier-badge-premium',
  ELITE: 'tier-badge-elite',
  SUPER_PREMIUM: 'tier-badge-super_premium',
};


function CardCatalogItem({ card }: { card: CardSummary }) {
  return (
    <div className="card-surface overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Card image / gradient */}
      <div className="p-3 pb-0">
        <CardGradient
          name={card.name}
          issuerName={card.issuer.name}
          network={card.network}
          tier={card.tier}
          imageUrl={card.cardImageThumbnailUrl}
          className="w-full h-32"
        />
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
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

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="font-body text-xs text-on-surface-variant">Annual Fee</p>
            <p className="font-headline font-bold text-on-surface text-sm">
              {card.annualFee === 0 ? 'FREE' : formatInr(card.annualFee)}
            </p>
          </div>
          <div>
            <p className="font-body text-xs text-on-surface-variant">Effective Rate</p>
            <p className="font-headline font-bold text-on-surface text-sm">
              {card.pointValueInr.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {card.hasLoungeAccess && (
            <span className="flex items-center gap-1 bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-xs">airline_seat_recline_extra</span>
              Lounge
            </span>
          )}
          {card.hasZeroForex && (
            <span className="flex items-center gap-1 bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-xs">currency_exchange</span>
              0% Forex
            </span>
          )}
          {card.primaryHighlights?.[0] && (
            <span className="bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded-full truncate max-w-full">
              {card.primaryHighlights?.[0]}
            </span>
          )}
        </div>

        <Link
          to={`/cards/${card.id}`}
          className="btn-outlined text-sm py-2 text-center mt-auto"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card-surface overflow-hidden">
      <div className="h-28 skeleton" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-8 rounded" />
          <div className="skeleton h-8 rounded" />
        </div>
        <div className="skeleton h-8 rounded-xl" />
      </div>
    </div>
  );
}

export default function CardCatalogPage() {
  const [selectedTiers, setSelectedTiers] = useState<CardTier[]>([]);
  const [selectedRewardTypes, setSelectedRewardTypes] = useState<RewardType[]>([]);
  const [feeMax, setFeeMax] = useState(20000);
  const [loungeOnly, setLoungeOnly] = useState(false);
  const [sort, setSort] = useState('effectiveRate_desc');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['cards', selectedTiers, selectedRewardTypes, feeMax, loungeOnly, sort, page],
    queryFn: () =>
      cardsApi.getCards({
        tiers: selectedTiers.length ? selectedTiers : undefined,
        rewardTypes: selectedRewardTypes.length ? selectedRewardTypes : undefined,
        annualFeeMax: feeMax,
        hasLoungeAccess: loungeOnly || undefined,
        sort,
        page,
        size: 12,
      }),
  });

  const toggleTier = (tier: CardTier) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
    setPage(0);
  };

  const toggleRewardType = (type: RewardType) => {
    setSelectedRewardTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedTiers([]);
    setSelectedRewardTypes([]);
    setFeeMax(20000);
    setLoungeOnly(false);
    setSort('effectiveRate_desc');
    setPage(0);
  };

  const allTiers: CardTier[] = ['ENTRY', 'STANDARD', 'PREMIUM', 'ELITE', 'SUPER_PREMIUM'];
  const allRewardTypes: RewardType[] = ['CASHBACK', 'POINTS', 'MILES'];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-headline font-bold text-3xl text-on-surface mb-2">
            Credit Card Catalog
          </h1>
          <p className="font-body text-on-surface-variant">
            Browse and compare {data?.total ?? '75+'} credit cards across all major issuers.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="card-surface p-5 space-y-6 sticky top-24">
              <div className="flex items-center justify-between">
                <h2 className="font-body font-semibold text-on-surface">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="font-body text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>

              {/* Tier */}
              <div>
                <p className="font-body text-sm font-semibold text-on-surface mb-2">Card Tier</p>
                <div className="space-y-2">
                  {allTiers.map((tier) => (
                    <label
                      key={tier}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTiers.includes(tier)}
                        onChange={() => toggleTier(tier)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="font-body text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                        {tier.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reward type */}
              <div>
                <p className="font-body text-sm font-semibold text-on-surface mb-2">
                  Reward Type
                </p>
                <div className="space-y-2">
                  {allRewardTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRewardTypes.includes(type)}
                        onChange={() => toggleRewardType(type)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="font-body text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Annual fee */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-body text-sm font-semibold text-on-surface">
                    Annual Fee
                  </p>
                  <span className="font-body text-xs text-primary font-semibold">
                    Up to {formatInr(feeMax)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20000}
                  step={500}
                  value={feeMax}
                  onChange={(e) => { setFeeMax(parseInt(e.target.value)); setPage(0); }}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between font-body text-xs text-on-surface-variant mt-1">
                  <span>₹0</span>
                  <span>₹20,000</span>
                </div>
              </div>

              {/* Lounge access */}
              <div className="flex items-center justify-between">
                <p className="font-body text-sm font-semibold text-on-surface">
                  Lounge Access Only
                </p>
                <button
                  type="button"
                  onClick={() => { setLoungeOnly((v) => !v); setPage(0); }}
                  className={clsx(
                    'relative w-10 h-5 rounded-full transition-colors duration-200',
                    loungeOnly ? 'bg-primary' : 'bg-outline-variant'
                  )}
                >
                  <span
                    className={clsx(
                      'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                      loungeOnly ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="font-body text-sm text-on-surface-variant">
                {isLoading ? 'Loading...' : `${data?.total ?? 0} cards found`}
              </p>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(0); }}
                className="input-field w-auto text-sm py-2 px-3"
              >
                <option value="effectiveRate_desc">Best Effective Rate</option>
                <option value="annualFee_asc">Lowest Annual Fee</option>
                <option value="annualFee_desc">Highest Annual Fee</option>
                <option value="name_asc">Name A–Z</option>
              </select>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : data?.items.length ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.items.map((card) => (
                    <CardCatalogItem key={card.id} card={card} />
                  ))}
                </div>

                {/* Pagination */}
                {Math.ceil((data.total || 0) / 20) > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="btn-outlined py-2 px-3 text-sm disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(Math.ceil((data.total || 0) / 20), 7) }).map((_, i) => {
                      const pageNum = i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={clsx(
                            'w-9 h-9 rounded-xl font-body text-sm font-medium transition-colors',
                            pageNum === page
                              ? 'bg-primary text-on-primary'
                              : 'text-on-surface-variant hover:bg-surface-container'
                          )}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(Math.ceil((data.total || 0) / 20) - 1, p + 1))}
                      disabled={page === Math.ceil((data.total || 0) / 20) - 1}
                      className="btn-outlined py-2 px-3 text-sm disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
                  search_off
                </span>
                <p className="font-body font-semibold text-on-surface mb-1">
                  No cards found
                </p>
                <p className="font-body text-sm text-on-surface-variant mb-4">
                  Try adjusting your filters
                </p>
                <button onClick={clearFilters} className="btn-outlined text-sm">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
