import type { Period, Ranked, Walker, World } from './types';

/** Steps a walker has on a board for the period. */
export function periodSteps(walker: Walker, period: Period, world: World) {
  const days = walker.days;
  const count = period === 'day' ? 1 : period === 'week' ? world.weekDays : world.monthDays;
  let total = 0;
  for (let i = 0; i < count && i < days.length; i++) total += days[days.length - 1 - i];
  return total;
}

export interface AreaTotals { steps: number; walkers: number }

/** Every board for one period: world, each country and each city, plus totals. */
export interface Standings {
  period: Period;
  world: Ranked[];
  byCountry: Map<string, Ranked[]>;
  byCity: Map<string, Ranked[]>;
  /** id → row on the world, country and city boards. */
  worldRow: Map<string, Ranked>;
  countryRow: Map<string, Ranked>;
  cityRow: Map<string, Ranked>;
  totals: AreaTotals & { countries: number };
  countryTotals: Map<string, AreaTotals>;
}

const byStepsThenId = (a: { steps: number; walker: Walker }, b: { steps: number; walker: Walker }) =>
  b.steps - a.steps || a.walker.syncedAt - b.walker.syncedAt || (a.walker.id < b.walker.id ? -1 : 1);

function rank(rows: { walker: Walker; steps: number }[]): Ranked[] {
  rows.sort(byStepsThenId);
  return rows.map((row, index) => ({ walker: row.walker, steps: row.steps, rank: index + 1 }));
}

export function buildStandings(world: World, period: Period): Standings {
  const all = world.walkers.map(walker => ({ walker, steps: periodSteps(walker, period, world) }));
  const countryRows = new Map<string, { walker: Walker; steps: number }[]>();
  const cityRows = new Map<string, { walker: Walker; steps: number }[]>();
  for (const row of all) {
    let list = countryRows.get(row.walker.cc);
    if (!list) countryRows.set(row.walker.cc, (list = []));
    list.push(row);
    let cityList = cityRows.get(row.walker.city);
    if (!cityList) cityRows.set(row.walker.city, (cityList = []));
    cityList.push(row);
  }
  const worldBoard = rank(all);
  const byCountry = new Map<string, Ranked[]>();
  const byCity = new Map<string, Ranked[]>();
  const countryTotals = new Map<string, AreaTotals>();
  const worldRow = new Map<string, Ranked>();
  const countryRow = new Map<string, Ranked>();
  const cityRow = new Map<string, Ranked>();
  for (const row of worldBoard) worldRow.set(row.walker.id, row);
  let steps = 0;
  for (const [cc, rows] of countryRows) {
    const board = rank(rows);
    byCountry.set(cc, board);
    let total = 0;
    for (const row of board) { countryRow.set(row.walker.id, row); total += row.steps; }
    countryTotals.set(cc, { steps: total, walkers: board.length });
    steps += total;
  }
  for (const [city, rows] of cityRows) {
    const board = rank(rows);
    byCity.set(city, board);
    for (const row of board) cityRow.set(row.walker.id, row);
  }
  return {
    period, world: worldBoard, byCountry, byCity, worldRow, countryRow, cityRow, countryTotals,
    totals: { steps, walkers: worldBoard.length, countries: byCountry.size },
  };
}

/** "Top 18%": the share of the board at or above this rank, rounded up, never "top 0%". */
export const topPercent = (rank: number, of: number) => Math.max(1, Math.ceil((rank / Math.max(1, of)) * 100));

/** Public boards round steps to the nearest 100 (DECISIONS.md D10). */
export const roundSteps = (steps: number) => Math.round(steps / 100) * 100;

const whole = new Intl.NumberFormat('en-US');
export const formatNumber = (value: number) => whole.format(Math.round(value));

/** 152,300 → "152.3k", 1,234,000 → "1.23M". */
export function compactSteps(steps: number) {
  if (steps >= 1_000_000) return `${(steps / 1_000_000).toFixed(steps >= 10_000_000 ? 1 : 2)}M`;
  if (steps >= 10_000) return `${(steps / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return formatNumber(steps);
}

export function syncedAgo(syncedAt: number, now: number) {
  const minutes = Math.max(0, Math.round((now / 1000 - syncedAt) / 60));
  if (minutes < 2) return 'synced just now';
  if (minutes < 60) return `synced ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `synced ${hours} h ago` : 'synced yesterday';
}

/** Rest tag from the plan (PLAN.md §4.2): no upload yet on this race day. */
export const isResting = (walker: Walker, now: number) => now / 1000 - walker.syncedAt > 18 * 3600 || walker.days[walker.days.length - 1] === 0;

/** 820 → "820", 4,050 → "4.1k", 2,140,000 → "2.1M" (km²). */
export function compactArea(km2: number) {
  if (km2 >= 1_000_000) return `${(km2 / 1_000_000).toFixed(km2 >= 10_000_000 ? 0 : 1)}M`;
  if (km2 >= 10_000) return `${Math.round(km2 / 1000)}k`;
  if (km2 >= 1000) return `${(km2 / 1000).toFixed(1)}k`;
  return formatNumber(Math.round(km2));
}
