import type { CSSProperties, ReactNode } from 'react';
import { leaf } from './sceneryArt';

// Hand-drawn pieces of the walk scene. Light comes from the upper right, where the sun rises.

/** A Dutch smock windmill standing on the ground at (x, y), with four latticed sails that turn. */
export function Windmill({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g className="st-windmill" transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="3" rx="52" ry="10" fill="#6fae74" opacity="0.55" />
      <path d="M-26 2 C-23 -40 -18 -82 -13 -112 H13 C18 -82 23 -40 26 2 Z" fill="#f8f1e5" />
      <path d="M-26 2 C-23 -40 -18 -82 -13 -112 H-1 C-3 -82 -5 -40 -6 2 Z" fill="#e3d5bf" />
      <path d="M-29 -44 H29 L26 -38 H-26 Z" fill="#8f5f3c" />
      <path d="M-24 -38 V-32 M-12 -38 V-32 M0 -38 V-32 M12 -38 V-32 M24 -38 V-32" stroke="#8f5f3c" strokeWidth="2" />
      <path d="M-8 2 V-15 a8 8 0 0 1 16 0 V2 Z" fill="#8a5a3c" />
      <circle cx="0" cy="-74" r="5.5" fill="#9cc4e4" stroke="#cbb89b" strokeWidth="2" />
      <path d="M-18 -110 C-17 -131 17 -131 18 -110 Z" fill="#c96b4c" />
      <path d="M-18 -110 C-17 -131 -3 -131 1 -129 C-5 -123 -7 -116 -7 -110 Z" fill="#a9563b" />
      <g className="st-windmill-blades">
        {[0, 90, 180, 270].map(angle => (
          <g key={angle} transform={`rotate(${angle} 0 -119)`}>
            <path d="M0 -119 V-210" stroke="#7a5a3e" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M2.5 -134 H19 V-206 H2.5 Z" fill="#fffaf1" opacity="0.92" />
            <path d="M2.5 -134 H19 V-206 H2.5 Z M2.5 -146 H19 M2.5 -158 H19 M2.5 -170 H19 M2.5 -182 H19 M2.5 -194 H19 M10.7 -134 V-206" fill="none" stroke="#c4ae8e" strokeWidth="1.3" />
          </g>
        ))}
        <circle cx="0" cy="-119" r="5.5" fill="#6b4a33" />
      </g>
    </g>
  );
}

/** A small cottage with a lit window and a wisp of chimney smoke. */
export function Cottage({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="-4" cy="2" rx="48" ry="8" fill="#6fae74" opacity="0.5" />
      <path d="M-38 0 V-26 L-24 -38 V0 Z" fill="#dccab0" />
      <rect x="-24" y="-38" width="48" height="38" fill="#f6ead3" />
      <path d="M-30 -38 L0 -64 L30 -38 Z" fill="#cf6f4f" />
      <path d="M-30 -38 L0 -64 L-14 -70 L-44 -44 Z" fill="#a9573c" />
      <rect x="12" y="-72" width="7" height="16" fill="#9c5a43" />
      <path d="M-6 0 V-17 a6 6 0 0 1 12 0 V0 Z" fill="#8a5a3c" />
      <rect x="10" y="-30" width="9" height="9" rx="1.5" fill="#ffd98c" />
      <rect x="-19" y="-30" width="9" height="9" rx="1.5" fill="#ffd98c" />
      <g className="st-smoke" fill="#ffffff">
        <circle cx="16" cy="-80" r="5" /><circle cx="20" cy="-90" r="6" /><circle cx="15" cy="-102" r="7" />
      </g>
    </g>
  );
}

