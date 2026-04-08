import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import PublicLayout from '../../components/Layout/PublicLayout';
import CardGradient from '../../components/CardGradient';
import { recommendationsApi } from '../../api/recommendations';
import { formatInr } from '../../utils/format';
import type { RecommendationItem } from '../../types/recommendations';
import type { RewardType, CardNetwork, CardTier } from '../../types/cards';

type FilterCategory = 'ALL' | 'CASHBACK' | 'POINTS' | 'MILES' | 'TRAVEL' | 'PREMIUM';

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 80 ? 'bg-secondary' : pct >= 60 ? 'bg-primary' : 'bg-outline';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-container rounded-full h-1.5">
        <div
          className={`${color} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-body text-xs text-on-surface-variant w-7 text-right">
        {Math.round(pct)}
      </span>
    </div>
  );
}

function RecommendationCard({ item }: { item: RecommendationItem }) {
  return (
    <div
      className={clsx(
        'card-surface p-0 overflow-hidden hover:shadow-md transition-shadow duration-200',
        item.rank === 1 && 'ring-2 ring-primary'
      )}
    >
      {/* Top badge */}
      {item.rank === 1 && (
        <div className="bg-primary text-on-primary text-xs font-body font-semibold px-4 py-1.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          Highly Recommended — Best Match for You
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-0">
        {/* Card visual */}
        <div className="sm:w-48 p-4 shrink-0">
          <CardGradient
            name={item.cardName}
            issuerName={item.issuerName}
            network={item.cardNetwork as CardNetwork}
            tier={item.cardTier as CardTier}
            imageUrl={item.cardImageThumbnailUrl}
            compact
            className="h-28 w-full"
          />
        </div>

        {/* Info */}
        <div className="flex-1 p-4 sm:pl-2 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-headline font-bold text-on-surface">{item.cardName}</h3>
              <p className="font-body text-sm text-on-surface-variant">{item.issuerName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-body text-xs text-on-surface-variant">Match Score</p>
              <p className="font-headline font-bold text-primary">{Math.round(item.matchScore)}</p>
            </div>
          </div>

          <ScoreBar score={item.matchScore} />

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-3 mb-3">
            <div>
              <p className="font-body text-xs text-on-surface-variant">Annual Fee</p>
              <p className="font-headline font-bold text-on-surface text-sm">
                {item.annualFee === 0 ? 'FREE' : formatInr(item.annualFee)}
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-on-surface-variant">Effective Rate</p>
              <p className="font-headline font-bold text-primary text-sm">
                {item.effectiveRewardRate.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-on-surface-variant">Net Value</p>
              <p
                className={clsx(
                  'font-headline font-bold text-sm',
                  item.netAnnualProfitInr >= 0 ? 'text-secondary' : 'text-error'
                )}
              >
                {item.netAnnualProfitInr >= 0 ? '+' : ''}
                {formatInr(item.netAnnualProfitInr)}/yr
              </p>
            </div>
          </div>

          {/* Explanation */}
          <p className="font-body text-xs text-on-surface-variant mb-3 line-clamp-2">
            {item.highlightBenefit ?? ""}
          </p>

          {/* Tags + CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-auto">
            <div className="flex flex-wrap gap-1.5">
              {item.recommendationTags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="bg-primary-fixed/30 text-primary text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Link
                to={`/cards/${item.cardId}`}
                className="btn-outlined text-xs py-1.5 px-3"
              >
                View Details
              </Link>
              <a
                href="#apply"
                onClick={(e) => e.preventDefault()}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                Apply Now
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card-surface p-4">
      <div className="flex gap-4">
        <div className="skeleton w-44 h-28 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-5 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-2 rounded-full" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-8 rounded" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { setId } = useParams<{ setId?: string }>();
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [feeMax, setFeeMax] = useState(20000);
  const [selectedRewardTypes, setSelectedRewardTypes] = useState<RewardType[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['recommendations', setId ?? 'latest'],
    queryFn: () =>
      setId ? recommendationsApi.getById(setId) : recommendationsApi.getLatest(),
    retry: false,
  });

  const FILTER_CATEGORIES: { id: FilterCategory; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'CASHBACK', label: 'Cashback' },
    { id: 'POINTS', label: 'Reward Points' },
    { id: 'MILES', label: 'Air Miles' },
    { id: 'TRAVEL', label: 'Travel' },
    { id: 'PREMIUM', label: 'Premium' },
  ];

  const allRewardTypes: RewardType[] = ['CASHBACK', 'POINTS', 'MILES'];

  const filteredItems =
    data?.items.filter((item) => {
      if (filterCategory !== 'ALL') {
        if (filterCategory === 'TRAVEL') {
          if (!item.recommendationTags?.some((t) => t.toLowerCase().includes('travel'))) return false;
        } else if (filterCategory === 'PREMIUM') {
          if (!['PREMIUM', 'ELITE', 'SUPER_PREMIUM'].includes(item.cardTier)) return false;
        } else if (filterCategory === 'CASHBACK' || filterCategory === 'POINTS' || filterCategory === 'MILES') {
          if (!item.recommendationTags?.some((t) => t.toUpperCase().includes(filterCategory))) return false;
        }
      }
      if (item.annualFee > feeMax) return false;
      return true;
    }) ?? [];

  const toggleRewardType = (type: RewardType) => {
    setSelectedRewardTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-headline font-bold text-3xl text-on-surface mb-2">
            Your Curated Selections
          </h1>
          <p className="font-body text-on-surface-variant">
            Personalized credit card recommendations based on your spending profile.
          </p>
        </div>

        {error ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
              search_off
            </span>
            <p className="font-headline font-bold text-xl text-on-surface mb-2">
              No recommendations yet
            </p>
            <p className="font-body text-on-surface-variant mb-6">
              Set up your spending profile to get personalized card recommendations.
            </p>
            <Link to="/expense-profiler" className="btn-primary">
              Create Your Profile
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="card-surface p-5 space-y-6 sticky top-24">
                <div className="flex items-center justify-between">
                  <h2 className="font-body font-semibold text-on-surface">Filters</h2>
                  <button
                    onClick={() => {
                      setFilterCategory('ALL');
                      setFeeMax(20000);
                      setSelectedRewardTypes([]);
                    }}
                    className="font-body text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                {/* Category chips */}
                <div>
                  <p className="font-body text-sm font-semibold text-on-surface mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id)}
                        className={clsx(
                          'px-3 py-1 rounded-full text-xs font-body font-semibold transition-colors',
                          filterCategory === cat.id
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annual fee range */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-body text-sm font-semibold text-on-surface">Annual Fee</p>
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
                    onChange={(e) => setFeeMax(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between font-body text-xs text-on-surface-variant mt-1">
                    <span>₹0</span>
                    <span>₹20,000</span>
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

                {/* Profiler nudge */}
                <div className="bg-primary-fixed/20 rounded-xl p-4">
                  <p className="font-body text-xs font-semibold text-on-surface mb-1">
                    Improve Results
                  </p>
                  <p className="font-body text-xs text-on-surface-variant mb-2">
                    Update your spending profile for more accurate recommendations.
                  </p>
                  <Link
                    to="/expense-profiler"
                    className="font-body text-xs text-primary font-semibold hover:underline"
                  >
                    Update Profile →
                  </Link>
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {/* Count */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-on-surface-variant">
                    {isLoading ? 'Loading...' : `${filteredItems.length} cards found`}
                  </span>
                  {data && (
                    <span className="bg-primary-fixed/30 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                      {filteredItems.length}
                    </span>
                  )}
                </div>
                {data && (
                  <p className="font-body text-xs text-on-surface-variant">
                    Generated {new Date(data.generatedAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>

              {/* Cards */}
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <RecommendationCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
                    filter_alt_off
                  </span>
                  <p className="font-headline font-bold text-xl text-on-surface mb-2">
                    No matches for these filters
                  </p>
                  <p className="font-body text-on-surface-variant mb-4">
                    Try adjusting or clearing your filters.
                  </p>
                  <button
                    onClick={() => {
                      setFilterCategory('ALL');
                      setFeeMax(20000);
                      setSelectedRewardTypes([]);
                    }}
                    className="btn-outlined text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Summary row */}
              {data && filteredItems.length > 0 && (
                <div className="mt-6 bg-surface-container-low rounded-2xl p-5 border border-outline-variant">
                  <h3 className="font-headline font-bold text-base text-on-surface mb-3">
                    Potential Annual Value
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="font-body text-xs text-on-surface-variant mb-0.5">Top Card Value</p>
                      <p className="font-headline font-bold text-secondary">
                        {formatInr(filteredItems[0]?.projectedAnnualValueInr ?? 0)}/yr
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-xs text-on-surface-variant mb-0.5">Top Net Profit</p>
                      <p className="font-headline font-bold text-secondary">
                        {formatInr(filteredItems[0]?.netAnnualProfitInr ?? 0)}/yr
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-xs text-on-surface-variant mb-0.5">Best Rate</p>
                      <p className="font-headline font-bold text-primary">
                        {filteredItems.length > 0
                          ? Math.max(...filteredItems.map((i) => i.effectiveRewardRate)).toFixed(2)
                          : '0.00'}%
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-xs text-on-surface-variant mb-0.5">Cards Matched</p>
                      <p className="font-headline font-bold text-on-surface">
                        {filteredItems.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
