/**
 * Where this visit came from, worked out once per browser session and reused by analytics and the store links.
 * UTM tags win (MCX links carry them, including the post's brief ID in utm_content); without them the referrer
 * domain is mapped to a channel; with neither, the visit is "direct". Nothing personal is stored.
 */
export type Attribution = {
  source: string;
  medium: string;
  campaign: string;
  /** The MCX brief ID (for example OCT12-V1) when the link carried one. */
  content: string;
  referrer: string;
  landingPath: string;
};

const KEY = 'mozy_attr_v1';
let cached: Attribution | null = null;

// Referrer domains mapped to the channel names MCX uses in utm_source.
const REFERRERS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
  [/(^|\.)(t\.co|x\.com|twitter\.com)$/, 'x'],
  [/(^|\.)threads\.(net|com)$/, 'threads'],
  [/(^|\.)(facebook\.com|fb\.me|fb\.com)$/, 'facebook'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'linkedin'],
  [/(^|\.)reddit\.com$/, 'reddit'],
  [/(^|\.)producthunt\.com$/, 'producthunt'],
  [/(^|\.)news\.ycombinator\.com$/, 'hackernews'],
  [/(^|\.)google\.[a-z.]+$/, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, 'chatgpt'],
  [/(^|\.)perplexity\.ai$/, 'perplexity'],
  [/(^|\.)mcrudra\.com$/, 'mcrudra'],
];

const clean = (value: string | null, max = 60) => (value ?? '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(0, max);

function fromLocation(): Attribution {
  const params = new URLSearchParams(window.location.search);
  let host = '';
  try { host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch { host = ''; }
  const ownSite = host === window.location.hostname.replace(/^www\./, '');
  const referrer = ownSite ? '' : host;
  const utmSource = clean(params.get('utm_source'));
  const qr = params.get('src');
  const mapped = REFERRERS.find(([pattern]) => pattern.test(referrer))?.[1];
  const source = utmSource || (qr ? clean(qr) || 'qr' : '') || mapped || (referrer ? clean(referrer) : 'direct');
  return {
    source,
    medium: clean(params.get('utm_medium')) || (utmSource ? '' : qr ? 'qr' : mapped ? 'referral' : referrer ? 'referral' : 'none'),
    campaign: clean(params.get('utm_campaign')),
    // Keep the brief ID's own casing (OCT12-V1) so it matches MCX records.
    content: (params.get('utm_content') ?? '').trim().replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 40),
    referrer,
    landingPath: window.location.pathname,
  };
}

/** Reads (or works out and stores) this session's attribution. Safe to call during server rendering: returns null. */
export function getAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  if (cached) return cached;
  const fresh = fromLocation();
  let stored: Attribution | null = null;
  try { stored = JSON.parse(sessionStorage.getItem(KEY) ?? 'null'); } catch { stored = null; }
  // A tagged link always starts a new attribution; otherwise the first touch of the session is kept.
  const hasTags = /[?&](utm_source|src)=/.test(window.location.search);
  cached = hasTags || !stored ? fresh : stored;
  try { sessionStorage.setItem(KEY, JSON.stringify(cached)); } catch { /* private mode: keep it in memory */ }
  return cached;
}

const SHORT: Record<string, string> = {
  instagram: 'ig', youtube: 'yt', x: 'x', threads: 'th', facebook: 'fb', linkedin: 'li', reddit: 'rd', producthunt: 'ph',
  hackernews: 'hn', google: 'gg', bing: 'bi', duckduckgo: 'ddg', chatgpt: 'gpt', perplexity: 'pplx', qr: 'qr', email: 'em', direct: 'dir', mcrudra: 'mcr',
};

/** A short code for an App Store campaign token (30 characters at most): "ig-oct12-v1-hero". */
export function campaignToken(placement: string) {
  const attribution = getAttribution();
  const source = attribution ? SHORT[attribution.source] ?? attribution.source.replace(/[^a-z0-9]/g, '').slice(0, 6) : 'web';
  const content = attribution?.content ? attribution.content.toLowerCase().slice(0, 12) : '';
  return [source || 'web', content, placement].filter(Boolean).join('-').slice(0, 30);
}
