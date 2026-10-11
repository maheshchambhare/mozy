# Mozy landing page analytics plan (11 October 2026)

PostHog is now built into the site and set up in PostHog. The section "What was built" near the end describes what exists today; where it differs from the plan above, that section is the current truth.

## What you want to know

1. Where each visitor came from: Instagram, YouTube, X, Threads, Facebook, LinkedIn, Reddit, Product Hunt, Google, a QR code, or direct.
2. What visitors did on the page: how far they scrolled, which chapters they saw, which FAQ answers they opened.
3. How many tapped "App Store" and how many tapped "Google Play", and from which button (hero, sticky bar, final section, nav, /get, /pricing).
4. Daily numbers: visitors today, live visitors, top sources.
5. Which of your posts (MCX brief IDs such as OCT12-V1) drove visits and store taps.
6. How many of those taps became installs.

## Recommendation

| Layer | Tool | Cost | Why |
|---|---|---|---|
| Main analytics | PostHog Cloud | Free up to 1M events and 5,000 session recordings a month | Traffic sources from referrer and UTM tags, a web analytics dashboard with today and live views, custom events for store taps, funnels, visitor journeys, session replay and heatmaps in one tool. Optional cookieless mode. |
| Free extra, optional | Microsoft Clarity | Free forever, up to 100,000 recorded sessions per day, 30-day retention | Unlimited heatmaps and recordings if PostHog's 5,000 recordings a month runs out. |
| Free backup count | Cloudflare Web Analytics | Free once the site is on Cloudflare | Raw visit counts, referrers and countries with no setup. It has no custom events and no UTM support, so it can't be the main tool. |
| Installs | App Store Connect campaign analytics and Google Play Console acquisition reports | Free | The only reliable way to count installs per campaign. They need the right link parameters, described below. |
| Inside the apps | Firebase (you already have it) | Free | Keep it for app events like first open. It is not the best fit for the landing page. |

Build your own analytics later, if ever. Section "Should you build your own?" explains why.

## How each option compares

| Tool | Free limit | Sources and UTMs | Custom events (store taps) | Funnels and journeys | Replay and heatmaps | Cookie banner needed | Verdict |
|---|---|---|---|---|---|---|---|
| PostHog Cloud | 1M events and 5,000 recordings a month; 1 project; 1-year retention | Yes, with channel types | Yes | Yes | Yes | Not in cookieless mode | Best all-in-one free option |
| Google Analytics 4 (Firebase web is the same thing) | No event cap; 14-month retention at most | Yes | Yes | Yes (Explorations) | No | Yes, for cookies | Free and powerful, but a heavy interface, consent issues, thresholded reports and frequently blocked |
| Umami Cloud (Hobby) | 100K events a month; 1 website; 6-month retention | Yes | Yes | Yes | No | No (cookieless) | Simplest privacy-first option; plan B if PostHog feels like too much |
| Mixpanel (Free) | 1M events and 10K replays a month; 5 saved reports per seat | Yes | Yes | Yes | Replay yes | Yes | Strong product analytics, weaker for website traffic |
| Amplitude (Free) | Around 2M events a month; reports say a card is now required | Yes | Yes | Yes | Some | Yes | Same as Mixpanel; the card requirement is a negative |
| Microsoft Clarity | Free forever; 100K recorded sessions a day; 30-day retention | Referrer filters | Custom tags | No | Yes, unlimited | Yes, for full features | Best free add-on, not a main tool |
| Cloudflare Web Analytics | Free; 6-month history; sampled | Referrers only, no UTMs | No | No | No | No | Backup visit counter only |
| Plausible CE, Umami, Rybbit, OpenPanel self-hosted | Software is free; you pay for a server (about $5 a month) and maintain it | Yes | Yes | Varies | Rybbit has replay | No | Only worth it if you want full data ownership |

Free-tier numbers come from vendor pages and recent pricing trackers. They change often, so confirm on the vendor site at sign-up.

## How much traffic the free tiers cover

A visit on this page would send about 8 to 12 events: a page view, a page leave, section views as each chapter scrolls in, one or two clicks and maybe an FAQ open.

| Tool | Free events a month | Visits a month that fit |
|---|---|---|
| PostHog | 1,000,000 | About 80,000 to 120,000 |
| Umami Hobby | 100,000 | About 8,000 to 12,000 |
| Mixpanel | 1,000,000 | About 80,000 to 120,000 |

