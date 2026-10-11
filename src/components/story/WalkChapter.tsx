import { useRef } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScene } from '../../hooks/useScene';
import type { SceneContext } from '../../hooks/useScene';
import { Moz } from './Moz';
import { ArrowRight, Footprints } from './icons';
import { ART_WIDTH, circle, crest, ellipse, footY, ground, hillY, midY, mountainRange, pineRow, random, roundTrees, waveFill } from './walk/sceneryArt';
import { Bird, Butterfly, Cloud, Cottage, Deer, Gate, Rabbit, Signpost, Windmill } from './walk/SceneryParts';

// Every layer is drawn 1000 units tall (= the full stage height) and filled down to the bottom edge,
// so parallax offsets can never open a gap between layers. Widths are in the same units.
// The meadow runs well past the gate so its end never shows, even on very wide screens.
const MEADOW_WIDTH = 5000;
const GATE_LEFT = 3040;
const PATH_Y = 884;
const STEPS = 3400;
const UNLOCK_AT = 0.93;
// The sky is bright enough for dark type from here on; before it, the copy is light.
const DAYBREAK = 0.36;

// Far: two mountain ranges (a pale one behind) and foothills with tiny pines.
const backRange = mountainRange(8, 712, 470, 560, 520, [260, 420]);
const frontRange = mountainRange(3, 716, 515, 630, 590, [220, 360]);
const footPines = pineRow(31, 0, ART_WIDTH, footY, 6, 16, 30, 18, 1);
// Mid: a blue-green ridge under two rows of forest.
const midBack = pineRow(11, -20, ART_WIDTH, midY, 10, 40, 74, 19, 2);
const midFront = pineRow(17, -30, ART_WIDTH, midY, 34, 46, 86, 20);
// Hills: a green crest with broadleaf trees, two windmills, a cottage and a grazing deer, all standing on hillY.
const windmillAt = [crest(hillY, 1080, 1300), crest(hillY, 2840, 3080)];
const cottageAt = crest(hillY, 2240, 2420);
const deerAt = 1760;
const treeSpots = (() => {
  const next = random(5);
  const spots: number[] = [];
  const clear = [...windmillAt.map(x => [x - 70, x + 70]), [cottageAt - 70, cottageAt + 60], [deerAt - 60, deerAt + 60]];
  for (let x = 60; x < ART_WIDTH; x += 70 + next() * 190) {
    if (!clear.some(([a, b]) => x > a && x < b)) spots.push(Math.round(x));
  }
  return spots;
})();
const hillTrees = roundTrees(5, treeSpots, hillY, 24);

// Meadow: path, pebbles, footprints, tufts and flowers. Flowers are merged per colour to keep the DOM small.
const meadowTop = waveFill(MEADOW_WIDTH, 770, 9, 320, 0);
const pathBase = waveFill(MEADOW_WIDTH, 857, 5, 430, 1.3);
const pathTop = waveFill(MEADOW_WIDTH, 865, 5, 430, 1.3);
const pathRim = waveFill(MEADOW_WIDTH, 903, 5, 390, 2.1);
const pathBottom = waveFill(MEADOW_WIDTH, 911, 5, 390, 2.1);
const meadowShade = waveFill(MEADOW_WIDTH, 952, 8, 520, 3.4);
const pebbles = (() => {
  const next = random(29);
  let dark = '';
  let light = '';
  for (let x = 20; x < MEADOW_WIDTH; x += 26 + next() * 70) {
    const top = next() > 0.5;
    const y = top ? 868 + next() * 6 : 896 + next() * 6;
    const rx = 2.4 + next() * 3.6;
    dark += ellipse(x, y, rx, rx * 0.62);
    light += ellipse(x - rx * 0.25, y - rx * 0.22, rx * 0.45, rx * 0.25);
  }
  return { dark, light };
})();
// Moz's round footprints, left and right, every 34 units; they appear behind him as he walks.
const trail = (() => {
  let d = '';
  for (let x = 150, i = 0; x < GATE_LEFT - 40; x += 34, i += 1) d += ellipse(x, PATH_Y + (i % 2 ? 9 : -7), 6.5, 3.8);
  return d;
})();
function tufts(seed: number, count: number, yFrom: number, yTo: number) {
  const next = random(seed);
  let d = '';
  for (let i = 0; i < count; i += 1) {
    const x = next() * MEADOW_WIDTH;
    const y = yFrom + next() * (yTo - yFrom);
    const h = 10 + next() * 12;
    d += `M${x.toFixed(1)} ${y.toFixed(1)}q-6 ${-h * 0.6} -9 ${-h}q7 ${h * 0.4} 9 ${h * 0.7}q2 ${-h * 0.7} 8 ${-h * 1.1}q-3 ${h * 0.6} -2 ${h}q4 ${-h * 0.5} 10 ${-h * 0.8}q-6 ${h * 0.5} -6 ${h}Z`;
  }
  return d;
}
const grass = tufts(19, 210, 785, 990);
const flowerColors = ['#fff8ef', '#ffd76a', '#ff9db5', '#c9a6ff'];
const flowers = (() => {
  const next = random(7);
  const petals = flowerColors.map(() => '');
  let stems = '';
  let centres = '';
  for (let i = 0; i < 140; i += 1) {
    const above = next() > 0.45;
    const x = Math.round(next() * MEADOW_WIDTH);
    const y = Math.round(above ? 790 + next() * 46 : 925 + next() * 60);
    const colour = Math.floor(next() * flowerColors.length);
    const s = 0.7 + next() * 0.6;
    stems += `M${x} ${y}v${(14 * s).toFixed(1)}`;
    for (const [dx, dy] of [[-4, -3], [4, -3], [0, -8], [0, 2]]) petals[colour] += circle(x + dx * s, y + dy * s, 4 * s);
    centres += circle(x, y - 3 * s, 3 * s);
  }
  return { petals, stems, centres };
})();

