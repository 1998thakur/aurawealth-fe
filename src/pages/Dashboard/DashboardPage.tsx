
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '../../components/Layout/AppLayout';
import MetricCard from '../../components/MetricCard';
import CardGradient from '../../components/CardGradient';
import { useAuth } from '../../store/authStore';
import { recommendationsApi } from '../../api/recommendations';
import { expenseApi } from '../../api/expense';
import type { RecommendationItem } from '../../types/recommendations';
import type { CardNetwork, CardTier } from '../../types/cards';
import { formatInr } from '../../utils/format';

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} />;
}

function RecommendationMiniCard({ item }: { item: RecommendationItem }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant flex gap-4 hover:border-primary/30 transition-colors">
      <div className="shrink-0 w-20">
        <CardGradient
          name={item.cardName}
          issuerName={item.issuerName}
          network={item.cardNetwork as CardNetwork}
          tier={item.cardTier as CardTier}
          imageUrl={item.cardImageThumbnailUrl}
          compact
          className="h-12"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-body font-semibold text-on-surface text-sm truncate">
              {item.cardName}
            </p>
            <p className="font-body text-xs text-on-surface-variant">{item.issuerName}</p>
          </div>
          <span className="font-body font-semibold text-xs text-secondary shrink-0">
            #{item.rank}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-headline font-bold text-sm text-on-surface">
            {formatInr(item.projectedAnnualValueInr)}/yr
          </span>
          <span className="text-xs text-on-surface-variant">
            {item.effectiveRewardRate.toFixed(2)}% rate
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { state } = useAuth();
  const navigate = useNavigate();

  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations', 'latest'],
    queryFn: () => recommendationsApi.getLatest(),
    retry: false,
  });

  const { data: activeProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['expense-profiles', 'active'],
    queryFn: () => expenseApi.getActiveProfile(),
    retry: false,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = state.user?.name.split(' ')[0] ?? 'there';

  const totalValue = recommendations?.items.reduce(
    (acc, item) => acc + item.projectedAnnualValueInr,
    0
  );
  const topCard = recommendations?.items[0];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline font-bold text-2xl text-on-surface mb-1">
          {greeting}, {firstName} 👋
        </h1>
        <p className="font-body text-on-surface-variant text-sm">
          Here's your CreditBrain summary for today.
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard
          icon="auto_awesome"
          label="Wealth Velocity (Annual)"
          value={
            recsLoading
              ? '—'
              : totalValue !== undefined
              ? formatInr(totalValue)
              : '₹0'
          }
          trend={
            recommendations
              ? { direction: 'up', text: 'From top card' }
              : undefined
          }
          accent
        />
        <MetricCard
          icon="receipt_long"
          label="Profile Completeness"
          value={
            profileLoading ? '—' : activeProfile ? `${activeProfile.completenessPct}%` : 'Not set'
          }
          trend={
            activeProfile
              ? activeProfile.completenessPct < 100
                ? { direction: 'neutral', text: 'Update profile' }
                : { direction: 'up', text: 'Complete' }
              : undefined
          }
        />
        <MetricCard
          icon="credit_card"
          label="Cards Matched"
          value={recommendations ? String(recommendations.items.length) : '0'}
          trend={
            recommendations
              ? { direction: 'up', text: `${recommendations.items.length} recommendations` }
              : undefined
          }
        />
      </div>

      {/* Profile completeness nudge */}
      {activeProfile && activeProfile.completenessPct < 100 && (
        <div className="bg-primary-fixed/30 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-2xl">info</span>
          <div className="flex-1">
            <p className="font-body font-semibold text-on-surface text-sm">
              Complete your spending profile
            </p>
            <p className="font-body text-xs text-on-surface-variant">
              You've profiled {activeProfile.completenessPct}% of your spending.
              Add more categories for better recommendations.
            </p>
          </div>
          <Link to="/expense-profiler" className="btn-primary text-sm py-2 px-4 shrink-0">
            Update
          </Link>
        </div>
      )}

      {/* No profile nudge */}
      {!profileLoading && !activeProfile && (
        <div className="bg-primary-fixed/30 border border-primary/20 rounded-2xl p-6 mb-6 text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-2 block">
            receipt_long
          </span>
          <p className="font-body font-semibold text-on-surface mb-1">
            Set up your spending profile
          </p>
          <p className="font-body text-sm text-on-surface-variant mb-4">
            Tell us how you spend to get personalized card recommendations.
          </p>
          <Link to="/expense-profiler" className="btn-primary text-sm">
            Start Profiling
          </Link>
        </div>
      )}

      {/* Top Recommendations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Top Recommendations
          </h2>
          {recommendations && (
            <Link
              to="/recommendations"
              className="font-body text-sm text-primary font-semibold hover:underline"
            >
              View all →
            </Link>
          )}
        </div>

        {recsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl p-4 border border-outline-variant flex gap-4">
                <SkeletonBlock className="w-20 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-2/3 rounded" />
                  <SkeletonBlock className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations?.items.length ? (
          <div className="space-y-3">
            {recommendations.items.slice(0, 3).map((item) => (
              <RecommendationMiniCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-on-surface-variant font-body text-sm">
            No recommendations yet.{' '}
            <Link to="/expense-profiler" className="text-primary font-semibold">
              Create your profile
            </Link>{' '}
            to get started.
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-headline font-bold text-lg text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: 'receipt_long', label: 'Update Spending', to: '/expense-profiler' },
            { icon: 'balance', label: 'Compare Cards', to: '/compare' },
            { icon: 'calculate', label: 'Rewards Calculator', to: '/simulator' },
            { icon: 'credit_card', label: 'Browse Cards', to: '/cards' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:bg-surface-container hover:border-primary/20 transition-colors group"
            >
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                {action.icon}
              </span>
              <span className="font-body text-xs font-medium text-on-surface-variant group-hover:text-on-surface transition-colors text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top card spotlight */}
      {topCard && (
        <div className="mt-8">
          <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
            Your Best Match
          </h2>
          <div className="card-surface p-6 flex flex-col sm:flex-row gap-6">
            <CardGradient
              name={topCard.cardName}
              issuerName={topCard.issuerName}
              network={topCard.cardNetwork as CardNetwork}
              tier={topCard.cardTier as CardTier}
              imageUrl={topCard.cardImageThumbnailUrl}
              className="w-full sm:w-60 h-36 shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    {topCard.cardName}
                  </h3>
                  <p className="font-body text-sm text-on-surface-variant">
                    {topCard.issuerName}
                  </p>
                </div>
                <div className="flex gap-2">
                  {(topCard.recommendationTags ?? []).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary-fixed/30 text-primary text-xs font-body font-semibold px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="font-body text-xs text-on-surface-variant">Annual Fee</p>
                  <p className="font-headline font-bold text-on-surface">
                    {topCard.annualFee === 0 ? 'FREE' : formatInr(topCard.annualFee)}
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-on-surface-variant">Cash Value</p>
                  <p className="font-headline font-bold text-secondary">
                    {formatInr(topCard.projectedAnnualValueInr)}/yr
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-on-surface-variant">Net Profit</p>
                  <p className="font-headline font-bold text-on-surface">
                    {formatInr(topCard.netAnnualProfitInr)}/yr
                  </p>
                </div>
              </div>
              <p className="font-body text-sm text-on-surface-variant mb-4 line-clamp-2">
                {topCard.highlightBenefit ?? 'Top recommended card based on your spending profile.'}
              </p>
              <div className="flex gap-3">
                <Link
                  to={`/cards/${topCard.cardId}`}
                  className="btn-outlined text-sm py-2 px-4"
                >
                  View Details
                </Link>
                <Link to="/recommendations" className="btn-primary text-sm py-2 px-4">
                  All Recommendations
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
