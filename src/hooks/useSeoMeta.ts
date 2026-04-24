import { useEffect } from 'react';

interface SeoMeta {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  canonical?: string;
  noIndex?: boolean;
  // Article-specific OG properties (used on blog detail pages)
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
}

const SITE_NAME = 'CreditBrain';
const DEFAULT_OG_IMAGE = 'https://credbrain.in/og-image.png';

export function useSeoMeta({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType,
  ogUrl,
  canonical,
  noIndex = false,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags,
}: SeoMeta) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    setMeta('description', description || '');
    if (keywords) setMeta('keywords', keywords);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Open Graph
    setMeta('og:title', ogTitle || fullTitle, true);
    setMeta('og:description', ogDescription || description || '', true);
    setMeta('og:type', ogType || 'website', true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:image', ogImage || DEFAULT_OG_IMAGE, true);
    if (ogUrl) setMeta('og:url', ogUrl, true);

    // Article OG properties (only set when provided; remove stale ones on cleanup)
    if (articlePublishedTime) setMeta('article:published_time', articlePublishedTime, true);
    if (articleModifiedTime)  setMeta('article:modified_time',  articleModifiedTime,  true);
    if (articleSection)       setMeta('article:section',        articleSection,        true);
    // article:tag allows multiple values — one <meta> per tag
    if (articleTags && articleTags.length > 0) {
      // Remove previously injected article:tag metas first
      document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
      articleTags.forEach(tag => {
        const el = document.createElement('meta');
        el.setAttribute('property', 'article:tag');
        el.content = tag;
        document.head.appendChild(el);
      });
    }

    // Twitter / X
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', ogTitle || fullTitle);
    setMeta('twitter:description', ogDescription || description || '');
    setMeta('twitter:image', ogImage || DEFAULT_OG_IMAGE);

    // Canonical link
    const canonicalHref = canonical || (typeof window !== 'undefined' ? window.location.href : '');
    if (canonicalHref) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonicalHref;
    }

    return () => {
      document.title = 'CreditBrain — India\'s Smartest Credit Card Advisor';
      // Clean up article:tag metas on unmount
      document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogType, ogUrl, canonical,
      noIndex, articlePublishedTime, articleModifiedTime, articleSection, articleTags]);
}

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Injects a JSON-LD <script> block. Call inside useEffect. */
export function injectJsonLd(id: string, schema: object) {
  removeJsonLd(id);
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = `jsonld-${id}`;
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

export function removeJsonLd(id: string) {
  document.getElementById(`jsonld-${id}`)?.remove();
}