/** The three locked apps glowing inside the gate. Also used by the share banners (src/og). */
export function AppGlyphs() {
  return (
    <g className="st-gate-apps">
      <defs>
        <linearGradient id="walk-ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#feda75" /><stop offset="0.35" stopColor="#fa7e1e" /><stop offset="0.65" stopColor="#d62976" /><stop offset="1" stopColor="#4f5bd5" /></linearGradient>
      </defs>
      <rect x="3106" y="694" width="56" height="56" rx="16" fill="url(#walk-ig)" />
      <rect x="3120" y="708" width="28" height="28" rx="9" fill="none" stroke="#fff" strokeWidth="4" /><circle cx="3134" cy="722" r="6.5" fill="none" stroke="#fff" strokeWidth="4" />
      <rect x="3106" y="760" width="56" height="56" rx="16" fill="#fff" />
      <rect x="3116" y="776" width="36" height="24" rx="8" fill="#f00" /><path d="M3130 781v14l12-7z" fill="#fff" />
      <rect x="3106" y="826" width="56" height="56" rx="16" fill="#111" />
      <path d="M3138 838v20a7 7 0 1 1 -7 -7M3138 838c1.5 5 5 8 10 8.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      {[694, 760, 826].map(y => (
        <g key={y} className="st-gate-lock" style={{ animationDelay: `${(y - 694) / 400}s` }}>
          <circle cx="3162" cy={y} r="13" fill="#e5484d" stroke="#fff4e2" strokeWidth="3" />
          <rect x="3156" y={y - 1} width="12" height="9" rx="2" fill="#fff" /><path d={`M3158.5 ${y - 1}v-3a3.5 3.5 0 0 1 7 0v3`} fill="none" stroke="#fff" strokeWidth="2.2" />
        </g>
      ))}
    </g>
  );
}

