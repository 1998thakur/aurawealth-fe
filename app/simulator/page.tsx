import type { Metadata } from 'next';
import SimulatorPage from '../../src/views/Simulator/SimulatorPage';

export const metadata: Metadata = {
  title: 'Credit Card Rewards Calculator — Estimate Your Annual Earnings',
  description:
    'Calculate exactly how much you can earn from any Indian credit card based on your monthly spending. Free rewards simulator covering 75+ cards.',
  keywords:
    'credit card rewards calculator India, credit card points calculator, cashback calculator India, credit card comparison tool',
  alternates: {
    canonical: '/simulator',
  },
  openGraph: {
    title: 'Credit Card Rewards Calculator | CreditBrain',
    description:
      'Calculate exactly how much you can earn from any Indian credit card based on your monthly spending.',
    type: 'website',
    url: '/simulator',
  },
};

export default function Page() {
  return <SimulatorPage />;
}
