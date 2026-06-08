import type { Metadata } from 'next';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import CardDetailPage from '../../../src/views/Cards/CardDetailPage';
import type { CardDetail } from '../../../src/types/cards';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://creditbrain.in';

// ISR — revalidate every hour so card data stays fresh without a full rebuild
export const revalidate = 3600;

// ── Helpers ───────────────────────────────────────────────────────────────────

function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  const absoluteBase = base.startsWith('/') ? `${SITE_URL}${base}` : base;
  return `${absoluteBase}${path}`;
}

async function fetchCard(id: string): Promise<CardDetail | null> {
  try {
    const res = await fetch(apiUrl(`/cards/${id}`), { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    // Backend wraps: { success, data: <CardDetail> }
    return (json?.data ?? json) as CardDetail;
  } catch {
    return null;
  }
}

// ── Static params (SSG) ───────────────────────────────────────────────────────

export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const res = await fetch(apiUrl('/cards?page=0&size=500'), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data ?? json;
    return (data.items ?? []).map((c: { slug: string }) => ({ id: c.slug }));
  } catch {
    return [];
  }
}

// ── SEO metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const card = await fetchCard(params.id);
  if (!card) return {};

  const slug = card.slug ?? params.id;
  const canonicalUrl = `${SITE_URL}/cards/${slug}`;
  const title = `${card.name} — Review, Rewards & Benefits 2026`;
  const description =
    card.tagline ||
    `${card.name} by ${card.issuer?.name ?? ''}. Annual fee ₹${
      card.annualFee?.toLocaleString('en-IN') ?? '0'
    }. Compare rewards, benefits, and lounge access to decide if this card is right for you.`;

  return {
    title,
    description,
    // Absolute canonical — prevents Google treating /cards/id and /cards/slug as duplicates
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${card.name} | CreditBrain`,
      description,
      url: canonicalUrl,
      type: 'website',
      images: card.cardImageUrl
        ? [{ url: card.cardImageUrl, width: 600, height: 380 }]
        : [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${card.name} | CreditBrain`,
      description,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Page({ params }: { params: { id: string } }) {
  // Fetch card data on the server so the initial HTML contains real content
  // (not loading skeletons), which is what Googlebot actually indexes.
  const card = await fetchCard(params.id);

  // Pre-populate React Query cache so CardDetailPage renders with data
  // on first render (no loading flash, no empty skeleton in SSR HTML).
  const queryClient = new QueryClient();
  if (card) {
    queryClient.setQueryData(['cards', params.id], card);
  }

  // ── Server-side JSON-LD schemas ────────────────────────────────────────────
  // These are injected into the HTML <body> before any JS runs.
  // Googlebot reads them on first crawl — no JavaScript execution required.

  const breadcrumbSchema = card
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Credit Cards',
            item: `${SITE_URL}/cards`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: card.name,
            item: `${SITE_URL}/cards/${card.slug}`,
          },
        ],
      }
    : null;

  const productSchema = card
    ? {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        name: card.name,
        description:
          card.tagline || `${card.name} credit card by ${card.issuer?.name ?? ''}`,
        image: card.cardImageUrl ?? `${SITE_URL}/og-image.png`,
        url: `${SITE_URL}/cards/${card.slug}`,
        brand: { '@type': 'Brand', name: card.issuer?.name ?? '' },
        feesAndCommissionsSpecification: `Annual fee: ₹${
          card.annualFee === 0 ? '0 (Lifetime Free)' : card.annualFee?.toLocaleString('en-IN')
        }`,
        offers: {
          '@type': 'Offer',
          price: card.annualFee ?? 0,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      }
    : null;

  return (
    <>
      {/* Server-rendered structured data — Googlebot sees these on first crawl */}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {productSchema && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}

      {/*
        HydrationBoundary passes the pre-fetched QueryClient state to the client.
        When CardDetailPage renders (both server-side for initial HTML and
        client-side after hydration), React Query finds ['cards', id] already
        populated → renders actual card content instead of loading skeletons.
        This is what makes Googlebot see real, indexable content.
      */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CardDetailPage />
      </HydrationBoundary>
    </>
  );
}
