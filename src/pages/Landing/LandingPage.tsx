import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/Layout/PublicLayout';
import { useSeoMeta, injectJsonLd, removeJsonLd } from '../../hooks/useSeoMeta';

const BENTO_ITEMS = [
  {
    icon: 'shopping_bag',
    title: 'Online Shopping',
    description: 'Earn up to 5x points on Amazon, Flipkart & more. Unlock exclusive cashback offers on every purchase.',
    color: 'from-blue-50 to-indigo-50',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
  },
  {
    icon: 'flight',
    title: 'Travel & Lounge',
    description: 'Complimentary airport lounge access, zero forex markup, and accelerated miles on every flight booking.',
    color: 'from-sky-50 to-cyan-50',
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-100',
  },
  {
    icon: 'auto_awesome',
    title: 'Points Optimization',
    description: 'Smart algorithms match your spending pattern to cards that maximize your reward points every month.',
    color: 'from-violet-50 to-purple-50',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-100',
  },
  {
    icon: 'restaurant',
    title: 'Dining & Food',
    description: 'Up to 5% cashback at restaurants, Swiggy & Zomato discounts, and special dining privileges.',
    color: 'from-orange-50 to-amber-50',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: 'receipt_long',
    title: 'Profile Your Spending',
    description:
      'Tell us your monthly spend across categories — travel, dining, shopping, fuel, and more.',
  },
  {
    step: '02',
    icon: 'auto_awesome',
    title: 'Get Recommendations',
    description:
      'Our engine analyzes 75+ cards and ranks them by net annual value based on your actual spending patterns.',
  },
  {
    step: '03',
    icon: 'credit_card',
    title: 'Apply & Earn',
    description:
      'Apply directly for your best-matched card and start maximizing rewards from day one.',
  },
];

const STATS = [
  { value: '75+', label: 'Cards Analyzed', icon: 'credit_card' },
  { value: '₹50K', label: 'Avg Annual Value Unlocked', icon: 'trending_up' },
  { value: '100%', label: 'Free to Use', icon: 'verified' },
];

