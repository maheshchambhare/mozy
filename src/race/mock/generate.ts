import type { Walker, World } from '../types';
import { cityById, countries, type City, type Country } from './places';
import { handles, namePools, nameStyles } from './names';

/**
 * Dummy walkers for designing the race pages before the backend exists. Never ship this to production boards:
 * the plan's rule C5 says boards show recorded numbers only.
 */
export interface GenSettings {
  /** How many walkers to make. */
  walkers: number;
  /** Same seed, same world. */
  seed: number;
  /** 0 = walkers spread like Mozy's audience (India and the US lead); 1 = every listed country gets the same share. */
  spread: number;
  /** Share of "ultra walkers" who walk 2–4 times the usual amount. */
  whales: number;
  /** How often people take rest days, 0–0.5. */
  restDays: number;
  /** Median steps on an active day. */
  median: number;
}

export const DEFAULT_GEN: GenSettings = { walkers: 6000, seed: 42, spread: 0, whales: 0.01, restDays: 0.12, median: 6800 };

export const MAX_DAY_STEPS = 100_000;
const HISTORY_DAYS = 31;

/** Small, fast, seedable PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Random = ReturnType<typeof rng>;

const gauss = (random: Random) => {
  const u = Math.max(1e-9, random());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
};

function pick<T>(random: Random, items: readonly T[], weight: (item: T) => number): T {
  let total = 0;
  for (const item of items) total += weight(item);
  let roll = random() * total;
  for (const item of items) {
    roll -= weight(item);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const profileId = (random: Random) => {
  let id = 'p_';
  for (let i = 0; i < 22; i++) id += BASE62[Math.floor(random() * 62)];
  return id;
};

function raceName(random: Random, country: Country): string {
  if (random() < 0.06) return handles[Math.floor(random() * handles.length)];
  const pool = namePools[country.region];
  const first = pool[Math.floor(random() * pool.length)];
  const style = nameStyles[Math.floor(random() * nameStyles.length)];
  const name = style(first, Math.floor(random() * 1000));
  return name.length <= 16 ? name : first;
}

/** Local hour (0–24) for a UTC offset in minutes. */
export function localHour(now: number, tz: number) {
  const minutes = (now / 60000 + tz) % 1440;
  return ((minutes + 1440) % 1440) / 60;
}

/** How much of a race day's walking (4 AM to 4 AM, CONTRACT.md §3) is done by a local hour. */
function dayProgress(hour: number) {
  const sinceFour = (hour - 4 + 24) % 24;
  const t = Math.min(1, Math.max(0, (sinceFour - 2) / 16));
  return t * t * (3 - 2 * t);
}

/** Relative walking intensity by local hour: quiet at night, peaks on the way to work and in the evening. */
export function activityAt(hour: number) {
  if (hour < 5.5) return 0.04;
  if (hour < 7) return 0.5;
  if (hour < 9.5) return 1.5;
  if (hour < 12) return 0.9;
  if (hour < 14) return 1.1;
  if (hour < 17) return 0.8;
  if (hour < 20.5) return 1.6;
  if (hour < 22.5) return 0.6;
  return 0.12;
}

/** Days so far this week (Monday first) and this month, counting today. */
function calendar(now: number) {
  const date = new Date(now);
  const weekDays = ((date.getDay() + 6) % 7) + 1;
  return { weekDays, monthDays: date.getDate() };
}

/**
 * A usual spot: about two thirds live in their city's area (centre to suburbs), the rest anywhere around the
 * country's other towns, so people spread across the land the way real users would.
 */
function spotNear(random: Random, city: City, country: Country): [number, number] {
  const rural = random() < 0.35;
  const centre = rural ? country.cities[Math.floor(random() * country.cities.length)] : city;
  const km = Math.abs(gauss(random)) * (rural ? 120 + random() * 280 : 20 + random() * 90);
  const angle = random() * Math.PI * 2;
  const lat = centre.lat + (km / 111) * Math.sin(angle);
  const lng = centre.lng + ((km / 111) * Math.cos(angle)) / Math.max(0.2, Math.cos((centre.lat * Math.PI) / 180));
  return [Math.max(-85, Math.min(85, lat)), ((lng + 540) % 360) - 180];
}

