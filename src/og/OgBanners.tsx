/**
 * Open Graph share banners (1200 x 630), drawn in code from the landing page's own art: the hero's night sky, the
 * phone's lock screen, the walk's stone gate and the park finale, plus Moz in his existing poses and the real app
 * icon. Not imported by the app; scripts/og/render.mjs renders them (see variants.ts) to PNG. Image paths are
 * relative to public/ (the render page sets <base> there). Claims come from MCX's verified facts.
 */
import type { ReactNode } from 'react';
import { AppTile } from '../components/story/AppTile';
import { HeroSky } from '../components/story/Hero';
import { Moz } from '../components/story/Moz';
import { PhoneFrame, ShieldScreen } from '../components/story/Phone';
import { AppGlyphs } from '../components/story/WalkChapter';
import { Cloud, Gate as GateWrap } from '../components/story/walk/SceneryParts';
import { Daisy, FinalScene, FinalSky } from '../components/story/world/FinalScene';

const SITE = 'mozy.mcrudra.com';
type Point = [number, number];

/** The real app icon, with iOS-style rounded corners. */
function AppIcon({ size, className = '' }: { size: number; className?: string }) {
  return <img className={`og-icon ${className}`} src="assets/icon.png" width={size} height={size} alt="" style={{ width: size, height: size, borderRadius: size * 0.2237 }} />;
}

