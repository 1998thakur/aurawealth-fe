'use client';

import Link from 'next/link';
import PublicLayout from '../../components/Layout/PublicLayout';

const stats = [
  { value: '75+', label: 'Credit Cards', icon: 'credit_card' },
  { value: '50K+', label: 'Avg Annual Value Found', icon: 'currency_rupee' },
  { value: '10+', label: 'Top Indian Banks', icon: 'account_balance' },
  { value: '100%', label: 'Free to Use', icon: 'verified' },
];

const values = [
  {
    icon: 'shield',
    title: 'Transparency First',
    description:
      'We show you the real numbers — annual fees, reward rates, hidden charges — so you can compare with complete confidence. No sponsored rankings, ever.',
  },
  {
    icon: 'psychology',
    title: 'AI-Powered Matching',
    description:
      'Our recommendation engine analyses your actual spending patterns across categories to surface cards that maximise your specific rewards, not generic lists.',
  },
  {
    icon: 'diversity_3',
    title: 'Built for India',
    description:
      'From HDFC Regalia to SBI SimplyCLICK, our database covers the cards Indians actually use — with INR-native math, lounge access data, and fuel surcharge waivers.',
  },
  {
    icon: 'lock',
    title: 'Privacy by Design',
    description:
      'Your spending data stays on your device during analysis. We never sell personal information or share it with card issuers without your explicit consent.',
  },
];

const howItWorks = [
  {
    step: '01',
    icon: 'search',
    title: 'Browse or Search',
    description: 'Filter 75+ credit cards by tier, reward type, annual fee, lounge access, and more.',
  },
  {
    step: '02',
    icon: 'receipt_long',
    title: 'Profile Your Spending',
    description: 'Tell us how much you spend on groceries, fuel, travel, dining, and online shopping each month.',
  },
  {
    step: '03',
    icon: 'auto_awesome',
    title: 'Get Matched',
    description: 'Our engine calculates your estimated annual reward value for every card and ranks them for you.',
  },
  {
    step: '04',
    icon: 'compare_arrows',
    title: 'Compare & Decide',
    description: 'Side-by-side comparisons of up to 3 cards across fees, rewards, benefits, and eligibility.',
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-primary/80 py-24 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary-fixed rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary-fixed rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-primary-fixed/20 text-primary-fixed border border-primary-fixed/30 text-xs font-body font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="material-symbols-outlined text-sm">diamond</span>
            Our Story
          </span>
          <h1 className="font-headline font-bold text-4xl md:text-6xl text-on-primary mb-6 leading-tight">
            India deserves smarter<br />credit card advice
          </h1>
          <p className="font-body text-lg text-on-primary/80 max-w-2xl mx-auto leading-relaxed">
            CreditBrain was built because we got tired of generic "top 10 cards" lists that ignore
            how you actually spend. We built the tool we wished existed.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface-container border-b border-outline-variant">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-10 h-10 bg-primary-fixed/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-primary text-xl">{s.icon}</span>
                </div>
                <div className="font-headline font-bold text-2xl text-on-surface">{s.value}</div>
                <div className="font-body text-sm text-on-surface-variant mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="font-body text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Mission</span>
            <h2 className="font-headline font-bold text-3xl text-on-surface mb-5 leading-snug">
              Help every Indian get maximum value from their credit cards
            </h2>
            <p className="font-body text-base text-on-surface-variant leading-relaxed mb-4">
              The average Indian credit card holder leaves thousands of rupees in unredeemed
              rewards on the table every year — not because they don't want value, but because
              the right card is genuinely hard to find without hours of research.
            </p>
            <p className="font-body text-base text-on-surface-variant leading-relaxed">
              CreditBrain turns that research into a 2-minute exercise. Enter your monthly
              spend, get a personalised ranking of the best cards for your profile, and apply
              with confidence.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'trending_up', label: 'Maximise rewards', color: 'bg-secondary-container text-secondary' },
              { icon: 'compare', label: 'Side-by-side compare', color: 'bg-tertiary-container/40 text-tertiary' },
              { icon: 'currency_rupee', label: 'Real INR math', color: 'bg-primary-fixed/30 text-primary' },
              { icon: 'filter_alt', label: 'Smart filters', color: 'bg-error-container/40 text-error' },
            ].map((item) => (
              <div key={item.label} className="card-surface p-5 flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                </div>
                <span className="font-body text-sm font-medium text-on-surface">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface-container py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-body text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Values</span>
            <h2 className="font-headline font-bold text-3xl text-on-surface">What we stand for</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card-surface p-6">
                <div className="w-11 h-11 bg-primary-fixed/30 rounded-2xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-xl">{v.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-base text-on-surface mb-2">{v.title}</h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="font-body text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">How it works</span>
          <h2 className="font-headline font-bold text-3xl text-on-surface">From spending profile to perfect card in minutes</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step) => (
            <div key={step.step} className="text-center">
              <div className="relative inline-block mb-5">
                <div className="w-16 h-16 bg-primary-fixed/30 rounded-3xl flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-primary text-2xl">{step.icon}</span>
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center font-headline font-bold text-on-primary text-xs">
                  {step.step.slice(1)}
                </span>
              </div>
              <h3 className="font-headline font-bold text-sm text-on-surface mb-2">{step.title}</h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-fixed rounded-full" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-headline font-bold text-3xl text-on-primary mb-4">
            Ready to find your perfect card?
          </h2>
          <p className="font-body text-on-primary/80 mb-8">
            Takes 2 minutes. No sign-up required to browse and compare.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/expense-profiler" className="inline-flex items-center gap-2 bg-on-primary text-primary font-body font-semibold text-sm px-6 py-3 rounded-2xl hover:bg-primary-fixed transition-colors">
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              Get My Recommendations
            </Link>
            <Link href="/cards" className="inline-flex items-center gap-2 border border-on-primary/40 text-on-primary font-body font-semibold text-sm px-6 py-3 rounded-2xl hover:bg-on-primary/10 transition-colors">
              Browse All Cards
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
