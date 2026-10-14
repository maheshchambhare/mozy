/**
 * Blobs: every walker's avatar on the world map. A blob is a soft jelly shape with a face, and its colour is also the
 * colour of the walker's land. Today a blob is worked out from the walker's id; later the app will hand each walker
 * their blob (a seed the race API returns), and the same maths draws it here (SVG in lists, a shader on the globe).
 *
 * Drawing space (shared by BlobAvatar and the globe shader): x from -0.5 to 0.5, y from 0 (ground) up to 1.
 * The body is centred at (0, BODY_Y) with radius BODY_R, wobbled by three harmonics and squashed vertically.
 */
export interface Blob {
  /** Body colour, #rrggbb. */
  color: string;
  rgb: [number, number, number];
  /** Land colour: the body colour, a little muted so the blob stands out on its own land. */
  land: [number, number, number];
  /** Harmonic amplitudes (2nd, 3rd, 4th) and a phase seed 0–1. */
  shape: [number, number, number, number];
  /** Vertical squash, ~0.9–1.06. */
  squash: number;
  /** Face: eyes 0 dots · 1 happy arcs · 2 big sparkly · 3 sleepy; mouth 0 smile · 1 open · 2 cat · 3 "o". */
  eyes: number;
  mouth: number;
  blush: boolean;
}

export const BODY_Y = 0.46;
export const BODY_R = 0.4;

/** Candy colours that read well on the night globe and against each other. */
export const BLOB_COLORS = [
  '#FF6B6B', '#FF9F43', '#FECA57', '#C4E538', '#2ED573', '#1DD1A1', '#00D2D3', '#48DBFB', '#54A0FF', '#6C7BFF',
  '#A29BFE', '#8E6CFF', '#E056FD', '#FD79A8', '#FF8FAB', '#FAB1A0', '#E17055', '#B8E994', '#F6E58D', '#7ED6DF',
];

const hexRgb = (hex: string): [number, number, number] => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];

/** FNV-1a, salted, as a number in [0, 1). */
function unit(id: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  return (h >>> 0) / 4294967296;
}

const cache = new Map<string, Blob>();

export function blobOf(id: string): Blob {
  let blob = cache.get(id);
  if (blob) return blob;
  const color = BLOB_COLORS[Math.floor(unit(id, 1) * BLOB_COLORS.length)];
  const rgb = hexRgb(color);
  const slate = [62, 72, 104];
  const land = rgb.map((value, index) => Math.round((value * 0.8 + slate[index] * 0.2) * 0.9)) as [number, number, number];
  blob = {
    color, rgb, land,
    shape: [0.02 + unit(id, 2) * 0.07, unit(id, 3) * 0.05, unit(id, 4) * 0.035, unit(id, 5)],
    squash: 0.9 + unit(id, 6) * 0.16,
    eyes: Math.floor(unit(id, 7) * 4),
    mouth: Math.floor(unit(id, 8) * 4),
    blush: unit(id, 9) < 0.65,
  };
  cache.set(id, blob);
  return blob;
}

/** Body radius at an angle (radians), before the squash. */
export function blobRadius(blob: Blob, angle: number) {
  const [a2, a3, a4, w] = blob.shape;
  return BODY_R * (1 + a2 * Math.cos(2 * angle + w * 7) + a3 * Math.cos(3 * angle + w * 11) + a4 * Math.cos(4 * angle + w * 5));
}
