'use client';

import { useAuth } from '../src/store/authStore';
import LandingPage from '../src/views/Landing/LandingPage';
import DashboardPage from '../src/views/Dashboard/DashboardPage';

export default function Page() {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state.isAuthenticated) {
    return <DashboardPage />;
  }

  return <LandingPage />;
}