/** A deer seen from the side, ground at (x, y). It lowers its head to graze now and then. */
export function Deer({ x, y, scale = 1, flip = false }: { x: number; y: number; scale?: number; flip?: boolean }) {
  return (
    <g className="st-deer" transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <ellipse cx="0" cy="1" rx="30" ry="4" fill="#4e8a55" opacity="0.35" />
      <g stroke="#7a4a2a" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M-17 -20 L-19 -9 L-17 0" />
        <path d="M15 -21 L17 -10 L16 0" />
      </g>
      <path d="M-26 -27 C-27 -36 -14 -39 2 -37 C14 -36 23 -35 24 -27 C25 -20 16 -17 2 -18 C-12 -18 -26 -17 -26 -27 Z" fill="#b8793f" />
      <path d="M-20 -21 C-8 -17 8 -17 18 -20 C14 -17 4 -16 -6 -16 C-13 -16 -18 -18 -20 -21 Z" fill="#ead2ac" />
      <path d="M-28 -30 C-31 -31 -32 -27 -29 -25 Z" fill="#fff7ea" />
      <g stroke="#9a6236" strokeWidth="3.6" strokeLinecap="round" fill="none">
        <path d="M-12 -20 L-14 -9 L-12 0" />
        <path d="M10 -20 L12 -10 L11 0" />
      </g>
      <g fill="#3a2516"><ellipse cx="-12" cy="0" rx="2.6" ry="1.5" /><ellipse cx="11" cy="0" rx="2.6" ry="1.5" /><ellipse cx="-17" cy="0" rx="2.4" ry="1.4" /><ellipse cx="16" cy="0" rx="2.4" ry="1.4" /></g>
      <g className="st-deer-head">
        <path d="M14 -33 C17 -40 21 -48 25 -52 L31 -49 C28 -44 24 -36 22 -29 Z" fill="#b8793f" />
        <path d="M24 -57 C28 -61 36 -58 41 -51 C43 -48 41 -46 38 -46 C33 -46 28 -48 24 -52 Z" fill="#b8793f" />
        <path d="M24 -55 C21 -61 22 -66 25 -66 C27 -63 27 -59 26 -55 Z" fill="#a46a37" />
        <circle cx="41" cy="-49" r="1.8" fill="#2b1a10" />
        <circle cx="32" cy="-53" r="1.5" fill="#2b1a10" />
        <path d="M28 -58 C28 -66 26 -72 22 -76 M27 -66 C30 -69 33 -70 35 -72 M25 -71 C22 -73 20 -73 18 -75" stroke="#7a5232" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
}

/** One bird of the flock: two wings that flap from the shoulder and a small body. */
export function Bird({ x, y, scale, delay }: { x: number; y: number; scale: number; delay: number }) {
  const style = { animationDelay: `${delay}s` } as CSSProperties;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="st-bird" style={style}>
        <path className="st-bird-wing" style={style} d="M0 0 C-5 -9 -15 -13 -25 -8 C-17 -8 -9 -5 -1 2 Z" />
        <path className="st-bird-wing is-right" style={style} d="M0 0 C5 -9 15 -13 25 -8 C17 -8 9 -5 1 2 Z" />
        <path d="M-6 1 C-3 -2 4 -2 7 0 C9 0 11 1 12 2 C8 3 3 4 -1 3 C-3 3 -5 2 -6 1 Z" />
      </g>
    </g>
  );
}

/** A soft cumulus cloud: body, a shaded underside and two sunlit puffs. */
export function Cloud({ className, width }: { className: string; width: number }) {
  return (
    <svg className={`st-cloud ${className}`} viewBox="0 0 240 110" width={width} aria-hidden="true">
      <path className="st-cloud-body" d="M34 96 C14 96 6 80 14 68 C8 52 24 38 42 44 C46 22 74 12 94 26 C104 8 140 4 154 28 C168 18 196 22 200 46 C222 46 236 64 228 80 C226 92 214 96 200 96 Z" />
      <path className="st-cloud-shade" d="M34 96 C18 96 10 86 12 76 C40 88 150 92 226 78 C228 90 216 96 200 96 Z" />
      <path className="st-cloud-light" d="M50 50 C54 34 72 27 87 34 C79 35 70 41 66 50 Z M108 30 C118 17 138 15 150 30 C139 27 125 28 117 36 Z" />
    </svg>
  );
}

/** A butterfly; the wings fold in time with a CSS flutter. */
export function Butterfly({ color, under }: { color: string; under: string }) {
  return (
    <g className="st-butterfly">
      <path d="M0 0 C-6 -13 -17 -13 -16 -3 C-15 2 -6 2 0 0 Z M0 0 C6 -13 17 -13 16 -3 C15 2 6 2 0 0 Z" fill={color} />
      <path d="M0 0 C-5 4 -12 11 -8 13 C-4 14 -1 6 0 0 Z M0 0 C5 4 12 11 8 13 C4 14 1 6 0 0 Z" fill={under} />
      <rect x="-1.1" y="-7" width="2.2" height="14" rx="1.1" fill="#4a3428" />
    </g>
  );
}

