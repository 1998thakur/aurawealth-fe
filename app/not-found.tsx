import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found — CreditBrain',
  description: 'The page you are looking for does not exist.',
  robots: 'noindex, nofollow',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
      {/* Brand mark */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-xl">diamond</span>
        </div>
        <span className="font-headline font-bold text-xl text-primary">CreditBrain</span>
      </Link>

      {/* Error code */}
      <p className="font-headline font-extrabold text-8xl text-primary/10 leading-none select-none mb-2">
        404
      </p>

      <h1 className="font-headline font-bold text-2xl text-on-surface mb-3">
        Page not found
      </h1>
      <p className="font-body text-on-surface-variant max-w-sm mb-8 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Let&apos;s get you back on track.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/" className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">home</span>
          Back to Home
        </Link>
        <Link href="/cards" className="btn-outlined px-6 py-3 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">credit_card</span>
          Browse Cards
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 justify-center">
        {[
          { href: '/compare',         label: 'Compare Cards' },
          { href: '/simulator',       label: 'Rewards Calculator' },
          { href: '/expense-profiler',label: 'Get Recommendations' },
          { href: '/blog',            label: 'Blog' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
