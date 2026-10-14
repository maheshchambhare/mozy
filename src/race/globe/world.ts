import type { Standings } from '../board';
import type { Walker } from '../types';
import { buildGrid, findCell, latLngToVec } from './grid';
import { finishTerritory, type Owner, type Territory } from './territory';
import { tileAt, type TileSet } from './tiles';

/**
 * One world, shared by strength.
 *
 * Every walker has a strength (a newcomer base plus steps, level and Moz Points) and a home. Every bit of land belongs
 * to someone, and land grows outward from each home:
 * - Shares by strength (fair = 1, the default): each walker's land is their share of all the land, so one walker owns
 *   the world, two equal walkers get half each, and a walker twice as strong gets twice the land. Everyone claims their
 *   nearest free land at the same pace relative to their share, so nobody is boxed in before they've grown.
 * - Borders by distance (fair = 0): land goes to whoever reaches it first, and stronger walkers move faster, so a walker
 *   alone on a continent keeps all of it until neighbours arrive.
 * - In between, a blend. Either way, walking more pushes your border into your neighbours' land, across any border,
 *   and islands are reached across the sea (which costs more than walking over land).
 * It depends only on today's strengths and homes, so a server and every phone get the same map.
 */
export interface StrengthRule {
  /** What every walker has from the start, so a newcomer with 0 steps still gets land. */
  newcomer: number;
  /** Added per 10,000 steps in the period. */
  perSteps: number;
  /** Added per level. */
  perLevel: number;
  /** Added per 1,000 Moz Points. */
  perMp: number;
  /** Borders by distance: speed = strength^curve (0.5 makes area grow in step with strength). */
  curve: number;
  /** How much more a kilometre of sea costs than a kilometre of land. */
  sea: number;
  /**
   * 1 = shares by strength, 0 = borders by distance, in between a blend; -1 = automatic: shares while the world is
   * small (two equal walkers get half each), turning into local borders as it fills up (in a crowded city, global
   * shares can't be met without taking land far from home, while borders stay fair between neighbours).
   */
  fair: number;
}

export const DEFAULT_STRENGTH: StrengthRule = { newcomer: 1, perSteps: 1, perLevel: 0.15, perMp: 0.3, curve: 0.5, sea: 1.8, fair: -1 };

/** The blend actually used for a world of `walkers` (see `fair`). */
export function fairFor(rule: StrengthRule, walkers: number) {
  return rule.fair >= 0 ? rule.fair : Math.max(0, Math.min(1, 1 - Math.log10(Math.max(1, walkers)) / 3.3));
}

export function strengthOf(walker: Walker, steps: number, rule: StrengthRule) {
  return rule.newcomer + (rule.perSteps * steps) / 10_000 + rule.perLevel * walker.level + (rule.perMp * walker.mp) / 1000;
}

/** Land tiles joined by shared edges, plus sea bridges between coasts that face each other. */
export interface WorldGraph {
  tiles: TileSet;
  start: Int32Array;
  to: Int32Array;
  /** Edge cost in radians of walking (bridges include the sea factor). */
  cost: Float32Array;
}

const graphs = new WeakMap<TileSet, Map<number, WorldGraph>>();

/** A min-heap over (priority, item). */
class Heap {
  prio: number[] = [];
  item: number[] = [];
  get size() { return this.prio.length; }
  push(p: number, value: number) {
    const { prio, item } = this;
    let i = prio.length;
    prio.push(p); item.push(value);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (prio[parent] <= p) break;
      prio[i] = prio[parent]; item[i] = item[parent];
      i = parent;
    }
    prio[i] = p; item[i] = value;
  }
  pop() {
    const { prio, item } = this;
    const top = item[0];
    const lastP = prio.pop()!, lastI = item.pop()!;
    const n = prio.length;
    if (n) {
      let i = 0;
      for (;;) {
        let child = 2 * i + 1;
        if (child >= n) break;
        if (child + 1 < n && prio[child + 1] < prio[child]) child++;
        if (prio[child] >= lastP) break;
        prio[i] = prio[child]; item[i] = item[child];
        i = child;
      }
      prio[i] = lastP; item[i] = lastI;
    }
    return top;
  }
}