/** A rabbit sitting in the grass, ears twitching. */
export function Rabbit({ x, y }: { x: number; y: number }) {
  return (
    <g className="st-rabbit" transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="5" rx="27" ry="4" fill="#4e8a55" opacity="0.3" />
      <circle cx="-24" cy="-8" r="6.5" fill="#ffffff" />
      <path d="M-23 3 C-27 -13 -13 -26 3 -25 C16 -24 23 -13 21 0 C14 5 -16 6 -23 3 Z" fill="#f3eee5" />
      <ellipse cx="-9" cy="-7" rx="13" ry="11" fill="#e8dfd1" />
      <ellipse cx="-3" cy="3" rx="11" ry="3.6" fill="#efe7db" />
      <g className="st-rabbit-ears">
        <path d="M9 -32 C4 -47 6 -58 11 -58 C15 -57 15 -46 14 -33 Z" fill="#e8dfd1" />
        <path d="M13 -33 C10 -49 13 -61 18 -60 C22 -59 21 -47 18 -33 Z" fill="#f3eee5" />
        <path d="M15 -36 C13 -48 15 -56 17.5 -56 C19 -55 19 -46 17 -36 Z" fill="#f4b9be" />
      </g>
      <circle cx="18" cy="-24" r="11.5" fill="#f6f2ea" />
      <ellipse cx="23" cy="-19" rx="6" ry="4.6" fill="#fbf8f2" />
      <circle cx="22" cy="-27" r="2.1" fill="#2b1a10" /><circle cx="22.7" cy="-27.7" r="0.7" fill="#fff" />
      <circle cx="29" cy="-21.5" r="1.7" fill="#f49aa5" />
    </g>
  );
}

/** A wooden two-way signpost: "Your apps" points ahead to the gate, "Home" points back. Text is fitted to the planks. */
export function Signpost({ x, y }: { x: number; y: number }) {
  return (
    <g className="st-signpost" transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="4" rx="22" ry="4" fill="#4e8a55" opacity="0.35" />
      <path d="M-5.5 6 V-112 a5.5 5.5 0 0 1 11 0 V6 Z" fill="#8a5a36" />
      <path d="M1.5 6 V-114 a5.5 5.5 0 0 1 4 2 V6 Z" fill="#a8744a" />
      <path d="M-62 -104 H54 L72 -88 L54 -72 H-62 a4 4 0 0 1 -4 -4 V-100 a4 4 0 0 1 4 -4 Z" fill="#a36d40" />
      <path d="M-62 -106 H54 L72 -90 L54 -74 H-62 a4 4 0 0 1 -4 -4 V-102 a4 4 0 0 1 4 -4 Z" fill="#c98f5c" />
      <path d="M-58 -96 C-30 -98 10 -95 46 -97 M-52 -82 C-20 -80 20 -83 52 -81" stroke="#b47c4b" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <text x="-2" y="-83.5" className="st-signpost-text" textAnchor="middle" textLength="92" lengthAdjust="spacingAndGlyphs">Your apps</text>
      <path d="M58 -58 H-48 L-64 -44 L-48 -30 H58 a4 4 0 0 0 4 -4 V-54 a4 4 0 0 0 -4 -4 Z" fill="#a36d40" />
      <path d="M58 -60 H-48 L-64 -46 L-48 -32 H58 a4 4 0 0 0 4 -4 V-56 a4 4 0 0 0 -4 -4 Z" fill="#c38955" />
      <text x="6" y="-39.5" className="st-signpost-text is-small" textAnchor="middle" textLength="52" lengthAdjust="spacingAndGlyphs">Home</text>
      <g fill="#6b4527"><circle cx="-56" cy="-90" r="1.8" /><circle cx="50" cy="-46" r="1.8" /></g>
      <path d="M-14 6 q3 -10 6 -12 q-1 6 0 12 M8 6 q4 -9 8 -11 q-3 5 -2 11" fill="#63aa4a" />
    </g>
  );
}

const ARCH = { cx: 3134, base: 890, spring: 690, outer: 88, inner: 64 };