export default function LandingPage() {
  useSeoMeta({
    title: 'CreditBrain — Find Your Perfect Credit Card in India',
    description:
      'Get personalized credit card recommendations based on your spending. Compare 75+ Indian credit cards, calculate rewards, and earn ₹50,000+ more every year. 100% free.',
    keywords:
      'best credit card India 2024, credit card recommendations, credit card comparison India, reward points credit card, cashback credit card India, travel credit card India, airport lounge access credit card',
    ogType: 'website',
    canonical: 'https://credbrain.in/',
    ogUrl: 'https://credbrain.in/',
  });

  useEffect(() => {
    injectJsonLd('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CreditBrain',
      url: 'https://credbrain.in',
      logo: 'https://credbrain.in/favicon.svg',
      description: "India's smartest credit card advisor",
      sameAs: [],
    });

    injectJsonLd('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CreditBrain',
      url: 'https://credbrain.in',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://credbrain.in/cards?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    });

    injectJsonLd('faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Which credit card is best in India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The best credit card in India depends on your spending habits. CreditBrain analyzes 75+ cards and recommends the one that earns you the most based on your actual monthly spend across travel, dining, shopping, and more.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I compare credit cards in India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use CreditBrain\'s free card comparison tool to compare up to 3 credit cards side-by-side on rewards, annual fees, lounge access, and net annual value.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which credit card gives the most reward points in India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cards like HDFC Infinia, Axis Magnus, and ICICI Emeralde typically offer the highest reward rates. However, the best card for reward points depends on your spending categories. Use CreditBrain\'s rewards calculator to find your top earner.',
          },
        },
      ],
    });

    return () => {
      removeJsonLd('organization');
      removeJsonLd('website');
      removeJsonLd('faq');
    };
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-container text-on-primary overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/5 rounded-full translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="material-symbols-outlined text-primary-fixed-dim text-base">
                auto_awesome
              </span>
              <span className="font-body text-sm text-primary-fixed-dim font-medium">
                AI-powered card matching
              </span>
            </div>
            <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-on-primary leading-tight mb-6">
              Find Your Perfect
              <br />
              <span className="text-primary-fixed-dim">Credit Card</span>
            </h1>
            <p className="font-body text-lg text-on-primary/80 mb-8 max-w-xl leading-relaxed">
              Personalized credit card recommendations based on your actual spending. Stop leaving
              reward points on the table — earn ₹50,000+ more every year.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/expense-profiler"
                className="inline-flex items-center gap-2 bg-on-primary text-primary font-body font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-fixed transition-colors duration-200 text-base"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                Start Recommendation
              </Link>
              <Link
                to="/cards"
                className="inline-flex items-center gap-2 border-2 border-on-primary/40 text-on-primary font-body font-semibold px-7 py-3.5 rounded-xl hover:border-on-primary/80 hover:bg-white/10 transition-colors duration-200 text-base"
              >
                <span className="material-symbols-outlined">credit_card</span>
                Browse All Cards
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-6 divide-x divide-outline-variant">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col sm:flex-row items-center gap-3 px-4 text-center sm:text-left">
                <div className="w-10 h-10 bg-primary-fixed/40 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-2xl text-on-surface">{stat.value}</p>
                  <p className="font-body text-sm text-on-surface-variant">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-headline font-bold text-3xl text-on-surface mb-3">
            Cards for Every Lifestyle
          </h2>
          <p className="font-body text-on-surface-variant max-w-xl mx-auto">
            Whether you travel frequently, love dining out, or shop online — we have the perfect card
            recommendation for you.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENTO_ITEMS.map((item) => (
            <div
              key={item.title}
              className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 border border-outline-variant/40 hover:shadow-md transition-shadow duration-200`}
            >
              <div
                className={`w-11 h-11 ${item.iconBg} rounded-xl flex items-center justify-center mb-4`}
              >
                <span className={`material-symbols-outlined text-xl ${item.iconColor}`}>
                  {item.icon}
                </span>
              </div>
              <h3 className="font-headline font-bold text-on-surface mb-2">{item.title}</h3>
              <p className="font-body text-sm text-on-surface-variant mb-4 leading-relaxed">
                {item.description}
              </p>
              <Link
                to="/cards"
                className="inline-flex items-center gap-1 font-body text-sm font-semibold text-primary hover:gap-2 transition-all duration-150"
              >
                Explore cards
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-container py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline font-bold text-3xl text-on-surface mb-3">
              How It Works
            </h2>
            <p className="font-body text-on-surface-variant max-w-xl mx-auto">
              Three simple steps to finding the credit card that earns you the most.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-outline-variant" />
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.step} className="flex flex-col items-center text-center relative">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-on-primary text-3xl">
                      {step.icon}
                    </span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-7 h-7 bg-primary-fixed rounded-full flex items-center justify-center">
                    <span className="font-headline font-bold text-xs text-primary">
                      {idx + 1}
                    </span>
                  </div>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              to="/expense-profiler"
              className="inline-flex items-center gap-2 btn-primary text-base px-8 py-4"
            >
              <span className="material-symbols-outlined">rocket_launch</span>
              Get My Personalized Recommendations
            </Link>
          </div>
        </div>
      </section>

      {/* Feature callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary to-primary-container rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-headline font-bold text-3xl text-on-primary mb-4">
              Know exactly what you're earning
            </h2>
            <p className="font-body text-on-primary/80 mb-8 leading-relaxed">
              Use our interactive Rewards Calculator to simulate earnings across any card. Enter
              your monthly spend and instantly see points, cash value, and net profit — category by
              category.
            </p>
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 bg-on-primary text-primary font-body font-semibold px-6 py-3 rounded-xl hover:bg-primary-fixed transition-colors"
            >
              <span className="material-symbols-outlined">calculate</span>
              Open Rewards Calculator
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
