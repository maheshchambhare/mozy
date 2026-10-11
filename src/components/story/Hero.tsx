import { useRef } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import gsap from 'gsap';
import { useScene } from '../../hooks/useScene';
import type { SceneContext } from '../../hooks/useScene';
import { AppTile } from './AppTile';
import { Footprints, Moon } from './icons';
import { DoomscrollScreen } from './DoomscrollScreen';
import { playDoomscroll } from './doomscrollTimeline';
import { PhoneFrame } from './Phone';
import { StoreBadges } from './StoreBadges';

function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { x: number; y: number; r: number; twinkle: boolean; delay: number };

// Stars keep clear of the copy, where a dot reads as a stray full stop. On two columns the copy fills the left
// of the sky (x 35 to 710, y from 116 down, in sky units, at every desktop size). On one column it covers the
// top and the sky is scaled up, so phones and tablets get smaller stars of their own around the phone art.
const stars = (() => {
  const next = random(23);
  const scatter = (count: number, x0: number, x1: number, y0: number, y1: number, rMax: number): Star[] =>
    Array.from({ length: count }, (_, index) => ({ x: Math.round(x0 + next() * (x1 - x0)), y: Math.round(y0 + next() * (y1 - y0)), r: +(0.5 + next() * (rMax - 0.5)).toFixed(2), twinkle: index % 3 === 0, delay: +(next() * 4).toFixed(2) }));
  return {
    wide: scatter(96, 0, 1440, 0, 560, 2).filter(star => !(star.x > 20 && star.x < 760 && star.y > 108)),
    narrow: scatter(30, 340, 1100, 500, 680, 1.4),
  };
})();

const starDot = (star: Star, index: number) => (
  <circle key={index} cx={star.x} cy={star.y} r={star.r} fill="#fff" className={star.twinkle ? 'st-twinkle' : undefined} style={star.twinkle ? { animationDelay: `${star.delay}s` } : undefined} opacity={star.twinkle ? undefined : 0.75} />
);

// A distant skyline that is still awake at 2:17 AM: a few windows flicker on and off.
const skyline = (() => {
  const next = random(41);
  const buildings: { x: number; w: number; h: number }[] = [];
  const windows: { x: number; y: number; flicker: boolean; delay: number }[] = [];
  for (let x = 0; x < 1440;) {
    const w = 28 + Math.round(next() * 46);
    const h = 40 + Math.round(next() * 130);
    buildings.push({ x, w, h });
    for (let wy = 742 - h + 12; wy < 732; wy += 16) {
      for (let wx = x + 7; wx < x + w - 9; wx += 12) {
        if (next() > 0.82) windows.push({ x: wx, y: wy, flicker: next() > 0.7, delay: +(next() * 6).toFixed(2) });
      }
    }
    x += w + 4 + Math.round(next() * 10);
  }
  return { buildings, windows };
})();

/** The hero's night sky: stars, moon, the lit skyline and the hills. Also used by the share banners (src/og). */
export function HeroSky() {
  return (
    <svg className="st-hero-sky" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0e1a" /><stop offset="0.62" stopColor="#141a38" /><stop offset="1" stopColor="#262c57" /></linearGradient>
        <radialGradient id="hero-moon-glow"><stop offset="0" stopColor="#fff1c9" stopOpacity="0.45" /><stop offset="1" stopColor="#fff1c9" stopOpacity="0" /></radialGradient>
        <mask id="hero-crescent"><rect width="1440" height="900" fill="#fff" /><circle cx="1236" cy="138" r="36" fill="#000" /></mask>
        {/* The skyline fades out behind the copy column so city lights never sit under text. */}
        <linearGradient id="hero-skyline-fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0.3" stopColor="#fff" stopOpacity="0" /><stop offset="0.6" stopColor="#fff" stopOpacity="1" /></linearGradient>
        <mask id="hero-skyline-mask"><rect width="1440" height="900" fill="url(#hero-skyline-fade)" /></mask>
        {/* The hills darken into #0c1125, the exact colour "How it works" starts with, so the two sections meet without an edge. */}
        <linearGradient id="hero-hill-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2149" /><stop offset="0.55" stopColor="#121836" /><stop offset="1" stopColor="#0c1125" /></linearGradient>
        <linearGradient id="hero-hill-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#111734" /><stop offset="1" stopColor="#0c1125" /></linearGradient>
        <linearGradient id="hero-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c1125" stopOpacity="0" /><stop offset="1" stopColor="#0c1125" /></linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#hero-sky)" />
      <g className="st-hero-stars">
        <g className="st-hero-stars-wide">
          {stars.wide.map(starDot)}
          <path className="st-shooting-star" d="M760 60 l140 46" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g className="st-hero-stars-narrow">{stars.narrow.map(starDot)}</g>
      </g>
      <circle cx="1210" cy="150" r="130" fill="url(#hero-moon-glow)" />
      <circle cx="1210" cy="150" r="40" fill="#fff4d6" mask="url(#hero-crescent)" />
      <g className="st-skyline" mask="url(#hero-skyline-mask)">
        {skyline.buildings.map(building => <rect key={building.x} x={building.x} y={742 - building.h} width={building.w} height={building.h + 40} rx="3" fill="#18203f" />)}
        {skyline.windows.map((light, index) => <rect key={index} x={light.x} y={light.y} width="5" height="7" rx="1" fill="#ffd58a" className={light.flicker ? 'st-flicker' : undefined} style={light.flicker ? { animationDelay: `${light.delay}s` } : undefined} opacity={light.flicker ? undefined : 0.85} />)}
      </g>
      <path d="M0 760 C180 726 360 740 560 752 C760 764 940 724 1140 730 C1300 735 1380 750 1440 756 L1440 900 L0 900 Z" fill="url(#hero-hill-back)" />
      <path d="M0 822 C200 798 420 818 650 810 C880 802 1120 784 1440 806 L1440 900 L0 900 Z" fill="url(#hero-hill-front)" />
      <rect y="800" width="1440" height="100" fill="url(#hero-mist)" />
    </svg>
  );
}

