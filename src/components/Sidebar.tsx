'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '../store/authStore';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'credit_card', label: 'Card Catalog', path: '/cards' },
  { icon: 'balance', label: 'Compare Cards', path: '/compare' },
  { icon: 'receipt_long', label: 'Expense Profiler', path: '/expense-profiler' },
  { icon: 'auto_awesome', label: 'Recommendations', path: '/recommendations' },
  { icon: 'calculate', label: 'Simulator', path: '/simulator' },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { state, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  function navClass(path: string) {
    const isActive = pathname === path;
    return clsx(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 font-body text-sm font-medium',
      isActive
        ? 'bg-primary-fixed text-primary'
        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
    );
  }

  return (
    <aside className="flex flex-col h-full bg-surface-container-lowest border-r border-outline-variant w-[280px]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-outline-variant">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-lg">diamond</span>
        </div>
        <span className="font-headline font-bold text-lg text-primary">CreditBrain</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* User info */}
      {state.user && (
        <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant">
          <div className="w-9 h-9 bg-primary-fixed rounded-full flex items-center justify-center shrink-0">
            <span className="font-headline font-bold text-primary text-sm">
              {state.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-body font-semibold text-on-surface text-sm truncate">{state.user.name}</p>
            <p className="font-body text-on-surface-variant text-xs truncate">{state.user.email}</p>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <Link href={item.path} onClick={onClose} className={navClass(item.path)}>
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-outline-variant space-y-1">
        <Link href="/settings" onClick={onClose} className={navClass('/settings')}>
          <span className="material-symbols-outlined text-xl">settings</span>
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 font-body text-sm font-medium text-error hover:bg-error-container w-full"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
