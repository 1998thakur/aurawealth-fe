import type { Metadata } from 'next';
import TermsOfServicePage from '../../src/views/Legal/TermsOfServicePage';

export const metadata: Metadata = {
  title: 'Terms of Service — CreditBrain',
  description:
    'Read CreditBrain\'s Terms of Service to understand your rights and obligations when using our credit card comparison and recommendation platform.',
  openGraph: {
    title: 'Terms of Service — CreditBrain',
    description: 'Terms and conditions for using the CreditBrain platform.',
    type: 'website',
  },
};

export default function Page() {
  return <TermsOfServicePage />;
}
