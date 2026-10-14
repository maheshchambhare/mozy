/** Shapes for the Mozy Race web preview. Field names follow step-challenges/CONTRACT.md where the contract has them. */

/** Board periods: today, this week (from Monday) and this month (CONTRACT.md §3). */
export type Period = 'day' | 'week' | 'month';
export const PERIOD_LABEL: Record<Period, string> = { day: 'Today', week: 'This week', month: 'This month' };

export interface Walker {
  /** `p_` + 22 base62 characters. */
  id: string;
  /** Race name, 2–16 characters. */
  name: string;
  /** Four digits that tell two walkers with the same name apart ("walker 4821"). */
  tag: number;
  /*
   * No pet field: each walker's avatar is their blob (blob.ts), worked out from the id for now. CONTRACT.md's `pet`
   * would become a blob seed handed out by the app.
   */
  /** ISO 3166-1 alpha-2. */
  cc: string;
  /** City id (`in-pune`). Not in the contract yet: city boards need a decision. */
  city: string;
  /** Race-day totals for the last 31 days, oldest first; the last one is today. */
  days: number[];
  /** The walker's usual day, used only by the dummy live simulation. */
  base: number;
  /** Last upload, Unix seconds. */
  syncedAt: number;
  /** The land the walker picked to grow from, as [lat, lng]; null means their usual spot. */
  home: [number, number] | null;
  /** Where the walker usually is, as [lat, lng]: somewhere in their city's area (dummy; a real home would be chosen in the app). */
  spot: [number, number];
  /** Game level and Moz Points (MP), which add to a walker's strength on the map. */
  level: number;
  mp: number;
}

export interface World {
  walkers: Walker[];
  byId: Map<string, Walker>;
  /** Wall-clock time the data describes, Unix ms (the live simulation moves it forward). */
  now: number;
  /** Race days so far this week and this month, today included. */
  weekDays: number;
  monthDays: number;
  /** Bumped on every change so views recompute. */
  version: number;
}

export interface Ranked {
  walker: Walker;
  steps: number;
  /** 1-based rank on the board this row came from. */
  rank: number;
}
