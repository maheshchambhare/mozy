import { useId } from 'react';

/*
 * Moz's floating island (viewBox 900 x 640), drawn in three eras that share one DOM:
 * desert (sand, dunes, cacti, a dead tree), abandoned city (ruins rise from the sand) and the park
 * (grass sweeps in, trees grow, the pond fills and spills off the edge).
 * The markup's natural state is the finished park, which is what reduced-motion and no-JS visitors see;
 * WorldChapter's scroll timeline rewinds it to the desert and plays it forward.
 * The st-world-* class names are that timeline's hooks, so keep them in sync with WorldChapter.tsx.
 */

type Pt = [number, number];
type Circle = [number, number, number];

const TOP = 'M70 318C70 270 215 236 450 234C690 232 830 268 830 316C830 362 690 400 452 402C212 404 70 366 70 318Z';
const CLIFF = 'M70 318C70 366 212 404 452 402C690 400 830 362 830 316L830 360C830 406 690 444 452 446C212 448 70 410 70 362Z';
const UNDER = 'M72 350C78 392 112 418 160 440C190 456 206 480 240 496C286 518 316 548 356 574C388 596 420 624 458 636C494 626 522 604 556 588C602 564 628 534 668 512C712 488 742 462 776 440C808 418 826 388 830 350Z';
const LIP = 'M72 322C76 366 214 402 452 400C690 398 826 362 828 320';
const FRONT: [Pt, Pt, Pt, Pt][] = [[[70, 318], [70, 366], [212, 404], [452, 402]], [[452, 402], [690, 400], [830, 362], [830, 316]]];

const r1 = (value: number) => Math.round(value * 10) / 10;

function bezier([a, b, c, d]: [Pt, Pt, Pt, Pt], t: number): Pt {
  const u = 1 - t;
  return [0, 1].map(i => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i]) as Pt;
}