function walkScene({ root, first, select, motion }: SceneContext) {
  const stage = first('.st-walk-stage');
  const meadow = first('.st-walk-meadow');
  const moz = first('.st-walk-moz');
  const copy = first('.st-walk-copy');
  const trailClip = first<SVGRectElement>('[data-trail-clip]');
  const stepsText = first('[data-walk-steps]');
  const minutesText = first('[data-walk-min]');
  if (!stage || !meadow || !moz) return;
  const backLayers: [HTMLElement, number][] = ([['.st-walk-far', 0.07], ['.st-walk-mid', 0.17], ['.st-walk-hills', 0.4]] as const)
    .flatMap(([query, depth]) => select(query).map(layer => [layer, depth] as [HTMLElement, number]));
  let travel = 0;
  let unit = 1;
  let mozLeft = 0;
  let mozWidth = 0;

  // Size layers from the stage height, then end the walk with the gate just in front of Moz.
  const layout = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    unit = height / 1000;
    meadow.style.width = `${MEADOW_WIDTH * unit}px`;
    const mozBox = moz.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    mozLeft = mozBox.left - stageBox.left;
    mozWidth = mozBox.width;
    const gap = Math.max(18, width * 0.035);
    const target = mozBox.right - stageBox.left + gap;
    travel = Math.max(0, GATE_LEFT * unit - target);
    stage.style.setProperty('--gate-x', `${target}px`);
    for (const [layer, depth] of backLayers) layer.style.width = `${Math.max(Number(layer.dataset.width) * unit, width + travel * depth + 40)}px`;
  };
  // Before the stage has a size, unit is 0 and the width would be NaN (which the browser rejects with a console error).
  const renderTrail = (meadowX: number) => {
    const trail = (mozLeft + mozWidth * 0.3 - meadowX) / unit;
    if (Number.isFinite(trail)) trailClip?.setAttribute('width', String(Math.max(0, trail)));
  };
  let lastSteps = -1;
  const renderCounters = (progress: number) => {
    const steps = Math.round(STEPS * Math.min(1, progress / UNLOCK_AT));
    if (steps !== lastSteps) {
      lastSteps = steps;
      if (stepsText) stepsText.textContent = steps.toLocaleString('en-US');
      if (minutesText) minutesText.textContent = String(Math.floor(steps / 34));
    }
    stage.classList.toggle('is-unlocked', progress >= UNLOCK_AT);
    copy?.classList.toggle('is-night', motion && progress < DAYBREAK);
  };

  layout();
  if (!motion) {
    gsap.set(meadow, { x: -travel });
    for (const [layer, depth] of backLayers) gsap.set(layer, { x: -travel * depth });
    renderTrail(-travel);
    renderCounters(1);
    const onResize = () => { layout(); gsap.set(meadow, { x: -travel }); renderTrail(-travel); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }

  ScrollTrigger.addEventListener('refreshInit', layout);
  const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
  // The ground arrives at the gate exactly when the counter hits 3,400, then holds while the gate opens.
  timeline.to({}, { duration: 1 }, 0).fromTo(meadow, { x: 0 }, { x: () => -travel, duration: UNLOCK_AT }, 0);
  for (const [layer, depth] of backLayers) timeline.fromTo(layer, { x: 0 }, { x: () => -travel * depth, duration: UNLOCK_AT }, 0);
  timeline
    .fromTo(first('.st-walk-day') ?? [], { opacity: 0 }, { opacity: 1, duration: 0.55 }, 0.05)
    .fromTo(first('.st-walk-tint') ?? [], { opacity: 1 }, { opacity: 0, duration: 0.5 }, 0)
    .fromTo(first('.st-walk-stars') ?? [], { opacity: 1 }, { opacity: 0, duration: 0.25 }, 0)
    .fromTo(first('.st-walk-sun') ?? [], { yPercent: 190, scale: 0.8 }, { yPercent: 0, scale: 1, duration: 0.65 }, 0);

  // Moz only walks while the scroll moves, and turns round when the visitor scrolls back up.
  let last = -1;
  let idle = 0;
  timeline.eventCallback('onUpdate', () => {
    const progress = timeline.progress();
    renderCounters(progress);
    renderTrail(Number(gsap.getProperty(meadow, 'x')));
    if (Math.abs(progress - last) > 0.0004 && progress < UNLOCK_AT) {
      stage.classList.add('is-walking');
      stage.classList.toggle('is-reverse', progress < last);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => stage.classList.remove('is-walking', 'is-reverse'), 160);
    }
    last = progress;
  });
  renderCounters(0);
  renderTrail(0);
  return () => {
    ScrollTrigger.removeEventListener('refreshInit', layout);
    window.clearTimeout(idle);
    copy?.classList.remove('is-night');
  };
}

