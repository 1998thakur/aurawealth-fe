'use client';

import { useEffect } from 'react';

// global-error replaces the root layout when it fires,
// so it must include its own <html> and <body> tags.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f9f9fe' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: '#ffdad6',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              fontSize: 24,
            }}
          >
            ⚠️
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#191c1f', margin: '0 0 12px' }}>
            Critical error
          </h1>
          <p style={{ color: '#42474f', maxWidth: 360, lineHeight: 1.6, margin: '0 0 32px' }}>
            The application encountered a critical error. Please refresh the page or visit our homepage.
          </p>

          {error.digest && (
            <p style={{ fontSize: 12, color: '#72778080', marginBottom: 24 }}>
              Error ID: <code>{error.digest}</code>
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                background: '#003358',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                border: '1.5px solid #003358',
                color: '#003358',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
