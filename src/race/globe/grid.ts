/**
 * A hex planet: the dual of a subdivided icosahedron (a Goldberg polyhedron). Frequency n gives 10n² + 2 cells, all
 * hexagons except 12 pentagons, nearly equal in area. Cells are the land tiles walkers own.
 * Coordinates: y is north, longitude 0 faces +z (x = cos(lat)·sin(lng), y = sin(lat), z = cos(lat)·cos(lng)).
 */
export interface Grid {
  n: number;
  count: number;
  /** Cell centres, unit vectors (count × 3). */
  centers: Float32Array;
  /** Neighbours in CSR form: cell c's are nbr[nbrStart[c] .. nbrStart[c + 1]). */
  nbrStart: Int32Array;
  nbr: Int32Array;
  /** Corner points (one per triangle of the subdivision), unit vectors. */
  corners: Float32Array;
  /** Each cell's corners in order around it (CSR, like the neighbours). */
  cornerStart: Int32Array;
  cellCorners: Int32Array;
  /** Undirected edges between neighbouring cells: [cellA, cellB, cornerA, cornerB] per edge. */
  edges: Int32Array;
}

const T = (1 + Math.sqrt(5)) / 2;
const ICO_VERTS = [[-1, T, 0], [1, T, 0], [-1, -T, 0], [1, -T, 0], [0, -1, T], [0, 1, T], [0, -1, -T], [0, 1, -T], [T, 0, -1], [T, 0, 1], [-T, 0, -1], [-T, 0, 1]];
const ICO_FACES = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];

