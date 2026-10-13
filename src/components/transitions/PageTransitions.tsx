import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { createPortal } from 'react-dom';
import { useLocation } from 'wouter';
import { NAV_COVERED, NAV_START, SECTION_IDS, destinationLabel, isNavigating, jumpTo, prefersReducedMotion, setNavigating, waitFor } from '../../lib/navigation';
import { centerOf, fadeIn, fadeOut, rippleIn, rippleOut, type Point } from '../../lib/ripple';
import { prefetchRoute } from '../../routes';
import { MozLoader, RippleRings } from './MozLoader';
import '../../story-nav.css';

/** Moves keyboard and screen-reader focus to the new page's main content after a route change. */
function focusMain() {
  const main = document.getElementById('main');
  if (!main) return;
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  main.focus({ preventScroll: true });
}

/**
 * Every internal link (pages, and the landing-page chapters) goes through one transition: a night-sky curtain
 * ripples in from where you tapped, Moz walks on a pond while the next page loads and the scroll position is
 * set, then the curtain opens from the middle like a spreading ripple. In-page anchors (contents lists, skip
 * links), external links, store links and modified clicks behave normally.
 */
const noSubscribe = () => () => {};

export function PageTransitions() {
  // False on the server and while the prerendered home page hydrates, true right after: the curtain is not in that HTML.
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  const [, navigate] = useLocation();
  const [label, setLabel] = useState('');
  const curtain = useRef<HTMLDivElement>(null);
  const rings = useRef<SVGSVGElement>(null);
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  useEffect(() => {

    const go = async (url: URL, origin: Point) => {
      const layer = curtain.current;
      if (!layer || isNavigating()) return;
      setNavigating(true);
      prefetchRoute(url.pathname);
      window.dispatchEvent(new CustomEvent(NAV_START));
      setLabel(destinationLabel(url));
      const reduced = prefersReducedMotion();
      const samePath = url.pathname === window.location.pathname;
      const target = url.pathname + url.search + url.hash;
      try {
        const coveredAt = performance.now();
        const loader = layer.querySelector('.st-curtain-loader');
        if (reduced) await fadeIn(layer).then();
        else {
          // Moz rises out of his pond as the curtain finishes covering the screen.
          gsap.set(loader, { opacity: 0, y: 16, scale: 0.94 });
          await rippleIn(layer, rings.current, origin, 0.56).to(loader, { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'back.out(1.6)' }, '-=0.3').then();
        }
        window.dispatchEvent(new CustomEvent(NAV_COVERED));
        if (samePath) window.history.pushState(window.history.state, '', target);
        else navigateRef.current(target);
        await waitFor(() => window.location.pathname === url.pathname && !document.querySelector('.st-route-loading') && !!document.querySelector('main'));
        if (url.hash) await waitFor(() => !!document.getElementById(decodeURIComponent(url.hash.slice(1))), 2500);
        jumpTo(url.hash);
        // Let scrubbed scroll scenes catch up under the curtain, and give Moz a moment on screen.
        const hold = reduced ? 60 : Math.max(180, 880 - (performance.now() - coveredAt));
        await new Promise(resolve => setTimeout(resolve, hold));
        jumpTo(url.hash);
        if (reduced) await fadeOut(layer).then();
        else {
          // Moz sinks back into the pond, then the curtain opens from the same spot like a spreading ripple.
          const reveal = gsap.timeline();
          reveal.to(loader, { opacity: 0, y: 12, scale: 0.9, duration: 0.18, ease: 'power2.in' }, 0);
          reveal.add(rippleOut(layer, rings.current, centerOf(loader?.querySelector('.st-loader-pond') ?? loader), 0.64), 0.15);
          await reveal.then();
        }
        if (!samePath) focusMain();
      } finally {
        setNavigating(false);
      }
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download') || 'noTransition' in link.dataset) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || /\.[a-z0-9]{2,5}$/i.test(url.pathname)) return;
      const samePath = url.pathname === window.location.pathname;
      if (samePath && url.hash && !SECTION_IDS.has(decodeURIComponent(url.hash.slice(1)))) return;
      event.preventDefault();
      const origin = event.clientX || event.clientY ? { x: event.clientX, y: event.clientY } : centerOf(link);
      void go(url, origin);
    };

    const onIntent = (event: Event) => {
      const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname !== window.location.pathname) prefetchRoute(url.pathname);
    };

    // Capture phase, so this runs before the router's own link handler (which skips prevented clicks).
    document.addEventListener('click', onClick, true);
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent);
    document.addEventListener('touchstart', onIntent, { passive: true });
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('focusin', onIntent);
      document.removeEventListener('touchstart', onIntent);
    };
  }, []);

  if (!mounted) return null;
  return createPortal(
    <>
      <div className="st-curtain" ref={curtain} aria-hidden="true">
        <div className="st-curtain-sky" />
        <MozLoader label={label} className="st-curtain-loader" />
      </div>
      <RippleRings ref={rings} className="st-curtain-rings" />
      <p className="st-sr-only" role="status" aria-live="polite">{label ? `Opening ${label}` : ''}</p>
    </>,
    document.body,
  );
}
