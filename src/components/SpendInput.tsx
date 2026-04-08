
import clsx from 'clsx';

interface SpendInputProps {
  label: string;
  icon: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export default function SpendInput({
  label,
  icon,
  value,
  onChange,
  className,
  disabled = false,
}: SpendInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    onChange(raw === '' ? 0 : parseInt(raw, 10));
  };

  const displayValue = value === 0 ? '' : value.toLocaleString('en-IN');

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <label className="flex items-center gap-2 text-on-surface-variant font-body text-sm font-medium">
        <span className="material-symbols-outlined text-base text-primary">{icon}</span>
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-on-surface-variant font-body font-semibold text-sm select-none">
          ₹
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0"
          className={clsx(
            'w-full bg-surface-container-low border border-outline-variant rounded-xl pl-7 pr-4 py-3',
            'text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary',
            'focus:border-primary transition-colors duration-200 placeholder:text-outline',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <span className="absolute right-3 text-on-surface-variant font-body text-xs select-none">
          /mo
        </span>
      </div>
    </div>
  );
}
