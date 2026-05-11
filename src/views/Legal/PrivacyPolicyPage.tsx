'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicLayout from '../../components/Layout/PublicLayout';

const sections = [
  { id: 'information-we-collect', title: 'Information We Collect' },
  { id: 'how-we-use', title: 'How We Use Your Information' },
  { id: 'data-sharing', title: 'Data Sharing & Disclosure' },
  { id: 'cookies', title: 'Cookies & Tracking' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'your-rights', title: 'Your Rights' },
  { id: 'children', title: "Children's Privacy" },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact Us' },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('');

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-surface to-surface py-16 px-4 border-b border-outline-variant">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-primary-fixed/30 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-primary text-2xl">privacy_tip</span>
          </div>
          <h1 className="font-headline font-bold text-4xl md:text-5xl text-on-surface mb-4">Privacy Policy</h1>
          <p className="font-body text-base text-on-surface-variant max-w-xl mx-auto">
            We are committed to protecting your personal information and being transparent about how we use it.
          </p>
          <p className="font-body text-sm text-on-surface-variant/60 mt-4">
            Last updated: <span className="font-medium text-on-surface-variant">May 2026</span>
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sticky TOC */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="font-body text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-4">Contents</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setActiveSection(s.id)}
                    className={`block font-body text-sm px-3 py-2 rounded-xl transition-colors ${
                      activeSection === s.id
                        ? 'bg-primary-fixed/30 text-primary font-medium'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
              <div className="mt-8 p-4 bg-secondary-container/30 rounded-2xl">
                <p className="font-body text-xs text-on-surface-variant mb-2">Questions about your data?</p>
                <Link href="/contact" className="font-body text-sm font-medium text-primary hover:underline">
                  Contact us →
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <article className="flex-1 min-w-0 prose-custom">
            <div className="space-y-12">

              <section id="information-we-collect" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">database</span>
                  </span>
                  Information We Collect
                </h2>
                <div className="space-y-4 font-body text-sm text-on-surface-variant leading-relaxed">
                  <p><strong className="text-on-surface">Information you provide directly:</strong> When you create an account, we collect your name, email address, and password. If you use our expense profiler, we collect the spending amounts you enter by category.</p>
                  <p><strong className="text-on-surface">Automatically collected data:</strong> We collect standard web analytics data including your IP address, browser type, device type, pages visited, and session duration. This data is anonymised and aggregated.</p>
                  <p><strong className="text-on-surface">What we do NOT collect:</strong> We do not collect your credit card numbers, bank account details, PAN card, Aadhaar, or any other sensitive financial identifiers. CreditBrain is an advisory tool, not a financial services provider.</p>
                </div>
              </section>

              <section id="how-we-use" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">settings</span>
                  </span>
                  How We Use Your Information
                </h2>
                <div className="space-y-3 font-body text-sm text-on-surface-variant leading-relaxed">
                  <p>We use the information we collect to:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      'Provide, operate, and improve the CreditBrain service',
                      'Personalise card recommendations based on your spending profile',
                      'Send account-related emails (password resets, security alerts)',
                      'Analyse aggregated usage patterns to improve our recommendation engine',
                      'Comply with legal obligations under applicable Indian law',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5 shrink-0">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>We will never use your personal data for purposes beyond what is described here without your explicit consent.</p>
                </div>
              </section>

              <section id="data-sharing" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">share</span>
                  </span>
                  Data Sharing & Disclosure
                </h2>
                <div className="space-y-4 font-body text-sm text-on-surface-variant leading-relaxed">
                  <p><strong className="text-on-surface">We do not sell your data.</strong> CreditBrain does not sell, rent, or trade your personal information to third parties.</p>
                  <p>We may share your data with:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      'Service providers who assist in operating our platform (e.g., cloud hosting, analytics) — under strict data processing agreements',
                      'Law enforcement or regulatory authorities when required by law',
                      'A successor entity in the event of a merger or acquisition — you will be notified in advance',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-on-surface-variant/40 text-sm mt-0.5 shrink-0">arrow_right</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section id="cookies" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">cookie</span>
                  </span>
                  Cookies & Tracking
                </h2>
                <div className="space-y-4 font-body text-sm text-on-surface-variant leading-relaxed">
                  <p>We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how our service is used.</p>
                  <div className="grid sm:grid-cols-3 gap-3 not-prose">
                    {[
                      { type: 'Essential', desc: 'Required for the site to function. Cannot be disabled.', color: 'bg-secondary-container/40' },
                      { type: 'Analytics', desc: 'Help us understand usage patterns. Anonymised and aggregated.', color: 'bg-primary-fixed/20' },
                      { type: 'Preferences', desc: 'Remember your settings and personalisation choices.', color: 'bg-tertiary-container/30' },
                    ].map((c) => (
                      <div key={c.type} className={`${c.color} rounded-2xl p-4`}>
                        <p className="font-body font-semibold text-sm text-on-surface mb-1">{c.type}</p>
                        <p className="font-body text-xs text-on-surface-variant">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p>You can disable non-essential cookies through your browser settings at any time.</p>
                </div>
              </section>

              <section id="data-security" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">lock</span>
                  </span>
                  Data Security
                </h2>
                <div className="space-y-4 font-body text-sm text-on-surface-variant leading-relaxed">
                  <p>We implement industry-standard security measures to protect your data, including:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      'TLS encryption for all data in transit',
                      'Encrypted storage for all passwords (bcrypt hashing)',
                      'Role-based access controls on our internal systems',
                      'Regular security audits and dependency updates',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5 shrink-0">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>No method of transmission over the internet is 100% secure. If you believe your account has been compromised, contact us immediately.</p>
                </div>
              </section>

              <section id="your-rights" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">gavel</span>
                  </span>
                  Your Rights
                </h2>
                <div className="space-y-4 font-body text-sm text-on-surface-variant leading-relaxed">
                  <p>Under applicable Indian data protection law, you have the right to:</p>
                  <div className="grid sm:grid-cols-2 gap-3 not-prose">
                    {[
                      { icon: 'visibility', right: 'Access', desc: 'Request a copy of the personal data we hold about you' },
                      { icon: 'edit', right: 'Correct', desc: 'Update or correct inaccurate information' },
                      { icon: 'delete', right: 'Delete', desc: 'Request deletion of your account and associated data' },
                      { icon: 'block', right: 'Object', desc: 'Object to certain types of data processing' },
                    ].map((r) => (
                      <div key={r.right} className="card-surface p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-lg mt-0.5">{r.icon}</span>
                        <div>
                          <p className="font-body font-semibold text-sm text-on-surface">{r.right}</p>
                          <p className="font-body text-xs text-on-surface-variant mt-0.5">{r.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p>To exercise any of these rights, contact us at <a href="mailto:privacy@creditbrain.in" className="text-primary hover:underline">privacy@creditbrain.in</a>. We will respond within 30 days.</p>
                </div>
              </section>

              <section id="children" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">child_care</span>
                  </span>
                  Children's Privacy
                </h2>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  CreditBrain is not directed at individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
                </p>
              </section>

              <section id="changes" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">update</span>
                  </span>
                  Changes to This Policy
                </h2>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  We may update this Privacy Policy from time to time. When we make significant changes, we will notify registered users by email and update the "Last updated" date at the top of this page. Continued use of CreditBrain after changes constitutes your acceptance of the updated policy.
                </p>
              </section>

              <section id="contact" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">mail</span>
                  </span>
                  Contact Us
                </h2>
                <div className="card-surface p-6">
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4">
                    If you have questions, concerns, or requests regarding your privacy or this policy, please reach out:
                  </p>
                  <div className="space-y-2 font-body text-sm">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-base">mail</span>
                      <a href="mailto:privacy@creditbrain.in" className="text-primary hover:underline">privacy@creditbrain.in</a>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-base">language</span>
                      <Link href="/contact" className="text-primary hover:underline">Use our contact form</Link>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </article>
        </div>
      </div>
    </PublicLayout>
  );
}