Your first goal is 100 tracked installs. PostHog's free tier leaves a lot of room before you'd pay anything, and it lets you set a hard billing limit of $0.

## Getting the source right

Referrers alone will mislead you, because the Instagram in-app browser usually hides where a visitor came from. Without tags, that traffic shows up as "direct". Three rules fix this:

1. Every link you post carries UTM tags. MCX already builds them, for example `https://mozy.mcrudra.com/?utm_source=instagram&utm_medium=social&utm_campaign=mcx&utm_content=OCT12-V1`. The `utm_content` value is the MCX brief ID, so each post gets its own row in the reports.
2. Keep one lowercase naming scheme. Reports treat "Instagram" and "instagram" as different sources.

| Parameter | Values |
|---|---|
| utm_source | instagram, youtube, x, threads, facebook, linkedin, reddit, producthunt, qr, email |
| utm_medium | social, bio, story, reel, video, post, comment, dm |
| utm_campaign | mcx for now; later one per launch or month (for example oct-launch) |
| utm_content | the MCX brief ID |

3. Tag the link-in-bio and profile links as well, because most Instagram and YouTube Shorts traffic goes through them, not the post itself. Use `utm_medium=bio` for those.

## What to measure on the page

| Event | When it fires | Properties | Answers |
|---|---|---|---|
| Page view | Automatic | Source, medium, campaign, content, referrer, device, country | Who came, from where |
| `store_click` | A tap on any App Store or Google Play button | `store` (ios or android), `placement` (hero, sticky, final, nav, get, get-qr, pricing) | iOS vs Android taps, and which button works |
| `section_view` | A chapter scrolls into view | `section` (hero, how, walk, world, faq, final) | How far people get, and where they drop off |
| `faq_open` | An FAQ answer opens | `question` | What worries people before installing |
| `how_step` | A step button is clicked in How it works | `step` | Whether people explore the demo |
| `qr_landing` | /get opened with `src=qr` | none | Whether the QR code on laptops is used |
| `outbound_click` | Footer, social or Product Hunt links | `href` | Interest in you and mcrudra.com |

Dashboards to build in PostHog:

1. **Today:** visitors, live visitors, top sources, store taps by store.
2. **Acquisition:** visits and tap rate by source and by MCX brief ID, for example: Instagram 420 visits, 38 store taps, 9.0% tap rate.
3. **Funnel:** page view, then How viewed, then Walk viewed, then FAQ viewed, then store tap, broken down by source.
4. **Content:** a table of `utm_content` values (MCX brief IDs) by visits and store taps. Feed this into the MCX measurement review each week.
5. **Replays:** watch 10 sessions a week from visitors who left without tapping a store button.

PostHog shows each visitor as an anonymous profile, for example "a visitor from Instagram on an iPhone watched the hero, opened two FAQs and tapped App Store". You will not see names or contact details, and you shouldn't try to (no fingerprinting).

## Closing the loop to installs

The website can only see taps on the store buttons. Installs happen inside the stores, so they are counted there.

- **App Store:** add the provider token (`pt=`) from App Store Connect (Analytics, then Campaigns) to the store links. Today the links send `ct=` without `pt=`, so Apple attributes nothing. With both set, App Store Connect shows page views, downloads and proceeds per campaign token. Campaigns only appear after a few downloads.
- **Google Play:** the links already send a `referrer` with UTM tags. Play Console shows them under User acquisition, then Acquisition reports, then Tracked channels (UTM). The data lags by several days.
- **Pass the visitor's source through:** today every store link says "website" whatever the source, so a visitor from Instagram looks the same as one from Google. The plan is to keep the visitor's `utm_source` and `utm_content` for the session and add them to the store link: `ct=ig-OCT12-V1-hero` for Apple (30 characters at most) and `utm_source=instagram&utm_content=OCT12-V1&utm_term=hero` in the Play referrer. Then App Store Connect and Play Console report installs per channel and per post.
- **Android apps:** the Play Install Referrer gives the app the same UTM tags on first open, so Firebase in the app can tie a first open to the campaign. iPhone offers no equivalent for organic links, so iPhone installs per campaign come only from App Store Connect, as aggregate counts.

## Privacy and consent

