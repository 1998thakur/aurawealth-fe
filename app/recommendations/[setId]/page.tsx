import ProtectedRoute from '../../../src/components/ProtectedRoute';
import RecommendationsPage from '../../../src/views/Recommendations/RecommendationsPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <RecommendationsPage />
    </ProtectedRoute>
  );
}
