import { useId } from 'react';
import { Moz } from '../Moz';

/*
 * The download finale's daytime landscape (viewBox 1440 x 420, bottom-anchored): far, middle and near hills
 * in separate layers so FinalCta can drift them at different depths, with Moz waving from the near hill.
 * The scene box keeps the viewBox's aspect ratio, so Moz is placed in plain percentages of it.
 */

type Circle = [number, number, number];

const r1 = (value: number) => Math.round(value * 10) / 10;
const circles = (list: Circle[]) => list.map(([cx, cy, r]) => `M${r1(cx - r)} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join('');
const PETALS = ['#ff8fb1', '#ffd23f', '#ffffff', '#b98cff', '#ff9d6e'];
// x, crest y and canopy radius of the far trees.
const FAR_TREES: Circle[] = [[160, 229, 9], [560, 214, 10], [586, 212, 8], [920, 224, 7], [1294, 212, 10], [1318, 211, 8]];

/** A small daisy: stem, five petals (one path) and a centre. Also used by the share banners (src/og). */
export function Daisy({ x, y, c, s = 1 }: { x: number; y: number; c: number; s?: number }) {
  const r = r1(4 * s);
  const cy = r1(y - 12 * s);
  const petals = [0, 72, 144, 216, 288].map(a => [r1(x + Math.cos(((a - 90) * Math.PI) / 180) * r * 1.1), r1(cy + Math.sin(((a - 90) * Math.PI) / 180) * r * 1.1), r] as Circle);
  return (
    <g>
      <path d={`M${x} ${y}V${cy}`} stroke="#3f8f41" strokeWidth={r1(2.2 * s)} strokeLinecap="round" />
      <path d={circles(petals)} fill={PETALS[c]} />
      <circle cx={x} cy={cy} r={r1(r * 0.8)} fill={c === 1 ? '#f08a3c' : '#ffcf3a'} />
    </g>
  );
}

function Tree({ x, base, r, paint }: { x: number; base: number; r: number; paint: string }) {
  return (
    <g>
      <ellipse cx={x} cy={base} rx={r * 0.9} ry={r * 0.16} fill="#245a2c" opacity="0.18" />
      <path d={`M${x} ${base}V${base - r * 1.3}`} stroke="#8b5e3c" strokeWidth={r * 0.26} strokeLinecap="round" />
      <path d={circles([[x, base - r * 1.75, r], [x - r * 0.62, base - r * 1.3, r * 0.66], [x + r * 0.64, base - r * 1.32, r * 0.7]])} fill={paint} />
      <path d={circles([[x - r * 0.32, base - r * 2.1, r * 0.3]])} fill="#c4ee9f" opacity="0.55" />
    </g>
  );
}

const grass = (list: [number, number][]) => list.map(([x, y]) => `M${x - 6} ${y}q4-7 4-13q1 8 3 13q2-10 8-15q-3 9-2 15q3-5 7-8q-3 4-3 8Z`).join('');

export function FinalScene() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `st-final-${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;
  return (
    <div className="st-final-scene" aria-hidden="true">
      {/* Paint servers live in their own zero-size SVG so every layer can reference them. */}
      <svg className="st-final-defs" width="0" height="0" focusable="false">
        <defs>
          <linearGradient id={id('far')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c4e6cb" /><stop offset="1" stopColor="#d9efdc" /></linearGradient>
          <linearGradient id={id('mid')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fd69a" /><stop offset="1" stopColor="#86c586" /></linearGradient>
          <linearGradient id={id('near')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#77c76c" /><stop offset="1" stopColor="#4c9f4f" /></linearGradient>
          <radialGradient id={id('canopy')} cx="0.36" cy="0.3" r="0.78"><stop offset="0" stopColor="#97d877" /><stop offset="0.62" stopColor="#55ab52" /><stop offset="1" stopColor="#3a8b45" /></radialGradient>
          <radialGradient id={id('canopy-far')} cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#b5e2b0" /><stop offset="1" stopColor="#8cc896" /></radialGradient>
        </defs>
      </svg>
      <div className="st-final-sun" />
      <svg className="st-final-layer st-final-far" viewBox="0 0 1440 420">
        <path d="M0 430V262C110 232 220 214 340 226C460 238 540 208 680 204C820 200 920 236 1050 232C1180 228 1300 200 1440 214V430Z" fill={url('far')} />
        {/* Hazy little trees sitting on the far crest. */}
        <path d={FAR_TREES.map(([x, y]) => `M${x} ${y + 2}V${y - 9}`).join('')} stroke="#a7c4a6" strokeWidth="3" strokeLinecap="round" />
        <path d={circles(FAR_TREES.map(([x, y, r]) => [x, y - 9 - r * 0.8, r] as Circle))} fill={url('canopy-far')} />
      </svg>
      <svg className="st-final-layer st-final-mid" viewBox="0 0 1440 420">
        <path d="M0 430V320C150 286 300 276 450 296C570 312 650 326 770 308C910 288 1030 268 1170 282C1290 294 1370 306 1440 298V430Z" fill={url('mid')} />
        <path d="M0 330C150 296 300 286 450 306C570 322 650 336 770 318C910 298 1030 278 1170 292C1290 304 1370 316 1440 308" stroke="#b9e4ae" strokeWidth="3" fill="none" opacity="0.6" />
        <Tree x={252} base={300} r={24} paint={url('canopy')} />
        <Tree x={292} base={304} r={17} paint={url('canopy')} />
        <Tree x={1150} base={290} r={26} paint={url('canopy')} />
        <Tree x={1196} base={294} r={18} paint={url('canopy')} />
        <Tree x={706} base={318} r={13} paint={url('canopy')} />
      </svg>
      <div className="st-final-layer st-final-near">
        <svg viewBox="0 0 1440 420">
          <path d="M0 430V388C150 362 320 352 480 362C600 370 690 352 780 330C840 316 900 312 960 316C1060 322 1180 356 1300 362C1360 365 1410 360 1440 356V430Z" fill={url('near')} />
          <path d="M0 390C150 364 320 354 480 364C600 372 690 354 780 332C840 318 900 314 960 318C1060 324 1180 358 1300 364C1360 367 1410 362 1440 358" stroke="#a9e28f" strokeWidth="3" fill="none" opacity="0.7" />
          <path d="M346 430C420 404 520 388 610 372C700 356 790 336 872 320L900 320C826 342 744 364 652 384C560 404 470 418 424 430Z" fill="#f3e5b6" />
          <path d={circles([[478, 410, 3.2], [492, 404, 3.2], [566, 392, 3], [580, 386, 3], [652, 376, 2.8], [664, 370, 2.8], [736, 358, 2.6], [748, 352, 2.6], [812, 340, 2.4], [823, 335, 2.4]])} fill="#dcc68f" />
          <Tree x={176} base={378} r={32} paint={url('canopy')} />
          <Tree x={1064} base={332} r={36} paint={url('canopy')} />
          <path d={grass([[96, 396], [268, 372], [530, 380], [700, 362], [980, 330], [1150, 352], [1250, 370], [1380, 366]])} fill="#3f9143" />
          <Daisy x={80} y={412} c={0} />
          <Daisy x={238} y={398} c={1} />
          <Daisy x={300} y={414} c={2} />
          <Daisy x={560} y={414} c={3} />
          <Daisy x={668} y={404} c={0} s={0.9} />
          <Daisy x={790} y={366} c={1} s={0.9} />
          <Daisy x={968} y={344} c={2} s={0.9} />
          <Daisy x={1000} y={360} c={0} />
          <Daisy x={1130} y={376} c={3} />
          <Daisy x={1206} y={396} c={1} />
          <Daisy x={1318} y={392} c={0} />
          <Daisy x={1400} y={404} c={2} />
          <g className="st-final-flutter">
            <path className="st-final-wings" d="M986 282c-11-13-20-4-13 4c-7 7 2 13 13-4ZM986 282c11-13 20-4 13 4c7 7-2 13-13-4Z" fill="#ff9d6e" />
            <path d="M986 275v14" stroke="#5a3a2a" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <g className="st-final-flutter is-b">
            <path className="st-final-wings" d="M322 352c-9-11-17-4-11 4c-6 6 2 11 11-4ZM322 352c9-11 17-4 11 4c6 6-2 11-11-4Z" fill="#ffd23f" />
            <path d="M322 346v12" stroke="#5a3a2a" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
        <div className="st-final-moz"><Moz mood="wave" /></div>
      </div>
    </div>
  );
}

/** A small floating island like Moz's world: grass cap, earthy underside with roots, and a tree or a flower patch. */
function FloatingIsle({ className, tree = false, uid }: { className: string; tree?: boolean; uid: string }) {
  const earth = `st-final-isle-earth-${uid}`;
  return (
    <svg className={`st-final-isle ${className}`} viewBox="0 0 160 150" aria-hidden="true">
      <defs>
        <linearGradient id={earth} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9935c" /><stop offset="1" stopColor="#8a5a33" /></linearGradient>
      </defs>
      <path d="M16 74C16 68 144 68 144 74C144 100 110 132 80 144C50 132 16 100 16 74Z" fill={`url(#${earth})`} />
      <path d="M30 96C60 104 104 104 132 94" stroke="#a8743f" strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M58 116c2 8-2 13 1 20M96 112c-2 9 3 14 0 22M78 128c1 6-1 9 0 14" stroke="#6e4128" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M104 118l8-5 9 2 3 7-7 5-10-1z" fill="#9a6a3e" />
      <ellipse cx="80" cy="72" rx="64" ry="12" fill="#e9bf86" />
      <path d="M16 71C16 62 144 60 144 71C144 78 134 82 126 80Q120 88 112 81Q104 89 96 82Q88 90 80 82Q72 90 64 82Q56 89 48 81Q40 88 34 80Q18 81 16 71Z" fill="#62b452" />
      <ellipse cx="80" cy="66" rx="58" ry="8" fill="#82cb68" />
      {tree ? (
        <g>
          <path d="M70 66V40" stroke="#8b5e3c" strokeWidth="5" strokeLinecap="round" />
          <path d="M70 18a16 16 0 1 0 0.1 0ZM56 34a11 11 0 1 0 0.1 0ZM84 33a12 12 0 1 0 0.1 0Z" fill="#4f9f4f" />
          <path d="M66 22a6 6 0 1 0 0.1 0Z" fill="#a6dd84" opacity="0.7" />
          <path d="M104 62q2-8 6-11q-2 6-1 11M112 63q1-6 4-8q-1 5-1 8" fill="#3f8f41" />
        </g>
      ) : (
        <g>
          <path d="M60 64q2-8 6-11q-2 6-1 11M98 64q2-8 6-11q-2 6-1 11" fill="#3f8f41" />
          <circle cx="76" cy="60" r="4" fill="#ffd23f" /><circle cx="76" cy="60" r="1.6" fill="#f08a3c" />
          <circle cx="88" cy="63" r="3.4" fill="#ff8fb1" /><circle cx="88" cy="63" r="1.4" fill="#ffcf3a" />
        </g>
      )}
    </svg>
  );
}

/**
 * The sky at the top of the finale: a cream cloud bank that the questions section melts into, the sun (fully inside the
 * section so its glow is never cut), drifting clouds, two small floating islands from Moz's world and a flock of birds.
 */
export function FinalSky() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <div className="st-final-sky" aria-hidden="true">
      <svg className="st-final-bank" viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path className="is-back" d="M0 0H1440V74C1404 92 1362 98 1322 86C1288 108 1236 112 1198 92C1162 114 1104 116 1066 94C1030 114 972 116 934 96C896 118 836 118 798 96C762 116 704 118 666 96C630 116 572 116 534 94C498 112 440 114 402 92C366 110 310 110 274 90C240 106 188 104 156 86C124 100 74 98 40 82C26 86 12 86 0 84Z" />
        <path className="is-front" d="M0 0H1440V40C1410 54 1372 58 1340 48C1310 66 1262 68 1230 52C1198 70 1146 72 1114 54C1082 72 1030 74 998 56C966 74 914 76 882 58C850 76 798 76 766 58C734 76 682 76 650 58C618 74 566 74 534 56C502 72 450 72 418 54C386 70 336 70 304 52C274 66 228 66 198 50C168 62 124 62 94 48C66 58 30 58 0 46Z" />
      </svg>
      <div className="st-final-sun is-sky" />
      {[0, 1, 2].map(i => <svg key={i} className={`st-final-cloud is-${i}`} viewBox="0 0 200 80"><path d="M32 72C12 72 6 52 22 44C20 28 42 20 56 30C62 12 94 8 106 26C120 14 148 18 150 38C170 34 186 50 178 64C186 72 176 74 168 74Z" /></svg>)}
      <FloatingIsle className="is-a" tree uid={`${uid}a`} />
      <FloatingIsle className="is-b" uid={`${uid}b`} />
      <svg className="st-final-birds" viewBox="0 0 120 60">
        <path className="st-final-bird" d="M8 30q8-8 16 0q8-8 16 0" />
        <path className="st-final-bird is-b" d="M50 14q7-7 14 0q7-7 14 0" />
        <path className="st-final-bird is-c" d="M78 40q6-6 12 0q6-6 12 0" />
        <path className="st-final-bird is-d" d="M96 18q5-5 10 0q5-5 10 0" />
      </svg>
    </div>
  );
}