- **The current privacy page needs an update.** It promises "zero server-side storage or tracking". Once website analytics is added, it must say which tool runs on the website, what it collects (pages, clicks, device, country, source) and that it doesn't identify people. The app's own privacy claims stay unchanged.
- **India's DPDP Act:** the main notice and consent duties apply from 13 May 2027, though one law firm reads the notice rule as starting 13 November 2026. EU visitors fall under GDPR now. A lawyer should confirm how this applies to the site.
- **Two consent setups in PostHog:**
  - `cookieless_mode: "always"` needs no banner for PostHog. You keep daily visitor counts, sources, events and funnels, but returning visitors aren't linked across days.
  - `cookieless_mode: "on_reject"` shows a small banner. Visitors who accept get full tracking, and visitors who decline are still counted anonymously.
- **Recommendation:** start with "always" for a clean, banner-free page, and switch to "on_reject" if you need cross-day journeys or session replay for everyone.
- **Ad blockers:** they block many analytics scripts, though few people use them inside the Instagram app. Serve PostHog through your own domain with a reverse proxy, which PostHog supports and which can run on Cloudflare for free. That keeps counts closer to reality.

## Should you build your own?

Not now. A home-made tracker on Cloudflare would fit the free limits (Workers allows 100,000 requests a day, Workers Analytics Engine 100,000 data points a day, D1 100,000 row writes a day). But you would also have to build:

- session handling and visitor counting without cookies
- referrer and UTM parsing and channel grouping
- bot and crawler filtering
- dashboards, funnels and date comparisons
- replays and heatmaps, which would be very hard
- privacy handling and data retention
- upkeep as browsers change

That is weeks of work to rebuild a weaker version of a free product. One small exception may be worth doing later: a first-party `store_click` counter on a Cloudflare Worker as a backup count that no ad blocker hides. Build it only if PostHog's numbers look too low compared with store data.

## Rollout plan

**Phase 0: prerequisites (your actions)**
1. Deploy the new site to mozy.mcrudra.com. Analytics on localhost isn't useful.
2. Create a free PostHog Cloud account: pick the US or EU region, set a $0 billing limit and turn on "Cookieless server hash mode".
3. Generate the App Store provider token in App Store Connect (Analytics, then Campaigns).
4. Decide on the consent setup ("always" or "on_reject").

**Phase 1: install and events (about a day of work once approved)**
1. Add PostHog with a reverse proxy, and turn off autocapture noise you don't need.
2. Add the events listed above, plus first-touch UTM capture for the session.
3. Pass source and post through to the App Store `ct=` and the Play referrer.
4. Update the privacy page.
5. Optional: add Microsoft Clarity.

**Phase 2: dashboards and habits (the first week)**
1. Build the five dashboards.
2. Turn on PostHog's weekly email digest.
3. Add a weekly check to the MCX measurement routine: top posts by store taps, the iOS vs Android split, and the funnel drop-off.

**Phase 3: installs (after 2 to 3 weeks of data)**
1. Compare website taps with App Store Connect campaign downloads and Play Console UTM installs.
2. Decide which channels and posts to double down on.

## Decisions for you

1. PostHog as the main tool, or Umami for a simpler privacy-first dashboard?
2. A banner-free cookieless setup, or a small consent banner with full tracking?
3. Add Microsoft Clarity for unlimited heatmaps and recordings?
4. Where the site will be hosted (Cloudflare is assumed above).

## What was built (11 October 2026)

PostHog runs on the site, in the PostHog project "Mozy website" (US cloud). Nothing is deployed yet, so no real visitor data exists.

**In the code**

| File | What it does |
|---|---|
| `src/lib/analytics.ts` | Loads PostHog after the page is idle or on the first tap, so it never slows the hero. Only production builds send data. Adds the visit's source to every event. Holds the opt-out switch. |
| `src/lib/attribution.ts` | Works out the visit's source once per session: UTM tags first, then `src=` for the QR code, then the referring site, otherwise "direct". Builds the App Store `ct=` token. |
| `src/lib/interactions.ts` | Sends the named events below from data attributes on links and buttons, and records which chapters a visitor reaches. |
| `src/data/landing.ts` | Store links now carry the visit's source: `ct=ig-oct12-v1-hero` for Apple, and source, post and button in the Play referrer. |
| `src/pages/PrivacyPage.tsx` | New section 06 explains website analytics and has an on/off switch for each visitor. |

**Events**

