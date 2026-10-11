import { useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { socialLinks } from '../data/landing';
import { FounderSticker } from './FounderSticker';
import { Logo } from './Logo';
import '../story-footer.css';

// Fireflies over the hills: left, height above the bottom of the scene, and when each one starts glowing.
const fireflies: [string, string, number][] = [
  ['6%', '34%', 0], ['17%', '56%', 1.5], ['29%', '24%', 3.1], ['41%', '48%', 0.7], ['54%', '30%', 2.4], ['66%', '58%', 1.1], ['78%', '36%', 3.6], ['91%', '22%', 2.7],
];

/**
 * The one footer every page uses. It opens with a small evening scene that picks up the colour of whatever sits
 * above it (a sunset on the cream pages, the darkening meadow on the home page, the night sky on the 404 page),
 * with parallax hills that end in the footer's own colour, and closes with Mahesh's sticker peeking over the line.
 */
export function SiteFooter() {
  const scene = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = scene.current;
    if (!element || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
    let frame = 0;
    let visible = false;
    // 0 while the scene is still below the screen, 1 once it has scrolled fully into view.
    const update = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      // At the very bottom (or on a page too short to scroll) the scene always settles completely.
      const progress = atBottom ? 1 : Math.min(1, Math.max(0, (window.innerHeight - box.top) / (box.height + window.innerHeight * 0.3)));
      element.style.setProperty('--fp', progress.toFixed(3));
    };
    const request = () => { if (visible && !frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) request(); }, { rootMargin: '160px 0px' });
    update();
    observer.observe(element);
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => { observer.disconnect(); window.removeEventListener('scroll', request); window.removeEventListener('resize', request); cancelAnimationFrame(frame); };
  }, []);
  return (
    <footer className="st-footer">
      <div className="st-foot-scene" ref={scene} aria-hidden="true">
        <div className="st-foot-sky" />
        <div className="st-foot-stars" />
        <div className="st-foot-sun" />
        <div className="st-foot-layer is-far"><svg viewBox="0 0 1440 200" preserveAspectRatio="none"><path d="M0 200V44C110 24 230 10 360 16C500 23 610 46 750 43C890 40 990 14 1130 9C1260 5 1360 20 1440 30V200Z" /></svg></div>
        <div className="st-foot-layer is-mid"><svg viewBox="0 0 1440 200" preserveAspectRatio="none"><path d="M0 200V40C140 22 280 12 420 20C560 28 670 50 810 47C950 44 1070 20 1210 16C1330 13 1400 24 1440 30V200Z" /></svg></div>
        <div className="st-foot-fireflies">
          {fireflies.map(([left, bottom, delay]) => <span key={left} style={{ left, bottom, animationDelay: `${delay}s` } as CSSProperties} />)}
        </div>
        <div className="st-foot-layer is-near"><svg viewBox="0 0 1440 200" preserveAspectRatio="none"><path d="M0 200V34C150 18 300 10 450 18C600 26 710 44 870 40C1030 36 1150 18 1290 15C1370 14 1415 20 1440 24V200Z" /></svg></div>
      </div>
      <div className="st-footer-body">
        <div className="st-footer-inner">
          <div className="st-footer-brand">
            <Logo />
            <p>Use tech without letting it use you. Made by Mahesh Chambhare at <a href="https://mcrudra.com/">mcrudra.com</a>.</p>
          </div>
          <nav className="st-footer-nav" aria-label="Footer">
            <div><p className="st-footer-head">Mozy</p><a href="/#how">How it works</a><a href="/#worlds">Worlds</a><Link href="/pricing">Pricing</Link><Link href="/blog">Journal</Link></div>
            <div><p className="st-footer-head">Company</p><a href="https://mcrudra.com/">mcrudra.com</a><Link href="/privacy">Privacy</Link><a href="https://mcrudra.com/terms">Terms</a><a href="mailto:hello@mcrudra.com">Contact</a></div>
            <div><p className="st-footer-head">Follow</p>{socialLinks.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</div>
          </nav>
        </div>
        <div className="st-footer-base">
          <FounderSticker />
          <p className="st-footer-legal">© {new Date().getFullYear()} mcrudra.com. App Store is a service mark of Apple Inc. Google Play is a trademark of Google LLC.</p>
        </div>
      </div>
    </footer>
  );
}