/** Several circles as one path, so a canopy or a bush is a single element. */
const circles = (list: Circle[]) => list.map(([cx, cy, r]) => `M${r1(cx - r)} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join('');
const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;
/** Tufts of grass, as one path. */
const tufts = (list: Pt[]) => list.map(([x, y]) => `M${x - 5} ${y}q3-5 3-10q1 6 2 10q2-8 6-12q-2 7-1 12q2-4 5-6q-2 3-2 6Z`).join('');

// Grass that drapes over the cliff: the front edge, then scallops back along it.
const FRINGE = (() => {
  const points: Pt[] = [];
  for (const segment of FRONT) for (let i = 0; i < 14; i++) points.push(bezier(segment, i / 14));
  points.push([830, 316]);
  let d = 'M70 318C70 366 212 404 452 402C690 400 830 362 830 316';
  for (let i = points.length - 1; i > 0; i--) {
    const [x1, y1] = points[i];
    const [x0, y0] = points[i - 1];
    const droop = 10 + ((i * 7) % 5) * 2.4;
    d += `Q${r1((x0 + x1) / 2)} ${r1((y0 + y1) / 2 + droop)} ${r1(x0)} ${r1(y0 + 3)}`;
  }
  return `${d}Z`;
})();

type Building = { x: number; base: number; w: number; h: number; d: number; top: number[]; cols: number; rows: number; broken: number[]; lit: number[]; vine: string; leaves: Circle[]; moss: Circle[]; crack: string; roof?: string };

// Back row of ruins, listed back to front.
const BUILDINGS: Building[] = [
  { x: 548, base: 274, w: 86, h: 168, d: 16, top: [0, 8, 2, 18, 6, 24], cols: 3, rows: 5, broken: [3, 10], lit: [0, 4, 8, 11, 13], vine: 'M553 272C560 250 549 232 557 212C564 194 552 176 560 156', leaves: [[558, 248, 4], [552, 228, 3.5], [561, 204, 4], [554, 184, 3.5], [560, 164, 3]], moss: [[552, 110, 9], [568, 116, 8], [612, 126, 10], [628, 132, 7]], crack: 'M600 180l-6 10l8 8l-5 12', roof: 'M574 116l2-18h3l-1 18ZM596 120l-2-22h3l2 22ZM570 98h32v-14q-16-6-32 0ZM568 86q18-16 36 0Z' },
  { x: 330, base: 278, w: 62, h: 86, d: 12, top: [14, 0, 20, 8], cols: 2, rows: 2, broken: [1], lit: [2], vine: 'M386 276C380 262 390 250 383 236C378 226 386 216 382 206', leaves: [[384, 258, 3.5], [387, 240, 3.5], [380, 222, 3]], moss: [[336, 206, 8], [352, 194, 9], [384, 202, 7]], crack: 'M350 240l5 8l-4 7' },
  { x: 214, base: 290, w: 92, h: 212, d: 16, top: [10, 0, 4, 22, 14, 30], cols: 3, rows: 7, broken: [2, 9, 13], lit: [1, 4, 8, 12, 16], vine: 'M301 288C292 262 304 240 296 216C289 194 300 174 293 150C288 134 296 120 292 106', leaves: [[298, 264, 4], [293, 240, 3.5], [300, 218, 4], [291, 196, 3.5], [298, 172, 4], [291, 150, 3.5], [295, 126, 3]], moss: [[220, 90, 10], [236, 80, 9], [262, 84, 8], [278, 102, 9], [300, 108, 7]], crack: 'M240 180l7 9l-6 10l6 9', roof: 'M249 80l5-34l3 0.5l-5 34ZM246 58l14 3l-0.6 2.6l-14-3ZM254 44l9-6l1.6 2.2l-9 6Z' },
  { x: 662, base: 290, w: 72, h: 118, d: 14, top: [12, 2, 16, 0], cols: 2, rows: 3, broken: [2], lit: [1, 3, 4], vine: 'M667 288C674 270 664 254 671 236C676 222 668 210 673 196', leaves: [[672, 268, 3.5], [666, 250, 3.5], [674, 230, 3.5], [668, 212, 3]], moss: [[668, 184, 8], [690, 176, 9], [728, 174, 8]], crack: 'M708 236l-5 8l6 6' },
  { x: 118, base: 304, w: 78, h: 140, d: 14, top: [6, 0, 10, 4, 16], cols: 3, rows: 4, broken: [4, 7], lit: [0, 5, 9], vine: 'M123 302C130 284 120 268 127 250C132 236 124 222 129 208', leaves: [[128, 282, 3.5], [122, 262, 3.5], [130, 242, 3.5], [124, 224, 3]], moss: [[122, 172, 8], [140, 164, 9], [172, 172, 8], [192, 182, 7]], crack: 'M170 220l6 8l-5 9' },
];

function topAt(b: Building, x: number) {
  const step = b.w / (b.top.length - 1);
  const i = Math.min(b.top.length - 2, Math.max(0, Math.floor((x - b.x) / step)));
  const t = (x - b.x - i * step) / step;
  return b.base - b.h + b.top[i] + (b.top[i + 1] - b.top[i]) * t;
}

function windows(b: Building) {
  const list: { x: number; y: number; index: number }[] = [];
  const step = (b.w - 34) / Math.max(1, b.cols - 1);
  const y0 = b.base - b.h + Math.max(...b.top) + 14;
  for (let row = 0; row < b.rows; row++) {
    for (let col = 0; col < b.cols; col++) {
      const x = r1(b.x + 12 + col * step);
      const y = y0 + row * 22;
      if (y + 13 < b.base - 10 && y > Math.max(topAt(b, x), topAt(b, x + 10)) + 6) list.push({ x, y, index: row * b.cols + col });
    }
  }
  return list;
}

// Farther ruins are lighter and hazier (index = depth: 0 far, 1 middle, 2 near).
const SIDES = ['#8b84a5', '#7b7396', '#6e6689'];

function Ruin({ b, clip, paint, depth }: { b: Building; clip: string; paint: string; depth: number }) {
  const n = b.top.length - 1;
  const points = b.top.map((offset, i) => `${r1(b.x + (b.w / n) * i)} ${b.base - b.h + offset}`);
  const last = b.base - b.h + b.top[n];
  const all = windows(b);
  const whole = all.filter(w => !b.broken.includes(w.index));
  const broken = all.filter(w => b.broken.includes(w.index));
  const lit = whole.filter(w => b.lit.includes(w.index));
  return (
    <g clipPath={clip}>
      <g className="st-world-rise" data-rise={b.h + (b.roof ? 52 : 8)}>
        <path d={`M${b.x + b.w} ${b.base}L${b.x + b.w + b.d} ${b.base - b.d * 0.5}L${b.x + b.w + b.d} ${last - b.d * 0.5 + 8}L${b.x + b.w} ${last}Z`} fill={SIDES[depth]} />
        <path d={`M${b.x} ${b.base}L${points.join('L')}L${b.x + b.w} ${b.base}Z`} fill={paint} />
        <path d={`M${points.join('L')}`} stroke="#cdc6df" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none" />
        <path d={whole.map(w => rect(w.x, w.y, 10, 13)).join('')} fill="#615a7e" />
        <path d={broken.map(w => rect(w.x, w.y, 10, 13)).join('')} fill="#3f3957" />
        <path d={broken.map(w => `M${w.x} ${w.y}l5 0l-5 7ZM${w.x + 10} ${w.y + 13}l-4 0l4-6Z`).join('')} fill="#a49dbb" />
        <path d={b.crack} stroke="#5f587a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {b.roof ? <path d={b.roof} fill="#6d6588" /> : null}
        <rect x={b.x} y={b.base - 6} width={b.w} height="6" fill="#6d6588" opacity="0.5" />
        <path className="st-world-lit" d={lit.map(w => rect(w.x, w.y, 10, 13)).join('')} fill="#ffd27a" />
        <path className="st-world-vine" d={b.vine} stroke="#4a9443" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <path className="st-world-leaves" d={circles(b.leaves)} fill="#6cbf55" />
        <path className="st-world-moss" d={circles(b.moss)} fill="#62b552" />
      </g>
    </g>
  );
}

const PETALS = ['#ff8fb1', '#ffd23f', '#fff4e0', '#b98cff', '#ff9d6e'];

function Flower({ x, y, c = 0, s = 1 }: { x: number; y: number; c?: number; s?: number }) {
  const r = r1(3.3 * s);
  const cy = r1(y - 9 * s);
  const petals = [0, 72, 144, 216, 288].map(a => [r1(x + Math.cos(((a - 90) * Math.PI) / 180) * r * 1.05), r1(cy + Math.sin(((a - 90) * Math.PI) / 180) * r * 1.05), r] as Circle);
  return (
    <g className="st-world-flower">
      <path d={`M${x} ${y}V${cy}`} stroke="#4c9a44" strokeWidth={r1(1.8 * s)} strokeLinecap="round" />
      <path d={circles(petals)} fill={PETALS[c]} />
      <circle cx={x} cy={cy} r={r1(r * 0.8)} fill={c === 1 ? '#f08a3c' : '#ffd23f'} />
    </g>
  );
}

function Bush({ parts, shine, paint }: { parts: Circle[]; shine: Circle[]; paint: string }) {
  return (
    <g className="st-world-grow">
      <path d={circles(parts)} fill={paint} />
      <path d={circles(shine)} fill="#a6de83" opacity="0.7" />
    </g>
  );
}

function Cactus({ trunk, arms, shine, base }: { trunk: string; arms: string; shine: string; base: Pt }) {
  return (
    <g className="st-world-cactus">
      <ellipse cx={base[0]} cy={base[1]} rx="15" ry="4" fill="#9a6a3c" opacity="0.25" />
      <path d={`${trunk}${arms}`} stroke="#4f9149" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`${trunk}${arms}`} stroke="#66a95c" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(-1.5 0)" />
      <path d={shine} stroke="#a5d68f" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </g>
  );
}

export function WorldIsland() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `st-world-${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;
  return (
    <svg className="st-world-island" viewBox="0 0 900 640" aria-hidden="true">
      <defs>
        <linearGradient id={id('sand')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fae3b6" /><stop offset="1" stopColor="#eec28a" /></linearGradient>
        <linearGradient id={id('dune')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fdeccb" /><stop offset="1" stopColor="#f3d09a" stopOpacity="0" /></linearGradient>
        <linearGradient id={id('cliff')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2aa74" /><stop offset="1" stopColor="#c4854f" /></linearGradient>
        <linearGradient id={id('rock')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c08457" /><stop offset="0.55" stopColor="#99603d" /><stop offset="1" stopColor="#6e4128" /></linearGradient>
        <linearGradient id={id('shade')} x1="0" y1="0" x2="1" y2="0"><stop offset="0.3" stopColor="#4a2414" stopOpacity="0" /><stop offset="1" stopColor="#4a2414" stopOpacity="0.38" /></linearGradient>
        <linearGradient id={id('grass')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b2e38a" /><stop offset="1" stopColor="#74c464" /></linearGradient>
        <linearGradient id={id('water')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9be6fb" /><stop offset="1" stopColor="#38aee6" /></linearGradient>
        <linearGradient id={id('fall')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9f3ff" /><stop offset="0.45" stopColor="#7fd5f5" stopOpacity="0.95" /><stop offset="1" stopColor="#7fd5f5" stopOpacity="0" /></linearGradient>
        <linearGradient id={id('pine')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5aab5f" /><stop offset="1" stopColor="#2c7445" /></linearGradient>
        <linearGradient id={id('boulder')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d49c6c" /><stop offset="1" stopColor="#a5683f" /></linearGradient>
        <linearGradient id={id('bld0')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bcb5d1" /><stop offset="1" stopColor="#9f97b8" /></linearGradient>
        <linearGradient id={id('bld1')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#aca4c2" /><stop offset="1" stopColor="#8b83a4" /></linearGradient>
        <linearGradient id={id('bld2')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a39bba" /><stop offset="1" stopColor="#7f7799" /></linearGradient>
        <radialGradient id={id('canopy')} cx="0.36" cy="0.3" r="0.75"><stop offset="0" stopColor="#9ad978" /><stop offset="0.6" stopColor="#56ad52" /><stop offset="1" stopColor="#3b8e45" /></radialGradient>
        <radialGradient id={id('bush')} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#8fd16c" /><stop offset="1" stopColor="#3f9348" /></radialGradient>
        <radialGradient id={id('glow')}><stop offset="0" stopColor="#ffe7a3" stopOpacity="0.95" /><stop offset="1" stopColor="#ffe7a3" stopOpacity="0" /></radialGradient>
        <radialGradient id={id('mist')}><stop offset="0" stopColor="#ffffff" stopOpacity="0.85" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></radialGradient>
        <clipPath id={id('under')}><path d={UNDER} /></clipPath>
        <clipPath id={id('sweep')}><path className="st-world-sweep" d="M-60 120H870C846 170 908 214 880 258C856 300 916 338 888 380C862 420 914 452 884 520H-60Z" /></clipPath>
        {BUILDINGS.map((b, i) => <clipPath key={i} id={id(`ruin${i}`)}><rect x={b.x - 6} y="0" width={b.w + b.d + 12} height={b.base} /></clipPath>)}
        <clipPath id={id('lamp')}><rect x="396" y="0" width="60" height="290" /></clipPath>
      </defs>

      {/* Small rocks drifting beside the island. */}
      <g className="st-world-bob is-a">
        <path d="M28 452C28 438 88 436 90 452C90 472 72 494 58 500C44 492 28 472 28 452Z" fill={url('rock')} />
        <ellipse cx="59" cy="449" rx="31" ry="8" fill="#eec28a" />
        <path className="st-world-cap" d="M28 449C28 440 90 438 90 449C90 456 80 460 74 458Q70 465 64 459Q58 466 52 459Q45 464 40 457Q30 458 28 449Z" fill="#6fbf5d" />
      </g>
      <g className="st-world-bob is-b">
        <path d="M842 404C842 394 886 392 888 404C888 418 874 434 864 438C854 432 842 418 842 404Z" fill={url('rock')} />
        <ellipse cx="865" cy="402" rx="23" ry="6" fill="#eec28a" />
        <path className="st-world-cap" d="M842 402C842 395 888 394 888 402C888 407 880 410 876 408Q872 414 866 409Q860 414 855 408Q846 410 842 402Z" fill="#6fbf5d" />
      </g>
      <g className="st-world-bob is-c">
        <path d="M210 590C210 582 244 581 246 590C246 600 236 612 228 614C220 610 210 600 210 590Z" fill={url('rock')} />
        <ellipse cx="228" cy="589" rx="18" ry="5" fill="#eec28a" />
      </g>

      {/* Rocky underside with strata, facets and roots. */}
      <path d="M196 478C192 498 198 512 192 532M318 546C314 566 320 582 314 604M540 596C544 614 538 628 542 646M648 520C654 540 648 556 654 572M432 610C430 626 436 638 432 652" stroke="#6e4128" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <g clipPath={url('under')}>
        <rect x="60" y="330" width="790" height="320" fill={url('rock')} />
        <path d="M60 340H840V420C700 472 560 488 450 486C340 484 200 468 60 420Z" fill="#c98e5f" />
        <path d="M60 476C200 526 330 544 452 544C574 544 700 526 840 476V650H60Z" fill="#8a5434" opacity="0.6" />
        <path d="M100 424C220 470 340 488 450 490C560 488 690 472 806 422" stroke="#8a5434" strokeWidth="4" fill="none" opacity="0.55" />
        <path d="M190 524C290 564 380 578 452 578C540 578 640 558 730 516" stroke="#5f3721" strokeWidth="3" fill="none" opacity="0.45" />
        <path d="M146 430C182 446 214 460 234 474C242 490 246 504 248 520C228 508 208 498 192 492C174 474 158 454 146 430ZM566 496C596 494 630 486 660 476C648 494 634 512 620 530C604 516 586 504 566 496Z" fill="#e2ad7b" opacity="0.4" />
        <path d="M330 494L342 530L334 566M560 500L552 540L562 572M446 560L450 602M250 470L262 496" stroke="#5a341f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
        {/* Pebbles set into the rock: a dark socket under a lighter stone. */}
        <path d={circles([[218, 454, 7], [356, 452, 4.5], [522, 470, 8], [642, 450, 6], [300, 510, 5], [470, 530, 6.5], [600, 532, 4.5], [404, 584, 4], [738, 436, 4]])} fill="#6e4128" opacity="0.45" />
        <path d={circles([[216, 452, 6], [355, 451, 3.8], [520, 468, 7], [640, 448, 5], [299, 509, 4.2], [468, 528, 5.6], [599, 531, 3.8], [403, 583, 3.4], [737, 435, 3.4]])} fill="#dcae80" />
        <rect x="60" y="330" width="790" height="320" fill={url('shade')} />
      </g>
      <path d="M74 352C80 392 114 418 160 440C190 456 206 480 240 496C286 518 316 548 356 574" stroke="#efbd8a" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />

      <path d={CLIFF} fill={url('cliff')} />
      <path d={CLIFF} fill={url('shade')} />
      <path d="M72 340C74 388 214 426 452 424C690 422 828 384 830 338" stroke="#b5764a" strokeWidth="2.5" fill="none" opacity="0.6" />
      <path d={circles([[150, 412, 3], [262, 428, 2.5], [380, 436, 3], [520, 436, 2.5], [640, 428, 3], [760, 402, 2.5]])} fill="#b97a4c" opacity="0.7" />

      {/* Desert floor: sand, dunes, ripples and a dry pond bed. */}
      <path d={TOP} fill={url('sand')} />
      <path d="M86 330Q170 286 286 318Q190 336 86 330Z" fill={url('dune')} />
      <path d="M182 302Q244 302 286 318Q232 318 182 302Z" fill="#e2a96d" opacity="0.6" />
      <path d="M520 296Q630 256 782 292Q650 308 520 296Z" fill={url('dune')} />
      <path d="M642 274Q722 278 782 292Q712 294 642 274Z" fill="#e2a96d" opacity="0.6" />
      <path d="M300 378Q404 340 548 372Q424 390 300 378Z" fill={url('dune')} />
      <path d="M404 354Q484 356 548 372Q482 370 404 354Z" fill="#e2a96d" opacity="0.6" />
      <path d="M120 360q20-6 40 0t40 0M600 330q18-5 36 0t36 0M420 300q16-5 32 0t32 0M222 388q16-4 32 0" stroke="#e5b67a" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="628" cy="354" rx="90" ry="24" fill="#e3ad71" />
      <ellipse cx="628" cy="356" rx="70" ry="16" fill="#d89e62" />
      <path d="M582 352l14 4l10-6l16 5M640 350l12 6l14-4M600 362l10-3l9 4M660 360l-8 4" stroke="#c08349" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={LIP} stroke="#fde9c2" strokeWidth="3" fill="none" opacity="0.85" />

      <g className="st-world-shimmer">
        <path d="M190 262q10-5 20 0t20 0t20 0M560 236q10-5 20 0t20 0t20 0M380 214q10-5 20 0t20 0" stroke="#fff6e3" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>

      {/* The park: grass sweeps across the sand as the clip slides in from the left. */}
      <g clipPath={url('sweep')}>
        <path d={TOP} fill={url('grass')} />
        <path d={FRINGE} fill="#5fb153" />
        <path d={LIP} stroke="#c9f0a8" strokeWidth="3" fill="none" opacity="0.8" />
        <ellipse cx="300" cy="296" rx="70" ry="12" fill="#c3ec9f" opacity="0.55" />
        <ellipse cx="660" cy="290" rx="80" ry="12" fill="#c3ec9f" opacity="0.5" />
        <ellipse cx="420" cy="350" rx="110" ry="16" fill="#8fd172" opacity="0.45" />
        <path d="M104 352C180 362 290 380 410 384C500 387 560 388 610 386" stroke="#efe4b4" strokeWidth="15" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d={tufts([[150, 330], [260, 312], [520, 300], [700, 312], [360, 360], [560, 384], [770, 340]])} fill="#5aab4e" />
      </g>

      <g className="st-world-hang">
        <path d="M168 430C164 456 172 476 166 506M392 446C396 470 388 490 394 518M612 440C608 466 616 486 610 510M762 410C766 432 760 448 764 472" stroke="#4a9443" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d={circles([[166, 452, 4], [170, 474, 3.5], [167, 496, 4], [394, 466, 4], [390, 488, 3.5], [393, 508, 3.5], [610, 460, 4], [614, 482, 3.5], [610, 502, 3.5], [764, 428, 3.5], [761, 448, 3.5], [764, 466, 3]])} fill="#6cbf55" />
      </g>

      {/* Pond, reeds and the waterfall that spills off the edge. */}
      <g className="st-world-water">
        <ellipse cx="628" cy="355" rx="97" ry="28" fill="#4f9f48" />
        <ellipse cx="628" cy="353" rx="88" ry="22" fill={url('water')} />
        <path d="M570 346q22-6 44 0M640 358q16-4 32 0M598 362q10-3 20 0" stroke="#e8fbff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d={circles([[662, 344, 7], [588, 356, 6]])} fill="#4f9e4a" />
        <circle cx="662" cy="342" r="3" fill="#ff8fb1" />
      </g>
      <g className="st-world-reeds">
        <path d="M546 350C544 334 546 322 542 308M554 352C554 336 557 326 556 314M538 350C534 340 532 330 528 322" stroke="#4c8f3f" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M539 306a4 8 0 1 0 6 0a4 8 0 1 0-6 0ZM553 312a3.5 7 0 1 0 6 0a3.5 7 0 1 0-6 0Z" fill="#8a5a3b" />
      </g>
      <g className="st-world-fall">
        <path d="M688 368C700 372 708 378 712 384L728 384C722 374 712 366 700 362Z" fill={url('water')} />
        <path d="M708 380C714 392 716 404 716 420L714 640L740 640L740 420C740 402 736 390 728 380Z" fill={url('fall')} />
        <path className="st-world-stream" d="M720 400V620M727 410V630M733 396V610" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="16 22" opacity="0.75" />
        <ellipse cx="726" cy="384" rx="16" ry="4" fill="#e8fbff" opacity="0.8" />
        <path d={circles([[718, 600, 12], [738, 612, 10], [726, 626, 14]])} fill={url('mist')} />
      </g>

      {/* The big park tree grows in the gap between the ruins. */}
      <g className="st-world-grow">
        <ellipse cx="486" cy="262" rx="46" ry="8" fill="#2f6a33" opacity="0.18" />
        <path d="M482 264C484 238 479 216 487 196M486 224C474 214 466 206 456 198M488 214C500 206 508 200 515 190" stroke="#8b5e3c" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d={circles([[486, 166, 50], [448, 186, 34], [526, 184, 36], [466, 136, 30], [510, 140, 28]])} fill={url('canopy')} />
        <path d={circles([[462, 140, 12], [478, 158, 8], [444, 176, 7]])} fill="#b6e690" opacity="0.6" />
      </g>

      <Ruin b={BUILDINGS[0]} clip={url('ruin0')} paint={url('bld0')} depth={0} />
      <Ruin b={BUILDINGS[1]} clip={url('ruin1')} paint={url('bld0')} depth={0} />

      <g clipPath={url('lamp')}>
        <g className="st-world-rise" data-rise="96">
          <path d="M414 290V214Q414 202 426 202H432" stroke="#5d5675" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M426 198H446L442 207H430Z" fill="#5d5675" />
          <rect x="408" y="284" width="12" height="6" rx="2" fill="#5d5675" />
          <g className="st-world-lit">
            <circle cx="437" cy="214" r="20" fill={url('glow')} />
            <circle cx="436" cy="209" r="3.5" fill="#ffd36b" />
          </g>
        </g>
      </g>

      <Ruin b={BUILDINGS[2]} clip={url('ruin2')} paint={url('bld1')} depth={1} />
      <Ruin b={BUILDINGS[3]} clip={url('ruin3')} paint={url('bld1')} depth={1} />

      {BUILDINGS.map((b, i) => <path key={i} className="st-world-dust" d={circles([[b.x + 4, b.base - 2, 15], [b.x + b.w / 2, b.base - 6, 21], [b.x + b.w + 4, b.base - 2, 15], [b.x + b.w * 0.3, b.base - 16, 11], [b.x + b.w * 0.75, b.base - 14, 12]])} fill="#fff4de" />)}

      <Bush parts={[[364, 298, 14], [380, 292, 16], [396, 300, 12]]} shine={[[374, 286, 6]]} paint={url('bush')} />
      <Bush parts={[[598, 296, 14], [614, 290, 15], [630, 298, 12]]} shine={[[606, 284, 6]]} paint={url('bush')} />

      <Ruin b={BUILDINGS[4]} clip={url('ruin4')} paint={url('bld2')} depth={2} />

      <g className="st-world-cactus">
        <ellipse cx="520" cy="320" rx="14" ry="4" fill="#9a6a3c" opacity="0.25" />
        <ellipse cx="520" cy="306" rx="13" ry="15" fill="#5fa257" />
        <path d="M514 294v24M520 292v28M526 294v24" stroke="#477f42" strokeWidth="1.4" opacity="0.7" />
        <path d={circles([[517, 290, 3], [523, 290, 3], [520, 287, 3]])} fill="#ff8fb1" />
      </g>

      {/* A pine grows where the tall cactus stood. */}
      <g className="st-world-grow">
        <ellipse cx="760" cy="322" rx="26" ry="6" fill="#2f6a33" opacity="0.18" />
        <rect x="755" y="300" width="10" height="22" rx="3" fill="#7a5236" />
        <path d="M760 268L796 306Q760 316 724 306Z" fill={url('pine')} />
        <path d="M760 244L788 280Q760 290 732 280Z" fill={url('pine')} />
        <path d="M760 220L780 254Q760 262 740 254Z" fill={url('pine')} />
      </g>

      <Bush parts={[[226, 320, 13], [242, 314, 16], [258, 322, 12]]} shine={[[236, 308, 6]]} paint={url('bush')} />

      <Cactus base={[744, 328]} trunk="M744 326V248" arms="M744 296H763V270M744 284H727V262" shine="M740 320V254M760 290V274M724 280V266" />
      <Cactus base={[236, 320]} trunk="M236 318V262" arms="M236 294H222V278" shine="M232 312V268M219 286V280" />

      {/* The dead tree comes back to life in the park. */}
      <ellipse cx="292" cy="338" rx="20" ry="4" fill="#7a4e2c" opacity="0.2" />
      <path d="M292 338C290 312 294 292 288 268M290 302C276 292 268 282 262 266M292 292C304 282 312 272 314 256M289 278C284 264 286 254 281 244" stroke="#8b5e3c" strokeWidth="6" strokeLinecap="round" fill="none" />
      <g className="st-world-grow">
        <path d={circles([[262, 258, 18], [288, 238, 24], [316, 250, 20], [300, 266, 15], [276, 270, 13]])} fill={url('canopy')} />
        <path d={circles([[280, 230, 8], [258, 252, 5]])} fill="#b6e690" opacity="0.6" />
      </g>

      <Flower x={200} y={338} c={0} />
      <Flower x={330} y={330} c={2} />
      <Flower x={414} y={346} c={3} />
      <Flower x={548} y={326} c={0} s={0.9} />
      <Flower x={700} y={330} c={1} />
      <Flower x={796} y={330} c={4} s={0.9} />

      <path className="st-world-rubble" d="M398 292l8-4l6 6l-4 6l-9 0ZM206 312l9-2l3 7l-8 3ZM664 290l8-3l5 6l-7 4Z" fill="#9790ae" />

      <path d="M180 374C178 356 196 346 210 348C224 350 234 360 232 374Z" fill={url('boulder')} />
      <path d="M188 360C192 354 200 351 206 352" stroke="#ebbd90" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path className="st-world-moss" d="M184 362C190 350 208 346 222 352C226 356 214 358 204 358C196 358 190 360 184 362Z" fill="#6cbf55" />

      {/* Tree on the far left. */}
      <g className="st-world-grow">
        <ellipse cx="112" cy="354" rx="26" ry="5" fill="#2f6a33" opacity="0.18" />
        <path d="M112 354V316" stroke="#8b5e3c" strokeWidth="7" strokeLinecap="round" />
        <path d={circles([[112, 298, 30], [90, 312, 20], [134, 312, 20]])} fill={url('canopy')} />
        <path d={circles([[102, 286, 8]])} fill="#b6e690" opacity="0.6" />
      </g>

      <Bush parts={[[786, 352, 13], [802, 346, 15], [818, 354, 11]]} shine={[[794, 340, 5]]} paint={url('bush')} />

      <path d="M572 396C570 376 592 366 610 368C628 370 640 382 636 398Z" fill={url('boulder')} />
      <path d="M582 380C588 374 598 371 606 372" stroke="#ebbd90" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path className="st-world-moss" d="M578 384C584 372 606 366 624 372C630 377 614 379 602 379C592 379 584 381 578 384Z" fill="#6cbf55" />

      <g className="st-world-tumble">
        <circle cx="352" cy="300" r="13" fill="none" stroke="#b98a52" strokeWidth="2.4" />
        <path d="M343 292q9 4 18-2M341 304q11-8 22 2M348 289q2 11 9 20M356 289q-6 9-4 22M343 298q9 6 20 4" stroke="#a87a45" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </g>

      {/* Butterflies and birds arrive with the park. */}
      <g className="st-world-butterfly">
        <g className="st-world-flutter is-a">
          <path className="st-world-wings" d="M380 300c-10-12-18-4-12 4c-6 6 2 12 12-4ZM380 300c10-12 18-4 12 4c6 6-2 12-12-4Z" fill="#ff9d6e" />
          <path d="M380 294v12" stroke="#5a3a2a" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
      <g className="st-world-butterfly">
        <g className="st-world-flutter is-b">
          <path className="st-world-wings" d="M574 270c-9-11-16-4-11 4c-5 5 2 11 11-4ZM574 270c9-11 16-4 11 4c5 5-2 11-11-4Z" fill="#ffd23f" />
          <path d="M574 265v10" stroke="#5a3a2a" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
      <g className="st-world-birds">
        <path className="st-world-bird" d="M720 96q7-7 14 0q7-7 14 0" stroke="#3f4a5c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path className="st-world-bird is-b" d="M760 74q6-6 12 0q6-6 12 0" stroke="#3f4a5c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path className="st-world-bird is-c" d="M792 104q5-5 10 0q5-5 10 0" stroke="#3f4a5c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

/** Flowers and grass at the front lip, drawn above Moz so he walks through them. */
export function WorldIslandFront() {
  return (
    <svg className="st-world-island is-front" viewBox="0 0 900 640" aria-hidden="true">
      <path className="st-world-flower" d={tufts([[150, 384], [228, 396], [300, 400], [380, 402], [470, 403], [540, 402], [690, 392], [790, 362]])} fill="#4f9f48" />
      <Flower x={176} y={390} c={1} />
      <Flower x={248} y={398} c={0} s={1.1} />
      <Flower x={318} y={401} c={2} />
      <Flower x={396} y={403} c={0} s={1.15} />
      <Flower x={444} y={404} c={1} s={1.05} />
      <Flower x={506} y={404} c={3} s={1.1} />
      <Flower x={560} y={402} c={2} />
      <Flower x={670} y={394} c={0} />
      <Flower x={742} y={382} c={1} s={0.95} />
    </svg>
  );
}