export function worldGraph(tiles: TileSet, seaFactor: number): WorldGraph {
  let bySea = graphs.get(tiles);
  if (!bySea) graphs.set(tiles, (bySea = new Map()));
  const cached = bySea.get(seaFactor);
  if (cached) return cached;
  const { centers, verts, vStart, edgeNbr, shapeOf, ice } = tiles;
  const land = tiles.count;
  const angle = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) => Math.acos(Math.max(-1, Math.min(1, ax * bx + ay * by + az * bz)));
  const from: number[] = [], to: number[] = [], cost: number[] = [];
  const seen = new Set<number>();
  const link = (a: number, b: number, c: number) => {
    if (a === b) return;
    const key = a < b ? a * land + b : b * land + a;
    if (seen.has(key)) return;
    seen.add(key);
    from.push(a); to.push(b); cost.push(c);
  };
  // Neighbouring tiles, and for each sea-facing edge, the cell of a coarse sea grid just beyond it.
  const nav = buildGrid(40);
  const coastOf = new Map<number, number[]>();
  for (let t = 0; t < land; t++) {
    if (shapeOf[t] === ice) continue;
    const cx = centers[t * 3], cy = centers[t * 3 + 1], cz = centers[t * 3 + 2];
    const m = vStart[t + 1] - vStart[t];
    for (let k = 0; k < m; k++) {
      const slot = vStart[t] + k;
      const n = edgeNbr[slot];
      if (n >= 0) {
        if (shapeOf[n] !== ice) link(t, n, angle(cx, cy, cz, centers[n * 3], centers[n * 3 + 1], centers[n * 3 + 2]));
        continue;
      }
      const a = slot * 3, b = (vStart[t] + ((k + 1) % m)) * 3;
      let ox = (verts[a] + verts[b]) / 2, oy = (verts[a + 1] + verts[b + 1]) / 2, oz = (verts[a + 2] + verts[b + 2]) / 2;
      ox += (ox - cx) * 0.8; oy += (oy - cy) * 0.8; oz += (oz - cz) * 0.8;
      const length = Math.hypot(ox, oy, oz);
      const cell = findCell(nav, ox / length, oy / length, oz / length);
      let list = coastOf.get(cell);
      if (!list) coastOf.set(cell, (list = []));
      if (!list.includes(t)) list.push(t);
    }
  }
  // Sea bridges: spread outward over the sea from every coast at once; where the spreads from two coasts meet, the
  // coasts get a bridge as long as the sea between them (times the sea factor).
  const seaDist = new Float64Array(nav.count).fill(Infinity);
  const seaFrom = new Int32Array(nav.count).fill(-1);
  const heap = new Heap();
  for (const [cell, list] of coastOf) {
    for (const t of list) {
      const d = angle(centers[t * 3], centers[t * 3 + 1], centers[t * 3 + 2], nav.centers[cell * 3], nav.centers[cell * 3 + 1], nav.centers[cell * 3 + 2]);
      if (d < seaDist[cell]) { seaDist[cell] = d; seaFrom[cell] = t; heap.push(d, cell); }
    }
  }
  while (heap.size) {
    const d = heap.prio[0];
    const cell = heap.pop();
    if (d > seaDist[cell]) continue;
    for (let k = nav.nbrStart[cell]; k < nav.nbrStart[cell + 1]; k++) {
      const m = nav.nbr[k];
      const next = d + angle(nav.centers[cell * 3], nav.centers[cell * 3 + 1], nav.centers[cell * 3 + 2], nav.centers[m * 3], nav.centers[m * 3 + 1], nav.centers[m * 3 + 2]);
      if (next < seaDist[m]) { seaDist[m] = next; seaFrom[m] = seaFrom[cell]; heap.push(next, m); }
    }
  }
  for (let e = 0; e < nav.edges.length; e += 4) {
    const a = nav.edges[e], b = nav.edges[e + 1];
    const ta = seaFrom[a], tb = seaFrom[b];
    if (ta < 0 || tb < 0 || ta === tb) continue;
    const across = seaDist[a] + seaDist[b] + angle(nav.centers[a * 3], nav.centers[a * 3 + 1], nav.centers[a * 3 + 2], nav.centers[b * 3], nav.centers[b * 3 + 1], nav.centers[b * 3 + 2]);
    link(ta, tb, across * seaFactor);
  }
  // A coast that shares its stretch of sea with a nearer one (a small island off a bigger coast) crosses to that one.
  for (const [cell, list] of coastOf) {
    const near = seaFrom[cell];
    if (near < 0) continue;
    for (const t of list) if (t !== near) link(t, near, angle(centers[t * 3], centers[t * 3 + 1], centers[t * 3 + 2], centers[near * 3], centers[near * 3 + 1], centers[near * 3 + 2]) * seaFactor);
  }
  const start = new Int32Array(land + 1);
  for (let i = 0; i < from.length; i++) { start[from[i] + 1]++; start[to[i] + 1]++; }
  for (let i = 0; i < land; i++) start[i + 1] += start[i];
  const at = start.slice(0, land);
  const out = new Int32Array(start[land]);
  const outCost = new Float32Array(start[land]);
  for (let i = 0; i < from.length; i++) {
    out[at[from[i]]] = to[i]; outCost[at[from[i]]++] = cost[i];
    out[at[to[i]]] = from[i]; outCost[at[to[i]]++] = cost[i];
  }
  const graph = { tiles, start, to: out, cost: outCost };
  bySea.set(seaFactor, graph);
  return graph;
}

