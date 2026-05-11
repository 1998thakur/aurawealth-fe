'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicLayout from '../../components/Layout/PublicLayout';

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'description', title: 'Description of Service' },
  { id: 'user-accounts', title: 'User Accounts' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'disclaimer', title: 'Disclaimer of Warranties' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'third-party', title: 'Third-Party Links' },
  { id: 'termination', title: 'Termination' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'changes', title: 'Changes to Terms' },
  { id: 'contact', title: 'Contact Us' },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('');

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-surface to-surface py-16 px-4 border-b border-outline-variant">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-primary-fixed/30 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
          </div>
          <h1 className="font-headline font-bold text-4xl md:text-5xl text-on-surface mb-4">Terms of Service</h1>
          <p className="font-body text-base text-on-surface-variant max-w-xl mx-auto">
            Please read these terms carefully before using CreditBrain. By accessing our service, you agree to be bound by them.
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
                <p className="font-body text-xs text-on-surface-variant mb-2">Legal questions?</p>
                <Link href="/contact" className="font-body text-sm font-medium text-primary hover:underline">
                  Contact us →
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <article className="flex-1 min-w-0">
            <div className="space-y-12">

              <section id="acceptance" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">handshake</span>
                  </span>
                  Acceptance of Terms
                </h2>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  By accessing or using CreditBrain ("the Service"), you agree to be bound by these Terms of Service and our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. If you do not agree with any part of these terms, you must not use the Service. These terms apply to all visitors, registered users, and others who access the Service.
                </p>
              </section>

              <section id="description" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">info</span>
                  </span>
                  Description of Service
                </h2>
                <div className="space-y-4 font-body text-sm text-on-surface-variant leading-relaxed">
                  <p>CreditBrain is a free credit card comparison and recommendation platform. We provide:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      'A searchable database of Indian credit cards with fees, rewards, and benefits',
                      'A spending profiler to estimate annual reward value from each card',
                      'Side-by-side card comparison tools',
                      'Educational blog content about credit cards and personal finance',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5 shrink-0">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="bg-surface-container border border-outline-variant rounded-2xl p-4">
                    <p className="font-body text-sm text-on-surface-variant">
                      <strong className="text-on-surface">Important:</strong> CreditBrain is an information and comparison service only. We are not a bank, financial institution, or credit card issuer. We do not process credit card applications, hold funds, or provide financial advice regulated by SEBI or RBI.
                    </p>
                  </div>
                </div>
              </section>

              <section id="user-accounts" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">person</span>
                  </span>
                  User Accounts
                </h2>
                <div className="space-y-3 font-body text-sm text-on-surface-variant leading-relaxed">
                  <p>When you create an account, you must provide accurate and complete information. You are responsible for:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      'Maintaining the confidentiality of your account password',
                      'All activity that occurs under your account',
                      'Notifying us immediately of any unauthorised access',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-on-surface-variant/40 text-sm mt-0.5 shrink-0">arrow_right</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>You must be at least 18 years old to create an account. We reserve the right to suspend or terminate accounts that violate these terms.</p>
                </div>
              </section>

              <section id="acceptable-use" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">rule</span>
                  </span>
                  Acceptable Use
                </h2>
                <div className="space-y-3 font-body text-sm text-on-surface-variant leading-relaxed">
                  <p>You agree not to:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      'Use the Service for any unlawful purpose or in violation of applicable law',
                      'Attempt to gain unauthorised access to our systems or data',
                      'Scrape, crawl, or extract data from the Service in bulk without written permission',
                      'Impersonate any person or entity, or misrepresent your affiliation',
                      'Transmit malware, viruses, or other malicious code',
                      'Interfere with or disrupt the integrity or performance of the Service',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-error text-sm mt-0.5 shrink-0">cancel</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section id="disclaimer" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">warning</span>
                  </span>
                  Disclaimer of Warranties
                </h2>
                <div className="bg-surface-container border border-outline-variant rounded-2xl p-5 font-body text-sm text-on-surface-variant leading-relaxed space-y-3">
                  <p>The Service is provided on an <strong className="text-on-surface">"as is" and "as available"</strong> basis without warranties of any kind.</p>
                  <p>While we strive to keep card data accurate and up to date, we cannot guarantee that all information (fees, reward rates, benefits, eligibility criteria) is current at the time of your visit. Card terms are set by issuers and may change without notice.</p>
                  <p>Always verify card details directly with the issuing bank before applying.</p>
                </div>
              </section>

              <section id="liability" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">balance</span>
                  </span>
                  Limitation of Liability
                </h2>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  To the fullest extent permitted by applicable law, CreditBrain and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including but not limited to loss of profits, data, goodwill, or other intangible losses — resulting from your use of, or inability to use, the Service. Our total liability to you for any claim arising out of these terms shall not exceed ₹1,000.
                </p>
              </section>

              <section id="intellectual-property" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">copyright</span>
                  </span>
                  Intellectual Property
                </h2>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  The CreditBrain name, logo, website design, recommendation engine, and all original content (including blog articles, comparison tools, and UI) are the exclusive property of CreditBrain and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
                </p>
              </section>

              <section id="third-party" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">open_in_new</span>
                  </span>
                  Third-Party Links
                </h2>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Our Service contains links to bank and issuer websites ("Apply Now" buttons). These sites are operated by third parties and have their own privacy policies and terms of service. We have no control over, and assume no responsibility for, their content, privacy practices, or terms. We encourage you to review their policies before applying for any card.
                </p>
              </section>

              <section id="termination" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">block</span>
                  </span>
                  Termination
                </h2>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  You may delete your account at any time via your settings page. We may suspend or terminate your access to the Service at our discretion, without notice, for conduct that we determine violates these Terms, is harmful to other users or third parties, or for any other reason. Upon termination, your right to use the Service ceases immediately.
                </p>
              </section>

              <section id="governing-law" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">flag</span>
                  </span>
                  Governing Law
                </h2>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of India.
                </p>
              </section>

              <section id="changes" className="scroll-mt-28">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary-fixed/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">update</span>
                  </span>
                  Changes to Terms
                </h2>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  We may modify these Terms at any time. We will notify registered users of material changes via email and update the "Last updated" date. Your continued use of the Service after changes become effective constitutes your acceptance of the revised Terms.
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
                    If you have questions about these Terms, please contact us:
                  </p>
                  <div className="space-y-2 font-body text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">mail</span>
                      <a href="mailto:legal@creditbrain.in" className="text-primary hover:underline">legal@creditbrain.in</a>
                    </div>
                    <div className="flex items-center gap-2">
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
