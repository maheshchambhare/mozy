import { useEffect } from 'react';
import { Link } from 'wouter';
import { Moz } from '../components/story/Moz';
import { ArrowRight, Footprints } from '../components/story/icons';
import { track } from '../lib/analytics';
import '../story.css';
import '../story-404.css';

const copy = {
  page: {
    kicker: 'Error 404 · page not found',
    title: 'This page wandered off.',
    lede: <>Moz walked 404 steps looking for it and came back <span className="st-nf-nowrap">empty-pawed</span>. The link may be old, or the address may have a typo.</>,
    primary: ['/', 'Back to the home page'],
    secondary: ['/blog', 'Read the journal'],
  },
  story: {
    kicker: 'Error 404 · story not found',
    title: 'That story isn’t here.',
    lede: 'It may have moved, or it isn’t published yet. Let’s find you another good read.',
    primary: ['/blog', 'Back to the journal'],
    secondary: ['/', 'Home page'],
  },
} as const;

/** Unknown addresses: the router's catch-all route, unknown journal stories, and the prerendered dist/404.html (noindex).
 * Its night sky runs into the shared footer's evening scene (hills and fireflies). */
export default function NotFoundPage({ variant = 'page' }: { variant?: keyof typeof copy }) {
  const text = copy[variant];
  // Counts broken links people actually land on (path only, never the query string).
  useEffect(() => { track('page_not_found', { path: window.location.pathname, variant }); }, [variant]);
  return (
    <div className="st-page st-nf">
      <main id="main" className="st-nf-hero" aria-labelledby="not-found-title">
        <div className="st-nf-sky" aria-hidden="true" />
        <svg className="st-nf-moon" viewBox="0 0 220 220" aria-hidden="true">
          <defs>
            <radialGradient id="nf-moon-glow"><stop offset="0" stopColor="#fff1c9" stopOpacity="0.4" /><stop offset="1" stopColor="#fff1c9" stopOpacity="0" /></radialGradient>
            <mask id="nf-crescent"><rect width="220" height="220" fill="#fff" /><circle cx="136" cy="98" r="34" fill="#000" /></mask>
          </defs>
          <circle cx="110" cy="110" r="108" fill="url(#nf-moon-glow)" />
          <circle cx="110" cy="110" r="38" fill="#fff4d6" mask="url(#nf-crescent)" />
        </svg>
        <div className="st-wrap st-nf-inner">
          <div className="st-nf-404" aria-hidden="true">
            <span className="st-nf-digit">4</span>
            <div className="st-nf-zero">
              <span className="st-nf-ripple" />
              <span className="st-nf-ripple is-b" />
              <span className="st-nf-ripple is-c" />
              <div className="st-nf-moz is-walking"><Moz mood="walk" rim className="st-nf-mozart" /></div>
            </div>
            <span className="st-nf-digit">4</span>
          </div>
          <p className="st-nf-kicker"><Footprints size={16} />{text.kicker}</p>
          <h1 id="not-found-title" className="st-nf-title">{text.title}</h1>
          <p className="st-nf-lede">{text.lede}</p>
          <div className="st-nf-actions">
            <Link href={text.primary[0]} className="st-nf-button">{text.primary[1]} <ArrowRight size={16} /></Link>
            <Link href={text.secondary[0]} className="st-nf-ghost">{text.secondary[1]}</Link>
          </div>
          <nav className="st-nf-more" aria-label="Popular pages">
            <span>Or try</span>
            <a href="/#how">How it works</a>
            <Link href="/pricing">Pricing</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
