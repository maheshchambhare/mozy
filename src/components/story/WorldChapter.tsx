import { useRef } from 'react';
import gsap from 'gsap';
import { useScene } from '../../hooks/useScene';
import type { SceneContext } from '../../hooks/useScene';
import { Moz } from './Moz';
import { WorldGlyph, WorldLedge, WorldShowcase } from './world/WorldChips';
import { WorldIsland, WorldIslandFront } from './world/WorldIsland';
import '../../story-world.css';

const WORLDS = [
  { key: 'desert', label: 'Desert Oasis · Level 1', level: 'Lv 1' },
  { key: 'city', label: 'Abandoned City · Level 5', level: 'Lv 5' },
  { key: 'park', label: 'Green Park · Level 10', level: 'Lv 10' },
] as const;

// Moz walks from the left of the island to its middle; the markup places him at the end of the walk.
const WALK = { xPercent: (-(470 - 150) / 900) * 100, yPercent: (-(376 - 344) / 640) * 100 };
// The grass sweep runs from SWEEP to SWEEP + SWEEP_LENGTH; things on the island react as its edge passes them.
const SWEEP = 0.64;
const SWEEP_LENGTH = 0.16;
const sweepReaches = (x: number) => SWEEP + (SWEEP_LENGTH * (x + 60)) / 940;
const phaseAt = (progress: number) => (progress < 1 / 3 ? 'desert' : progress < 2 / 3 ? 'city' : progress < 0.95 ? 'park' : 'done');
/** Horizontal centre of an SVG element in island units. */
const centreX = (node: Element) => {
  const box = (node as SVGGraphicsElement).getBBox();
  return box.x + box.width / 2;
};

/**
 * One scrubbed timeline over the sticky track: desert (0 to 1/3), the abandoned city rises (1/3 to 2/3),
 * then the park grows back. The badge, the track stops and Moz's mood follow `data-phase` on the section.
 * Reduced motion keeps the markup's finished park and only sets the phase.
 */
