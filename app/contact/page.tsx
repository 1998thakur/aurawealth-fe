import type { Metadata } from 'next';
import ContactPage from '../../src/views/Contact/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Us — CreditBrain',
  description:
    'Get in touch with the CreditBrain team. We\'re here to help with card data queries, feature requests, partnership enquiries, and more.',
  keywords: 'contact CreditBrain, credit card help India, CreditBrain support',
  openGraph: {
    title: 'Contact Us — CreditBrain',
    description: 'Get in touch with the CreditBrain team.',
    type: 'website',
  },
};

export default function Page() {
  return <ContactPage />;
}
