import { GateSunrise, Launch, NightHero, ParkDay } from './OgBanners';

/**
 * The Open Graph banner designs, by key, for scripts/og/render.mjs. H (Park day) is the live banner, chosen on
 * 2026-10-11 and rendered by `npm run og:render` to public/assets/og-banner.jpg; E-G are the alternates from that round.
 */
export const OG_VARIANTS = {
  e: { name: 'Launch poster', component: Launch },
  f: { name: 'Night hero', component: NightHero },
  g: { name: 'Gate at sunrise', component: GateSunrise },
  h: { name: 'Park day', component: ParkDay },
} as const;

export type OgVariant = keyof typeof OG_VARIANTS;
