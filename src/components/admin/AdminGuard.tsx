'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../store/authStore';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER'];

function isAdminRole(role?: string | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { state: authState } = useAuth();
  const [checked, setChecked] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }

    // Wait for the auth store to finish loading (it calls /auth/me on mount)
    if (authState.isLoading) return;

    if (!authState.isAuthenticated || !isAdminRole(authState.user?.role)) {
      router.replace('/admin/login');
    } else {
      setChecked(true);
    }
  }, [isLoginPage, authState.isLoading, authState.isAuthenticated, authState.user?.role, router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-800 text-lg">AuraWealth Admin</span>
          <nav className="flex gap-4">
            <Link
              href="/admin/blogs"
              className={`text-sm ${
                pathname?.startsWith('/admin/blogs')
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Blog Posts
            </Link>
            <Link
              href="/admin/cards"
              className={`text-sm ${
                pathname?.startsWith('/admin/cards')
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cards
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">
            {authState.user?.name} · {authState.user?.role}
          </span>
          <button
            onClick={() => {
              // Just redirect — auth store handles token cleanup on next load
              localStorage.removeItem('aw_access_token');
              router.push('/admin/login');
            }}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