/** A side-scrolling sunrise walk: scrolling walks Moz through the valley until the app gate unlocks. */
export function WalkChapter() {
  const root = useRef<HTMLElement>(null);
  useScene(root, walkScene);
  return (
    <section className="st-walk" id="walk" aria-labelledby="walk-title" ref={root}>
      <div className="st-walk-stage">
        <div className="st-walk-sky" aria-hidden="true"><div className="st-walk-day" /></div>
        <div className="st-walk-sun" aria-hidden="true"><span /></div>
        <div className="st-walk-clouds" aria-hidden="true">
          <Cloud className="is-a" width={230} /><Cloud className="is-b" width={150} /><Cloud className="is-c" width={260} /><Cloud className="is-d" width={170} /><Cloud className="is-e" width={110} />
        </div>
        <svg className="st-walk-birds" viewBox="0 0 300 120" aria-hidden="true">
          <Bird x={40} y={70} scale={1} delay={0} /><Bird x={86} y={46} scale={0.85} delay={0.18} /><Bird x={128} y={78} scale={0.92} delay={0.09} /><Bird x={176} y={56} scale={0.72} delay={0.3} /><Bird x={214} y={88} scale={0.62} delay={0.14} />
        </svg>

        <svg className="st-walk-layer st-walk-far" data-width={ART_WIDTH} viewBox={`0 0 ${ART_WIDTH} 1000`} preserveAspectRatio="xMinYMax slice" aria-hidden="true">
          {backRange.map((peak, index) => (
            <g key={index}><path className="st-far-back" d={peak.lit} /><path className="st-far-back-shade" d={peak.shade} />{peak.snow ? <><path className="st-far-back-snow" d={peak.snow} /><path className="st-far-back-snowshade" d={peak.snowShade} /></> : null}</g>
          ))}
          {frontRange.map((peak, index) => (
            <g key={index}><path className="st-far-lit" d={peak.lit} /><path className="st-far-shade" d={peak.shade} />{peak.snow ? <><path className="st-far-snow" d={peak.snow} /><path className="st-far-snowshade" d={peak.snowShade} /></> : null}</g>
          ))}
          <path className="st-far-foot" d={ground(footY)} />
          <path className="st-far-pines" d={footPines.dark + footPines.light} />
        </svg>
        <div className="st-walk-mist" aria-hidden="true" />
        <svg className="st-walk-layer st-walk-mid" data-width={ART_WIDTH} viewBox={`0 0 ${ART_WIDTH} 1000`} preserveAspectRatio="xMinYMax slice" aria-hidden="true">
          <path className="st-mid-ridge" d={ground(midY)} />
          <path className="st-mid-back-dark" d={midBack.dark} /><path className="st-mid-back-light" d={midBack.light} />
          <path className="st-mid-front-dark" d={midFront.dark} /><path className="st-mid-front-light" d={midFront.light} />
          <path className="st-mid-floor" d={ground(x => midY(x) + 40)} />
        </svg>
        <svg className="st-walk-layer st-walk-hills" data-width={ART_WIDTH} viewBox={`0 0 ${ART_WIDTH} 1000`} preserveAspectRatio="xMinYMax slice" aria-hidden="true">
          <path className="st-hill" d={ground(hillY)} />
          <path className="st-hill-crest" d={ground(x => hillY(x) + 7)} />
          <Windmill x={windmillAt[0]} y={hillY(windmillAt[0]) + 3} scale={0.82} />
          <Windmill x={windmillAt[1]} y={hillY(windmillAt[1]) + 3} scale={0.6} />
          <Cottage x={cottageAt} y={hillY(cottageAt) + 3} scale={0.72} />
          <path className="st-hill-trunks" d={hillTrees.trunk} />
          <path className="st-hill-tree-shade" d={hillTrees.shade} />
          <path className="st-hill-trees" d={hillTrees.crown} />
          <path className="st-hill-tree-light" d={hillTrees.light} />
          <Deer x={deerAt} y={hillY(deerAt) + 4} scale={0.62} flip />
        </svg>

        <svg className="st-walk-layer st-walk-meadow" viewBox={`0 0 ${MEADOW_WIDTH} 1000`} preserveAspectRatio="xMinYMax meet" aria-hidden="true">
          <defs>
            <radialGradient id="walk-portal" cx="50%" cy="60%" r="60%"><stop offset="0" stopColor="#fff8e4" /><stop offset="0.6" stopColor="#ffd59a" /><stop offset="1" stopColor="#ffb36b" /></radialGradient>
            <radialGradient id="walk-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ffe2a8" stopOpacity="0.9" /><stop offset="1" stopColor="#ffe2a8" stopOpacity="0" /></radialGradient>
            <clipPath id="walk-trail-clip"><rect data-trail-clip x="0" y="0" width="0" height="1000" /></clipPath>
          </defs>
          <path className="st-meadow-grass" d={meadowTop} />
          <path className="st-meadow-path-rim" d={pathBase} />
          <path className="st-meadow-path" d={pathTop} />
          <path className="st-meadow-path-light" d={`M0 878 C${MEADOW_WIDTH / 4} 872 ${MEADOW_WIDTH / 2} 884 ${MEADOW_WIDTH} 875`} />
          <path className="st-meadow-path-rim" d={pathRim} />
          <path className="st-meadow-grass" d={pathBottom} />
          <path className="st-meadow-shade" d={meadowShade} />
          <path className="st-meadow-pebbles" d={pebbles.dark} />
          <path className="st-meadow-pebbles-light" d={pebbles.light} />
          <path className="st-meadow-trail" d={trail} clipPath="url(#walk-trail-clip)" />
          <path className="st-meadow-tufts" d={grass} />
          <g className="st-meadow-flowers">
            <path d={flowers.stems} stroke="#5c9c45" strokeWidth="2.5" fill="none" />
            {flowers.petals.map((d, index) => <path key={index} d={d} fill={flowerColors[index]} />)}
            <path d={flowers.centres} fill="#f2a93b" />
          </g>
          <Rabbit x={1180} y={836} />
          <Signpost x={1900} y={852} />
          {/* Position lives on the outer groups so CSS animations on the inner ones never replace it. */}
          <g className="st-butterflies">
            <g transform="translate(2320 800)"><g className="st-butterfly-path"><Butterfly color="#ff9fbd" under="#ffc9da" /></g></g>
            <g transform="translate(2440 784)"><g className="st-butterfly-path is-two"><Butterfly color="#ffd76a" under="#ffe9a8" /></g></g>
            <g transform="translate(860 810)"><g className="st-butterfly-path is-three"><Butterfly color="#b9a2ff" under="#d9ccff" /></g></g>
          </g>
          <Gate>
            <AppGlyphs />
            <g className="st-confetti">
              {['#ff9a4d', '#63d586', '#ffd76a', '#ff9db5', '#8ec5ff', '#63d586', '#ff9a4d', '#ffd76a'].map((color, index) => (
                <rect key={index} x="3130" y="690" width="10" height="16" rx="3" fill={color} style={{ '--dx': `${Math.round(Math.cos(index * 0.8) * 150)}px`, '--dy': `${Math.round(-90 - Math.sin(index * 1.3) * 60)}px`, animationDelay: `${index * 0.03}s` } as CSSProperties} />
              ))}
            </g>
          </Gate>
        </svg>

        <div className="st-walk-moz" aria-hidden="true">
          <Moz mood="walk" className="is-walker" />
          <Moz mood="cheer" className="is-cheer" />
        </div>
        <div className="st-walk-stars st-stars" aria-hidden="true" />
        <div className="st-walk-tint" aria-hidden="true" />

        <div className="st-walk-copy">
          <p className="st-walk-eyebrow"><Footprints size={15} color="currentColor" />The walk</p>
          <h2 id="walk-title">Every <span className="st-walk-accent">34 steps<svg viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 C 40 2, 80 15, 120 8 S 200 3, 237 10" /></svg></span> buys you a minute.</h2>
          <div className="st-walk-meter">
            <p className="st-walk-stat"><strong data-walk-steps>{STEPS.toLocaleString('en-US')}</strong><span>steps walked</span></p>
            <span className="st-walk-arrow" aria-hidden="true"><ArrowRight size={18} /></span>
            <p className="st-walk-stat is-earned"><strong><span data-walk-min>{Math.floor(STEPS / 34)}</span><small>min</small></strong><span>screen time earned</span></p>
          </div>
          <p className="st-walk-lede">Around the block, to the shop, the long way home. Mozy counts your steps on your phone, with no GPS.</p>
        </div>
        <p className="st-walk-unlocked" aria-hidden="true">Unlocked · +100 min</p>
      </div>
    </section>
  );
}