function Brand({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return <div className={`og-brand is-${tone}`}><AppIcon size={64} /><span className="og-brand-name">Mozy</span></div>;
}

function Site({ tone = 'dark', children }: { tone?: 'dark' | 'light'; children?: ReactNode }) {
  return <p className={`og-site is-${tone}`}>{children ?? <>iPhone &amp; Android <span aria-hidden="true">·</span> {SITE}</>}</p>;
}

function Badges({ className = '' }: { className?: string }) {
  return (
    <div className={`og-badges ${className}`}>
      <img src="assets/app-store-badge.svg" alt="Download on the App Store" width="176" height="52" />
      <img src="assets/google-play-badge.svg" alt="Get it on Google Play" width="176" height="52" />
    </div>
  );
}

function Swoosh() {
  return <svg className="og-swoosh" viewBox="0 0 240 16" preserveAspectRatio="none"><path d="M3 10 C 40 2, 80 15, 120 8 S 200 3, 237 10" /></svg>;
}

/** Fine film grain over everything, so flat colour reads as print. */
function Grain() {
  return <div className="og-grain" />;
}

/**
 * Moz's footsteps along a gentle curve (banner pixels, from -> via -> to): round prints alternating either side of
 * the line, fading in towards him. `size` scales the first and last print, so a trail can recede into the distance.
 */
function Trail({ from, via, to, steps, color, size = [1, 1], className }: { from: Point; via: Point; to: Point; steps: number; color: string; size?: Point; className: string }) {
  const prints = Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const u = 1 - t;
    const x = u * u * from[0] + 2 * u * t * via[0] + t * t * to[0];
    const y = u * u * from[1] + 2 * u * t * via[1] + t * t * to[1];
    const angle = (Math.atan2(u * (via[1] - from[1]) + t * (to[1] - via[1]), u * (via[0] - from[0]) + t * (to[0] - via[0])) * 180) / Math.PI;
    const scale = size[0] + (size[1] - size[0]) * t;
    return { x, y, angle, scale, side: i % 2 ? 1 : -1, opacity: 0.3 + 0.7 * t };
  });
  return (
    <svg className={`og-trail ${className}`} viewBox="0 0 1200 630" aria-hidden="true">
      {prints.map(({ x, y, angle, scale, side, opacity }, i) => (
        <ellipse key={i} cx="0" cy={side * 7} rx="9" ry="5.6" fill={color} opacity={opacity.toFixed(2)} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${scale.toFixed(2)})`} />
      ))}
    </svg>
  );
}

/** The hero's crescent moon, redrawn so it can sit clear of the site line. */
function Moon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 260 260" aria-hidden="true">
      <defs>
        <radialGradient id="og-moon-glow"><stop offset="0" stopColor="#fff1c9" stopOpacity="0.45" /><stop offset="1" stopColor="#fff1c9" stopOpacity="0" /></radialGradient>
        <mask id="og-moon-crescent"><rect width="260" height="260" fill="#fff" /><circle cx="156" cy="118" r="36" fill="#000" /></mask>
      </defs>
      <circle cx="130" cy="130" r="130" fill="url(#og-moon-glow)" />
      <circle cx="130" cy="130" r="40" fill="#fff4d6" mask="url(#og-moon-crescent)" />
    </svg>
  );
}

/** E: launch poster. The real icon in orbit, locked apps circling it, Moz walking his step trail. */
function Launch() {
  const tiles: [Parameters<typeof AppTile>[0]['app'], number, string][] = [['instagram', 88, 'is-1'], ['tiktok', 72, 'is-2'], ['youtube', 68, 'is-3'], ['x', 56, 'is-4']];
  return (
    <div className="og og-e">
      <div className="og-stars" />
      <div className="og-e-aurora" />
      <svg className="og-e-orbits" viewBox="0 0 1200 630">
        <ellipse cx="868" cy="300" rx="300" ry="118" transform="rotate(-14 868 300)" />
        <ellipse cx="868" cy="300" rx="226" ry="176" transform="rotate(20 868 300)" />
      </svg>
      <div className="og-e-halo" />
      <AppIcon size={236} className="og-e-icon" />
      {tiles.map(([app, size, position]) => <span key={app} className={`og-e-tile ${position}`}><AppTile app={app} size={size} locked /></span>)}
      <Trail className="og-e-trail" from={[700, 548]} via={[840, 602]} to={[1000, 586]} steps={7} color="#ffad66" />
      <div className="og-e-walker"><Moz mood="walk" still className="og-e-moz" /></div>
      <div className="og-e-copy">
        <p className="og-e-kicker">iPhone &amp; Android</p>
        <h1 className="og-e-title">Mozy</h1>
        <p className="og-e-tag">Walk to earn <span>screen time.</span></p>
        <p className="og-e-sub">Lock the apps you pick.<br />Your steps unlock them.</p>
        <Badges />
      </div>
      <p className="og-site is-dark og-e-site">{SITE}</p>
      <Grain />
    </div>
  );
}

/** F: the landing page's hero at night: skyline, the phone with Mozy's lock sheet, Moz saying no. */
function NightHero() {
  return (
    <div className="og og-f">
      <div className="og-f-sky"><HeroSky /></div>
      <Moon className="og-f-moon" />
      <Brand />
      <Site />
      <div className="og-f-copy">
        <h1 className="og-h1">Your phone now charges you <span className="og-accent">in steps.<Swoosh /></span></h1>
        <p className="og-sub">Lock the apps you pick. Walk to earn them back.</p>
      </div>
      <div className="og-f-art">
        <div className="og-f-glow" />
        <div className="og-f-phone"><PhoneFrame dark><ShieldScreen className="is-active" /></PhoneFrame></div>
        <span className="og-f-tile is-1"><AppTile app="tiktok" size={74} locked /></span>
        <span className="og-f-tile is-2"><AppTile app="youtube" size={66} locked /></span>
        <span className="og-f-tile is-3"><AppTile app="x" size={54} locked /></span>
      </div>
      <p className="og-f-note">it’s 2:17 AM. Moz says no.</p>
      <Grain />
    </div>
  );
}

/** G: sunrise at the end of the walk. Moz heads up the path to the stone gate where the apps glow. */
function GateSunrise() {
  return (
    <div className="og og-g">
      <div className="og-g-rays" />
      <div className="og-g-sun" />
      <Cloud className="og-g-cloud is-a" width={210} />
      <Cloud className="og-g-cloud is-b" width={140} />
      <Cloud className="og-g-cloud is-c" width={170} />
      {/* The land stays low on the left, so the words sit on sky and the far ridge rather than on grass. */}
      <svg className="og-g-land" viewBox="0 0 1200 630" preserveAspectRatio="none">
        <path d="M0 630V360L90 318L170 340L260 286L350 330L430 306L520 344L600 304L700 352L800 286L880 318L960 272L1060 330L1140 300L1200 320V630Z" fill="#8a6aa8" opacity="0.7" />
        <path d="M0 630V452C120 444 230 432 340 422C470 410 560 384 690 368C820 358 930 380 1040 372C1110 368 1160 372 1200 376V630Z" fill="#7aa86a" />
        <path d="M0 630V500C160 490 320 486 480 488C650 488 820 456 1000 448C1090 444 1150 446 1200 448V630Z" fill="#5f9a54" />
        <path d="M0 630V556C200 546 420 540 620 542C820 544 1000 528 1200 520V630Z" fill="#4e8a46" />
        <path d="M150 630C350 594 570 560 770 530C866 516 934 506 992 500L1020 502C962 512 884 526 796 544C628 578 440 612 318 630Z" fill="#f1dfae" />
      </svg>
      <svg className="og-g-gate" viewBox="2938 560 392 336">
        <defs>
          <radialGradient id="walk-portal" cx="50%" cy="60%" r="60%"><stop offset="0" stopColor="#fff8e4" /><stop offset="0.6" stopColor="#ffd59a" /><stop offset="1" stopColor="#ffb36b" /></radialGradient>
          <radialGradient id="walk-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ffe2a8" stopOpacity="0.9" /><stop offset="1" stopColor="#ffe2a8" stopOpacity="0" /></radialGradient>
        </defs>
        <GateArt />
      </svg>
      <svg className="og-g-flowers" viewBox="0 0 1200 630" aria-hidden="true">
        {GATE_DAISIES.map(([x, y, c, s]) => <Daisy key={`${x}-${y}`} x={x} y={y} c={c} s={s} />)}
      </svg>
      <Trail className="og-g-trail" from={[400, 612]} via={[560, 580]} to={[704, 556]} steps={7} color="#a24c27" size={[1.3, 0.95]} />
      <div className="og-g-walker"><Moz mood="walk" still className="og-g-moz" /></div>
      <Brand />
      <Site />
      <div className="og-g-copy">
        <h1 className="og-h1">Walk to <span className="og-g-warm">unlock</span><br />your apps.</h1>
        <p className="og-sub">Your steps earn minutes for the apps you lock.</p>
      </div>
      <Grain />
    </div>
  );
}

// Daisies on the hills either side of the path (x, y, petal colour, scale), kept off the words and the X domain label.
const GATE_DAISIES: [number, number, number, number][] = [[214, 592, 0, 1.5], [366, 574, 1, 1.3], [492, 552, 2, 1.2], [604, 534, 3, 1.1], [548, 624, 0, 1.6], [780, 596, 2, 1.4], [884, 546, 1, 1.1], [1118, 548, 0, 1.2], [1166, 574, 3, 1.4], [1060, 600, 1, 1.6]];

/** The walk chapter's gate with the locked apps inside (its coordinates live in the walk scene's space). */
function GateArt() {
  return <GateWrap><AppGlyphs /></GateWrap>;
}

/** H: the bright park finale, with the download badges. */
function ParkDay() {
  return (
    <div className="og og-h st-final">
      <FinalSky />
      <div className="og-h-copy">
        <Brand tone="light" />
        <h1 className="og-h1">Your next scroll<br />starts with a walk.</h1>
        <p className="og-sub">Lock the apps that eat your evenings. Earn them back, one walk at a time.</p>
        <Badges />
      </div>
      <div className="og-h-scene"><FinalScene /></div>
      <p className="og-site is-light og-h-site">{SITE}</p>
      <Grain />
    </div>
  );
}

export { GateSunrise, Launch, NightHero, ParkDay };
