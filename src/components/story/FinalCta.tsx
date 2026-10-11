import { useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'wouter';
import { PRODUCT_FACTS } from '../../data/productFacts';
import { useScene } from '../../hooks/useScene';
import type { SceneContext } from '../../hooks/useScene';
import { ArrowUpRight } from './icons';
import { StoreBadges } from './StoreBadges';
import { FinalScene, FinalSky } from './world/FinalScene';
import '../../story-world.css';

const usd = (value?: number) => `$${value?.toFixed(2) ?? ''}`;

/** Gentle parallax while the finale scrolls in: the far hills lag, the near hill (with Moz) catches up, the sun rises. */
function setupFinal({ root, select, desktop, motion }: SceneContext) {
  if (!motion) return;
  const scrollTrigger = { trigger: root, start: 'top bottom', end: 'bottom bottom', scrub: 0.8 };
  const depth = desktop ? 1 : 0.55;
  const layers: [string, number][] = [['.st-final-far', 36], ['.st-final-mid', 70], ['.st-final-near', 110], ['.st-final-scene .st-final-sun', 120], ['.st-final-birds', -40]];
  for (const [selector, distance] of layers) {
    gsap.fromTo(select(selector), { y: distance * depth }, { y: 0, ease: 'none', scrollTrigger });
  }
}

type FinalCtaProps = {
  eyebrow?: string;
  title?: string;
  lede?: string;
  /** Analytics placement for the store badges. */
  placement?: string;
  /** The one-line price summary under the badges (the pricing page leaves it out). */
  showPrice?: boolean;
  link?: { href: string; label: string };
};

/** The download finale on a bright day: store badges, a QR code for laptops and the price, over green hills.
 * The home page uses the defaults; other pages (pricing) pass their own words. */
export function FinalCta({
  eyebrow = 'The next chapter is yours',
  title = 'Your next scroll starts with a walk.',
  lede = 'Lock the apps that eat your evenings. Earn them back, one walk at a time.',
  placement = 'LANDING-FINAL',
  showPrice = true,
  link = { href: '/pricing', label: 'Pricing details' },
}: FinalCtaProps = {}) {
  const root = useRef<HTMLElement>(null);
  useScene(root, setupFinal);
  const { monthlyUsd, yearlyUsd } = PRODUCT_FACTS.platforms.ios.pricing;
  return (
    <section className="st-final" id="get" aria-labelledby="final-title" ref={root}>
      <span id="download" className="st-anchor" />
      <FinalSky />
      <div className="st-wrap st-final-inner">
        <p className="st-eyebrow st-final-eyebrow">{eyebrow}</p>
        <h2 id="final-title" className="st-final-title">{title}</h2>
        <p className="st-final-lede">{lede}</p>
        <div className="st-final-actions">
          <StoreBadges placement={placement} className="is-stacked" />
          <div className="st-final-qr">
            <img src="/assets/story/mozy-qr.svg" width="112" height="112" alt="QR code that opens Mozy in your phone’s app store" />
            <p><strong>On a laptop?</strong> Scan to get Mozy on your phone.</p>
          </div>
        </div>
        {showPrice ? <p className="st-final-price">Free download. iPhone: Mozy Premium, {usd(monthlyUsd)} a month or {usd(yearlyUsd)} a year (US). Android: in-app purchases.</p> : null}
        {/* Hash targets live on the home page, so they stay plain anchors; routes use the client router. */}
        {link.href.includes('#')
          ? <a href={link.href} className="st-final-link">{link.label} <ArrowUpRight size={14} /></a>
          : <Link href={link.href} className="st-final-link">{link.label} <ArrowUpRight size={14} /></Link>}
      </div>
      <FinalScene />
    </section>
  );
}
