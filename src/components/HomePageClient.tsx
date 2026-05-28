'use client';

import { useAuth } from '../store/authStore';
import LandingPage from '../views/Landing/LandingPage';
import DashboardPage from '../views/Dashboard/DashboardPage';

/**
 * Handles auth-based routing for the homepage.
 * - Server render (and initial client render): shows LandingPage → SSR-safe for Google
 * - After auth check completes and user is authenticated: shows DashboardPage
 * - Never shows a loading spinner — LandingPage is always the default
 */
export default function HomePageClient() {
  const { state } = useAuth();

  if (state.isAuthenticated && !state.isLoading) {
    return <DashboardPage />;
  }

  return <LandingPage />;
}
