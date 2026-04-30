'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PublicLayout from '../../components/Layout/PublicLayout';
import MetricCard from '../../components/MetricCard';
import CardGradient from '../../components/CardGradient';
import { useAuth } from '../../store/authStore';
import { useProfile } from '../../store/profileStore';
import { recommendationsApi } from '../../api/recommendations';
import { expenseApi } from '../../api/expense';
import type { ExpenseProfile } from '../../types/expense';
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

// ─────────────────────────── Profile Sidebar ───────────────────────────

function ProfileSidebar({
  profiles,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  isCreating,
}: {
  profiles: ExpenseProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isCreating: boolean;
}) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant">
          <h2 className="font-headline font-semibold text-sm text-on-surface">My Profiles</h2>
        </div>

        <ul className="py-2">
          {profiles.map((p) => {
            const name = p.label?.trim() || 'My Profile';
            const isSelected = p.id === selectedId;
            return (
              <li key={p.id}>
                <button
                  onClick={() => onSelect(p.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors group
                    ${isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-surface-container text-on-surface'
                    }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg shrink-0 ${
                      isSelected ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    account_balance_wallet
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium truncate">{name}</p>
                    <p className="font-body text-xs text-on-surface-variant">
                      {p.completenessPct}% complete · {formatInr(p.totalMonthlyInr)}/mo
                    </p>
                  </div>
                  {isSelected && profiles.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(p.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-error hover:text-error/80 shrink-0 transition-opacity"
                      title="Delete profile"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="px-4 py-3 border-t border-outline-variant">
          <button
            onClick={onNew}
            disabled={isCreating}
            className="w-full flex items-center gap-2 text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            {isCreating ? 'Creating…' : 'New Profile'}
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────── New Profile Modal ───────────────────────────

function NewProfileModal({
  onConfirm,
  onCancel,
  isLoading,
}: {
  onConfirm: (label: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [label, setLabel] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-headline font-semibold text-lg text-on-surface mb-4">New Profile</h3>
        <input
          autoFocus
          type="text"
          placeholder="e.g. Personal, Business, Travel…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && label.trim() && onConfirm(label.trim())}
          className="w-full border border-outline rounded-xl px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-outlined text-sm py-2 px-4">
            Cancel
          </button>
          <button
            onClick={() => label.trim() && onConfirm(label.trim())}
            disabled={!label.trim() || isLoading}
            className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
          >
            {isLoading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Profile Content ───────────────────────────

function ProfileContent({ profile }: { profile: ExpenseProfile }) {
  const router = useRouter();

  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations', 'latest', profile.id],
    queryFn: () => recommendationsApi.getLatest(profile.id),
    retry: false,
  });

  const totalValue = recommendations?.items.reduce(
    (acc, item) => acc + item.projectedAnnualValueInr,
    0
  );
  const topCard = recommendations?.items[0];

  return (
    <div className="flex-1 min-w-0">
      {/* Profile header */}
      <div className="mb-6">
        <h2 className="font-headline font-bold text-xl text-on-surface">
          {profile.label?.trim() || 'My Profile'}
        </h2>
        <p className="font-body text-sm text-on-surface-variant mt-0.5">
          Monthly spend: {formatInr(profile.totalMonthlyInr)} · {profile.completenessPct}% profiled
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          icon="auto_awesome"
          label="Wealth Velocity (Annual)"
          value={recsLoading ? '—' : totalValue !== undefined ? formatInr(totalValue) : '₹0'}
          trend={recommendations ? { direction: 'up', text: 'From top card' } : undefined}
          accent
        />
        <MetricCard
          icon="receipt_long"
          label="Profile Completeness"
          value={`${profile.completenessPct}%`}
          trend={
            profile.completenessPct < 100
              ? { direction: 'neutral', text: 'Update profile' }
              : { direction: 'up', text: 'Complete' }
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
      {profile.completenessPct < 100 && (
        <div className="bg-primary-fixed/30 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-2xl">info</span>
          <div className="flex-1">
            <p className="font-body font-semibold text-on-surface text-sm">
              Complete your spending profile
            </p>
            <p className="font-body text-xs text-on-surface-variant">
              You've profiled {profile.completenessPct}% of your spending. Add more categories for
              better recommendations.
            </p>
          </div>
          <Link
            href={`/expense-profiler?profileId=${profile.id}`}
            className="btn-primary text-sm py-2 px-4 shrink-0"
          >
            Update
          </Link>
        </div>
      )}

      {/* Top Recommendations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline font-bold text-base text-on-surface">Top Recommendations</h3>
          {recommendations && (
            <Link
              href={`/recommendations?profileId=${profile.id}`}
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
            <Link
              href={`/expense-profiler?profileId=${profile.id}`}
              className="text-primary font-semibold"
            >
              Add your spending
            </Link>{' '}
            to get started.
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="font-headline font-bold text-base text-on-surface mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: 'receipt_long',
              label: 'Update Spending',
              to: `/expense-profiler?profileId=${profile.id}`,
            },
            { icon: 'balance', label: 'Compare Cards', to: '/compare' },
            { icon: 'calculate', label: 'Rewards Calculator', to: '/simulator' },
            { icon: 'credit_card', label: 'Browse Cards', to: '/cards' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.to)}
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
        <div>
          <h3 className="font-headline font-bold text-base text-on-surface mb-4">Your Best Match</h3>
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
                  <h4 className="font-headline font-bold text-lg text-on-surface">
                    {topCard.cardName}
                  </h4>
                  <p className="font-body text-sm text-on-surface-variant">{topCard.issuerName}</p>
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
                <Link href={`/cards/${topCard.cardId}`} className="btn-outlined text-sm py-2 px-4">
                  View Details
                </Link>
                <Link
                  href={`/recommendations?profileId=${profile.id}`}
                  className="btn-primary text-sm py-2 px-4"
                >
                  All Recommendations
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── Main Page ───────────────────────────

export default function DashboardPage() {
  const { state } = useAuth();
  const { selectedProfileId, setSelectedProfileId } = useProfile();
  const queryClient = useQueryClient();
  const [showNewModal, setShowNewModal] = useState(false);

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['expense-profiles'],
    queryFn: () => expenseApi.listProfiles(),
    retry: false,
  });

  // Auto-select first profile if nothing is stored or stored id is gone
  useEffect(() => {
    if (profiles.length === 0) return;
    const found = profiles.find((p) => p.id === selectedProfileId);
    if (!found) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId, setSelectedProfileId]);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) ?? profiles[0] ?? null;

  const createMutation = useMutation({
    mutationFn: (label: string) => expenseApi.createProfile(label),
    onSuccess: (newProfile) => {
      queryClient.invalidateQueries({ queryKey: ['expense-profiles'] });
      setSelectedProfileId(newProfile.id);
      setShowNewModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseApi.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-profiles'] });
    },
  });

  const handleDelete = (id: string) => {
    if (profiles.length <= 1) return;
    deleteMutation.mutate(id);
    const next = profiles.find((p) => p.id !== id);
    if (next) setSelectedProfileId(next.id);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = state.user?.name?.split(' ')[0] ?? 'there';

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="font-headline font-bold text-2xl text-on-surface mb-1">
            {greeting}, {firstName} 👋
          </h1>
          <p className="font-body text-on-surface-variant text-sm">
            Here's your AuraWealth summary.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {profilesLoading ? (
            <aside className="w-full lg:w-64 shrink-0">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 space-y-3">
                {[1, 2].map((i) => (
                  <SkeletonBlock key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            </aside>
          ) : (
            <ProfileSidebar
              profiles={profiles}
              selectedId={selectedProfile?.id ?? null}
              onSelect={setSelectedProfileId}
              onNew={() => setShowNewModal(true)}
              onDelete={handleDelete}
              isCreating={createMutation.isPending}
            />
          )}

          {selectedProfile ? (
            <ProfileContent profile={selectedProfile} />
          ) : !profilesLoading ? (
            <div className="flex-1 text-center py-16 text-on-surface-variant font-body text-sm">
              No profiles yet.{' '}
              <button
                onClick={() => setShowNewModal(true)}
                className="text-primary font-semibold"
              >
                Create your first profile
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {showNewModal && (
        <NewProfileModal
          onConfirm={(label) => createMutation.mutate(label)}
          onCancel={() => setShowNewModal(false)}
          isLoading={createMutation.isPending}
        />
      )}
    </PublicLayout>
  );
}