export function generateWorld(settings: GenSettings, now = Date.now()): World {
  // Not tied to the count: a world of n walkers is the first n of a bigger one, so the map can grow walker by walker.
  const random = rng(settings.seed * 7919 + 13);
  const share = (country: Country) => Math.pow(country.w, 1 - settings.spread);
  const walkers: Walker[] = [];
  const nowS = Math.floor(now / 1000);
  for (let i = 0; i < settings.walkers; i++) {
    const country = pick(random, countries, share);
    const city: City = pick(random, country.cities, item => item.w);
    // A usual day: log-normal around the median, a few ultra walkers far above it.
    let base = settings.median * Math.exp(gauss(random) * 0.42);
    if (random() < settings.whales) base *= 2.2 + random() * 2;
    base = Math.min(base, 38_000);
    const steady = 0.7 + random() * 0.3;
    const weekendLift = 0.8 + random() * 0.5;
    const days: number[] = [];
    for (let d = 0; d < HISTORY_DAYS; d++) {
      const weekday = new Date(now - (HISTORY_DAYS - 1 - d) * 86_400_000).getDay();
      const weekend = weekday === 0 || weekday === 6;
      const rest = random() < settings.restDays * (1.5 - steady);
      let steps = rest ? base * (0.08 + random() * 0.3) : base * Math.max(0.15, 1 + gauss(random) * 0.28);
      if (weekend) steps *= weekendLift;
      days.push(Math.min(MAX_DAY_STEPS, Math.round(steps)));
    }
    // Today is still going: scale it by how far the walker's local day has got.
    const hour = localHour(now, city.tz);
    const resting = random() < 0.07;
    days[HISTORY_DAYS - 1] = resting ? 0 : Math.round(days[HISTORY_DAYS - 1] * dayProgress(hour));
    const syncedAt = resting
      ? nowS - Math.round((20 + random() * 20) * 3600)
      : nowS - Math.round(Math.pow(random(), 2.2) * 3 * 3600);
    const level = Math.max(1, Math.min(30, Math.round(2 + base / 1400 + gauss(random) * 2.5)));
    walkers.push({
      id: profileId(random),
      name: raceName(random, country),
      tag: 1000 + Math.floor(random() * 9000),
      cc: country.cc,
      city: city.id,
      days,
      base,
      syncedAt,
      home: null,
      spot: spotNear(random, city, country),
      level,
      mp: Math.round(level * 110 + random() * 400),
    });
  }
  return { walkers, byId: new Map(walkers.map(walker => [walker.id, walker])), now, ...calendar(now), version: 1 };
}

/**
 * Moves the dummy world forward: walkers who are awake add steps for `minutes` of simulated time.
 * Returns how many walkers moved.
 */
export function simulateWalking(world: World, minutes: number, random: Random): number {
  world.now += minutes * 60_000;
  const nowS = Math.floor(world.now / 1000);
  const today = HISTORY_DAYS - 1;
  let moved = 0;
  for (const walker of world.walkers) {
    const city = cityById.get(walker.city);
    const pace = activityAt(localHour(world.now, city?.tz ?? 0));
    // Not everyone is walking right now.
    if (random() > Math.min(0.9, 0.18 * pace * Math.max(1, minutes / 10))) continue;
    const perMinute = walker.base / (15 * 60);
    const added = Math.round(perMinute * pace * minutes * (0.4 + random() * 1.6));
    if (added <= 0) continue;
    walker.days[today] = Math.min(MAX_DAY_STEPS, walker.days[today] + added);
    walker.syncedAt = nowS;
    moved++;
  }
  world.version++;
  return moved;
}

/** Gives one walker extra steps today (spilling into earlier days past the 100,000 daily cap). */
export function boostWalker(world: World, id: string, steps: number) {
  const walker = world.byId.get(id);
  if (!walker) return;
  let left = steps;
  for (let d = HISTORY_DAYS - 1; d >= 0 && left > 0; d--) {
    const room = MAX_DAY_STEPS - walker.days[d];
    const add = Math.min(room, left);
    walker.days[d] += add;
    left -= add;
  }
  walker.syncedAt = Math.floor(world.now / 1000);
  world.version++;
}

/** Sets (or clears, with null) the land a walker grows from. */
export function setHome(world: World, id: string, home: [number, number] | null) {
  const walker = world.byId.get(id);
  if (!walker) return;
  walker.home = home;
  world.version++;
}

/** Adds a brand-new walker (for testing "first walker from …" and newcomers taking land). */
export function addWalker(world: World, cc: string, steps: number, seed: number, name?: string): Walker | null {
  const country = countries.find(item => item.cc === cc);
  if (!country) return null;
  const random = rng(seed);
  const city = pick(random, country.cities, item => item.w);
  const days = new Array(HISTORY_DAYS).fill(0);
  days[HISTORY_DAYS - 1] = Math.min(MAX_DAY_STEPS, steps);
  // A newcomer: level 1, no Moz Points yet.
  const walker: Walker = {
    id: profileId(random), name: name ?? raceName(random, country), tag: 1000 + Math.floor(random() * 9000),
    cc, city: city.id, days, base: Math.max(3000, steps), syncedAt: Math.floor(world.now / 1000), home: null,
    spot: spotNear(random, city, country), level: 1, mp: 0,
  };
  world.walkers.push(walker);
  world.byId.set(walker.id, walker);
  world.version++;
  return walker;
}
