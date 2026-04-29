import ProtectedRoute from '../../src/components/ProtectedRoute';
import SimulatorPage from '../../src/views/Simulator/SimulatorPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <SimulatorPage />
    </ProtectedRoute>
  );
}
