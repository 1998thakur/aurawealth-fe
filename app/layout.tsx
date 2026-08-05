import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Providers from '../src/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'CreditBrain',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', site: '@CreditBrain' },
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://creditbrain.in';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CreditBrain',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/og-image.png`,
    width: 1200,
    height: 630,
  },
  description: "India's smartest credit card advisor — compare 75+ credit cards and find your best match.",
  areaServed: { '@type': 'Country', name: 'India' },
  sameAs: ['https://twitter.com/CreditBrain'],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CreditBrain',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/cards?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <meta name="theme-color" content="#003358" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Material Symbols: preconnect early, load non-blocking via Script below */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Server-rendered structured data — visible to Googlebot on first crawl */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        {/* Material Symbols: load stylesheet after interactive to avoid render-blocking.
            globals.css hides icon text (visibility:hidden) until ms-ready class is added. */}
        <Script id="load-material-symbols" strategy="afterInteractive">
          {`(function(){
            var l=document.createElement('link');
            l.rel='stylesheet';
            l.href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
            l.onload=function(){document.documentElement.classList.add('ms-ready');};
            document.head.appendChild(l);
          })();`}
        </Script>
        {/* Google Analytics — loads after page is interactive, never blocks render */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WZ2BE0GHRC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WZ2BE0GHRC');
          `}
        </Script>
      </body>
    </html>
  );
}
