import type { PostHog, Properties } from 'posthog-js';
import { getAttribution } from './attribution';

/**
 * PostHog for the Mozy website (project "Mozy", US cloud). The project key is public by design.
 * Loaded after the page is idle (or on the first tap) so it never delays the hero; events captured before
 * that are queued. Only production builds on mozy.mcrudra.com send data; on localhost add ?ph_debug=1 once to test.
 * Visitors can turn analytics off on /privacy, which stops PostHog from loading at all.
 */
const KEY = import.meta.env.VITE_POSTHOG_KEY ?? 'phc_rziqBjs6ZhEMRSFtWzeKjGghbkqyf4csttASC5Bb8Nyp';
// Point VITE_POSTHOG_HOST at a reverse proxy on your own domain (for example https://mozy.mcrudra.com/ingest)
// once the site is deployed, so ad blockers don't hide visits.
const HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com';
const OFF_KEY = 'mozy_analytics_off';
const DEBUG_KEY = 'mozy_ph_debug';
// Cloudflare preview addresses (*.workers.dev) run the production build too; they stay out of the numbers.
const LIVE_HOSTS = ['mozy.mcrudra.com'];

type Queued = [event: string, properties?: Properties, beacon?: boolean];
let client: PostHog | null = null;
let loading = false;
const queue: Queued[] = [];

const storage = {
  get: (key: string) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key: string, value: string | null) => { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* storage blocked */ } },
};

export const analyticsOptedOut = () => storage.get(OFF_KEY) === '1';

function enabled() {
  if (typeof window === 'undefined' || analyticsOptedOut()) return false;
  const debug = new URLSearchParams(window.location.search).get('ph_debug');
  if (debug === '1') storage.set(DEBUG_KEY, '1');
  if (debug === '0') storage.set(DEBUG_KEY, null);
  return (import.meta.env.PROD && LIVE_HOSTS.includes(window.location.hostname)) || storage.get(DEBUG_KEY) === '1';
}

function visitorPlatform() {
  const agent = navigator.userAgent;
  if (/android/i.test(agent)) return 'android';
  if (/iphone|ipad|ipod/i.test(agent) || (/macintosh/i.test(agent) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'desktop';
}

async function load() {
  if (client || loading || !enabled()) return;
  loading = true;
  const { default: posthog } = await import('posthog-js');
  const attribution = getAttribution();
  posthog.init(KEY, {
    api_host: HOST,
    ui_host: 'https://us.posthog.com',
    defaults: '2026-08-30',
    // Anonymous visitors only: no names or emails are ever sent.
    person_profiles: 'identified_only',
    capture_pageview: 'history_change',
    capture_pageleave: true,
    loaded: instance => {
      instance.register({ site: 'mozy-landing', visitor_platform: visitorPlatform() });
      if (attribution) {
        instance.register_for_session({
          entry_source: attribution.source,
          entry_medium: attribution.medium || null,
          entry_campaign: attribution.campaign || null,
          entry_content: attribution.content || null,
          entry_referrer: attribution.referrer || null,
        });
      }
    },
  });
  client = posthog;
  for (const [event, properties, beacon] of queue.splice(0)) send(event, properties, beacon);
}

function send(event: string, properties?: Properties, beacon = false) {
  client?.capture(event, properties, beacon ? { send_instantly: true, transport: 'sendBeacon' } : undefined);
}

/** Captures an event now, or queues it until PostHog has loaded. `beacon` survives a navigation away from the page. */
export function track(event: string, properties?: Properties, beacon = false) {
  if (!enabled()) return;
  if (client) send(event, properties, beacon);
  else { queue.push([event, properties, beacon]); void load(); }
}

/** Starts PostHog once the page is idle, or on the first tap or key press, whichever comes first. */
export function initAnalytics() {
  if (!enabled()) return;
  const start = () => { void load(); };
  const idle = () => { if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(start, { timeout: 2500 }); else setTimeout(start, 1200); };
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
  for (const type of ['pointerdown', 'keydown'] as const) window.addEventListener(type, start, { once: true, passive: true });
}

/** Turns website analytics off on this device (and stops recording right away if PostHog is running). */
export function optOutOfAnalytics() {
  client?.opt_out_capturing();
  storage.set(OFF_KEY, '1');
}

/** Turns website analytics back on for this device. */
export function optInToAnalytics() {
  storage.set(OFF_KEY, null);
  if (client) client.opt_in_capturing();
  else void load();
}
