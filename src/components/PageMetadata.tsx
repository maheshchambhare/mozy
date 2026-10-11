import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { pageMeta } from '../data/metadata';
export default function PageMetadata() {
  const [location] = useLocation();
  useEffect(() => {
    let cancelled = false;
    async function update() {
      // Held stories resolve to "not found" (noindex), matching the prerendered build.
      const article = location.startsWith('/blog/') ? (await import('../data/articles')).articles.find(item => item.slug === location.slice(6)) : undefined;
      if (cancelled) return;
      const meta = pageMeta(location, article);
      document.title = meta.title;
      // A not-found page has no canonical URL or og:url (the prerendered 404.html ships without them), so they are
      // removed there and recreated when the visitor moves on to a real page.
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!meta.found) canonical?.remove();
      else {
        if (!canonical) {canonical=document.createElement('link');canonical.setAttribute('rel','canonical');document.head.append(canonical);}
        canonical.setAttribute('href',meta.url);
      }
      if (!meta.found) document.querySelector('meta[property="og:url"]')?.remove();
      const values: Record<string, string> = {'name:description':meta.description,'name:robots':meta.robots,'property:og:title':meta.ogTitle,'property:og:description':meta.ogDescription,'property:og:image':meta.image,'property:og:type':meta.type,'name:twitter:title':meta.ogTitle,'name:twitter:description':meta.ogDescription,'name:twitter:image':meta.image};
      if (meta.found) values['property:og:url']=meta.url;
      for (const [key,value] of Object.entries(values)) {
        const [attribute,...parts]=key.split(':');const name=parts.join(':');
        let tag=document.querySelector(`meta[${attribute}="${name}"]`);
        if (!tag) {tag=document.createElement('meta');tag.setAttribute(attribute,name);document.head.append(tag);}
        tag.setAttribute('content',value);
      }
    }
    void update();
    return () => {cancelled=true;};
  },[location]);
  return null;
}
