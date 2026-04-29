'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const token = localStorage.getItem('aw_admin_token');
    if (!token && !isLoginPage) {
      router.replace('/admin/login');
    } else {
      setChecked(true);
    }
  }, [pathname, isLoginPage, router]);

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
          </nav>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('aw_admin_token');
            router.push('/admin/login');
          }}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
