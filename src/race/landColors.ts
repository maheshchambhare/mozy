import { blobOf } from './blob';
import type { Territory } from './globe/territory';
import type { TileSet } from './globe/tiles';

/**
 * Land colours. Blobs carry the bright colours; land stays calm so a busy country doesn't turn into confetti:
 * - `pastel`: a candy patchwork of light pastels, warm and cool (the default);
 * - `cool`: the same with only cool pastels (mint, aqua, sky, periwinkle, lavender, lilac);
 * - `fields`: a patchwork of soft greens, like fields from the air;
 * - `sand`: the same patchwork in warm sand;
 * - `country`: each country its own soft hue, its territories in shades of it;
 * - `blob`: each territory in its owner's blob colour (the first version, kept to compare).
 * Neighbouring territories never share a shade, and each walker keeps their shade from one update to the next.
 */
export type LandMode = 'pastel' | 'cool' | 'fields' | 'sand' | 'country' | 'blob';

type Rgb = [number, number, number];
const hex = (value: string): Rgb => [parseInt(value.slice(1, 3), 16), parseInt(value.slice(3, 5), 16), parseInt(value.slice(5, 7), 16)];

// Pastels at about the same lightness, so no territory shouts louder than its neighbours.
const PATCHWORK: Record<'pastel' | 'cool' | 'fields' | 'sand', Rgb[]> = {
  pastel: ['#B8F0D8', '#AEDBFF', '#CDBDFA', '#FFD6BF', '#FFEBA8', '#FBC6DD', '#AAEDEC', '#BDC8FF', '#D5F0B2', '#E6CBF7'].map(hex),
  cool: ['#B8F0D8', '#AAEDEC', '#AEDBFF', '#BDC8FF', '#CDBDFA', '#E6CBF7', '#C8F2C2', '#D3E3FF'].map(hex),
  fields: ['#79C08E', '#93CFA2', '#68B07F', '#A5D8B0', '#86C497', '#5FA676'].map(hex),
  sand: ['#E3D5B8', '#D8C8A7', '#ECE1CA', '#CDBC98', '#E0CFAE', '#D2C29F'].map(hex),
};

function hsl(h: number, s: number, l: number): Rgb {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return [f(0), f(8), f(4)];
}

const hashCc = (cc: string) => (cc.charCodeAt(0) * 31 + cc.charCodeAt(1) * 17) % 360;
/** Six soft shades of one country's hue. */
const countryShades = (cc: string): Rgb[] => [0.8, 0.86, 0.76, 0.89, 0.83, 0.78].map((l, i) => hsl(hashCc(cc), 0.55 + (i % 2) * 0.12, l));

// Shade remembered per walker and mode, so territories keep their look while land changes hands.
const remembered = new Map<string, number>();

export function landColors(territory: Territory, mode: LandMode): Rgb[] {
  const { owners, owner, tileSet } = territory;
  if (mode === 'blob') return owners.map(item => blobOf(item.walker.id).land);
  // Who borders whom.
  const touching: Set<number>[] = owners.map(() => new Set());
  for (let t = 0; t < tileSet.count; t++) {
    const o = owner[t];
    if (o < 0) continue;
    for (let k = tileSet.vStart[t]; k < tileSet.vStart[t + 1]; k++) {
      const n = tileSet.edgeNbr[k];
      if (n >= 0 && owner[n] >= 0 && owner[n] !== o) touching[o].add(owner[n]);
    }
  }
  const shade = new Int8Array(owners.length).fill(-1);
  const result: Rgb[] = new Array(owners.length);
  owners.forEach((item, o) => {
    const palette = mode === 'country' ? countryShades(item.walker.cc) : PATCHWORK[mode];
    const taken = new Set<number>();
    for (const other of touching[o]) if (shade[other] >= 0) taken.add(shade[other]);
    const key = `${mode}:${item.walker.id}`;
    const before = remembered.get(key);
    let pick = before !== undefined && !taken.has(before) ? before : -1;
    if (pick < 0) {
      // Start from a spot set by the id, so new walkers don't all take the first shade.
      const startAt = item.walker.id.charCodeAt(item.walker.id.length - 1) % palette.length;
      for (let k = 0; k < palette.length && pick < 0; k++) if (!taken.has((startAt + k) % palette.length)) pick = (startAt + k) % palette.length;
      if (pick < 0) pick = startAt;
    }
    shade[o] = pick;
    remembered.set(key, pick);
    result[o] = palette[pick];
  });
  return result;
}

/**
 * One soft colour per country with walkers, used where its territories are too small on screen to tell apart (the
 * globe blends to it from far away). Neighbouring countries get different colours.
 */
export function countryTones(tileSet: TileSet, mode: LandMode): (Rgb | null)[] {
  const palette = mode === 'cool' || mode === 'fields' || mode === 'sand' ? PATCHWORK[mode] : PATCHWORK.pastel;
  const { shapes, centers } = tileSet;
  // Which countries are near each other: shared 2° squares of the map, from a sample of each country's tiles.
  const cells = new Map<number, Set<number>>();
  shapes.forEach((shape, s) => {
    if (!shape.cc) return;
    const count = shape.end - shape.start;
    const stride = Math.max(1, Math.floor(count / 400));
    for (let t = shape.start; t < shape.end; t += stride) {
      const lat = (Math.asin(Math.max(-1, Math.min(1, centers[t * 3 + 1]))) * 180) / Math.PI;
      const lng = (Math.atan2(centers[t * 3], centers[t * 3 + 2]) * 180) / Math.PI;
      const key = Math.floor((lat + 90) / 2) * 1000 + Math.floor((lng + 180) / 2);
      let set = cells.get(key);
      if (!set) cells.set(key, (set = new Set()));
      set.add(s);
    }
  });
  const near: Set<number>[] = shapes.map(() => new Set());
  for (const [key, set] of cells) {
    for (const dKey of [0, 1, 1000, 1001, 999, -1, -1000, -1001, -999]) {
      const other = cells.get(key + dKey);
      if (!other) continue;
      for (const a of set) for (const b of other) if (a !== b) { near[a].add(b); near[b].add(a); }
    }
  }
  const pick = new Int8Array(shapes.length).fill(-1);
  return shapes.map((shape, s) => {
    if (!shape.cc) return null;
    if (mode === 'country') return countryShades(shape.cc)[0];
    const taken = new Set<number>();
    for (const other of near[s]) if (pick[other] >= 0) taken.add(pick[other]);
    const startAt = (shape.cc.charCodeAt(0) * 7 + shape.cc.charCodeAt(1)) % palette.length;
    let choice = startAt;
    for (let k = 0; k < palette.length; k++) if (!taken.has((startAt + k) % palette.length)) { choice = (startAt + k) % palette.length; break; }
    pick[s] = choice;
    return palette[choice];
  });
}
