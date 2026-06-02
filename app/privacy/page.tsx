import type { Metadata } from 'next';
import PrivacyPolicyPage from '../../src/views/Legal/PrivacyPolicyPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — CreditBrain',
  description:
    'Read CreditBrain\'s Privacy Policy to understand how we collect, use, and protect your personal information.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy — CreditBrain',
    description: 'How CreditBrain collects, uses, and protects your personal information.',
    url: '/privacy',
    type: 'website',
  },
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
