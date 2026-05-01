import type { Metadata } from 'next';
import './globals.css';
import Providers from '../src/components/providers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://creditbrain.in'),
  title: {
    default: 'CreditBrain — Find Your Perfect Credit Card in India',
    template: '%s | CreditBrain',
  },
  description:
    'Get personalized credit card recommendations based on your spending. Compare 75+ Indian credit cards, calculate rewards, and earn ₹50,000+ more every year. 100% free.',
  keywords:
    'best credit card India, credit card rewards, credit card comparison, airport lounge access, cashback credit card, travel credit card India, reward points credit card',
  authors: [{ name: 'CreditBrain' }],
  openGraph: {
    siteName: 'CreditBrain',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', site: '@CreditBrain' },
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#003358" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
