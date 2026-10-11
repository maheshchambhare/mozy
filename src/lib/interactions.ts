import { track } from './analytics';

/*
 * Named events for the landing page, captured by delegated listeners so components only need data attributes:
 *  store_click    an App Store / Google Play button           a[data-store][data-placement]
 *  cta_click      a "Get Mozy" button that isn't a store link  a[data-cta][data-placement]
 *  outbound_click a link to another site (socials, mcrudra.com, Product Hunt)
 *  faq_open       an FAQ answer opened                         details inside #faq
 *  how_step       a step button in How it works                .st-how-step button
 *  section_view   a landing chapter reached the middle of the screen (observeSections)
 * PostHog autocapture, page views, page leave (with scroll depth), heatmaps and replays run alongside these.
 */
let installed = false;

const area = (element: Element) => (element.closest('footer') ? 'footer' : element.closest('header') ? 'header' : element.closest('section[id]')?.id ?? 'page');

function onClick(event: MouseEvent) {
  const target = event.target as Element | null;
  if (!target?.closest) return;
  const link = target.closest<HTMLAnchorElement>('a[href]');
  if (link?.dataset.store) {
    track('store_click', { store: link.dataset.store, placement: link.dataset.placement ?? 'unknown', path: window.location.pathname }, true);
    return;
  }
  if (link?.dataset.cta) {
    track('cta_click', { cta: link.dataset.cta, placement: link.dataset.placement ?? 'unknown', destination: link.getAttribute('href') ?? '' });
    return;
  }
  if (link && link.host && link.host !== window.location.host && /^https?:/.test(link.protocol)) {
    track('outbound_click', { href: link.href, host: link.host.replace(/^www\./, ''), label: (link.getAttribute('aria-label') || link.textContent || '').trim().slice(0, 80), area: area(link) }, true);
    return;
  }
  const step = target.closest<HTMLElement>('.st-how-step');
  if (step && target.closest('button')) {
    track('how_step', { step: Number(step.dataset.index ?? -1) + 1, title: step.querySelector('.st-how-step-title')?.textContent?.trim() ?? '' });
  }
}

function onToggle(event: Event) {
  const details = event.target as HTMLDetailsElement;
  if (!(details instanceof HTMLDetailsElement) || !details.open || !details.closest('#faq')) return;
  const all = [...details.closest('#faq')!.querySelectorAll('details')];
  track('faq_open', { question: details.querySelector('summary')?.textContent?.trim() ?? '', position: all.indexOf(details) + 1 });
}

/** Installs the page-wide listeners once (call from main). */
export function installInteractionTracking() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  document.addEventListener('click', onClick, true);
  document.addEventListener('toggle', onToggle, true);
}

/**
 * Sends section_view once per chapter per page view, when the chapter crosses the middle band of the screen
 * (this works for tall sticky chapters too). Returns a cleanup for the landing page's effect.
 */
export function observeSections(root: HTMLElement) {
  if (typeof IntersectionObserver === 'undefined') return () => {};
  const sections = [...root.querySelectorAll<HTMLElement>('main > section')];
  const seen = new Set<string>();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target as HTMLElement;
      const name = element.id || (element.classList.contains('st-hero') ? 'hero' : 'section');
      if (seen.has(name)) continue;
      seen.add(name);
      track('section_view', { section: name, order: sections.indexOf(element) + 1 });
      observer.unobserve(element);
    }
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
  return () => observer.disconnect();
}
