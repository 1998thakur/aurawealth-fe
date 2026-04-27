import ProtectedRoute from '../../src/components/ProtectedRoute';
import DashboardPage from '../../src/views/Dashboard/DashboardPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
