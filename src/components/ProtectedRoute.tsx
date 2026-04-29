'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../store/authStore';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER'];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.isLoading) return;
    if (!state.isAuthenticated) {
      router.replace('/auth');
    } else if (state.user?.role && ADMIN_ROLES.includes(state.user.role)) {
      router.replace('/admin/blogs');
    }
  }, [state.isLoading, state.isAuthenticated, state.user?.role, router]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-body text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) return null;
  if (state.user?.role && ADMIN_ROLES.includes(state.user.role)) return null;

  return <>{children}</>;
}
