import type { Walker } from '../types';
import { forNeighbours, type TileSet } from './tiles';

export interface Owner {
  walker: Walker;
  steps: number;
  rankInCountry: number;
  tiles: number;
  /** Tile their land grew from (their home). */
  seed: number;
  /** The tile deepest inside their land, where their blob stands. */
  anchor: number;
  /** Their land's area in km². */
  km2: number;
  /** Strength on the world map. */
  weight?: number;
}

export interface Territory {
  tileSet: TileSet;
  /** Owner index per tile, -1 for land nobody owns. */
  owner: Int32Array;
  owners: Owner[];
  ownerById: Map<string, number>;
  /** Tiles per race country (cc). */
  countryTiles: Map<string, number>;
}

/**
 * Drops anyone the land ran out for, then finds where each blob stands (the tile farthest from its land's edge) and
 * each owner's area (tiles can differ in size between countries).
 */
export function finishTerritory(tileSet: TileSet, owner: Int32Array, owners: Owner[], countryTiles: Map<string, number>): Territory {
  const { centers } = tileSet;
  const counted = new Int32Array(owners.length);
  for (let t = 0; t < owner.length; t++) if (owner[t] >= 0) counted[owner[t]]++;
  owners.forEach((item, index) => { item.tiles = counted[index]; });
  const kept: number[] = [];
  const remap = new Int32Array(owners.length).fill(-1);
  owners.forEach((item, index) => { if (item.tiles > 0) { remap[index] = kept.length; kept.push(index); } });
  const finalOwners = kept.map(index => owners[index]);
  for (let t = 0; t < owner.length; t++) if (owner[t] >= 0) owner[t] = remap[owner[t]];
  const depth = new Int32Array(tileSet.count).fill(-1);
  const queue: number[] = [];
  for (let t = 0; t < tileSet.count; t++) {
    const o = owner[t];
    if (o < 0) continue;
    let edge = false;
    for (let k = tileSet.vStart[t]; k < tileSet.vStart[t + 1] && !edge; k++) {
      const m = tileSet.edgeNbr[k];
      edge = m < 0 || owner[m] !== o;
    }
    if (edge) { depth[t] = 0; queue.push(t); }
  }
  for (let q = 0; q < queue.length; q++) {
    const t = queue[q];
    forNeighbours(tileSet, t, m => { if (depth[m] < 0 && owner[m] === owner[t]) { depth[m] = depth[t] + 1; queue.push(m); } });
  }
  const sum = new Float64Array(finalOwners.length * 3);
  const km2 = new Float64Array(finalOwners.length);
  for (let t = 0; t < tileSet.count; t++) {
    const o = owner[t];
    if (o < 0) continue;
    sum[o * 3] += centers[t * 3]; sum[o * 3 + 1] += centers[t * 3 + 1]; sum[o * 3 + 2] += centers[t * 3 + 2];
    km2[o] += tileSet.km2[t];
  }
  const best = new Float64Array(finalOwners.length).fill(-Infinity);
  for (let t = 0; t < tileSet.count; t++) {
    const o = owner[t];
    if (o < 0) continue;
    const length = Math.hypot(sum[o * 3], sum[o * 3 + 1], sum[o * 3 + 2]) || 1;
    const toMiddle = (centers[t * 3] * sum[o * 3] + centers[t * 3 + 1] * sum[o * 3 + 1] + centers[t * 3 + 2] * sum[o * 3 + 2]) / length;
    const score = depth[t] * 10 + toMiddle;
    if (score > best[o]) { best[o] = score; finalOwners[o].anchor = t; }
  }
  finalOwners.forEach((item, o) => { item.km2 = km2[o]; });
  return { tileSet, owner, owners: finalOwners, ownerById: new Map(finalOwners.map((item, index) => [item.walker.id, index])), countryTiles };
}
