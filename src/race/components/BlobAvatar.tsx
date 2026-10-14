import { useId, useMemo } from 'react';
import { blobOf, blobRadius, BODY_Y } from '../blob';
import type { CrownKind } from '../crowns';
import { Crown } from './bits';

// Blob units (x -0.5…0.5, y 0…1 from the ground up) to SVG units in a 100 × 100 box.
const X = (x: number) => 50 + x * 100;
const Y = (y: number) => 100 - y * 100;
const INK = '#23140c';

/** A closed Catmull-Rom curve through the points, as an SVG path. */
function smoothPath(points: [number, number][]) {
  const n = points.length;
  let d = `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n], p1 = points[i], p2 = points[(i + 1) % n], p3 = points[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `${d}Z`;
}

const shade = (rgb: [number, number, number], k: number, lift = 0) =>
  `rgb(${rgb.map(v => Math.round(Math.min(255, v * k + lift))).join(',')})`;

function Eyes({ style }: { style: number }) {
  return (
    <>
      {[-0.13, 0.13].map(x => {
        const cx = X(x), cy = Y(0.5);
        if (style === 1) return <path key={x} d={`M${cx - 4.2} ${cy + 1.6} Q${cx} ${cy - 5} ${cx + 4.2} ${cy + 1.6}`} stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />;
        if (style === 3) return <path key={x} d={`M${cx - 4.2} ${cy - 1} Q${cx} ${cy + 4.4} ${cx + 4.2} ${cy - 1}`} stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />;
        const r = style === 2 ? 6 : 4.6;
        return (
          <g key={x}>
            <circle cx={cx} cy={cy} r={r} fill={INK} />
            <circle cx={cx + r * 0.32} cy={cy - r * 0.36} r={r * 0.34} fill="#fff" />
            {style === 2 ? <circle cx={cx - r * 0.35} cy={cy + r * 0.35} r={r * 0.16} fill="#fff" /> : null}
          </g>
        );
      })}
    </>
  );
}

function Mouth({ style }: { style: number }) {
  const cx = X(0), cy = Y(0.36);
  if (style === 1) return <g><path d={`M${cx - 6} ${cy - 1.5} Q${cx} ${cy + 9} ${cx + 6} ${cy - 1.5} Z`} fill="#5a1a1a" /><ellipse cx={cx} cy={cy + 3.4} rx="3" ry="1.8" fill="#ff7f8f" /></g>;
  if (style === 2) return <path d={`M${cx - 5} ${cy - 1} Q${cx - 2.5} ${cy + 3.4} ${cx} ${cy - 0.4} Q${cx + 2.5} ${cy + 3.4} ${cx + 5} ${cy - 1}`} stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  if (style === 3) return <ellipse cx={cx} cy={cy + 0.8} rx="2.6" ry="3.2" fill="#5a1a1a" />;
  return <path d={`M${cx - 4.6} ${cy - 1.2} Q${cx} ${cy + 4.6} ${cx + 4.6} ${cy - 1.2}`} stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />;
}

/** A walker's blob, the same drawing the globe shows, for lists and cards. */
export function BlobAvatar({ id, size = 36, crown, className = '' }: { id: string; size?: number; crown?: CrownKind | null; className?: string }) {
  const blob = blobOf(id);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const body = useMemo(() => {
    const points: [number, number][] = [];
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const r = blobRadius(blob, angle);
      points.push([X(Math.cos(angle) * r), Y(BODY_Y + Math.sin(angle) * r * blob.squash)]);
    }
    return smoothPath(points);
  }, [blob]);
  return (
    <span className={`rc-blob ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <defs>
          <radialGradient id={`g${uid}`} cx="0.38" cy="0.32" r="0.75">
            <stop offset="0" stopColor={shade(blob.rgb, 1, 70)} />
            <stop offset="0.55" stopColor={blob.color} />
            <stop offset="1" stopColor={shade(blob.rgb, 0.72)} />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="96" rx="30" ry="4.2" fill="#000" opacity="0.28" />
        <path d={body} fill={`url(#g${uid})`} stroke={shade(blob.rgb, 0.55)} strokeWidth="2.4" />
        <ellipse cx={X(-0.15)} cy={Y(BODY_Y + 0.2 * blob.squash)} rx="9" ry="5.2" transform={`rotate(-24 ${X(-0.15)} ${Y(BODY_Y + 0.2 * blob.squash)})`} fill="#fff" opacity="0.7" />
        {blob.blush ? <>{[-0.24, 0.24].map(x => <ellipse key={x} cx={X(x)} cy={Y(0.41)} rx="5" ry="3" fill="#ff6f91" opacity="0.45" />)}</> : null}
        <Eyes style={blob.eyes} />
        <Mouth style={blob.mouth} />
      </svg>
      {crown ? <Crown kind={crown} /> : null}
    </span>
  );
}
