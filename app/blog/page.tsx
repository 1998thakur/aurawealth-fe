import type { Metadata } from 'next';
import BlogListPage from '../../src/views/Blog/BlogListPage';

export const metadata: Metadata = {
  title: 'Credit Card Tips, Guides & Comparisons — CreditBrain Blog',
  description:
    'Expert guides on the best credit cards in India, reward optimisation strategies, card comparisons, and tips to maximise cashback and travel benefits.',
  keywords:
    'credit card blog India, credit card tips India, best credit card guides, reward points tips, credit card cashback tips, travel card India guide',
  openGraph: {
    title: 'Credit Card Tips, Guides & Comparisons — CreditBrain Blog',
    description:
      'Expert guides on the best credit cards in India, reward optimisation strategies, card comparisons, and tips to maximise cashback and travel benefits.',
    type: 'website',
  },
};

export default function Page() {
  return <BlogListPage />;
}
