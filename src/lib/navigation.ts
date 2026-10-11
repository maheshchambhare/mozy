/** Shared state for the page-transition system (PageTransitions) and anything that must not fight it. */
export const NAV_START = 'mozy:nav-start';
/** Fired once the transition curtain fully covers the screen (the menu closes underneath it then). */
export const NAV_COVERED = 'mozy:nav-covered';

/** Landing-page chapters that get the full ripple transition when linked, even from the home page itself. */
export const SECTION_IDS = new Set(['how', 'walk', 'worlds', 'faq', 'get']);

let navigating = false;
export const isNavigating = () => navigating;
export const setNavigating = (value: boolean) => { navigating = value; };

const sectionLabels: Record<string, string> = { how: 'How it works', walk: 'the walk', worlds: 'Worlds', faq: 'Quick answers', get: 'Get Mozy' };
const pageLabels: Record<string, string> = { '/': 'home', '/pricing': 'Pricing', '/blog': 'the Journal', '/privacy': 'Privacy', '/get': 'the store' };

/** Short, friendly name of where a link goes, for the loader ("Walking to Pricing"). */
export function destinationLabel(url: URL) {
  const id = url.hash.slice(1);
  if (id && sectionLabels[id]) return sectionLabels[id];
  if (pageLabels[url.pathname]) return pageLabels[url.pathname];
  if (url.pathname.startsWith('/blog/')) return 'the story';
  return 'the page';
}

/** Scrolls to a hash target instantly (it runs under a cover), honouring each section's scroll-margin-top. */
export function jumpTo(hash: string) {
  const element = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (element) element.scrollIntoView({ block: 'start', behavior: 'instant' });
  else window.scrollTo({ top: 0, behavior: 'instant' });
  return !!element;
}

/** Polls (setTimeout, so it also runs in background tabs) until `check` passes or the timeout ends. */
export async function waitFor(check: () => boolean, timeout = 5000) {
  const start = performance.now();
  while (!check()) {
    if (performance.now() - start > timeout) return false;
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  return true;
}

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
