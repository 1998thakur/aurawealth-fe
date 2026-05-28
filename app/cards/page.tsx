import type { Metadata } from 'next';
import CardCatalogPage from '../../src/views/Cards/CardCatalogPage';

export const metadata: Metadata = {
  title: 'Compare 75+ Credit Cards in India — Best Cards by Rewards & Benefits',
  description:
    'Browse and compare all major Indian credit cards. Filter by cashback, travel rewards, lounge access, annual fee, and more. Find the card that earns you the most.',
  keywords:
    'compare credit cards India, best cashback credit card, best travel credit card India, credit card catalog, lounge access credit card, reward points credit card 2026',
  alternates: {
    canonical: '/cards',
  },
  openGraph: {
    title: 'Compare 75+ Credit Cards in India — Best Cards by Rewards & Benefits',
    description:
      'Browse and compare all major Indian credit cards. Filter by cashback, travel rewards, lounge access, annual fee, and more.',
    type: 'website',
    url: '/cards',
  },
};

export default function Page() {
  return <CardCatalogPage />;
}
