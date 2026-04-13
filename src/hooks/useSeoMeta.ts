import { useEffect } from 'react';

interface SeoMeta {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

export function useSeoMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType,
  canonical,
}: SeoMeta) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description || '');
    setMeta('og:title', ogTitle || title, true);
    setMeta('og:description', ogDescription || description || '', true);
    setMeta('og:type', ogType || 'website', true);
    if (ogImage) setMeta('og:image', ogImage, true);
    if (canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
    return () => {
      document.title = 'AuraWealth – Smart Credit Card Advisor';
    };
  }, [title, description, ogTitle, ogDescription, ogImage, ogType, canonical]);
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
