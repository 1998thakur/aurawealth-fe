import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import PublicLayout from '../../components/Layout/PublicLayout';
import CardGradient from '../../components/CardGradient';
import { cardsApi } from '../../api/cards';
import { formatInr } from '../../utils/format';
import type { CardDetail, CardTier } from '../../types/cards';

const TIER_BADGES: Record<CardTier, string> = {
  ENTRY: 'tier-badge-entry',
  STANDARD: 'tier-badge-standard',
  PREMIUM: 'tier-badge-premium',
  ELITE: 'tier-badge-elite',
  SUPER_PREMIUM: 'tier-badge-super_premium',
};

const MAX_CARDS = 3;

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-secondary font-semibold text-sm">
      <span className="material-symbols-outlined text-base">check_circle</span>
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-on-surface-variant text-sm">
      <span className="material-symbols-outlined text-base">cancel</span>
      No
    </span>
  );
}

function CompareRow({
  label,
  values,
}: {
  label: string;
  values: React.ReactNode[];
}) {
  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="py-3 pr-4 font-body text-sm text-on-surface-variant font-medium w-36 align-top">
        {label}
      </td>
      {values.map((val, i) => (
        <td key={i} className="py-3 px-4 font-body text-sm text-on-surface align-top">
          {val}
        </td>
      ))}
      {/* Empty columns if fewer than MAX_CARDS */}
      {Array.from({ length: MAX_CARDS - values.length }).map((_, i) => (
        <td key={`empty-${i}`} className="py-3 px-4" />
      ))}
    </tr>
  );
}

