// Builds src/race/globe/india-view.json: India and every country it borders on land, as on India's official map, for
// the race globe. Source: Natural Earth's 1:10m countries from India's point of view (all of Jammu & Kashmir and Ladakh,
// including Aksai Chin, in India). Borders are simplified once per shared stretch (TopoJSON arcs), so neighbours still
// meet exactly; ids are world-atlas's, so tiles.ts swaps these in for the 1:110m outlines.
//
//   curl -L -o ne-ind.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries_ind.geojson
//   npm i --no-save topojson-server
//   node scripts/india-view.mjs ne-ind.geojson src/race/globe/india-view.json
import { readFile, writeFile } from 'node:fs/promises';
import { topology } from 'topojson-server';
import { feature } from 'topojson-client';

const [input, output] = process.argv.slice(2);
const pick = { IND: '356', PAK: '586', CHN: '156', NPL: '524', BTN: '064', BGD: '050', MMR: '104', AFG: '004' };
const data = JSON.parse(await readFile(input, 'utf8'));
const features = data.features
  .filter(item => pick[item.properties.ADM0_A3])
  .map(item => ({ type: 'Feature', id: pick[item.properties.ADM0_A3], properties: {}, geometry: item.geometry }));
const topo = topology({ countries: { type: 'FeatureCollection', features } });

const users = topo.arcs.map(() => new Set());
for (const geometry of topo.objects.countries.geometries) {
  const walk = arcs => (typeof arcs === 'number' ? users[arcs < 0 ? ~arcs : arcs].add(geometry.id) : arcs.forEach(walk));
  walk(geometry.arcs);
}

/** Douglas–Peucker; a closed loop also keeps the point farthest from its start, so it can't collapse. */
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  let far = 0, farthest = -1;
  for (let i = 1; i < points.length - 1; i++) {
    const d = Math.hypot(points[i][0] - points[0][0], points[i][1] - points[0][1]);
    if (d > farthest) { farthest = d; far = i; }
  }
  keep[0] = keep[points.length - 1] = 1;
  const stack = far > 0 ? [[0, far], [far, points.length - 1]] : [[0, points.length - 1]];
  if (far > 0) keep[far] = 1;
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a], [bx, by] = points[b];
    const dx = bx - ax, dy = by - ay, length = Math.hypot(dx, dy);
    let worst = -1, index = -1;
    for (let i = a + 1; i < b; i++) {
      const d = length ? Math.abs(dy * points[i][0] - dx * points[i][1] + bx * ay - by * ax) / length : Math.hypot(points[i][0] - ax, points[i][1] - ay);
      if (d > worst) { worst = d; index = i; }
    }
    if (worst > tolerance) { keep[index] = 1; stack.push([a, index], [index, b]); }
  }
  return points.filter((_, i) => keep[i]);
}

// India's outline to about 3 km, the rest to about 7 km, small islands to an eighth of their size; 3 decimals (~100 m).
topo.arcs = topo.arcs.map((arc, i) => {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  for (const [x, y] of arc) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const tolerance = Math.min(users[i].has('356') ? 0.03 : 0.07, Math.max(maxX - minX, maxY - minY) / 8);
  return simplify(arc, tolerance).map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]);
});

const area = ring => {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) sum += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  return Math.abs(sum / 2);
};
const out = {};
for (const item of feature(topo, topo.objects.countries).features) {
  const polygons = item.geometry.type === 'Polygon' ? [item.geometry.coordinates] : item.geometry.coordinates;
  // India keeps every island its official map shows (Lakshadweep, Andaman and Nicobar); elsewhere islands under about
  // 700 km² are left out, as on the 1:110m map.
  const minArea = item.id === '356' ? 0.00008 : 0.06;
  out[item.id] = polygons
    .map(polygon => polygon.filter((ring, r) => ring.length >= 4 && area(ring) >= (r === 0 ? minArea : 0.06)))
    .filter((rings, p) => rings.length && rings[0] === polygons[p][0]);
  const points = out[item.id].reduce((sum, rings) => sum + rings.reduce((total, ring) => total + ring.length, 0), 0);
  console.log(`${item.id}: ${out[item.id].length} polygons, ${points} points`);
}
await writeFile(output, JSON.stringify(out));
console.log(`wrote ${output} (${(JSON.stringify(out).length / 1024).toFixed(1)} KB)`);
