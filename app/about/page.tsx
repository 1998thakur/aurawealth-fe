import type { Metadata } from 'next';
import AboutPage from '../../src/views/About/AboutPage';

export const metadata: Metadata = {
  title: 'About CreditBrain — India\'s Smartest Credit Card Advisor',
  description:
    'Learn how CreditBrain helps Indians find the best credit cards for their spending profile. Our AI-powered recommendation engine analyses your spending to maximise rewards.',
  keywords:
    'about CreditBrain, credit card comparison India, best credit card advisor India, credit card recommendation engine',
  openGraph: {
    title: 'About CreditBrain — India\'s Smartest Credit Card Advisor',
    description:
      'Learn how CreditBrain helps Indians find the best credit cards for their spending profile.',
    type: 'website',
  },
};

export default function Page() {
  return <AboutPage />;
}
