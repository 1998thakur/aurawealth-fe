import type { Metadata } from 'next';
import CardDetailPage from '../../../src/views/Cards/CardDetailPage';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://creditbrain.in';

function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  const absoluteBase = base.startsWith('/') ? `${SITE_URL}${base}` : base;
  return `${absoluteBase}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const res = await fetch(apiUrl(`/cards/${params.id}`), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    const json = await res.json();
    const card = json?.data ?? json;

    const slug: string = card.slug ?? params.id;
    const canonical = `/cards/${slug}`;
    const title = `${card.name} — Review, Rewards & Benefits 2026`;
    const description =
      card.tagline ||
      `Compare ${card.name} reward rate, annual fee, and benefits. Is this ${card.issuer?.name ?? ''} credit card worth it for you?`;

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title: `${card.name} | CreditBrain`,
        description,
        url: canonical,
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
  } catch {
    return {};
  }
}

export default function Page() {
  return <CardDetailPage />;
}
