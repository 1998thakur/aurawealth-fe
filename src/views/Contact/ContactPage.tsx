'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicLayout from '../../components/Layout/PublicLayout';

const contactChannels = [
  {
    icon: 'mail',
    label: 'General Enquiries',
    value: 'hello@creditbrain.in',
    href: 'mailto:hello@creditbrain.in',
    color: 'bg-primary-fixed/30 text-primary',
  },
  {
    icon: 'privacy_tip',
    label: 'Privacy & Data',
    value: 'privacy@creditbrain.in',
    href: 'mailto:privacy@creditbrain.in',
    color: 'bg-secondary-container text-secondary',
  },
  {
    icon: 'gavel',
    label: 'Legal & Compliance',
    value: 'legal@creditbrain.in',
    href: 'mailto:legal@creditbrain.in',
    color: 'bg-tertiary-container/40 text-tertiary',
  },
];

const faqs = [
  {
    q: 'Is CreditBrain free to use?',
    a: 'Yes, completely. We never charge users for browsing cards, comparing them, or getting personalised recommendations.',
  },
  {
    q: 'How do you make money?',
    a: 'We may earn a referral fee from card issuers when you click "Apply Now" and are approved. This never influences our rankings or recommendations — cards are always ranked by value for your spending profile.',
  },
  {
    q: 'Is my spending data safe?',
    a: 'Your spending data is processed on our servers only to generate recommendations and is never sold to third parties or shared with card issuers. See our Privacy Policy for full details.',
  },
  {
    q: 'How often is the card data updated?',
    a: 'Our team reviews and updates card information regularly. However, always verify the latest terms directly with the issuing bank before applying.',
  },
  {
    q: 'Can I suggest a card that\'s not listed?',
    a: 'Absolutely! Use the contact form and include the card name and issuer. We\'ll review and add it to our database.',
  },
];

type FormState = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Enquiry', message: '' });
  const [formState, setFormState] = useState<FormState>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const subjects = ['General Enquiry', 'Card Data Error', 'Feature Request', 'Privacy / Data Request', 'Business Partnership', 'Other'];

  function set(key: keyof typeof form, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setFormState('sending');
    // Simulate submission — replace with real API call when backend endpoint exists
    await new Promise((r) => setTimeout(r, 1200));
    setFormState('success');
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-surface to-surface py-16 px-4 border-b border-outline-variant">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-primary-fixed/30 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-primary text-2xl">forum</span>
          </div>
          <h1 className="font-headline font-bold text-4xl md:text-5xl text-on-surface mb-4">Get in Touch</h1>
          <p className="font-body text-base text-on-surface-variant max-w-xl mx-auto">
            Have a question, found a data error, or want to partner with us? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Contact channels + FAQ */}
          <div className="space-y-8">
            {/* Channels */}
            <div>
              <h2 className="font-headline font-bold text-base text-on-surface mb-4">Reach us directly</h2>
              <div className="space-y-3">
                {contactChannels.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    className="card-surface p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${c.color}`}>
                      <span className="material-symbols-outlined text-lg">{c.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-xs text-on-surface-variant">{c.label}</p>
                      <p className="font-body text-sm font-medium text-primary group-hover:underline truncate">{c.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="bg-secondary-container/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary text-lg">schedule</span>
                <span className="font-body font-semibold text-sm text-on-surface">Typical response time</span>
              </div>
              <p className="font-body text-sm text-on-surface-variant">
                We aim to respond to all enquiries within <strong className="text-on-surface">1–2 business days</strong>.
              </p>
            </div>

            {/* Quick links */}
            <div className="card-surface p-5">
              <p className="font-body font-semibold text-sm text-on-surface mb-3">Quick links</p>
              <ul className="space-y-2">
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'About CreditBrain', href: '/about' },
                  { label: 'Blog', href: '/blog' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-body text-sm text-primary hover:underline flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            {formState === 'success' ? (
              <div className="card-surface p-12 text-center">
                <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-secondary text-3xl">check_circle</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-3">Message sent!</h3>
                <p className="font-body text-sm text-on-surface-variant mb-6 max-w-sm mx-auto">
                  Thanks for reaching out. We'll get back to you at <strong className="text-on-surface">{form.email}</strong> within 1–2 business days.
                </p>
                <button
                  onClick={() => { setForm({ name: '', email: '', subject: 'General Enquiry', message: '' }); setFormState('idle'); }}
                  className="btn-outlined text-sm px-5 py-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="card-surface p-6 sm:p-8">
                <h2 className="font-headline font-bold text-xl text-on-surface mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label-field">Name <span className="text-error">*</span></label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="Your full name"
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-field">Email <span className="text-error">*</span></label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-field">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => set('subject', e.target.value)}
                      className="input-field bg-white"
                    >
                      {subjects.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label-field">Message <span className="text-error">*</span></label>
                    <textarea
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                      placeholder="Tell us how we can help…"
                      required
                      rows={6}
                      className="input-field resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="font-body text-xs text-on-surface-variant">
                      By submitting, you agree to our{' '}
                      <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                    </p>
                    <button
                      type="submit"
                      disabled={formState === 'sending'}
                      className="btn-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-60"
                    >
                      {formState === 'sending' ? (
                        <>
                          <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">send</span>
                          Send Message
                        </>
                      )}
                    </button>
                  </div>

                  {formState === 'error' && (
                    <div className="bg-error-container text-error px-4 py-3 rounded-xl text-sm font-body">
                      Something went wrong. Please try again or email us directly.
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="font-headline font-bold text-2xl text-on-surface">Frequently asked questions</h2>
            <p className="font-body text-sm text-on-surface-variant mt-2">Can't find what you're looking for? Send us a message above.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card-surface overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-body font-semibold text-sm text-on-surface pr-4">{faq.q}</span>
                  <span className={`material-symbols-outlined text-on-surface-variant text-xl shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