/** The ivy-covered stone gate at the end of the walk, with the locked apps glowing inside. */
export function Gate({ children }: { children?: ReactNode }) {
  const { cx, base, spring, outer, inner } = ARCH;
  const stones = ['', ''];
  // Jamb blocks in alternating courses, then voussoirs around the arch and a keystone.
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? cx - outer : cx + inner;
    const courses = [[base, 842], [842, 788], [788, 738], [738, spring]];
    courses.forEach(([y1, y0], index) => {
      stones[(index + (side > 0 ? 1 : 0)) % 2] += `M${x0 + 1} ${y0 + 1.5}h${outer - inner - 2}v${y1 - y0 - 3}h${-(outer - inner - 2)}Z`;
    });
  }
  const wedges = 9;
  for (let i = 0; i < wedges; i += 1) {
    if (i === 4) continue;
    const a0 = Math.PI - (Math.PI * i) / wedges - 0.012;
    const a1 = Math.PI - (Math.PI * (i + 1)) / wedges + 0.012;
    const p = (a: number, r: number) => `${(cx + Math.cos(a) * r).toFixed(1)} ${(spring - Math.sin(a) * r).toFixed(1)}`;
    stones[i % 2] += `M${p(a0, inner)}L${p(a0, outer)}A${outer} ${outer} 0 0 1 ${p(a1, outer)}L${p(a1, inner)}A${inner} ${inner} 0 0 0 ${p(a0, inner)}Z`;
  }
  let ivyDark = '';
  let ivyLight = '';
  for (let i = 0; i < 17; i += 1) {
    const a = (10 + i * 10) * (Math.PI / 180);
    const r = outer + 2 + (i % 3) * 2;
    const px = cx + Math.cos(a) * r;
    const py = spring - Math.sin(a) * r;
    const piece = leaf(px, py, -a + (i % 2 ? 0.9 : -0.9), 15 + (i % 3) * 3);
    if (i % 3) ivyLight += piece; else ivyDark += piece;
  }
  for (const [px, py, a, side] of [[cx - outer - 2, 716, 2.4, 0], [cx - outer - 4, 752, 2.1, 1], [cx - outer, 790, 2.5, 0], [cx + outer + 2, 724, 0.7, 1], [cx + outer + 3, 764, 0.4, 0]] as [number, number, number, number][]) {
    const piece = leaf(px, py, a, 16);
    if (side) ivyLight += piece; else ivyDark += piece;
  }
  return (
    <g className="st-gate">
      <ellipse className="st-gate-glow" cx={cx} cy="760" rx="210" ry="220" fill="url(#walk-glow)" />
      <ellipse cx={cx} cy={base + 3} rx="110" ry="11" fill="#4f8a45" opacity="0.35" />
      <path d={`M${cx - outer} ${base} V${spring} A${outer} ${outer} 0 0 1 ${cx + outer} ${spring} V${base} Z`} fill="#b9a382" />
      <path d={stones[0]} fill="#d8c6a8" />
      <path d={stones[1]} fill="#cbb693" />
      <path d={`M${cx - 13} ${spring - outer - 8} H${cx + 13} L${cx + 9} ${spring - inner + 2} H${cx - 9} Z`} fill="#e3d3b8" />
      <path d={`M${cx - inner} ${base} V${spring} A${inner} ${inner} 0 0 1 ${cx + inner} ${spring} V${base} Z`} fill="#9b8465" />
      <path d={`M${cx - inner + 6} ${base - 4} V${spring + 6} A${inner - 6} ${inner - 6} 0 0 1 ${cx + inner - 6} ${spring + 6} V${base - 4} Z`} fill="url(#walk-portal)" />
      <path d={`M${cx - outer - 4} ${spring + 40} C${cx - outer - 8} ${spring - 60} ${cx - 40} ${spring - outer - 22} ${cx} ${spring - outer - 10} C${cx + 46} ${spring - outer - 18} ${cx + outer + 10} ${spring - 52} ${cx + outer + 4} ${spring + 50}`} stroke="#4f8f3e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d={ivyDark} fill="#4a9640" />
      <path d={ivyLight} fill="#63ae4f" />
      {[[cx - 62, spring - 66, '#ff9db5'], [cx + 64, spring - 64, '#ffd76a'], [cx, spring - outer - 14, '#fff8ef'], [cx - outer - 2, 740, '#ff9db5'], [cx + outer + 3, 744, '#fff8ef']].map(([fx, fy, color]) => (
        <g key={`${fx}-${fy}`}><circle cx={fx as number} cy={fy as number} r="5.5" fill={color as string} /><circle cx={fx as number} cy={fy as number} r="2.2" fill="#f2a93b" /></g>
      ))}
      {children}
    </g>
  );
}
