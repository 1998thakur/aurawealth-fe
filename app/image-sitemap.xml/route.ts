import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://creditbrain.in';

function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  const absoluteBase = base.startsWith('/') ? `${SITE_URL}${base}` : base;
  return `${absoluteBase}${path}`;
}

interface CardForImage {
  slug: string;
  name: string;
  cardImageUrl?: string;
  cardImageThumbnailUrl?: string;
}

interface PagedResponse<T> {
  items: T[];
  hasMore: boolean;
}

async function fetchAllCards(): Promise<CardForImage[]> {
  const all: CardForImage[] = [];
  let page = 0;
  const size = 100;
  while (true) {
    try {
      const res = await fetch(apiUrl(`/cards?page=${page}&size=${size}`), {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json = await res.json();
      const data: PagedResponse<CardForImage> = json?.data ?? json;
      all.push(...data.items);
      if (!data.hasMore) break;
      page++;
    } catch {
      break;
    }
  }
  return all;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const rawCards = await fetchAllCards();
  // Deduplicate by slug — backend pagination may return the same card on multiple pages
  const cards = Array.from(new Map(rawCards.map((c) => [c.slug, c])).values());

  const urlEntries = cards
    .filter((card) => card.cardImageUrl || card.cardImageThumbnailUrl)
    .map((card) => {
      const imageUrl = card.cardImageUrl || card.cardImageThumbnailUrl!;
      return `  <url>
    <loc>${SITE_URL}/cards/${escapeXml(card.slug)}</loc>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(card.name)}</image:title>
    </image:image>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