export function buildGrid(n: number): Grid {
  // Rotate the icosahedron a little so the 12 pentagons sit mostly over the oceans rather than on the poles.
  const tilt = 0.32;
  const verts = ICO_VERTS.map(([x, y, z]) => {
    const length = Math.hypot(x, y, z);
    const [nx, ny, nz] = [x / length, y / length, z / length];
    return [nx, ny * Math.cos(tilt) - nz * Math.sin(tilt), ny * Math.sin(tilt) + nz * Math.cos(tilt)];
  });
  const count = 10 * n * n + 2;
  const centers = new Float32Array(count * 3);
  let used = 0;
  const ids = new Map<string, number>();
  const add = (key: string, x: number, y: number, z: number) => {
    let id = ids.get(key);
    if (id !== undefined) return id;
    id = used++;
    ids.set(key, id);
    const length = Math.hypot(x, y, z);
    centers[id * 3] = x / length;
    centers[id * 3 + 1] = y / length;
    centers[id * 3 + 2] = z / length;
    return id;
  };
  const along = (u: number, v: number, k: number) => {
    // Point k/n of the way from icosahedron vertex u to v, keyed so both faces sharing the edge agree.
    if (k === 0) return add(`v${u}`, verts[u][0], verts[u][1], verts[u][2]);
    if (k === n) return add(`v${v}`, verts[v][0], verts[v][1], verts[v][2]);
    if (u > v) return along(v, u, n - k);
    const a = verts[u], b = verts[v], t = k / n;
    return add(`e${u}_${v}_${k}`, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
  };

  const tris: number[] = [];
  ICO_FACES.forEach(([a, b, c], f) => {
    const point = (i: number, j: number) => {
      const k = n - i - j;
      if (j === 0) return along(a, b, i);
      if (i === 0) return along(a, c, j);
      if (k === 0) return along(b, c, j);
      const A = verts[a], B = verts[b], C = verts[c];
      return add(`f${f}_${i}_${j}`, (A[0] * k + B[0] * i + C[0] * j) / n, (A[1] * k + B[1] * i + C[1] * j) / n, (A[2] * k + B[2] * i + C[2] * j) / n);
    };
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i; j++) {
        tris.push(point(i, j), point(i + 1, j), point(i, j + 1));
        if (j < n - 1 - i) tris.push(point(i + 1, j), point(i + 1, j + 1), point(i, j + 1));
      }
    }
  });

  const triCount = tris.length / 3;
  const corners = new Float32Array(triCount * 3);
  for (let t = 0; t < triCount; t++) {
    let x = 0, y = 0, z = 0;
    for (let k = 0; k < 3; k++) {
      const v = tris[t * 3 + k];
      x += centers[v * 3]; y += centers[v * 3 + 1]; z += centers[v * 3 + 2];
    }
    const length = Math.hypot(x, y, z);
    corners[t * 3] = x / length; corners[t * 3 + 1] = y / length; corners[t * 3 + 2] = z / length;
  }

  // Corners around each cell, then sorted by angle so they trace the cell's outline.
  const cornerStart = new Int32Array(count + 1);
  for (const v of tris) cornerStart[v + 1]++;
  for (let c = 0; c < count; c++) cornerStart[c + 1] += cornerStart[c];
  const cellCorners = new Int32Array(tris.length);
  const fill = cornerStart.slice(0, count);
  for (let t = 0; t < triCount; t++) for (let k = 0; k < 3; k++) cellCorners[fill[tris[t * 3 + k]]++] = t;
  for (let c = 0; c < count; c++) {
    const cx = centers[c * 3], cy = centers[c * 3 + 1], cz = centers[c * 3 + 2];
    // Tangent basis at the centre.
    let ux = -cz, uy = 0, uz = cx;
    if (Math.hypot(ux, uz) < 1e-6) { ux = 1; uy = 0; uz = 0; }
    const ul = Math.hypot(ux, uy, uz);
    ux /= ul; uy /= ul; uz /= ul;
    const vx = cy * uz - cz * uy, vy = cz * ux - cx * uz, vz = cx * uy - cy * ux;
    const list = Array.from(cellCorners.subarray(cornerStart[c], cornerStart[c + 1]));
    const angle = (t: number) => {
      const dx = corners[t * 3] - cx, dy = corners[t * 3 + 1] - cy, dz = corners[t * 3 + 2] - cz;
      return Math.atan2(dx * vx + dy * vy + dz * vz, dx * ux + dy * uy + dz * uz);
    };
    list.sort((p, q) => angle(p) - angle(q));
    cellCorners.set(list, cornerStart[c]);
  }

  // Edges: two cells sharing a triangle edge; the two triangles on either side are the edge's corners.
  const edgeTris = new Map<number, number>();
  const edgeList: number[] = [];
  for (let t = 0; t < triCount; t++) {
    for (let k = 0; k < 3; k++) {
      const p = tris[t * 3 + k], q = tris[t * 3 + ((k + 1) % 3)];
      const key = p < q ? p * count + q : q * count + p;
      const other = edgeTris.get(key);
      if (other === undefined) edgeTris.set(key, t);
      else edgeList.push(Math.min(p, q), Math.max(p, q), other, t);
    }
  }
  const edges = Int32Array.from(edgeList);
  const nbrStart = new Int32Array(count + 1);
  for (let e = 0; e < edges.length; e += 4) { nbrStart[edges[e] + 1]++; nbrStart[edges[e + 1] + 1]++; }
  for (let c = 0; c < count; c++) nbrStart[c + 1] += nbrStart[c];
  const nbr = new Int32Array(nbrStart[count]);
  const at = nbrStart.slice(0, count);
  for (let e = 0; e < edges.length; e += 4) { nbr[at[edges[e]]++] = edges[e + 1]; nbr[at[edges[e + 1]]++] = edges[e]; }

  return { n, count, centers, nbrStart, nbr, corners, cornerStart, cellCorners, edges };
}

export function latLngToVec(lat: number, lng: number): [number, number, number] {
  const phi = (lat * Math.PI) / 180, lambda = (lng * Math.PI) / 180;
  return [Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)];
}

export function vecToLatLng(x: number, y: number, z: number): [number, number] {
  return [(Math.asin(Math.max(-1, Math.min(1, y))) * 180) / Math.PI, (Math.atan2(x, z) * 180) / Math.PI];
}

/** The cell nearest a direction, found by walking downhill across neighbours (fast, exact on this grid). */
export function findCell(grid: Grid, x: number, y: number, z: number, start = 0): number {
  const { centers, nbr, nbrStart } = grid;
  let cell = start;
  let best = centers[cell * 3] * x + centers[cell * 3 + 1] * y + centers[cell * 3 + 2] * z;
  for (;;) {
    let next = -1;
    for (let k = nbrStart[cell]; k < nbrStart[cell + 1]; k++) {
      const m = nbr[k];
      const d = centers[m * 3] * x + centers[m * 3 + 1] * y + centers[m * 3 + 2] * z;
      if (d > best) { best = d; next = m; }
    }
    if (next < 0) return cell;
    cell = next;
  }
}
