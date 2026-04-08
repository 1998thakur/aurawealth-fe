
import clsx from 'clsx';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
  className?: string;
  accent?: boolean;
}

export default function MetricCard({
  icon,
  label,
  value,
  trend,
  className,
  accent = false,
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl p-5 border',
        accent
          ? 'bg-primary text-on-primary border-primary-container'
          : 'bg-surface-container-lowest text-on-surface border-outline-variant',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            accent ? 'bg-white/20' : 'bg-primary-fixed/40'
          )}
        >
          <span
            className={clsx(
              'material-symbols-outlined text-xl',
              accent ? 'text-on-primary' : 'text-primary'
            )}
          >
            {icon}
          </span>
        </div>
        {trend && (
          <div
            className={clsx(
              'flex items-center gap-1 text-xs font-body font-semibold px-2 py-1 rounded-full',
              trend.direction === 'up' && !accent && 'bg-secondary-container text-secondary',
              trend.direction === 'down' && !accent && 'bg-error-container text-error',
              trend.direction === 'neutral' && !accent && 'bg-surface-container text-on-surface-variant',
              accent && 'bg-white/20 text-on-primary'
            )}
          >
            {trend.direction === 'up' && (
              <span className="material-symbols-outlined text-sm">trending_up</span>
            )}
            {trend.direction === 'down' && (
              <span className="material-symbols-outlined text-sm">trending_down</span>
            )}
            {trend.text}
          </div>
        )}
      </div>
      <p
        className={clsx(
          'font-headline font-bold text-2xl mb-1',
          accent ? 'text-on-primary' : 'text-on-surface'
        )}
      >
        {value}
      </p>
      <p
        className={clsx(
          'font-body text-sm',
          accent ? 'text-on-primary/70' : 'text-on-surface-variant'
        )}
      >
        {label}
      </p>
    </div>
  );
}
