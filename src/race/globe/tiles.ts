import { cellToBoundary, cellToChildren, cellToLatLng, cellToParent, getHexagonAreaAvg, getResolution, gridDisk, latLngToCell, polygonToCells } from 'h3-js';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import atlasJson from 'world-atlas/countries-110m.json';
import indiaView from './india-view.json';
import { countries } from '../mock/places';
import { latLngToVec } from './grid';

/**
 * Land tiles: H3 hexagons (Uber's global hex grid) inside each country of Natural Earth's 1:110m map, with India and the
 * countries around it as on India's official map.
 * Hexes get smaller where people live: every country starts with big hexes, and any hex with two or more walkers' homes
 * in it splits into its seven children, again and again (down to the smallest size), so each walker has room around
 * them. Empty land keeps big hexes; busy cities get small ones. H3 ids are stable, so a chosen home could be stored as one.
 */
export interface Shape {
  atlas: string;
  name: string;
  /** Race country code, or null for countries nobody races in. */
  cc: string | null;
  polys: number[][][][];
  /** This country's tiles are tiles[start] … tiles[end - 1]. */
  start: number;
  end: number;
  center: [number, number, number];
  /** Land area of its tiles, and the smallest and biggest hex in it (km²). */
  km2: number;
  minKm2: number;
  maxKm2: number;
}

export interface TileSet {
  count: number;
  ids: string[];
  shapeOf: Int16Array;
  /** H3 resolution and area (km²) of each tile. */
  res: Uint8Array;
  km2: Float32Array;
  /** Tile centres, unit vectors (count × 3). */
  centers: Float32Array;
  /** Outline corners of tile t are verts[vStart[t] … vStart[t + 1]) (unit vectors, 3 floats each). */
  vStart: Int32Array;
  verts: Float32Array;
  /** The tile across each outline edge (edge k runs from corner k to corner k + 1), or -1 for the sea. */
  edgeNbr: Int32Array;
  index: Map<string, number>;
  shapes: Shape[];
  byCc: Map<string, number>;
  /** Antarctica's shape index (drawn as ice, never owned). */
  ice: number;
  /** The resolutions in use, finest first (for picking). */
  resolutions: number[];
}

export interface RefinePolicy {
  /** Hex size everywhere to start with (H3 resolution: 2 ≈ 87,000 km², 3 ≈ 12,400, 4 ≈ 1,770). */
  baseRes: number;
  /** Smallest hexes allowed (5 ≈ 250 km², 6 ≈ 36, 7 ≈ 5). */
  maxRes: number;
  /** A hex with this many homes or more splits into seven. */
  splitAt: number;
}

export const DEFAULT_REFINE: RefinePolicy = { baseRes: 3, maxRes: 7, splitAt: 2 };

type Base = Pick<Shape, 'atlas' | 'name' | 'cc' | 'polys'> & {
  rings: Float64Array[][];
  boxes: [number, number, number, number][];
  /** For a country drawn from India's official map: its 1:110m outline, only used to fill slivers (see buildTileSet). */
  atlasPolys: number[][][][] | null;
};
let bases: Base[] | null = null;

/** Every country of the map with its polygons ([lng, lat] rings). */
export function countryShapes(): Base[] {
  if (bases) return bases;
  const topology = atlasJson as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  const atlasToCc = new Map(countries.map(country => [country.atlas, country.cc]));
  bases = feature(topology, topology.objects.countries).features.flatMap(item => {
    const geometry = item.geometry;
    if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) return [];
    const atlas = String(item.id ?? item.properties.name);
    const atlasPolys = (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) as number[][][][];
    // India and every country it borders on land, as on India's official map (made by scripts/india-view.mjs): all of
    // Jammu & Kashmir and Ladakh, including Aksai Chin, are India, and Lakshadweep and the Andaman and Nicobar Islands
    // are drawn. The default world map has the line of control instead.
    const official = (indiaView as Record<string, number[][][][]>)[atlas];
    const polys = official ?? atlasPolys;
    const rings = polys.map(polygon => polygon.map(ring => Float64Array.from(ring.flat())));
    const boxes = rings.map(([outer]) => {
      let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;
      for (let i = 0; i < outer.length; i += 2) {
        minLng = Math.min(minLng, outer[i]); maxLng = Math.max(maxLng, outer[i]);
        minLat = Math.min(minLat, outer[i + 1]); maxLat = Math.max(maxLat, outer[i + 1]);
      }
      return [minLng, minLat, maxLng, maxLat] as [number, number, number, number];
    });
    return [{ atlas, name: item.properties.name, cc: atlasToCc.get(atlas) ?? null, polys, rings, boxes, atlasPolys: official ? atlasPolys : null }];
  });
  return bases;
}

