import ProtectedRoute from '../../src/components/ProtectedRoute';
import ExpenseProfilerPage from '../../src/views/ExpenseProfiler/ExpenseProfilerPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <ExpenseProfilerPage />
    </ProtectedRoute>
  );
}
