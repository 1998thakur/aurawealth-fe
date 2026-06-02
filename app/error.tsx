'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error tracking service (e.g. Sentry) here
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
      {/* Brand mark */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-xl">diamond</span>
        </div>
        <span className="font-headline font-bold text-xl text-primary">CreditBrain</span>
      </Link>

      {/* Icon */}
      <div className="w-16 h-16 bg-error-container rounded-2xl flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-error text-3xl">error</span>
      </div>

      <h1 className="font-headline font-bold text-2xl text-on-surface mb-3">
        Something went wrong
      </h1>
      <p className="font-body text-on-surface-variant max-w-sm mb-8 leading-relaxed">
        An unexpected error occurred. You can try again or head back to the homepage.
      </p>

      {/* Error digest for support reference */}
      {error.digest && (
        <p className="font-body text-xs text-on-surface-variant/50 mb-6">
          Error ID: <code className="font-mono">{error.digest}</code>
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="btn-primary px-6 py-3 text-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Try Again
        </button>
        <Link href="/" className="btn-outlined px-6 py-3 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">home</span>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
