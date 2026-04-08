
import { useState } from 'react';
import clsx from 'clsx';
import type { CardTier, CardNetwork } from '../types/cards';

interface CardGradientProps {
  name: string;
  issuerName: string;
  network: CardNetwork;
  tier: CardTier;
  imageUrl?: string;
  className?: string;
  compact?: boolean;
}

const TIER_GRADIENT: Record<CardTier, string> = {
  ENTRY: 'from-slate-700 to-slate-900',
  STANDARD: 'from-slate-700 to-slate-900',
  PREMIUM: 'from-blue-800 to-[#003358]',
  ELITE: 'from-violet-900 to-indigo-800',
  SUPER_PREMIUM: 'from-zinc-800 to-zinc-950',
};

const NETWORK_LABEL: Record<CardNetwork, string> = {
  VISA: 'VISA',
  MASTERCARD: 'MC',
  AMEX: 'AMEX',
  RUPAY: 'RuPay',
  DINERS: 'Diners',
};

export default function CardGradient({
  name,
  issuerName,
  network,
  tier,
  imageUrl,
  className,
  compact = false,
}: CardGradientProps) {
  const [imgError, setImgError] = useState(false);
  const gradient = TIER_GRADIENT[tier] ?? TIER_GRADIENT.STANDARD;
  const showImage = !!imageUrl && !imgError;

  if (showImage) {
    // Use natural credit card aspect ratio (85.6mm × 53.98mm ≈ 86:54)
    return (
      <div className="rounded-2xl overflow-hidden bg-white w-full aspect-[86/54] relative">
        <img
          src={imageUrl}
          alt={`${name} card`}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
        {/* Name + issuer overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 rounded-b-2xl">
          <p className={clsx('font-headline font-bold text-white leading-tight truncate', compact ? 'text-xs' : 'text-sm')}>
            {name}
          </p>
          {!compact && (
            <p className="font-body text-white/70 text-xs truncate">{issuerName}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        `bg-gradient-to-br ${gradient} rounded-2xl text-white relative overflow-hidden`,
        compact ? 'p-4' : 'p-6',
        className
      )}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top row: issuer + network */}
        <div className="flex items-start justify-between mb-auto">
          <p className={clsx('font-body font-semibold text-white/70', compact ? 'text-xs' : 'text-sm')}>
            {issuerName}
          </p>
          <span
            className={clsx(
              'font-headline font-black tracking-wider text-white/90 italic',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {NETWORK_LABEL[network]}
          </span>
        </div>

        {/* Chip */}
        {!compact && (
          <div className="mt-4 mb-3">
            <div className="w-10 h-7 bg-amber-300/80 rounded-lg" />
          </div>
        )}

        {/* Card number placeholder */}
        {!compact && (
          <p className="font-body text-white/50 text-sm tracking-widest mb-3">
            •••• •••• •••• 4242
          </p>
        )}

        {/* Card name */}
        <div className="mt-auto">
          <p
            className={clsx(
              'font-headline font-bold text-white leading-tight',
              compact ? 'text-sm' : 'text-lg'
            )}
          >
            {name}
          </p>
        </div>
      </div>
    </div>
  );
}