const PACK = 4194304;

export function computeWorldTerritory(tiles: TileSet, standings: Standings, rule: StrengthRule): Territory {
  const graph = worldGraph(tiles, rule.sea);
  const land = tiles.count;
  const { centers } = tiles;
  const usable = (t: number) => tiles.shapeOf[t] !== tiles.ice;

  // Homes: strongest first, so the strongest keep their home tile when two homes fall on the same one.
  const contenders = standings.world.map(row => ({ row, weight: strengthOf(row.walker, row.steps, rule) })).sort((a, b) => b.weight - a.weight);
  const owners: Owner[] = [];
  const homeOf = new Int32Array(land).fill(-1);
  const nearestFreeLand = (from: number) => {
    const queue = [from];
    const seen = new Set(queue);
    for (let q = 0; q < queue.length; q++) {
      const node = queue[q];
      if (homeOf[node] < 0 && usable(node)) return node;
      for (let k = graph.start[node]; k < graph.start[node + 1]; k++) {
        const m = graph.to[k];
        if (!seen.has(m)) { seen.add(m); queue.push(m); }
      }
    }
    // A small island with every tile taken: the nearest free tile anywhere.
    let best = -1, bestDot = -2;
    for (let t = 0; t < land; t++) {
      if (homeOf[t] >= 0 || !usable(t)) continue;
      const d = centers[t * 3] * centers[from * 3] + centers[t * 3 + 1] * centers[from * 3 + 1] + centers[t * 3 + 2] * centers[from * 3 + 2];
      if (d > bestDot) { bestDot = d; best = t; }
    }
    return best;
  };
  for (const { row, weight } of contenders) {
    const walker = row.walker;
    const [lat, lng] = walker.home ?? walker.spot;
    let seed = tileAt(tiles, lat, lng);
    const own = tiles.byCc.get(walker.cc);
    if (seed < 0 || !usable(seed) || (own !== undefined && tiles.shapeOf[seed] !== own)) {
      // Homes off the 1:110m coastline or over a border: the nearest tile of their own country.
      const [x, y, z] = latLngToVec(lat, lng);
      let bestDot = -2;
      seed = -1;
      if (own !== undefined) {
        for (let t = tiles.shapes[own].start; t < tiles.shapes[own].end; t++) {
          const d = centers[t * 3] * x + centers[t * 3 + 1] * y + centers[t * 3 + 2] * z;
          if (d > bestDot) { bestDot = d; seed = t; }
        }
      }
    }
    if (seed >= 0 && homeOf[seed] >= 0) seed = nearestFreeLand(seed);
    if (seed < 0) continue;
    homeOf[seed] = owners.length;
    owners.push({ walker, steps: row.steps, rankInCountry: standings.countryRow.get(walker.id)?.rank ?? 0, tiles: 0, seed, anchor: seed, km2: 0, weight });
  }
  const n = owners.length;
  const owner = new Int32Array(land).fill(-1);
  const area = new Float64Array(n);
  const claimHomes = () => {
    owner.fill(-1);
    area.fill(0);
    owners.forEach((item, o) => { owner[item.seed] = o; area[o] = tiles.km2[item.seed]; });
  };

  /**
   * Borders by distance: everyone spreads at once at their own speed; the first to reach a tile keeps it. Homes don't
   * wall anyone in: a faster walker flows past other people's homes (keeping clear of the homes themselves).
   */
  const byDistance = () => {
    claimHomes();
    const heap = new Heap();
    const best = new Float64Array(land).fill(Infinity);
    const passed = new Float64Array(land).fill(Infinity);
    const speed = Float64Array.from(owners, item => Math.pow(item.weight ?? 1, rule.curve));
    owners.forEach((item, o) => heap.push(0, o * PACK + item.seed));
    while (heap.size) {
      const p = heap.prio[0];
      const item = heap.pop();
      const o = Math.floor(item / PACK), node = item - o * PACK;
      if (owner[node] >= 0 && owner[node] !== o) {
        // Someone else's home: pass through it once, without taking it.
        if (homeOf[node] < 0 || p >= passed[node]) continue;
        passed[node] = p;
      } else if (owner[node] < 0) {
        owner[node] = o;
        area[o] += tiles.km2[node];
      } else if (p > 0) continue;
      for (let k = graph.start[node]; k < graph.start[node + 1]; k++) {
        const m = graph.to[k];
        if (!usable(m)) continue;
        const q = p + graph.cost[k] / speed[o];
        if (owner[m] < 0) { if (q < best[m]) { best[m] = q; heap.push(q, o * PACK + m); } }
        else if (homeOf[m] >= 0 && homeOf[m] !== o && q < passed[m]) heap.push(q, o * PACK + m);
      }
    }
  };

  /**
   * Shares: whoever is furthest below their share goes next and claims the free tile nearest their home along their
   * land's edge. Everyone fills at the same pace relative to their share, so land stays in one piece around each home
   * and nobody is surrounded before they've grown. Whoever runs out of free land around them stops where they are.
   */
  const byShares = (quota: Float64Array) => {
    claimHomes();
    const edges = owners.map(() => new Heap());
    const turn = new Heap();
    // Only free land goes on a walker's edge (hexes split where homes crowd, so homes rarely wall anyone in).
    const spread = (o: number, node: number, d: number) => {
      for (let k = graph.start[node]; k < graph.start[node + 1]; k++) {
        const m = graph.to[k];
        if (usable(m) && owner[m] < 0) edges[o].push(d + graph.cost[k], m);
      }
    };
    owners.forEach((item, o) => {
      spread(o, item.seed, 0);
      if (area[o] < quota[o]) turn.push(area[o] / quota[o], o);
    });
    while (turn.size) {
      const o = turn.pop();
      const edge = edges[o];
      let claimed = false;
      while (edge.size && !claimed) {
        const d = edge.prio[0];
        const node = edge.pop();
        if (owner[node] >= 0) continue;
        owner[node] = o;
        area[o] += tiles.km2[node];
        spread(o, node, d);
        claimed = true;
      }
      if (claimed && area[o] < quota[o]) turn.push(area[o] / quota[o], o);
    }
    // Land nobody reached (pockets, far islands) joins the territory next to it, so there are no stray pockets.
    const queue: number[] = [];
    for (let t = 0; t < land; t++) if (owner[t] >= 0) queue.push(t);
    for (let q = 0; q < queue.length; q++) {
      const t = queue[q];
      for (let k = graph.start[t]; k < graph.start[t + 1]; k++) {
        const m = graph.to[k];
        if (owner[m] >= 0 || !usable(m)) continue;
        owner[m] = owner[t];
        queue.push(m);
      }
    }
  };

  const fair = fairFor(rule, n);
  if (n) {
    if (fair <= 0) byDistance();
    else {
      let geography: Float64Array | null = null;
      if (fair < 1) { byDistance(); geography = area.slice(); }
      let totalLand = 0, totalWeight = 0;
      for (let t = 0; t < land; t++) if (usable(t)) totalLand += tiles.km2[t];
      owners.forEach(item => { totalWeight += item.weight ?? 1; });
      const quota = Float64Array.from(owners, (item, o) => {
        const share = (totalLand * (item.weight ?? 1)) / totalWeight;
        return geography ? geography[o] + (share - geography[o]) * fair : share;
      });
      byShares(quota);
    }
  }
  const countryTiles = new Map<string, number>();
  for (const shape of tiles.shapes) if (shape.cc) countryTiles.set(shape.cc, shape.end - shape.start);
  return finishTerritory(tiles, owner, owners, countryTiles);
}