function CardSearchInput({
  onSelect,
  excludeIds,
}: {
  onSelect: (id: string) => void;
  excludeIds: string[];
}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce: wait 300ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ['cards', 'search', debouncedQuery],
    queryFn: () => cardsApi.getCards({ search: debouncedQuery || undefined, page: 0, size: 10 }),
    enabled: open,
  });

  const results = (data?.items ?? []).filter((c) => !excludeIds.includes(c.id));

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-base">
          search
        </span>
        <input
          type="text"
          placeholder="Search by card name..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="input-field pl-9 pr-8"
        />
        {isFetching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 mt-1 max-h-72 overflow-y-auto">
          {results.length === 0 && !isFetching && (
            <div className="px-4 py-6 text-center">
              <span className="material-symbols-outlined text-2xl text-on-surface-variant block mb-1">search_off</span>
              <p className="font-body text-sm text-on-surface-variant">
                {debouncedQuery ? `No cards matching "${debouncedQuery}"` : 'No cards available'}
              </p>
            </div>
          )}
          {results.map((card) => (
            <button
              key={card.id}
              onMouseDown={() => { onSelect(card.id); setQuery(''); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container transition-colors text-left border-b border-outline-variant/50 last:border-0"
            >
              {/* Card thumbnail */}
              <div className="w-14 shrink-0">
                {card.cardImageThumbnailUrl ? (
                  <img
                    src={card.cardImageThumbnailUrl}
                    alt={card.name}
                    className="w-full h-auto rounded-lg object-contain bg-white"
                  />
                ) : (
                  <div className="w-14 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">credit_card</span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-on-surface truncate">{card.name}</p>
                <p className="font-body text-xs text-on-surface-variant truncate">{card.issuer.name}</p>
              </div>
              {/* Fee + tier */}
              <div className="shrink-0 text-right">
                <p className="font-headline font-bold text-xs text-on-surface">
                  {card.annualFee === 0 ? 'FREE' : formatInr(card.annualFee)}
                </p>
                <p className="font-body text-xs text-on-surface-variant capitalize">
                  {card.tier.replace('_', ' ').toLowerCase()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CardSlot({
  cardId,
  onRemove,
  onAdd,
  excludeIds,
}: {
  cardId: string | null;
  onRemove: () => void;
  onAdd: (id: string) => void;
  excludeIds: string[];
}) {
  const { data: card, isLoading } = useQuery({
    queryKey: ['cards', cardId],
    queryFn: () => cardsApi.getCard(cardId!),
    enabled: !!cardId,
  });

  if (!cardId) {
    return (
      <div className="flex-1 min-w-0 border-2 border-dashed border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center gap-4 bg-surface-container-low">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant">add_card</span>
        <p className="font-body text-sm text-on-surface-variant text-center">Add a card to compare</p>
        <div className="w-full">
          <CardSearchInput onSelect={onAdd} excludeIds={excludeIds} />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-outline-variant">
        <div className="skeleton h-36" />
        <div className="p-4 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-outline-variant">
      <div className="relative">
        <CardGradient
          name={card.name}
          issuerName={card.issuer.name}
          network={card.network}
          tier={card.tier}
          imageUrl={card.cardImageThumbnailUrl}
          className="w-full h-36"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-white text-sm">close</span>
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-headline font-bold text-on-surface text-sm">{card.name}</h3>
        <p className="font-body text-xs text-on-surface-variant">{card.issuer.name}</p>
      </div>
    </div>
  );
}

export default function CardComparisonPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cardIds, setCardIds] = useState<(string | null)[]>(() => {
    const ids = searchParams.get('cards')?.split(',').filter(Boolean) ?? [];
    const slots: (string | null)[] = [null, null, null];
    ids.slice(0, MAX_CARDS).forEach((id, i) => { slots[i] = id; });
    return slots;
  });

  useEffect(() => {
    const ids = cardIds.filter(Boolean) as string[];
    if (ids.length > 0) {
      setSearchParams({ cards: ids.join(',') }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [cardIds, setSearchParams]);

  const validIds = cardIds.filter(Boolean) as string[];

  const query0 = useQuery({
    queryKey: ['cards', cardIds[0]],
    queryFn: () => cardsApi.getCard(cardIds[0]!),
    enabled: !!cardIds[0],
  });
  const query1 = useQuery({
    queryKey: ['cards', cardIds[1]],
    queryFn: () => cardsApi.getCard(cardIds[1]!),
    enabled: !!cardIds[1],
  });
  const query2 = useQuery({
    queryKey: ['cards', cardIds[2]],
    queryFn: () => cardsApi.getCard(cardIds[2]!),
    enabled: !!cardIds[2],
  });

  const cards = [query0.data ?? null, query1.data ?? null, query2.data ?? null];

  const addCard = (slotIndex: number) => (id: string) => {
    setCardIds((prev) => {
      const next = [...prev];
      next[slotIndex] = id;
      return next;
    });
  };

  const removeCard = (slotIndex: number) => () => {
    setCardIds((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const validCards = cards.filter((c): c is CardDetail => c !== null);

  const COMPARE_ROWS: { label: string; render: (card: CardDetail) => React.ReactNode }[] = [
    {
      label: 'Annual Fee',
      render: (c: CardDetail) => (
        <span className="font-headline font-bold text-on-surface">
          {c.annualFee === 0 ? 'FREE' : formatInr(c.annualFee)}
        </span>
      ),
    },
    {
      label: 'Effective Rate',
      render: (c: CardDetail) => (
        <span className="font-headline font-bold text-primary">
          {c.pointValueInr.toFixed(4)}%
        </span>
      ),
    },
    {
      label: 'Reward Type',
      render: (c: CardDetail) => (
        <span
          className={clsx(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            c.rewardType === 'CASHBACK'
              ? 'bg-secondary-container text-secondary'
              : c.rewardType === 'MILES'
              ? 'bg-sky-100 text-sky-700'
              : 'bg-primary-fixed/60 text-primary'
          )}
        >
          {c.rewardType}
        </span>
      ),
    },
    {
      label: 'Network',
      render: (c: CardDetail) => <span className="font-headline font-bold">{c.network}</span>,
    },
    {
      label: 'Card Tier',
      render: (c: CardDetail) => (
        <span className={TIER_BADGES[c.tier]}>{c.tier.replace('_', ' ')}</span>
      ),
    },
    {
      label: 'Lounge Access',
      render: (c: CardDetail) => <YesNo value={c.hasLoungeAccess} />,
    },
    {
      label: 'Zero Forex',
      render: (c: CardDetail) => <YesNo value={c.hasZeroForex} />,
    },
    {
      label: 'Point Value',
      render: (c: CardDetail) => `₹${c.pointValueInr.toFixed(2)}/pt`,
    },
    {
      label: 'Fee Waiver',
      render: (c: CardDetail) =>
        c.feeWaiverThresholdInr
          ? `Spend ${formatInr(c.feeWaiverThresholdInr)}/yr`
          : '—',
    },
    {
      label: 'Min Income',
      render: (c: CardDetail) => (c.minIncomeAnnualInr ? `${formatInr(c.minIncomeAnnualInr)}/yr` : '—'),
    },
    {
      label: 'Min Credit Score',
      render: (c: CardDetail) => (c.minCreditScore ? `${c.minCreditScore}+` : '—'),
    },
  ];

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline font-bold text-3xl text-on-surface mb-2">
            Compare Cards
          </h1>
          <p className="font-body text-on-surface-variant">
            Compare up to 3 credit cards side-by-side to find your best match.
          </p>
        </div>

        {/* Card slots */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 min-w-[200px] max-w-xs">
              <CardSlot
                cardId={cardIds[i]}
                onRemove={removeCard(i)}
                onAdd={addCard(i)}
                excludeIds={validIds}
              />
            </div>
          ))}
        </div>

        {/* Comparison table */}
        {validCards.length >= 2 ? (
          <div className="card-surface overflow-hidden">
            <div className="p-5 border-b border-outline-variant">
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Side-by-Side Comparison
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="py-3 px-4 text-left font-body text-xs text-on-surface-variant font-semibold uppercase tracking-wide w-36">
                      Feature
                    </th>
                    {validCards.map((card: CardDetail) => (
                      <th
                        key={card.id}
                        className="py-3 px-4 text-left font-headline font-bold text-on-surface text-sm"
                      >
                        {card.name}
                      </th>
                    ))}
                    {Array.from({ length: MAX_CARDS - validCards.length }).map((_, i) => (
                      <th key={`empty-${i}`} className="py-3 px-4" />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <CompareRow
                      key={row.label}
                      label={row.label}
                      values={validCards.map((card: CardDetail) => row.render(card))}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reward rules comparison */}
            {validCards.some((c: CardDetail) => (c.rewardRules?.length ?? 0) > 0) && (
              <div className="p-5 border-t border-outline-variant">
                <h3 className="font-headline font-bold text-base text-on-surface mb-4">
                  Reward Rates Comparison
                </h3>
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${validCards.length}, 1fr)` }}>
                  {validCards.map((card: CardDetail) => (
                    <div key={card.id}>
                      <p className="font-body text-xs text-on-surface-variant font-semibold mb-2 uppercase tracking-wide">
                        {card.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {card.rewardRules?.map((rule: import("../../types/cards").RewardRule) => (
                          <span
                            key={rule.id}
                            className="flex items-center gap-1 bg-primary-fixed/30 text-primary text-xs font-semibold px-2.5 py-1 rounded-full"
                          >
                            <span className="font-black">
                              {rule.rateType === 'MULTIPLIER' ? `${rule.rate}x` : `${rule.rate}%`}
                            </span>
                            {rule.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits comparison */}
            {validCards.some((c: CardDetail) => (c.benefits?.length ?? 0) > 0) && (
              <div className="p-5 border-t border-outline-variant">
                <h3 className="font-headline font-bold text-base text-on-surface mb-4">
                  Benefits Comparison
                </h3>
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${validCards.length}, 1fr)` }}>
                  {validCards.map((card: CardDetail) => (
                    <div key={card.id}>
                      <p className="font-body text-xs text-on-surface-variant font-semibold mb-2 uppercase tracking-wide">
                        {card.name}
                      </p>
                      <div className="space-y-1.5">
                        {card.benefits?.filter((b: import("../../types/cards").CardBenefit) => b.isPrimaryHighlight).map((benefit) => (
                          <div key={benefit.id} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-base">
                              check_circle
                            </span>
                            <span className="font-body text-sm text-on-surface">{benefit.name}</span>
                          </div>
                        ))}
                        {(!card.benefits || card.benefits.filter((b: import("../../types/cards").CardBenefit) => b.isPrimaryHighlight).length === 0) && (
                          <p className="font-body text-sm text-on-surface-variant">No highlighted benefits</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs per card */}
            <div className="p-5 border-t border-outline-variant bg-surface-container-low">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${validCards.length + 1}, 1fr)` }}>
                <div />
                {validCards.map((card: CardDetail) => (
                  <div key={card.id} className="flex flex-col gap-2">
                    <Link
                      to={`/cards/${card.id}`}
                      className="btn-outlined text-sm py-2 text-center"
                    >
                      View Details
                    </Link>
                    <a
                      href="#apply"
                      onClick={(e) => e.preventDefault()}
                      className="btn-primary text-sm py-2 text-center"
                    >
                      Apply Now
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-container-low rounded-2xl border border-outline-variant">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
              balance
            </span>
            <p className="font-headline font-bold text-lg text-on-surface mb-2">
              Add at least 2 cards to compare
            </p>
            <p className="font-body text-sm text-on-surface-variant mb-4">
              Use the search boxes above to add cards to your comparison.
            </p>
            <Link to="/cards" className="btn-outlined text-sm">
              Browse Card Catalog
            </Link>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
