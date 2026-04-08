import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import AuthPage from './pages/Auth/AuthPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ExpenseProfilerPage from './pages/ExpenseProfiler/ExpenseProfilerPage';
import CardCatalogPage from './pages/Cards/CardCatalogPage';
import CardDetailPage from './pages/Cards/CardDetailPage';
import RecommendationsPage from './pages/Recommendations/RecommendationsPage';
import CardComparisonPage from './pages/Compare/CardComparisonPage';
import SimulatorPage from './pages/Simulator/SimulatorPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/expense-profiler" element={<ExpenseProfilerPage />} />
      <Route path="/cards" element={<CardCatalogPage />} />
      <Route path="/cards/:id" element={<CardDetailPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="/recommendations/:setId" element={<RecommendationsPage />} />
      <Route path="/compare" element={<CardComparisonPage />} />
      <Route path="/simulator" element={<SimulatorPage />} />
      <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
