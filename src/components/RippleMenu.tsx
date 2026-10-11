import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useLocation } from 'wouter';
import { socialLinks } from '../data/landing';
import { COMPANY } from '../data/company';
import type { useCtaAttributes } from '../hooks/usePlatform';
import { NAV_COVERED, prefersReducedMotion } from '../lib/navigation';
import { centerOf, fadeIn, fadeOut, rippleBack, rippleIn } from '../lib/ripple';
import { Moz } from './story/Moz';
import { ArrowRight, ArrowUpRight } from './story/icons';
import { RippleRings } from './transitions/MozLoader';

const menuLinks = [
  ['/#how', 'How it works', 'Walk first, scroll later'],
  ['/#worlds', 'Worlds', 'Worlds that grow with your streak'],
  ['/pricing', 'Pricing', 'Know the price before you install'],
  ['/blog', 'Journal', 'Stories about screen time'],
  ['/#faq', 'FAQ', 'Quick answers'],
] as const;

/** Elements outside the menu that must not be reachable while it is open. */
const OUTSIDE = 'main, .st-footer, .st-hud, .st-skip';

/**
 * The phone menu: tapping the button drops a ripple from it that floods the screen with the night sky, then the
 * links rise in one by one and Moz pops up in his pond. Closing pulls the ripple back into the button. Choosing a
 * link hands over to the page transition: once its curtain covers the screen, the menu disappears underneath.
 */
export function RippleMenu({ cta, ctaAttributes }: { cta: string; ctaAttributes: ReturnType<typeof useCtaAttributes> }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [location] = useLocation();
  const layer = useRef<HTMLDivElement>(null);
  const rings = useRef<SVGSVGElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const openRef = useRef(false);

  const lock = (on: boolean) => {
    document.documentElement.classList.toggle('st-menu-open', on);
    document.querySelectorAll<HTMLElement>(OUTSIDE).forEach(element => { element.inert = on; });
  };

  const close = useCallback((instant = false, returnFocus = true) => {
    const element = layer.current;
    if (!element || !openRef.current) return;
    openRef.current = false;
    timeline.current?.kill();
    const finish = () => { setOpen(false); lock(false); if (returnFocus) toggle.current?.focus({ preventScroll: true }); };
    if (instant) { gsap.set(element, { visibility: 'hidden', clipPath: 'none', opacity: 1 }); finish(); return; }
    const reduced = prefersReducedMotion();
    const out = gsap.timeline();
    if (!reduced) out.to(element.querySelectorAll('.st-rmenu-item, .st-rmenu-reveal'), { opacity: 0, y: -10, duration: 0.18, stagger: 0.02, ease: 'power1.in' });
    out.add(reduced ? fadeOut(element) : rippleBack(element, centerOf(toggle.current), 0.55), reduced ? 0 : 0.1);
    out.add(finish);
    timeline.current = out;
  }, []);

  // Open: runs after React has rendered the menu's contents, so every animated element exists.
  useEffect(() => {
    const element = layer.current;
    if (!open || !element || openRef.current) return;
    openRef.current = true;
    lock(true);
    timeline.current?.kill();
    const reduced = prefersReducedMotion();
    const intro = reduced ? fadeIn(element) : rippleIn(element, rings.current, centerOf(toggle.current), 0.78);
    if (!reduced) {
      intro.fromTo(element.querySelectorAll('.st-rmenu-item'), { y: 46, opacity: 0, rotate: 1.5 }, { y: 0, opacity: 1, rotate: 0, duration: 0.62, stagger: 0.065, ease: 'power3.out' }, 0.3);
      intro.fromTo(element.querySelectorAll('.st-rmenu-reveal'), { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 0.55);
      const moz = element.querySelector('.st-rmenu-moz');
      if (moz) intro.fromTo(moz, { yPercent: 60, scale: 0.6, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }, 0.5);
    }
    intro.add(() => element.querySelector<HTMLElement>('.st-rmenu-item a')?.focus({ preventScroll: true }), reduced ? 0.2 : 0.4);
    timeline.current = intro;
  }, [open]);

  useEffect(() => {
    const onNavigate = () => close(true, false);
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const wide = window.matchMedia('(min-width: 861px)');
    const onWide = () => { if (wide.matches) close(true, false); };
    window.addEventListener(NAV_COVERED, onNavigate);
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => { window.removeEventListener(NAV_COVERED, onNavigate); window.removeEventListener('keydown', onKey); wide.removeEventListener('change', onWide); lock(false); };
  }, [close]);

  const current = (href: string) => (href === '/pricing' && location === '/pricing') || (href === '/blog' && location.startsWith('/blog'));

  return (
    <>
      <button
        type="button"
        ref={toggle}
        className="st-burger"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        data-menu-toggle
        onClick={() => { if (openRef.current) close(); else { setReady(true); setOpen(true); } }}
      >
        <span /><span /><span />
      </button>
      {ready && createPortal(
        <>
        <div id="site-menu" className="st-rmenu" ref={layer} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open} inert={!open} data-menu-open={open}>
          <div className="st-rmenu-sky" aria-hidden="true" />
          <div className="st-rmenu-body">
            <p className="st-rmenu-kicker st-rmenu-reveal">Where to?</p>
            <ol className="st-rmenu-list">
              {menuLinks.map(([href, label, hint], index) => (
                <li className="st-rmenu-item" key={href}>
                  <a href={href} className={current(href) ? 'is-current' : undefined} aria-current={current(href) ? 'page' : undefined} data-menu-link>
                    <span className="st-rmenu-num">0{index + 1}</span>
                    <span className="st-rmenu-text"><span className="st-rmenu-label">{label}</span><span className="st-rmenu-hint">{current(href) ? 'You’re here' : hint}</span></span>
                    <span className="st-rmenu-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="st-rmenu-foot">
              <div className="st-rmenu-reveal">
                <a className="st-rmenu-cta" href={cta} {...ctaAttributes}>Get Mozy <ArrowUpRight size={18} /></a>
                <p className="st-rmenu-note">iPhone and Android · No account</p>
              </div>
              {(
                <div className="st-rmenu-moz" aria-hidden="true">
                  <div className="st-loader-pond is-menu">
                    <span className="st-loader-wave" /><span className="st-loader-wave is-b" /><span className="st-loader-wave is-c" />
                    <div className="st-loader-moz"><Moz mood="wave" className="st-loader-mozart" /></div>
                  </div>
                </div>
              )}
            </div>
            <nav className="st-rmenu-small st-rmenu-reveal" aria-label="More links">
              <a href="/privacy">Privacy</a>
              <a href={`mailto:${COMPANY.email}`}>Contact</a>
              {socialLinks.slice(0, 3).map(([name, href]) => <a key={name} href={href} target="_blank" rel="noopener noreferrer">{name}</a>)}
            </nav>
          </div>
        </div>
        <RippleRings ref={rings} className="st-rmenu-rings" />
        </>,
        document.body,
      )}
    </>
  );
}