function inRing(ring: Float64Array, lng: number, lat: number) {
  let inside = false;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Whether a point is inside the country (planar test on the map's rings; fine away from the poles). */
function inside(base: Base, lat: number, lng: number) {
  for (let p = 0; p < base.rings.length; p++) {
    const [minLng, minLat, maxLng, maxLat] = base.boxes[p];
    if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue;
    const rings = base.rings[p];
    if (!inRing(rings[0], lng, lat)) continue;
    let hole = false;
    for (let h = 1; h < rings.length && !hole; h++) hole = inRing(rings[h], lng, lat);
    if (!hole) return true;
  }
  return false;
}

/** The country a point is in, trying `prefer` first, or -1 for the sea. */
function countryAt(list: Base[], lat: number, lng: number, prefer: number) {
  if (inside(list[prefer], lat, lng)) return prefer;
  for (let s = 0; s < list.length; s++) if (s !== prefer && inside(list[s], lat, lng)) return s;
  return -1;
}

const baseCache = new Map<string, string[]>();
/**
 * A country's cells at its starting size (cached). A piece of it too small or thin for any (an island) gets smaller
 * hexes instead, down to three sizes smaller, or else the one hex at its middle, so every island shows.
 */
function baseCells(base: Base, res: number): string[] {
  const key = `${base.atlas}:${res}`;
  let ids = baseCache.get(key);
  if (ids) return ids;
  const set = new Set<string>();
  for (const polygon of base.polys) {
    let found = false;
    try {
      for (let r = res; r <= res + 3 && !found; r++) for (const id of polygonToCells(polygon, r, true)) { set.add(id); found = true; }
    } catch {
      // A few 1:110m polygons trip H3 at some sizes; that piece just has no tiles at this size.
      continue;
    }
    if (found) continue;
    let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;
    for (const [lng, lat] of polygon[0]) { minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng); minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat); }
    set.add(latLngToCell((minLat + maxLat) / 2, (minLng + maxLng) / 2, res + 3));
  }
  ids = [...set];
  baseCache.set(key, ids);
  return ids;
}

const sliverCache = new Map<string, string[]>();
/** Cells inside the 1:110m outline of a country now drawn from India's official map (cached). */
function atlasCells(base: Base, res: number): string[] {
  const key = `${base.atlas}:${res}`;
  let ids = sliverCache.get(key);
  if (ids) return ids;
  const set = new Set<string>();
  for (const polygon of base.atlasPolys ?? []) {
    try {
      for (const id of polygonToCells(polygon, res, true)) set.add(id);
    } catch {
      // As in baseCells.
    }
  }
  ids = [...set];
  sliverCache.set(key, ids);
  return ids;
}

const geometry = new Map<string, { center: [number, number, number]; corners: number[] }>();
/** A cell's centre (unit vector) and outline (lat, lng pairs), cached. */
function cellGeometry(id: string) {
  let cell = geometry.get(id);
  if (!cell) {
    const [lat, lng] = cellToLatLng(id);
    cell = { center: latLngToVec(lat, lng), corners: cellToBoundary(id).flat() };
    geometry.set(id, cell);
  }
  return cell;
}

const areaOf = new Map<number, number>();
const hexKm2 = (res: number) => {
  let km2 = areaOf.get(res);
  if (km2 === undefined) areaOf.set(res, (km2 = getHexagonAreaAvg(res, 'km2')));
  return km2;
};

/**
 * Tiles for the whole map. `homes` lists each race country's walkers' homes ([lat, lng]); hexes with `splitAt` or more
 * of them split until they don't (or reach the smallest size).
 */
