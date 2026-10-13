import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export type MozMood = 'happy' | 'stern' | 'cheer' | 'wave' | 'walk' | 'wink' | 'joy';

// Geometry in a 300 x 340 viewBox (y from -40 to 300): body, a plump leaf (base at 0,0, tip along +x) and a raised paw.
const BODY = 'M150 64 C182 64 249 101 260 170 C269 236 224 272 150 272 C76 272 31 236 40 170 C51 101 118 64 150 64 Z';
const LEAF = 'M0 0 C3 -24 26 -42 54 -42 C81 -42 98 -25 98 -4 C98 17 79 31 52 31 C25 31 3 19 0 0 Z';
const PAW = 'M-18 -2 C-21 -16 -23 -30 -22 -44 C-20 -61 -11 -69 0 -69 C11 -69 20 -61 22 -44 C23 -30 21 -16 18 -2 Z';
const STEM = 'M137 84 C138 66 140 54 143 46 C146 42 156 42 159 46 C162 54 164 66 165 84 Z';

type Ids = (name: string) => string;
const url = (id: string) => `url(#${id})`;

function Leaf({ id, x, y, angle, scale, flip }: { id: Ids; x: number; y: number; angle: number; scale: number; flip: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale} ${flip ? -scale : scale})`}>
      <path d={LEAF} fill={url(id('leaf'))} />
      <g clipPath={url(id('leafclip'))}>
        <path d={LEAF} fill="none" stroke="#2a7020" strokeWidth="9" opacity="0.32" filter={url(id('b3'))} />
        <path d="M-10 24 C26 44 84 40 112 12 L112 60 L-10 60 Z" fill="#2c741f" opacity="0.5" filter={url(id('b6'))} />
        <ellipse cx="50" cy="-23" rx="32" ry="12" fill="#bdeb8c" opacity="0.7" filter={url(id('b6'))} />
        <path d="M8 -2 C32 -7 62 -8 88 -5" stroke="#3a8a29" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.42" filter={url(id('b1'))} />
      </g>
    </g>
  );
}

function Eye({ id, cx, cy, closed, squash = 1 }: { id: Ids; cx: number; cy: number; closed: boolean; squash?: number }) {
  if (closed) return <path d={`M${cx - 15 * squash} ${cy + 4} Q${cx} ${cy - 13} ${cx + 15 * squash} ${cy + 4}`} stroke="#2a150d" strokeWidth="6" strokeLinecap="round" fill="none" />;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={21 * squash} ry="23.5" fill={url(id('eye'))} />
      <ellipse cx={cx} cy={cy + 13} rx={12 * squash} ry="6.5" fill="#7a4322" opacity="0.55" filter={url(id('b2'))} />
      <circle cx={cx + 6.5 * squash} cy={cy - 9} r={7.8 * (0.85 + 0.15 * squash)} fill="#fff" />
      <circle cx={cx - 8 * squash} cy={cy + 8} r="3" fill="#fff" opacity="0.9" />
    </g>
  );
}

function Mouth({ id, mood, dx }: { id: Ids; mood: MozMood; dx: number }) {
  if (mood === 'stern') return <path d="M138 200 Q150 192 162 200" stroke="#3a1a12" strokeWidth="4.6" strokeLinecap="round" fill="none" />;
  const big = mood === 'cheer' || mood === 'joy';
  const d = big ? 'M130 186 Q150 191 170 186 C170 205 161 215 150 215 C139 215 130 205 130 186 Z' : 'M133 187 Q150 191 167 187 C167 203 159 211 150 211 C141 211 133 203 133 187 Z';
  return (
    <g transform={`translate(${dx} 0)`}>
      <clipPath id={id('mouth')}><path d={d} /></clipPath>
      <path d={d} fill="#4b1913" />
      <ellipse cx="150" cy={big ? 213 : 209} rx={big ? 14 : 12} ry={big ? 9 : 8} fill="#f2545f" clipPath={url(id('mouth'))} />
      <path d={big ? 'M133 188 Q150 194 167 188' : 'M136 189 Q150 193 164 189'} stroke="#2b0c08" strokeWidth="2" opacity="0.35" fill="none" />
    </g>
  );
}

/** A resting hand: a small round nub tucked behind the body side. */
function Nub({ id, side }: { id: Ids; side: 1 | -1 }) {
  const x = side < 0 ? 40 : 260;
  const y = 224;
  const angle = side * -30;
  return (
    <g className={`moz-arm moz-arm-${side < 0 ? 'l' : 'r'}`}>
      <ellipse cx={x} cy={y} rx="12" ry="15.5" transform={`rotate(${angle} ${x} ${y})`} fill={url(id('nub'))} />
      <ellipse cx={x + side * 2} cy={y - 5} rx="4.5" ry="3.5" fill="#fff" opacity="0.75" />
    </g>
  );
}

/** A raised paw drawn behind the body, so it grows out of the side; `pad` shows the pink palm for "stop". */
function Paw({ id, side, angle, pad }: { id: Ids; side: 1 | -1; angle: number; pad: boolean }) {
  const x = side < 0 ? 66 : 234;
  return (
    <g className={`moz-arm moz-arm-${side < 0 ? 'l' : 'r'} is-raised`} style={{ transformOrigin: `${x}px 182px` } as CSSProperties}>
      <g transform={`translate(${x} 182) rotate(${side * angle})`}>
        <path d={PAW} fill={url(id('paw'))} />
        <path d={PAW} fill="none" stroke="#bf9f8a" strokeWidth="9" opacity="0.45" filter={url(id('b3'))} clipPath={url(id('pawclip'))} />
        <ellipse cx={-side * 6} cy="-58" rx="9" ry="7" fill="#fff" opacity="0.8" filter={url(id('b2'))} />
        {pad ? (
          <>
            <ellipse cx={side} cy="-46" rx="10" ry="11.5" fill="#f4aaa9" opacity="0.65" filter={url(id('b1'))} />
            <g fill="#f4aaa9" opacity="0.6"><circle cx="-8" cy="-60" r="3.2" /><circle cx="0" cy="-62.5" r="3.2" /><circle cx="8" cy="-60" r="3.2" /></g>
          </>
        ) : null}
      </g>
    </g>
  );
}

// Each blur's region hugs the shape it softens: a margin of `reach` times the shape's own size on every side, set so the
// smallest shape using that blur still gets about 3.2 deviations (plus half its stroke) of room. A region the size of
// the whole drawing made every small highlight blur a full Moz-sized area on each repaint, which phones felt.
const blur = (id: string, deviation: number, reach: number) => (
  <filter id={id} x={`${-reach * 100}%`} y={`${-reach * 100}%`} width={`${100 + reach * 200}%`} height={`${100 + reach * 200}%`}><feGaussianBlur stdDeviation={deviation} /></filter>
);

/**
 * Moz, the Mozy mascot, drawn from the store screenshots (public/assets/v2): a soft cream onion-dumpling with a short stem,
 * two puffy round leaves, big glossy eyes, blush and stub feet. Moods: happy, stern (brows down, pink paw raised: "no"),
 * cheer, wave, wink, joy (eyes closed, big smile; the widget face) and walk (a 3/4 turn to the right; the stride runs while an ancestor has `.is-walking`).
 * `rim` adds a soft moonlight rim for night scenes; `still` turns the idle animation off (tiny sizes);
 * `box` nests the drawing inside another SVG at that position. Animations live in story.css (`.st-moz`).
 */
export function Moz({ mood = 'happy', className = '', title, rim = false, still = false, box }: {
  mood?: MozMood;
  className?: string;
  title?: string;
  rim?: boolean;
  still?: boolean;
  box?: { x: number; y: number; width: number; height: number };
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id: Ids = name => `moz-${name}-${uid}`;
  const stern = mood === 'stern';
  const cheer = mood === 'cheer';
  const wave = mood === 'wave';
  const walk = mood === 'walk';
  const wink = mood === 'wink';
  const joy = mood === 'joy';
  // The walk is a 3/4 turn: the face slides right, the far eye narrows and the sprout trails back.
  const faceShift = walk ? 19 : 0;
  const eyeL = walk ? { cx: 131, cy: 171, squash: 0.82 } : { cx: 106, cy: 170, squash: 1 };
  const eyeR = walk ? { cx: 207, cy: 170, squash: 1 } : { cx: 194, cy: 170, squash: 1 };
  const blushL = walk ? { cx: 113, rx: 15 } : { cx: 82, rx: 21 };
  const blushR = walk ? { cx: 228, rx: 19 } : { cx: 218, rx: 21 };
  const sproutTilt = walk ? 'rotate(-9 151 78)' : undefined;
  const lean = walk ? 'rotate(5 150 272)' : undefined;
  const feet: [number, number, 'l' | 'r'][] = walk ? [[112, 266, 'l'], [200, 274, 'r']] : [[114, 272, 'l'], [186, 272, 'r']];

  const sides: ReactNode = walk
    ? <Nub id={id} side={1} />
    : <>{stern || cheer ? null : <Nub id={id} side={-1} />}{cheer || wave ? null : <Nub id={id} side={1} />}</>;
  const raised: ReactNode = <>
    {stern || cheer ? <Paw id={id} side={-1} angle={cheer ? 44 : 36} pad={stern} /> : null}
    {cheer || wave ? <Paw id={id} side={1} angle={cheer ? 44 : 38} pad={false} /> : null}
  </>;

  return (
    <svg
      viewBox="0 -40 300 340"
      className={`st-moz is-${mood}${still ? ' is-still' : ''} ${className}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...(box ?? {})}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        {blur(id('b1'), 1, 1.2)}
        {blur(id('b2'), 2.2, 0.7)}
        {blur(id('b3'), 3.5, 0.9)}
        {blur(id('b6'), 6, 0.9)}
        {blur(id('b14'), 14, 0.75)}
        <radialGradient id={id('body')} gradientUnits="userSpaceOnUse" cx="122" cy="122" r="185">
          <stop offset="0" stopColor="#fffdfa" /><stop offset="0.45" stopColor="#fbf5ef" /><stop offset="0.78" stopColor="#f1e4db" /><stop offset="1" stopColor="#e2cdc0" />
        </radialGradient>
        <radialGradient id={id('nub')} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#fffdf9" /><stop offset="0.65" stopColor="#f3e9dd" /><stop offset="1" stopColor="#ddcbb8" />
        </radialGradient>
        <radialGradient id={id('paw')} cx="0.42" cy="0.18" r="0.95">
          <stop offset="0" stopColor="#fffdfa" /><stop offset="0.45" stopColor="#f6ede4" /><stop offset="1" stopColor="#d6bba8" />
        </radialGradient>
        <linearGradient id={id('foot')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cdb9a5" /><stop offset="0.5" stopColor="#efe5d9" /><stop offset="1" stopColor="#fbf7f1" />
        </linearGradient>
        <linearGradient id={id('leaf')} x1="0" y1="-38" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#80cf55" /><stop offset="0.5" stopColor="#4fae37" /><stop offset="1" stopColor="#358b27" />
        </linearGradient>
        <linearGradient id={id('stem')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3f8f2d" /><stop offset="0.45" stopColor="#74c24f" /><stop offset="1" stopColor="#3a8429" />
        </linearGradient>
        <radialGradient id={id('eye')} cx="0.5" cy="0.38" r="0.62">
          <stop offset="0" stopColor="#1c0e08" /><stop offset="0.7" stopColor="#1f100a" /><stop offset="1" stopColor="#4a2716" />
        </radialGradient>
        <clipPath id={id('clip')}><path d={BODY} /></clipPath>
        <clipPath id={id('leafclip')}><path d={LEAF} /></clipPath>
        <clipPath id={id('pawclip')}><path d={PAW} /></clipPath>
      </defs>

      <ellipse className="moz-shadow" cx="150" cy="290" rx="92" ry="11" fill="#5a4330" opacity="0.28" filter={url(id('b3'))} />
      {feet.map(([x, y, side]) => (
        <g key={side} className={`moz-leg moz-leg-${side}`}>
          <ellipse cx={x} cy={y} rx="25" ry="15.5" fill={url(id('foot'))} />
          <ellipse cx={x + 2} cy={y + 6} rx="13" ry="5" fill="#fff" opacity="0.65" filter={url(id('b1'))} />
        </g>
      ))}

      <g className="moz-bob">
        <g transform={lean}>
          {sides}
          <path className="moz-stem" transform={sproutTilt} d={STEM} fill={url(id('stem'))} />
          {raised}
          <path d={BODY} fill={url(id('body'))} />
          <g clipPath={url(id('clip'))}>
            <ellipse cx="172" cy="282" rx="150" ry="58" fill="#dbbca9" opacity="0.5" filter={url(id('b14'))} />
            <ellipse cx="268" cy="196" rx="34" ry="90" fill="#dcc3b4" opacity="0.45" filter={url(id('b14'))} />
            <ellipse cx="150" cy="276" rx="96" ry="12" fill="#fff8ef" opacity="0.55" filter={url(id('b6'))} />
            <ellipse cx="118" cy="118" rx="52" ry="34" fill="#fff" opacity="0.8" filter={url(id('b14'))} />
            <ellipse cx="151" cy="72" rx="24" ry="7" fill="#c3a993" opacity="0.4" filter={url(id('b3'))} />
            <ellipse cx="36" cy="224" rx="10" ry="18" fill="#c9ab96" opacity="0.45" filter={url(id('b3'))} />
            <ellipse cx="264" cy="224" rx="10" ry="18" fill="#c9ab96" opacity="0.45" filter={url(id('b3'))} />
            {rim ? <path d={BODY} fill="none" stroke="#c4cfff" strokeWidth="7" opacity="0.26" filter={url(id('b2'))} transform="translate(-4 4)" /> : null}
          </g>
          <g transform={sproutTilt}>
            <g className="moz-sprout">
              <Leaf id={id} x={147} y={48} angle={-142} scale={1} flip />
              <Leaf id={id} x={155} y={49} angle={-14} scale={0.9} flip={false} />
              <path d="M143 47 C146 41 156 41 159 47 C157 53 145 53 143 47 Z" fill="#4c9f34" />
            </g>
          </g>
          <ellipse cx={blushL.cx} cy="198" rx={blushL.rx} ry="13" fill="#ff8d9c" opacity="0.6" filter={url(id('b3'))} />
          <ellipse cx={blushR.cx} cy="198" rx={blushR.rx} ry="13" fill="#ff8d9c" opacity="0.6" filter={url(id('b3'))} />
          <g className="moz-eyes">
            <Eye id={id} {...eyeL} closed={cheer || wink || joy} />
            <Eye id={id} {...eyeR} closed={cheer || joy} />
          </g>
          {stern ? <g className="moz-brows" stroke="#3a1a12" strokeWidth="5" strokeLinecap="round"><path d="M88 138 L118 148" /><path d="M182 148 L212 138" /></g> : null}
          <Mouth id={id} mood={mood} dx={faceShift} />
          {walk ? (
            <g className="moz-arm moz-arm-l is-near">
              <ellipse cx="78" cy="232" rx="13" ry="10" fill="#c9ab96" opacity="0.45" filter={url(id('b3'))} />
              <ellipse cx="72" cy="226" rx="12.5" ry="16" transform="rotate(28 72 226)" fill={url(id('nub'))} />
              <ellipse cx="68" cy="219" rx="4.5" ry="3.5" fill="#fff" opacity="0.75" />
            </g>
          ) : null}
        </g>
      </g>
    </svg>
  );
}
