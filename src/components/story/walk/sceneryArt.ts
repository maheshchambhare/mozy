// Path generators for the walk chapter's scenery. Every layer is 1000 units tall and ART_WIDTH wide, wide enough
// that a layer never has to be stretched past the stage's scale, even on 21:9 screens.
export const ART_WIDTH = 3800;

export function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (value: number) => value.toFixed(1);
type Point = [number, number];
const poly = (points: Point[]) => `M${points.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`;
// Whole-unit polygons for the many small pines; a tenth of a unit is invisible at that size and costs bytes.
const polyInt = (points: Point[]) => `M${points.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join(' ')}Z`;
export const circle = (cx: number, cy: number, r: number) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-2 * rx)} 0Z`;

// Ground lines as functions, so trees, the windmill and the deer stand exactly on them.
export const footY = (x: number) => 704 + 9 * Math.sin(x / 230) + 6 * Math.sin(x / 90 + 1);
export const midY = (x: number) => 694 + 20 * Math.sin(x / 410 + 1.1) + 9 * Math.sin(x / 165 + 0.2);
export const hillY = (x: number) => 730 + 17 * Math.sin(x / 300 + 0.4) + 10 * Math.sin(x / 131 + 1.7) + 4 * Math.sin(x / 63 + 0.3);

/** A filled ground: the line `fn` across the art, filled down to the bottom edge. */
export function ground(fn: (x: number) => number, width = ART_WIDTH, step = 16) {
  let d = `M0 ${n(fn(0))}`;
  for (let x = step; x <= width + step; x += step) d += `L${x} ${n(fn(x))}`;
  return `${d}L${width + step} 1000L0 1000Z`;
}

/** The x in [from, to] where `fn` is highest on screen (smallest y): a crest to stand things on. */
export function crest(fn: (x: number) => number, from: number, to: number) {
  let best = from;
  for (let x = from; x <= to; x += 4) if (fn(x) < fn(best)) best = x;
  return best;
}

export type Peak = { lit: string; shade: string; snow?: string; snowShade?: string };

/**
 * A mountain range lit from the upper right (where the sun rises): each peak has a sunlit body, a shaded left
 * face behind a ragged ridge, and, if it is tall enough, a snow cap with drips and its own shaded half.
 * Taller peaks come first so the lower ones in front overlap them.
 */
export function mountainRange(seed: number, base: number, minTop: number, maxTop: number, snowLine: number, spacing: [number, number]) {
  const next = random(seed);
  const peaks: { x: number; top: number; wl: number; wr: number }[] = [];
  for (let x = -140; x < ART_WIDTH + 240; x += spacing[0] + next() * (spacing[1] - spacing[0])) {
    const top = minTop + next() * (maxTop - minTop);
    const height = base - top;
    peaks.push({ x, top, wl: height * (1.3 + next() * 0.5), wr: height * (1.2 + next() * 0.5) });
  }
  peaks.sort((a, b) => a.top - b.top);
  const profile = 1.35;
  return peaks.map(({ x, top, wl, wr }): Peak => {
    const height = base - top;
    const yAt = (t: number) => base - height * t ** profile;
    const steps = 9;
    const left: Point[] = [];
    const right: Point[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const jitter = t > 0.3 && t < 0.74 ? (next() - 0.5) * 12 : 0;
      left.push([x - wl * (1 - t), yAt(t) + jitter]);
    }
    for (let i = steps; i >= 0; i -= 1) {
      const t = i / steps;
      const jitter = t > 0.3 && t < 0.74 ? (next() - 0.5) * 12 : 0;
      right.push([x + wr * (1 - t), yAt(t) + jitter]);
    }
    const lit = poly([...left, ...right.slice(1)]);
    // The ridge drops from the summit to the base a little right of centre; the left face is in shade.
    const ridge: Point[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      ridge.push([x + wr * 0.14 * (1 - t) + (i > 0 && i < steps ? (next() - 0.5) * 16 * (1 - t) : 0), yAt(t)]);
    }
    const shade = poly([...left, ...ridge.slice().reverse().slice(1)]);
    if (top > snowLine) return { lit, shade };
    const snowY = top + height * (0.22 + next() * 0.08);
    const tAt = ((base - snowY) / height) ** (1 / profile);
    const sl: Point = [x - wl * (1 - tAt), snowY];
    const sr: Point = [x + wr * (1 - tAt), snowY];
    const drips: Point[] = [];
    const count = 7;
    for (let i = 1; i < count; i += 1) {
      const px = sl[0] + ((sr[0] - sl[0]) * i) / count;
      drips.push([px, snowY + (i % 2 ? 8 + next() * 14 : -3 + next() * 5)]);
    }
    const snow = poly([[x, top], sl, ...drips, sr]);
    const ridgeX = x + wr * 0.14 * (1 - tAt);
    const shadedDrips = drips.filter(([px]) => px < ridgeX);
    const snowShade = poly([[x, top], sl, ...shadedDrips, [ridgeX, snowY + 4]]);
    return { lit, shade, snow, snowShade };
  });
}

/** A row of tiered pines in two tones (shaded left half, lit right half), standing on `baseFn`. */
export function pineRow(seed: number, from: number, to: number, baseFn: (x: number) => number, offset: number, minH: number, maxH: number, gap: number, tiers = 3) {
  const next = random(seed);
  let dark = '';
  let light = '';
  for (let x = from; x < to; x += gap * (0.55 + next() * 0.8)) {
    const h = minH + next() * (maxH - minH);
    const w = h * 0.36;
    const y = baseFn(x) + offset + next() * 10;
    for (let tier = 0; tier < tiers; tier += 1) {
      const top = y - h + tier * h * (0.72 / tiers);
      const bottom = tiers === 1 ? y : y - h * 0.42 + tier * h * (0.63 / tiers);
      const half = w * (tiers === 1 ? 0.9 : 0.5 + tier * 0.26);
      const notch = bottom - h * 0.05;
      dark += polyInt([[x, top], [x - half, bottom], [x, notch]]);
      light += polyInt([[x, top], [x + half, bottom], [x, notch]]);
    }
  }
  return { dark, light };
}

/** Round broadleaf trees: a trunk, a shaded under-crown, the crown and two sunlit puffs on the upper right. */
export function roundTrees(seed: number, xs: number[], baseFn: (x: number) => number, size: number) {
  const next = random(seed);
  let trunk = '';
  let shade = '';
  let crown = '';
  let light = '';
  for (const x of xs) {
    const y = baseFn(x) + 4;
    const r = size * (0.78 + next() * 0.44);
    trunk += poly([[x - 3.6, y], [x - 2, y - r * 1.25], [x + 2, y - r * 1.25], [x + 3.6, y]]);
    const puffs: [number, number, number][] = [[0, -1.55, 1], [-0.62, -1.1, 0.72], [0.66, -1.08, 0.74], [0.12, -2.08, 0.6]];
    for (const [dx, dy, k] of puffs) {
      shade += circle(x + dx * r - r * 0.1, y + dy * r + r * 0.12, r * k);
      crown += circle(x + dx * r + r * 0.04, y + dy * r - r * 0.04, r * k * 0.94);
    }
    light += circle(x + r * 0.32, y - r * 1.78, r * 0.42) + circle(x + r * 0.78, y - r * 1.22, r * 0.27);
  }
  return { trunk, shade, crown, light };
}

/** Wavy edge from x=0 to width, filled down to the bottom of the layer. */
export function waveFill(width: number, y: number, amp: number, step: number, phase: number) {
  let d = `M0 ${n(y + Math.sin(phase) * amp)}`;
  for (let x = 0, i = 0; x < width; x += step, i += 1) {
    const at = (k: number) => n(y + Math.sin(k * 1.7 + phase) * amp);
    d += `C${x + step / 3} ${at(i + 0.35)} ${x + (2 * step) / 3} ${at(i + 0.65)} ${x + step} ${at(i + 1)}`;
  }
  return `${d}L${width + 400} 1000L0 1000Z`;
}

/** A pointed leaf whose base sits at (cx, cy), pointing along `angle` (radians), `size` long. */
export function leaf(cx: number, cy: number, angle: number, size: number) {
  const k = size / 14;
  const at = (lx: number, ly: number) => `${n(cx + (lx * Math.cos(angle) - ly * Math.sin(angle)) * k)} ${n(cy + (lx * Math.sin(angle) + ly * Math.cos(angle)) * k)}`;
  return `M${at(0, 0)}C${at(4, -6)} ${at(11, -6)} ${at(14, 0)}C${at(11, 6)} ${at(4, 6)} ${at(0, 0)}Z`;
}
