import { useSyncExternalStore } from 'react';
import { placementName, storeLink } from '../data/landing';
import type { Store } from '../data/landing';

export type Platform = Store | 'other';

export function detectPlatform(): Platform {
  const agent = navigator.userAgent;
  if (/android/i.test(agent)) return 'android';
  // iPadOS reports a Mac user agent, so touch support tells the two apart.
  if (/iphone|ipad|ipod/i.test(agent) || (/macintosh/i.test(agent) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'other';
}

const subscribe = () => () => {};
const serverPlatform = (): Platform => 'other';

/** The visitor's phone platform; prerendered HTML and hydration use the neutral 'other'. */
export function usePlatform() {
  return useSyncExternalStore(subscribe, detectPlatform, serverPlatform);
}

/** Phones go straight to their store; everyone else gets the fallback (the download section). */
export function useStoreHref(placement: string, fallback: string) {
  const platform = usePlatform();
  return platform === 'other' ? fallback : storeLink(platform, placement);
}

/** Analytics labels for a "Get Mozy" button: a store tap on phones, a jump to the download section elsewhere. */
export function useCtaAttributes(placement: string) {
  const platform = usePlatform();
  const name = placementName(placement);
  return platform === 'other' ? { 'data-cta': 'get-mozy', 'data-placement': name } : { 'data-store': platform, 'data-placement': name };
}
