/**
 * generate-sitemap.mjs
 *
 * Generates public/sitemap.xml by fetching live data from the API.
 * Run: node scripts/generate-sitemap.mjs
 * Or add to build: "build": "tsc && vite build && node scripts/generate-sitemap.mjs"
 *
 * Env vars:
 *   SITE_URL   — canonical origin (default: https://credbrain.in)
 *   API_URL    — backend base URL (default: http://localhost:8080)
 *   OUT_FILE   — output path (default: public/sitemap.xml)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SITE_URL = process.env.SITE_URL || 'https://credbrain.in';
const API_URL  = process.env.API_URL  || 'http://localhost:8080';
const OUT_FILE = process.env.OUT_FILE || join(ROOT, 'public', 'sitemap.xml');

// ─── Static routes ────────────────────────────────────────────────────────────

const STATIC_ROUTES = [
  { loc: '/',                 changefreq: 'weekly',  priority: '1.0' },
  { loc: '/cards',            changefreq: 'daily',   priority: '0.9' },
  { loc: '/compare',          changefreq: 'weekly',  priority: '0.7' },
  { loc: '/simulator',        changefreq: 'monthly', priority: '0.7' },
  { loc: '/expense-profiler', changefreq: 'monthly', priority: '0.6' },
  { loc: '/blog',             changefreq: 'daily',   priority: '0.8' },
];

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

async function fetchAllCards() {
  try {
    const data = await fetchJson(`${API_URL}/api/v1/cards?page=0&size=200`);
    return (data?.data?.items ?? []).map((c) => c.id);
  } catch (e) {
    console.warn('⚠️  Could not fetch cards:', e.message);
    return [];
  }
}

async function fetchAllBlogSlugs() {
  try {
    const slugs = [];
    let page = 0;
    while (true) {
      const data = await fetchJson(`${API_URL}/api/v1/blog?page=${page}&size=50`);
      const items = data?.data?.items ?? [];
      slugs.push(...items.map((p) => p.slug));
      if (!data?.data?.hasMore) break;
      page++;
    }
    return slugs;
  } catch (e) {
    console.warn('⚠️  Could not fetch blog slugs:', e.message);
    return [];
  }
}

// ─── XML builder ─────────────────────────────────────────────────────────────

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const parts = [`  <url>`, `    <loc>${SITE_URL}${loc}</loc>`];
  if (lastmod)    parts.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority)   parts.push(`    <priority>${priority}</priority>`);
  parts.push(`  </url>`);
  return parts.join('\n');
}

function buildSitemap(entries) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries.map(urlEntry),
    '</urlset>',
  ].join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🗺️  Generating sitemap...');
  const today = new Date().toISOString().split('T')[0];

  const [cardIds, blogSlugs] = await Promise.all([fetchAllCards(), fetchAllBlogSlugs()]);

  const entries = [
    // Static pages
    ...STATIC_ROUTES.map((r) => ({ ...r, lastmod: today })),
    // Card detail pages
    ...cardIds.map((id) => ({
      loc: `/cards/${id}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.8',
    })),
    // Blog posts
    ...blogSlugs.map((slug) => ({
      loc: `/blog/${slug}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ];

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, buildSitemap(entries), 'utf-8');

  console.log(`✅ sitemap.xml written to ${OUT_FILE}`);
  console.log(`   Static: ${STATIC_ROUTES.length} | Cards: ${cardIds.length} | Blog: ${blogSlugs.length}`);
  console.log(`   Total URLs: ${entries.length}`);
}

main().catch((e) => { console.error('❌ Sitemap generation failed:', e); process.exit(1); });
