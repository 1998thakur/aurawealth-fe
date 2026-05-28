import type { Metadata } from 'next';
import ExpenseProfilerPage from '../../src/views/ExpenseProfiler/ExpenseProfilerPage';

export const metadata: Metadata = {
  title: 'Expense Profiler — Get Personalised Credit Card Recommendations',
  description:
    'Tell us your monthly spending across travel, dining, shopping, fuel, and more. Our engine matches you to the credit card that earns you the most rewards.',
  keywords:
    'personalised credit card recommendation India, best credit card for my spending, credit card expense profiler, spending based credit card recommendation',
  alternates: {
    canonical: '/expense-profiler',
  },
  openGraph: {
    title: 'Expense Profiler — Personalised Credit Card Recommendations | CreditBrain',
    description:
      'Profile your monthly spending and get matched to the Indian credit card that maximises your rewards.',
    type: 'website',
    url: '/expense-profiler',
  },
};

export default function Page() {
  return <ExpenseProfilerPage />;
}