| Event | Fires when | Properties |
|---|---|---|
| `$pageview`, `$pageleave` | Automatic | Device, country, referrer, UTM tags |
| `store_click` | A tap on any App Store or Google Play button, including the /get QR redirect | `store` (ios, android), `placement` (hero, sticky, nav, final, pricing, pricing-bottom, get, get-qr), `path` |
| `cta_click` | A desktop "Get Mozy" button, which scrolls to the download section | `cta`, `placement`, `destination` |
| `section_view` | A chapter reaches the middle of the screen, once per page view | `section` (hero, how, walk, worlds, faq, get), `order` |
| `faq_open` | A Quick answers question opens | `question`, `position` |
| `how_step` | A step button in How it works is clicked | `step`, `title` |
| `outbound_click` | A link to another site | `href`, `host`, `label`, `area` |

Every event also carries `entry_source`, `entry_medium`, `entry_campaign`, `entry_content` (the MCX post ID) and `entry_referrer` for the session, plus `site` and `visitor_platform`. Autocapture, heatmaps, dead clicks, web vitals, error capture and session replay are on.

**In PostHog**

- Actions: "Store tap", "App Store tap" and "Google Play tap".
- Dashboard "Mozy website: landing page", pinned. Its tiles:
  - headline numbers for visitors, visitors who tapped a store button, and the store tap rate
  - visitors and store taps per day, and the App Store vs Google Play split
  - a scroll-depth funnel and a visit-to-store-tap funnel by source
  - results by source and results by post
  - which button gets tapped, and which questions people open
  - visitors by country and by device
  - outbound link clicks, and desktop "Get Mozy" clicks
- Visits from localhost and 127.0.0.1 count as test traffic and are left out of every tile.
- IP addresses are discarded after the country is worked out.

**Differences from the plan**

- PostHog uses its normal first-party cookie, not cookieless mode. Cookieless mode resets visitors every day, which breaks returning-visitor journeys and replay. There is no consent banner yet. Decide this before EU traffic matters; see the open items below.
- There is no separate `qr_landing` event. A QR visit shows up as a `store_click` with placement `get-qr`.
- No reverse proxy yet. Point `VITE_POSTHOG_HOST` at one when the site is deployed.

**How to test locally**

PostHog drops events from headless browsers, so test in a normal browser window.

1. Run `npm run dev` and open `http://localhost:5173/?ph_debug=1&utm_source=instagram&utm_content=TEST-1`. The `ph_debug` flag is remembered on that browser.
2. Scroll, open a question and tap a store button.
3. In PostHog, open Activity and turn off the test-account filter to see the events.
4. Open `?ph_debug=0` to stop sending from that browser.

**Open items**

1. Deploy the site; until then the dashboard stays empty.
2. Add the App Store provider token as `VITE_APP_STORE_PROVIDER_TOKEN`. Without it Apple attributes no installs to campaigns.
3. Set up a reverse proxy on mozy.mcrudra.com and set `VITE_POSTHOG_HOST`.
4. Decide on consent: keep cookies and add a banner, or switch to cookieless mode with no banner.
5. Privacy section 05 still has the unverified midnight reset and emergency bypass claims from the audit.

## Sources

- [PostHog pricing](https://posthog.com/pricing), [PostHog web analytics docs](https://posthog.com/docs/web-analytics), [PostHog cookieless tracking](https://posthog.com/docs/privacy/cookieless-tracking)
- [Microsoft Clarity FAQ](https://learn.microsoft.com/en-us/clarity/faq)
- [Umami pricing](https://umami.is/pricing)
- [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/)
- [Mixpanel pricing docs](https://docs.mixpanel.com/docs/pricing)
- [Amplitude pricing change (PricingSaaS)](https://pricingsaas.com/companies/amplitude/diffs/2026W28)
- [GA4 and Firebase differences (InfoTrust)](https://infotrust.com/articles/ga4-firebase-analytics-differences/)
- [App Store Connect: manage campaigns](https://developer.apple.com/help/app-store-connect/view-app-analytics/manage-campaigns)
- [Play Console acquisition reports](https://support.google.com/googleplay/android-developer/answer/6263332)
- [Instagram link tracking and UTMs (link.boo)](https://link.boo/guides/instagram-link-click-tracking)
- [Cloudflare Analytics Engine pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing), [D1 free tier enforcement](https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/)
- [Plausible CE overview](https://learnwithhasan.com/guide/self-host-plausible-analytics/)
- [DPDP Rules timeline (Hogan Lovells)](https://ca.hoganlovells.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-), [KPMG DPDP guidance](https://assets.kpmg.com/content/dam/kpmgsites/in/pdf/2025/11/dpdp-rules-2025-guidance-to-dpdp-act-implementation.pdf)