function heroScene({ root, first, desktop, motion }: SceneContext) {
  const art = first('.st-hero-art');
  const phone = first('.st-hero-phone');
  if (!art || !phone) return;
  // Scale the 300×640 phone to the art column's height.
  const fit = () => art.style.setProperty('--hero-scale', String(Math.max(0.5, Math.min(0.92, (art.clientHeight - 40) / 640))));
  fit();
  window.addEventListener('resize', fit);
  if (motion) {
    gsap.set(phone, { transformPerspective: 1400, rotationY: -18, rotationX: 8, rotation: 3 });
    gsap.to(phone, { rotationY: -4, rotationX: 2, rotation: 0, y: desktop ? -40 : -20, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 } });
    gsap.to(first('.st-hero-copy') ?? [], { y: desktop ? -70 : -30, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.5 } });
    gsap.to(first('.st-hero-stars') ?? [], { y: 60, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 1 } });
    // The phone plays its doomscroll-then-lock story on a loop while the hero is on screen.
    const screen = first('.st-doom');
    if (screen) playDoomscroll(screen, root, first('.st-hero-buzz'));
  }
  return () => window.removeEventListener('resize', fit);
}

// Pointer tilt for fine pointers only; CSS reads the two variables.
function tilt(event: PointerEvent<HTMLElement>) {
  if (!window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--px', ((event.clientX - box.left) / box.width - 0.5).toFixed(3));
  event.currentTarget.style.setProperty('--py', ((event.clientY - box.top) / box.height - 0.5).toFixed(3));
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  useScene(root, heroScene);
  return (
    <section className="st-hero" aria-labelledby="hero-title" ref={root} onPointerMove={tilt} onPointerLeave={event => { event.currentTarget.style.setProperty('--px', '0'); event.currentTarget.style.setProperty('--py', '0'); }}>
      <HeroSky />
      <div className="st-hero-inner">
        <div className="st-hero-copy">
          <p className="st-clock"><Moon size={16} /><span>2:17 AM</span><span aria-hidden="true">·</span><span>Walk to earn screen time</span></p>
          <h1 id="hero-title">Your phone now charges you <span className="st-hero-accent">in steps.<svg viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 C 40 2, 80 15, 120 8 S 200 3, 237 10" /></svg></span></h1>
          <p className="st-hero-lede">Mozy locks the apps you pick, like Instagram, TikTok or YouTube, and unlocks them with minutes you earn by walking. Every 34 steps buys one minute.</p>
          <StoreBadges placement="LANDING-HERO" className="st-hero-badges" />
          <p className="st-hero-fine">iPhone · iOS 16.4+ <span aria-hidden="true">·</span> Android 8.0+ <span aria-hidden="true">·</span> No account needed</p>
        </div>
        <div className="st-hero-art" aria-hidden="true">
          <div className="st-hero-glow" />
          <div className="st-hero-phone"><div className="st-hero-buzz"><PhoneFrame dark><DoomscrollScreen /></PhoneFrame></div></div>
          <div className="st-hero-tile is-a" data-depth="70"><span style={{ '--float': '5.5s' } as CSSProperties}><AppTile app="tiktok" size={60} locked /></span></div>
          <div className="st-hero-tile is-b" data-depth="-40"><span style={{ '--float': '6.5s' } as CSSProperties}><AppTile app="youtube" size={54} locked /></span></div>
          <div className="st-hero-tile is-c" data-depth="100"><span style={{ '--float': '4.8s' } as CSSProperties}><AppTile app="x" size={46} locked /></span></div>
          <p className="st-hero-note">it’s 2:17 AM. Moz says no.</p>
        </div>
      </div>
      <a className="st-scroll-cue" href="#how"><span>Scroll to see how</span><Footprints size={28} color="#FF9A4D" className="st-bob" /></a>
    </section>
  );
}