function setupWorld({ root, select, first, motion }: SceneContext) {
  if (!motion) {
    root.dataset.phase = 'done';
    return;
  }
  const stage = first('.st-world-stage');
  const walker = first('.st-world-walker');
  const pinned = () => !!stage && getComputedStyle(stage).position === 'sticky';
  let idle = 0;
  let last = 0;

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: () => (pinned() ? 'top top' : 'top 70%'),
      end: () => (pinned() ? 'bottom bottom' : 'bottom 40%'),
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
    onUpdate: () => {
      const progress = tl.progress();
      const phase = phaseAt(progress);
      if (root.dataset.phase !== phase) root.dataset.phase = phase;
      const moved = Math.abs(progress - last);
      last = progress;
      if (!walker) return;
      // Legs swing only while Moz visibly moves, not through the scrub's slow settling tail.
      if (progress > 0.03 && progress < 0.9 && moved > 0.0004) {
        window.clearTimeout(idle);
        walker.classList.add('is-walking');
        idle = window.setTimeout(() => walker.classList.remove('is-walking'), 160);
      } else if (progress <= 0.03 || progress >= 0.9) walker.classList.remove('is-walking');
    },
  });

  // Sky: warm desert haze, then lilac over the ruins, then a clear blue morning.
  tl.fromTo(select('.st-world-sky.is-city'), { opacity: 0 }, { opacity: 1, duration: 0.16 }, 0.24)
    .fromTo(select('.st-world-glow'), { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0.3)
    .fromTo(select('.st-world-sky.is-park'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.6)
    .fromTo(select('.st-world-sun'), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.22 }, 0.62)
    .fromTo(select('.st-world-cloud'), { opacity: 0.45 }, { opacity: 1, duration: 0.2 }, 0.62);

  // Level track fills to each stop as its world arrives.
  const fill = select('.st-world-track-fill');
  tl.fromTo(fill, { scaleX: 0 }, { scaleX: 0.5, duration: 1 / 3 }, 0).to(fill, { scaleX: 1, duration: 1 / 3 }, 1 / 3);

  // Desert: a tumbleweed rolls past, heat shimmers over the dunes.
  const tumble = select('.st-world-tumble');
  tl.fromTo(tumble, { x: 0, rotation: 0, opacity: 1, transformOrigin: '50% 50%' }, { x: 330, rotation: 760, duration: 0.3 }, 0)
    .fromTo(tumble, { y: 0 }, { y: -10, duration: 0.025, ease: 'sine.out', yoyo: true, repeat: 11 }, 0)
    .to(tumble, { opacity: 0, duration: 0.04 }, 0.27)
    .fromTo(select('.st-world-shimmer'), { opacity: 1 }, { opacity: 0, duration: 0.1 }, 0.26);

  // Abandoned city: ruins push up out of the sand in a cloud of dust, then the first vines climb them.
  const rises = select('.st-world-rise');
  const riseAt = [0.31, 0.37, 0.43, 0.33, 0.4, 0.46];
  rises.forEach((node, i) => {
    tl.fromTo(node, { y: Number(node.dataset.rise ?? 120) }, { y: 0, duration: 0.09, ease: 'back.out(1.3)' }, riseAt[i]);
  });
  const dustAt = [0.31, 0.37, 0.33, 0.4, 0.46];
  select('.st-world-dust').forEach((node, i) => {
    tl.fromTo(node, { opacity: 0, scale: 0.5, transformOrigin: '50% 100%' }, { opacity: 0.95, scale: 1, duration: 0.03 }, dustAt[i])
      .to(node, { opacity: 0, scale: 1.4, duration: 0.07 }, dustAt[i] + 0.035);
  });
  tl.fromTo(select('.st-world-rubble'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.06, ease: 'back.out(2)' }, 0.44);
  select('.st-world-vine').forEach((node, i) => {
    const length = (node as unknown as SVGPathElement).getTotalLength();
    tl.fromTo(node, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 0.1 }, 0.5 + i * 0.025);
  });

  // The park: grass sweeps left to right and everything it passes comes back to life.
  tl.fromTo(select('.st-world-sweep'), { x: -940 }, { x: 0, duration: SWEEP_LENGTH }, SWEEP);
  for (const node of select('.st-world-cactus')) {
    tl.fromTo(node, { scale: 1, opacity: 1, transformOrigin: '50% 100%' }, { scale: 0, opacity: 0, duration: 0.04, ease: 'back.in(2)' }, sweepReaches(centreX(node)) - 0.02);
  }
  for (const node of select('.st-world-grow')) {
    tl.fromTo(node, { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.07, ease: 'back.out(1.6)' }, sweepReaches(centreX(node)) + 0.01);
  }
  for (const node of select('.st-world-flower')) {
    tl.fromTo(node, { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.045, ease: 'back.out(2.4)' }, Math.min(0.92, sweepReaches(centreX(node)) + 0.06));
  }
  tl.fromTo(select('.st-world-water'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.07, ease: 'power2.out' }, 0.75)
    .fromTo(select('.st-world-reeds'), { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.05 }, 0.78)
    .fromTo(select('.st-world-fall'), { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.09 }, 0.8)
    .fromTo(select('.st-world-hang'), { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.1 }, 0.77)
    .fromTo(select('.st-world-cap'), { scale: 0, transformOrigin: '50% 0%' }, { scale: 1, duration: 0.05 }, 0.82)
    .fromTo(select('.st-world-lit'), { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.85)
    .fromTo(select('.st-world-birds'), { x: -140, opacity: 0 }, { x: 0, opacity: 1, duration: 0.12, ease: 'power1.out' }, 0.84);
  // One tween per element: a staggered fromTo only renders its first target's start state up front.
  select('.st-world-leaves').forEach((node, i) => {
    tl.fromTo(node, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.05 }, 0.8 + i * 0.012);
  });
  select('.st-world-moss').forEach((node, i) => {
    tl.fromTo(node, { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.05, ease: 'back.out(2)' }, 0.81 + i * 0.01);
  });
  select('.st-world-butterfly').forEach((node, i) => {
    tl.fromTo(node, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.05 }, 0.86 + i * 0.03);
  });

  // Moz walks the island while it changes, then cheers when the park is done.
  tl.fromTo(select('.st-world-walker'), { xPercent: WALK.xPercent, yPercent: WALK.yPercent }, { xPercent: 0, yPercent: 0, duration: 0.86, ease: 'sine.inOut' }, 0.03);
  tl.set({}, {}, 1);

  // Entrance as the section scrolls in: the island lifts into place, the top clouds part and the chart bars grow.
  const entrance = { trigger: root, start: 'top bottom', end: 'top top', scrub: 0.6 };
  gsap.fromTo(select('.st-world-box'), { y: 90, scale: 0.92 }, { y: 0, scale: 1, ease: 'none', scrollTrigger: entrance });
  const bars = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...entrance, start: 'top 80%', end: 'top 10%' } });
  select('.st-world-bar').forEach((node, i) => {
    bars.fromTo(node, { scaleY: 0.1, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.4 }, (i % 7) * 0.08 + Math.floor(i / 7) * 0.04);
  });

  return () => {
    window.clearTimeout(idle);
    walker?.classList.remove('is-walking');
    root.dataset.phase = 'done';
  };
}

