import { Suspense } from 'react';
import CardComparisonPage from '../../src/views/Compare/CardComparisonPage';

export default function Page() {
  return (
    <Suspense>
      <CardComparisonPage />
    </Suspense>
  );
}