export function buildTileSet(homes: Map<string, [number, number][]>, policy: RefinePolicy): TileSet {
  const list = countryShapes();
  const startOf = (s: number) => (list[s].atlas === '010' ? Math.min(policy.baseRes, 3) : policy.baseRes);
  // Every starting hex belongs to one country, India's official map first where outlines overlap.
  const order = list.map((_, s) => s).sort((a, b) => Number(!!list[b].atlasPolys) - Number(!!list[a].atlasPolys));
  const owner = new Map<string, number>();
  const finer: [string, number][] = [];
  for (const s of order) {
    for (const id of baseCells(list[s], startOf(s))) {
      if (getResolution(id) > startOf(s)) finer.push([id, s]);
      else if (!owner.has(id)) owner.set(id, s);
    }
  }
  // Where a country from India's official map meets one still drawn at 1:110m, the two outlines don't quite match and
  // a hex can fall between them. Land on the old map that has land all around goes to the official country (next to
  // the sea it's just a coast drawn differently).
  for (const s of order) {
    if (!list[s].atlasPolys) break;
    const gaps = atlasCells(list[s], startOf(s)).filter(id => !owner.has(id));
    const open = new Set(gaps);
    for (const id of gaps) if (gridDisk(id, 1).every(other => owner.has(other) || open.has(other))) owner.set(id, s);
  }
  // Islands' smaller hexes, coarsest first, wherever no bigger hex covers them already.
  finer.sort((a, b) => getResolution(a[0]) - getResolution(b[0]));
  for (const [id, s] of finer) {
    let covered = owner.has(id);
    for (let res = startOf(s); res < getResolution(id) && !covered; res++) covered = owner.has(cellToParent(id, res));
    if (!covered) owner.set(id, s);
  }

  // Hexes with enough homes in them split. Each child goes to the country its centre is in (a neighbour's homes then
  // decide whether it splits again), or is dropped in the sea: coasts and borders sharpen as hexes shrink.
  const queue = [...owner.keys()], queueShape = [...owner.values()];
  const cellsByShape: string[][] = list.map(() => []);
  const counted = list.map(() => new Map<number, Map<string, number>>());
  const homesIn = (s: number, id: string, res: number) => {
    let count = counted[s].get(res);
    if (!count) {
      count = new Map();
      for (const [lat, lng] of homes.get(list[s].cc ?? '') ?? []) {
        const cell = latLngToCell(lat, lng, res);
        count.set(cell, (count.get(cell) ?? 0) + 1);
      }
      counted[s].set(res, count);
    }
    return count.get(id) ?? 0;
  };
  for (let q = 0; q < queue.length; q++) {
    const id = queue[q], s = queueShape[q], res = getResolution(id);
    if (res >= policy.maxRes || homesIn(s, id, res) < policy.splitAt) { cellsByShape[s].push(id); continue; }
    for (const child of cellToChildren(id, res + 1)) {
      const [lat, lng] = cellToLatLng(child);
      const to = countryAt(list, lat, lng, s);
      if (to >= 0) { queue.push(child); queueShape.push(to); }
    }
  }

  let count = 0, cornerCount = 0;
  for (const cells of cellsByShape) {
    count += cells.length;
    for (const id of cells) cornerCount += cellGeometry(id).corners.length / 2;
  }
  const ids: string[] = new Array(count);
  const shapeOf = new Int16Array(count);
  const resOf = new Uint8Array(count);
  const km2 = new Float32Array(count);
  const centers = new Float32Array(count * 3);
  const vStart = new Int32Array(count + 1);
  const verts = new Float32Array(cornerCount * 3);
  const edgeNbr = new Int32Array(cornerCount).fill(-1);
  const index = new Map<string, number>();
  const shapes: Shape[] = [];
  const midLat = new Float64Array(cornerCount), midLng = new Float64Array(cornerCount);
  const edgeAt = new Map<number, number>();
  let t = 0, v = 0;
  list.forEach((base, s) => {
    const start = t;
    let x = 0, y = 0, z = 0, total = 0, min = Infinity, max = 0;
    for (const id of cellsByShape[s]) {
      const cell = cellGeometry(id);
      const res = getResolution(id);
      ids[t] = id;
      index.set(id, t);
      shapeOf[t] = s;
      resOf[t] = res;
      km2[t] = hexKm2(res);
      total += km2[t]; min = Math.min(min, km2[t]); max = Math.max(max, km2[t]);
      centers.set(cell.center, t * 3);
      x += cell.center[0]; y += cell.center[1]; z += cell.center[2];
      vStart[t] = v;
      const n = cell.corners.length / 2;
      for (let k = 0; k < n; k++) {
        const lat = cell.corners[k * 2], lng = cell.corners[k * 2 + 1];
        verts.set(latLngToVec(lat, lng), (v + k) * 3);
        const k2 = (k + 1) % n;
        const mLat = (lat + cell.corners[k2 * 2]) / 2, mLng = (lng + cell.corners[k2 * 2 + 1]) / 2;
        midLat[v + k] = mLat; midLng[v + k] = mLng;
        // Same-size neighbours share an edge whose midpoint lands in the same ~2 m bucket.
        const key = res * 2 ** 49 + Math.round((mLng + 180) * 5e4) * 2 ** 24 + Math.round((mLat + 90) * 5e4);
        const other = edgeAt.get(key);
        if (other === undefined) edgeAt.set(key, v + k);
        else { edgeNbr[v + k] = -2 - other; edgeNbr[other] = -2 - (v + k); }
      }
      v += n;
      t++;
    }
    const length = Math.hypot(x, y, z) || 1;
    shapes.push({ atlas: base.atlas, name: base.name, cc: base.cc, polys: base.polys, start, end: t, center: [x / length, y / length, z / length], km2: total, minKm2: Number.isFinite(min) ? min : 0, maxKm2: max });
  });
  vStart[count] = v;
  const slotTile = new Int32Array(cornerCount);
  for (let tile = 0; tile < count; tile++) for (let k = vStart[tile]; k < vStart[tile + 1]; k++) slotTile[k] = tile;
  for (let k = 0; k < cornerCount; k++) if (edgeNbr[k] <= -2) edgeNbr[k] = slotTile[-2 - edgeNbr[k]];
  const resolutions = [...new Set(resOf)].sort((a, b) => b - a);
  // Neighbours of another size (where hexes split, or across a border to a country with other sizes): the tile just
  // beyond the edge's midpoint. What's left with no neighbour is coast.
  for (let tile = 0; tile < count; tile++) {
    const cx = centers[tile * 3], cy = centers[tile * 3 + 1], cz = centers[tile * 3 + 2];
    for (let k = vStart[tile]; k < vStart[tile + 1]; k++) {
      if (edgeNbr[k] >= 0) continue;
      let [ox, oy, oz] = latLngToVec(midLat[k], midLng[k]);
      ox += (ox - cx) * 0.6; oy += (oy - cy) * 0.6; oz += (oz - cz) * 0.6;
      const length = Math.hypot(ox, oy, oz);
      const lat = (Math.asin(Math.max(-1, Math.min(1, oy / length))) * 180) / Math.PI, lng = (Math.atan2(ox, oz) * 180) / Math.PI;
      for (const res of resolutions) {
        const other = index.get(latLngToCell(lat, lng, res));
        if (other !== undefined && other !== tile) { edgeNbr[k] = other; break; }
      }
    }
  }
  const byCc = new Map<string, number>();
  shapes.forEach((shape, i) => { if (shape.cc) byCc.set(shape.cc, i); });
  return { count, ids, shapeOf, res: resOf, km2, centers, vStart, verts, edgeNbr, index, shapes, byCc, ice: shapes.findIndex(shape => shape.atlas === '010'), resolutions };
}

/** The tile under a point, trying the finest hexes first. */
export function tileAt(tiles: TileSet, lat: number, lng: number): number {
  for (const res of tiles.resolutions) {
    const tile = tiles.index.get(latLngToCell(lat, lng, res));
    if (tile !== undefined) return tile;
  }
  return -1;
}

/** Tiles next to a tile in the same country. */
export function forNeighbours(tiles: TileSet, tile: number, visit: (other: number) => void) {
  const shape = tiles.shapeOf[tile];
  for (let k = tiles.vStart[tile]; k < tiles.vStart[tile + 1]; k++) {
    const other = tiles.edgeNbr[k];
    if (other >= 0 && tiles.shapeOf[other] === shape) visit(other);
  }
}