/** Chapter: Moz's world grows back from desert to abandoned city to park as the visitor scrolls. */
export function WorldChapter() {
  const root = useRef<HTMLElement>(null);
  useScene(root, setupWorld);
  return (
    <section className="st-world" id="worlds" aria-labelledby="world-title" ref={root} data-phase="done">
      <WorldLedge />
      <div className="st-world-stage">
        <div className="st-world-bg" aria-hidden="true">
          <div className="st-world-sky is-desert" />
          <div className="st-world-sky is-city" />
          <div className="st-world-sky is-park" />
          {[0, 1, 2].map(i => <svg key={i} className={`st-world-cloud is-${i}`} viewBox="0 0 200 80"><path d="M32 72C12 72 6 52 22 44C20 28 42 20 56 30C62 12 94 8 106 26C120 14 148 18 150 38C170 34 186 50 178 64C186 72 176 74 168 74Z" /></svg>)}
          {/* The cloud bank melts into the cream questions section below. */}
          {['is-bottom'].map(edge => (
            <svg key={edge} className={`st-world-bank ${edge}`} viewBox="0 0 1440 200" preserveAspectRatio="none">
              <path className="is-back" d="M0 200V118C60 92 118 98 160 120C204 82 282 82 322 112C364 86 432 90 466 118C512 90 590 92 626 124C676 96 752 98 790 126C838 94 920 96 958 124C1006 92 1084 94 1120 122C1170 94 1250 96 1290 124C1334 100 1400 104 1440 118V200Z" />
              <path className="is-front" d="M0 202V156C70 132 130 138 174 156C226 128 300 130 342 154C392 130 470 132 508 158C560 132 640 134 680 160C730 136 806 138 846 160C896 134 976 136 1014 158C1066 134 1144 136 1184 158C1234 136 1306 138 1346 156C1384 142 1420 144 1440 150V202Z" />
            </svg>
          ))}
        </div>

        <div className="st-wrap st-world-inner">
          <div className="st-world-text">
            <div className="st-world-copy">
              <p className="st-world-eyebrow"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18V9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><path d="M10 10C9 5 4.5 3.6 2.5 6c2.4 3 5.4 4 7.5 4zM10 9c1-4.6 5.5-5.8 7.6-3.4C15.2 8.4 12.2 9.2 10 9z" fill="currentColor" /></svg>Your world</p>
              <h2 id="world-title" className="st-world-title">Keep walking, and Moz’s world <span className="st-world-accent">grows back.<svg viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 C 40 2, 80 15, 120 8 S 200 3, 237 10" /></svg></span></h2>
              <p className="st-world-lede">Mozy comes with a companion that levels up, and worlds that unlock as you keep your streak: a desert oasis, then an abandoned city, then a green park.</p>
            </div>
            <WorldShowcase />
          </div>

          <div className="st-world-art">
            <div className="st-world-hud">
              <p className="st-world-badge" aria-live="off">
                {WORLDS.map(world => (
                  <span key={world.key} className="st-world-label" data-label={world.key}>
                    <WorldGlyph world={world.key} />
                    {world.label}
                  </span>
                ))}
              </p>
              <div className="st-world-track" aria-hidden="true">
                <span className="st-world-track-line"><span className="st-world-track-fill" /></span>
                {WORLDS.map(world => (
                  <span key={world.key} className="st-world-stop" data-stop={world.key}>
                    <WorldGlyph world={world.key} />
                    <span className="st-world-stop-level">{world.level}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="st-world-box">
              <div className="st-world-glow" aria-hidden="true" />
              <div className="st-world-sun" aria-hidden="true" />
              <div className="st-world-float">
                <WorldIsland />
                <div className="st-world-walker">
                  <div className="st-world-moz">
                    <Moz mood="walk" className="st-world-moz-walk" />
                    <Moz mood="cheer" className="st-world-moz-cheer" />
                  </div>
                </div>
                <WorldIslandFront />
              </div>
              <div className="st-world-shadow" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
