import type { Metadata } from 'next';
import { Suspense } from 'react';
import CardComparisonPage from '../../src/views/Compare/CardComparisonPage';

export const metadata: Metadata = {
  title: 'Compare Credit Cards Side-by-Side',
  description:
    'Compare up to 3 Indian credit cards side-by-side on rewards, annual fees, lounge access, and net annual value. Free card comparison tool.',
  keywords:
    'compare credit cards India, credit card comparison tool, HDFC vs Axis credit card, side by side credit card comparison',
  alternates: {
    canonical: '/compare',
  },
  openGraph: {
    title: 'Compare Credit Cards Side-by-Side | CreditBrain',
    description:
      'Compare up to 3 Indian credit cards side-by-side on rewards, annual fees, lounge access, and net annual value.',
    type: 'website',
    url: '/compare',
  },
};

export default function Page() {
  return (
    <Suspense>
      <CardComparisonPage />
    </Suspense>
  );
}
