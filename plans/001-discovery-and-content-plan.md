# MOZY discovery audit and implementation plan

**Audited 3 October 2026, Asia/Kolkata.** Workspace: `/Users/mahesh/Desktop/Projects/mcrudra.com/MOZY`. Parent Git HEAD `ad9af4d`; MOZY was untracked within the parent checkout, so the commit is not a reliable content snapshot. Re-read affected files before execution. Source changed during this session (pricing and productFacts appeared); preserve those changes and reconcile evidence rather than overwriting them.

The original requested deliverable was audit and planning. The subsequent user instruction authorizes fixing existing blogs. Blog repairs are therefore implemented separately; deployment, DNS, store changes, redirects, external submissions and the broader roadmap remain proposals. The accompanying [content inventory](content-inventory.md) records the **pre-repair** state. [Live research](live-research.md) supplies store, competitor and community evidence. No paid tools, new subscriptions or outreach were used.

## 1. Executive diagnosis

| Priority finding | Evidence / confidence | Consequence | Proposed response |
|---|---|---|---|
| Production is still the older Next/OpenNext site, not this Vite design | Direct HTTPS GET returned old heading and `x-opennext` on `/`, `/blog`, article and privacy; HIGH | Local fixes cannot improve public answers until the correct site is deployed | Confirm host ownership/route assignment, stage complete static output, test routes before host cutover |
| Missing article data is real | Complete31-record audit:307 sections,144FAQs;19records largely outlines; HIGH | Search snippets promise instructions/tests absent from the page | Fill useful sections, direct opening answers, factual metadata; preserve URLs during repair |
| Product source of truth has contradictions | Store pricing versus free claims; code calculation differs from owner-confirmed34steps/minute; Firebase calls versus zero-tracking language; HIGH source evidence, shipped behavior untested | Inaccurate answers harm fit and trust | Platform-specific evidence registry and release-device verification before definitive claims |
| The corpus includes unsupported authority claims | Seven-month trial/40% result without data, nonexistent diagnostic questions, unrelated citations; HIGH | Rich formatting would amplify unreliable information | Remove unsupported assertions, replace with honest guides/checklists and source-linked limitations |
| Migration is incomplete and could loop if current sibling routes ship together | Sibling middleware maps MOZY host to `/apps/mozy`, whose current page redirects to MOZY host; HIGH code pattern, live loop NOT observed | Future deployment could turn valid destinations into redirects to themselves | Separate host routing from old-path redirects; explicit map; permanent redirects only after destination ready |

**What already works:** current production sampled pages return meaningful HTML and self canonicals; robots explicitly allows OAI-SearchBot. Local build already prerenders article routes. Do not prescribe a framework rewrite or claim JavaScript-only public pages. Eligibility is not a promise of indexing, recommendation, traffic or installs.

## 2. Product facts and contradictions

Verification date for every row: **2026-10-03**. “Listing” means publisher-declared/store-observed, not independently tested. “Source” means inspected development code, not guaranteed released behavior. App source root below is `/Users/mahesh/Desktop/Projects/react-native/stepscroll`.

| Fact | Value / status | Source | Confidence / conflict / required check |
|---|---|---|---|
| Preferred origin | `https://mozy.mcrudra.com` | `src/data/metadata.ts:1`; successful live GET | HIGH configured and public; destination host assignment still needs owner console |
| iOS identity | Apple ID6792097497; developer Mahesh Chambhare | [US Apple listing](https://apps.apple.com/us/app/mozy-walk-to-earn-screen-time/id6792097497) | HIGH listing |
| Android identity | `com.moxstudio.mozy`; mcrudra | [Play listing](https://play.google.com/store/apps/details?id=com.moxstudio.mozy); app `android/app/build.gradle:51` | HIGH listing/source; Play support links still use moxstudio.tech |
| Regions | US Apple listing readable; generic Play localized AU | Same listings | US/AU observations only; US/UK/DE/France installs not verified; failed region fetch is not unavailability |
| OS | Apple iOS16.4+; Android source minSDK26 | Apple; app `android/build.gradle:4` | HIGH listing/source, Android shipped minOS pending; old live iOS15/Android9 copy conflicts |
| Earning mechanism | Accumulate walking-derived balance and spend on selected apps | Both listings; app `src/services/creditEngine.ts:6` | MED release behavior; do not say every opening needs a fresh walk |
| Rate | **Owner-confirmed product rule:34 steps earns1minute.** Use this in website copy and worked examples. Source code currently uses0.03minutes/step. | User confirmation2026-10-03; app `src/services/creditEngine.ts:6–35,90–122` | HIGH intended product rule; separate app consistency follow-up: source implementation differs. Do not replace owner-confirmed website rule with inferred code behavior. |
| Configurable ratio | Store mentions movement intensity; new productFacts says fixed | Listing; `src/data/productFacts.ts` | UNVERIFIED setting semantics; do not promise configurability |
| Banking/reset | iOS source resets available/earned/spent/penalty on logical new day | app `ios/mozy/WidgetSync.swift:297–322`; `creditEngine.ts` resetHourOffset | HIGH code, MED release; “every midnight” is too absolute until custom reset setting tested |
| iOS step source | CMPedometer; HealthKit observer requests read permission and wakes pedometer updates | app `ios/HealthKitStepObserver.swift:21–114` | HIGH code; privacy omits HealthKit observer; do not imply AppleWatch/manual Health steps all count |
| Android steps | Hardware sensor/no GPS described | Play; website privacy | MED listing; denied permission, sensor absent, OEM battery behavior need tests |
| iOS blocking | Screen Time native framework mechanism described | Apple; `src/pages/PrivacyPage.tsx` | MED; device test and selected-app scope needed |
| Android blocking | Accessibility foreground detection and overlay described | Play; privacy page | MED; test selection and exclusions |
| Reels/Shorts only | Store wording ambiguous; no verified selective filtering evidence | Listings versus generic app selection | UNVERIFIED; write selected-app blocking, not ability to keep DMs while blocking Reels |
| Emergency/bypass | Code has bypass debt and step penalty; new website says3×10min | app `ios/mozy/BypassBridgeModule.swift:27–42`; `src/store/useUserStore.ts:1219–1287` | HIGH bypass exists in source; caps, reset, essential apps and exact debt require released-device checks |
| Account | Apple claims no account; anonymous store identity still possible | Apple; subscription code | MED publisher claim; distinguish app login from store billing identity |
| Offline | Local step/balance paths exist; purchase restoration uses store APIs | app `src/services/subscription.ts:51–86` | Do not claim every feature/first launch works without network; test airplane mode and expired subscriptions |
| Analytics | Firebase dependency and active event calls exist | app `package.json:16–17`; `src/utils/analytics.ts:1–17`; `src/screens/PaywallScreen.tsx:328,404` | HIGH source; website/store zero-data claims conflict, actual release collection/consent not verified |
| iOS pricing | Free download, paid subscription required; US listing$4.99/month,$29.99/year | Apple US | HIGH observed regional prices; offer eligibility/trial and renewal checkout need verification |
| Android pricing | IAP shown, exact prices/free entitlement unknown | Play | UNVERIFIED; new website parity assumptions not verified by this audit |
| Accessibility/fit | No tested alternate earning mechanism or emergency guarantee | No device test evidence | UNVERIFIED; recommend native timers/manual boundaries for people unable to walk; no medical claims |

**Blocking facts to obtain from owner/release testing:** release version/hash per platform; US/European availability; current offer configuration and trials; account/network/analytics disclosure; logical-day reset options; debt/bypass caps; essential apps and movement alternatives. App-source review was scoped to cited calculation, reset, observer, billing and analytics files; not a full app/security/network audit.

## 3. Existing content, coverage and URL actions

See the complete31-row [URL action inventory](content-inventory.md) and [machine-readable inventory](content-inventory.json). Every local JSON body and FAQ was reviewed. Historical sibling source contains95records (30MOZY,15parent,25POZY,25DOOVI), plus a stub. Local31 equals the30MOZY records plus parent-owned `attention-economy-explained`; all were initially deep-equal. Do not migrate all parent content merely because it mentions MOZY.

Historical enrichment in sibling `lib/articles.ts` includes19 relevant prose maps that were not copied into this project. Four were fully reviewed during the historical pass; the remainder and12 matching historical Markdown bodies require follow-up before claiming a complete historical-body audit. Local bodies are fully audited. Live HTTP samples were home, hub, walk-to-earn article, privacy and a nonexistent URL, not a full rendered crawl of every historical article.

**Current repair decision:** keep all31 URLs and replace missing/misleading copy with substantive, answer-first guides. No destructive URL retirement or consolidation is executed without traffic/link history. The original inventory's retirement/consolidation recommendations remain future options; reflection checklists can replace unsupported clinical quizzes without inventing validated scores. Preserve source archive for provenance. Update titles, meta, OG and FAQs together so obsolete promises do not survive in snippets.

## 4. Conversational-intent map

All exact questions below are synthesized hypotheses, **not query logs**. O denotes observed public discussion themes documented with URLs in live-research.md; H denotes product-fit hypotheses. No search volumes/difficulty/ChatGPT frequency inferred. One primary destination per intent; closely related questions remain sections.

| Exact question / keyword family | Evidence | Audience / intent | Existing best URL → action / proposed canonical | Unique information and dependency | Priority |
|---|---|---|---|---|---|
| What is MOZY, and does it make me walk before using apps? / MOZY walking blocker | H, verified category | Both; branded discovery | `/` → update | Clear balance model; verified availability/cost | P1 |
| Can I earn screen time by walking and bank it? / walk-to-earn, step blocker | O banking questions | Both; mechanism | `/blog/walk-to-earn-screen-time` → update | Worked ledger, rounding, reset/debt test | P1 |
| How do I make Instagram require steps on Android? / Android walking blocker | H + platform distinction | Android; setup | `/blog/instagram-time-limit-android` → update | Actual permission sequence/screenshots, app-wide scope | P1 |
| Can I unlock apps with steps on iPhone? / iPhone walking blocker | O Health question | iPhone; setup | None → `/help/iphone-setup` | Screen Time + Motion/Health roles; binary tests | P1 |
| Is MOZY free? / MOZY price | H + store conflict | Both; branded purchase | FAQ; now `/pricing` exists → verify/update | Regional entitlements/trials/renewals | P0/P1 |
| What permissions does MOZY need and can it work offline? / privacy, no account | O tracking + H offline | Both; trust | `/privacy` → update | Firebase/release network audit and billing distinction | P0 |
| Why are steps not counting or apps still blocked? / MOZY support | O category failures | Both; troubleshooting | None → `/help` | Sensor/permission/debt/reset decision tree | P1 |
| Walking blocker or ordinary timer? / MOZY vs Digital Wellbeing | H official alternatives | Android; comparison | `/blog/digital-wellbeing-vs-mozy` → update | Transparent source comparison; proposed hands-on protocol | P1 |
| How do I stop opening my phone automatically? / compulsive checking | O related discussions | Both; practical guide | `/blog/how-to-stop-checking-phone` → update | Routine options, app-free alternative, real stopping cue | P2 |
| How do I stop scrolling in bed or first thing in the morning? / nighttime/morning use | H | Both; routine | `/blog/bedtime-revenge-procrastination-limbic-prefrontal-exhaustion` → update; morning section in checking guide | Safe routines; no nighttime walking requirement | P2 |
| Can I block Reels but keep Instagram messages? / Reels-only, Shorts-only | O short-form concern | Both; capability | `/blog/short-form-video-brain-atrophy-micro-content-cognitive-decay` → factual scope correction | Don't claim selective filtering without tests | P0 correction, P2 discovery |
| Can I bypass a blocker and keep essential apps? / emergency access | H | Both; safety/fit | Setup pages + `/help#essential-apps` | Release-tested exception/debt handling | P1 |

The initial build programme is **10 priority destinations** below, counting existing pages. Other31URL repairs correct current content; they are not a proposal to create31new acquisition pages. Do not add thin NFC/location pages; mention mechanism alternatives only where verified.

## 5. Initial priority page briefs

For all briefs: use a concise direct answer before sales copy; title/description are proposals pending facts. Include actual source links, visible publisher ownership, meaningful update dates, accessible headings and ordinary internal links. No arbitrary minimum word count. Device experiments below are **proposed, not performed**. Every acceptance gate includes rendered HTML and platform-claim review.

### B1 — `/` product homepage (update)
- Question: What does MOZY do? Secondary: devices, cost, balance, app selection. Distinct role: branded product destination.
- Title: `MOZY — Walk to Earn Screen Time`; H1: `Turn a walk into time for your apps`; description: `See how MOZY turns walking into screen time for selected apps, with platform details, pricing and setup help.`
- Opening: explain earning before spending; never imply each launch requires walking. Outline: How balance works → select apps → platform differences → cost → privacy/fit → download.
- Evidence: store identity and released balance test; authentic screenshots of selection, earned/spent/available state. Contribution: linked example rather than a slogan. Alternative: built-in timer where walking unsuitable. FAQ: banking, app scope, cost. Link B2/B3/B4/B5/B6; store CTA with platform label.
- Schema: SoftwareApplication + publisher IDs, no unverified offer/rating. Refresh on releases/store changes. Done: text and schema agree, every store link verified for target market, one H1 and answer in initial HTML.

### B2 — `/blog/walk-to-earn-screen-time` (update existing slug)
- Question: Can walking earn phone time? Secondary: conversion, banking, reset, debt. Title/H1: `How Walking Earns Screen Time`; description: `Understand steps, earned minutes, available balance and the questions to check before choosing a walking app blocker.`
- Answer: explain balance model and separate example from tested MOZY numbers. Outline: earning versus unlocking → worked ledger → spending/reset/debt → phone sensor requirements → suitability → next steps.
- Contribution: versioned ledger with starting balance, steps, earned/spent/result, reset test; source creditEngine and actual screenshots. Dependencies: owner confirms34steps/minute; logical reset and release version still require verification. No generic dopamine treatment.
- Alternatives/FAQ: timers if walking unavailable; can bank across days, phone versus watch steps. Link B1/B3/B4/B7; setup/store CTA. Article schema + breadcrumbs; refresh balance updates. Done: every numeric example reproducible and unknowns visible.

### B3 — `/blog/instagram-time-limit-android` (update)
- Question: How do I limit Instagram on Android? Secondary: native timers versus walking, messages/Reels scope. Title/H1: `How to Limit Instagram on Android`; description: `Set a native Instagram timer or compare a walking-based app limit, including permissions, scope and essential-app precautions.`
- Answer first gives the native Settings path with device variation and describes walking alternative. Outline: Digital Wellbeing steps → MOZY setup → permissions → what gets blocked → failure/essential access.
- Original contribution: screenshot walkthrough on named Android/version; denied permission and empty-balance test. Sources: Google Digital Wellbeing docs, Play, release device. No unbypassable guarantee.
- FAQ: DMs affected, removing timers, steps not counted. Link B2/B7/B8/B6; Android CTA. Article/Breadcrumb schema. Refresh OEM/OS/permission changes. Done: reader can follow on tested device, alternatives and scope disclosed.

### B4 — `/help/iphone-setup` (new, conditional distinct platform flow)
- Question: Can I set up a walking blocker on iPhone? Title/H1: `Set Up MOZY on iPhone`; description: `Follow MOZY's iPhone setup and understand Screen Time, motion permissions, balance and common setup problems.`
- Answer: verified iOS requirement, subscription, permission purpose. Outline: compatibility/cost → authorize Screen Time → motion/Health distinction → select apps → test balance → troubleshoot.
- Screens: real system authorization and selected-app UI; no reconstructed permissions. Source: Apple listing, native source, released-device run. Original: permission refusal recovery. Fit: walking limitations, keep essentials accessible; alternatives Screen Time. FAQs permission denied/watch steps/restore purchase. Link B2/B5/B6/B7; iOS CTA.
- Schema WebPage/Breadcrumb, application link. Refresh OS/app releases. Done: end-to-end tested path including restoring/declining permission, no Android instructions copied.

### B5 — `/pricing` (existing now; verify/update)
- Question: Is MOZY free and what does it cost? Title/H1: `MOZY Pricing and Subscription Details`; description: `Check MOZY's download price, subscription options, trial eligibility and where to manage billing for your platform.`
- Answer separates free download from paid use, labels region/date. Outline: per-platform entitlements → regional offers → trial/renewal → cancellation/restore → support.
- Original: dated store-checkout comparison. Dependencies: Android prices/trials/entitlement and iOS offers. Consult store consoles and official Apple/Google subscription-management guides before writing instructions. Do not universalize US prices.
- FAQ trial eligibility, cancellation versus uninstall, restoration. Link B3/B4/B7; store CTA. SoftwareApplication offer only matching visible verified market/terms; no fake$0offer for entire app. Refresh offer changes/monthly check. Done: every price has region/date/source and trial qualifications.

### B6 — `/privacy` (update, P0 truth gate)
- Question: What data and permissions does MOZY use? Title/H1: `MOZY Privacy and Permissions`; description: `Understand MOZY's permissions, local activity storage, analytics and store billing, with platform-specific details.`
- Answer distinguishes local steps from telemetry/purchases; current absolute language needs release audit. Outline: data inventory → Android permissions → iOS Health/Motion/Screen Time → network SDKs → retention/deletion → contact.
- Contribution: data-flow table purpose/data/destination/retention/control. Dependencies: shipped Firebase config, payloads, consent and billing. Screenshots redact identifiers. Alternatives/fit: explain what permission refusal prevents without pressure.
- FAQ account/offline/deletion. Link B3/B4/B7, support CTA. WebPage schema; no legal certainty inferred from code. Refresh SDK/permission changes. Done: developer review reconciles store declarations, website and actual release traffic.

### B7 — `/help` (new practical support hub)
- Question: Why are my apps blocked after walking? Title/H1: `MOZY Setup and Troubleshooting`; description: `Check permissions, steps, balance and billing when MOZY is not working as expected, with separate Android and iPhone guidance.`
- Answer starts a short diagnostic order: step count → balance/debt → selected app/authorization → subscription. Outline: steps missing → balance differs → shield persists → purchases → emergency/essential apps → contact.
- Contribution: tested decision tree and support-report template (version/device/time/state, never personal app content). Dependencies: release tests; no unsafe delete-data-first advice.
- FAQ reinstall effects, watch steps, offline, bypass. Link B2–B6; setup/support CTA rather than forced store purchase. WebPage/Breadcrumb. Refresh recurring tickets/releases. Done: branches have safe next actions, contacts work, anchors crawlable.

### B8 — `/blog/digital-wellbeing-vs-mozy` (update)
- Question: Is a walking balance or timer a better fit? Title/H1: `Digital Wellbeing vs MOZY: Timers or Walking?`; description: `Compare built-in Android timers with MOZY's walking balance, including setup, flexibility, cost and limitations.`
- Answer says they solve different preferences; no universal winner. Outline: mechanisms → setup → override/essential access → cost/privacy → fit decision.
- Contribution: sourced feature table and separately labelled proposed controlled test; same Android device/date/version, select same test app, record actual behavior. Disclose publisher makes MOZY; no invented comparison results.
- FAQ both together/free alternative/override. Link B3/B5/B6; choose native setup or MOZY store CTA. Article/Breadcrumb. Refresh comparator changes. Done: every cell sourced/tested/unknown and no rating invented.

### B9 — `/blog/how-to-stop-checking-phone` (update)
- Question: How do I stop opening apps automatically? Title/H1: `How to Stop Checking Your Phone Automatically`; description: `Try a practical routine for notifications, phone placement and intentional app use, with options that do not require another app.`
- Answer gives three concrete actions first. Outline: identify trigger → reduce cues → choose stopping rule → replace check → review week. Contribution: printable simple observation log, not validated medical instrument.
- Dependencies: none for ordinary suggestions; OS source for settings. Screens optional actual notification controls. Don't claim psychologist authorship. Walking optional, never necessary for essentials.
- FAQ work calls/boredom/morning; link B2/B8/B10; optional app CTA. Article/Breadcrumb. Refresh settings changes. Done: all promised steps present and no guaranteed behavioral result.

### B10 — existing bedtime slug (update)
- Question: How can I stop scrolling in bed? Title/H1: `How to Stop Scrolling in Bed`; description: `Build a practical evening phone routine with a stopping point, notification controls and alternatives to late-night scrolling.`
- Answer starts with charging location/stopping cue and planned use, no claim to fix sleep disorders. Outline: identify reason for delaying → set boundary → native schedule → keep essentials → review next morning.
- Contribution: sample routine labelled illustrative; source native schedule controls; no invented MOZY curfew. No prescription to walk outside at night. Suitable for self-management; persistent distress warrants appropriate help, not a paid app cure.
- FAQs alarm/urgent calls/morning relapse. Link B9/B7/B8; routine-first CTA. Article/Breadcrumb. Refresh source settings. Done: no neurological-cure claims or unverified schedule feature.

## 6. Technical and migration implementation plan

Stack: React19, TypeScript6, Vite8, wouter3, GSAP3. Existing commands: `npm run build` (`tsc -b`, Vite, prerender), `npm run lint` (oxlint). Lint passed during audit; build is run for implementation verification separately. No framework migration needed.

| Evidence / impact | Proposed change and exact location | Dependency / verification |
|---|---|---|
| New site uses `scripts/prerender.mjs`; public runs Next/OpenNext | Build and serve `dist` on confirmed MOZY host, preserving per-route files | Owner hosting access; rawGET must show new route-specificH1 withJS off |
| `src/main.tsx` creates root rather than hydrates | Measure rerender/flicker before considering hydrateRoot; align SSR/client tree if changed | Not a crawl blocker; hydration mismatch test before adoption |
| Metadata is central but article text stale | Update article title/H1/meta/OG from corrected content; preserve shared real image fallback | `src/data/metadata.ts`, article JSON, PageMetadata; compare direct response + client route |
| Renderer handles limited Markdown | Safe structured/Markdown links, sources, answer first; no raw HTML execution | `BlogPost.tsx`, types; test script URLs cannot execute |
| Existing build sitemap originally34 routes; pricing added; source sitemap differed | Generate routes from one allowlist; no build-time lastmod fallback; write build output only | `scripts/prerender.mjs`; every loc successful canonical, date only substantive edit |
| Sample production unknown URL404, new static host unknown | Preserve genuine404; don't blanket SPA-rewrite all unknowns to200 | Host-specific config after provider confirmed; unknownslug and path test |
| Blog route trailing slash returns308 to no-slash today | Keep canonical no-trailing-slash convention | Host redirects; one hop, canonical parity |
| Local robots wildcard allows all; live searchbot explicit allow with private exclusions | Preserve privacy exclusions and existing training policy; explicit searchbot group below | public/robots + old sibling route; genuine crawler logs, not spoofedUA |
| No analytics integration found in this website audit | First use existing host/webmaster data, then minimal outbound events only if available free backend | consent/privacy review; test no step/app data sent |
| Parent route rewrite plus new redirect code can self-loop | Remove MOZY rewrite only after separate host serves new site; old parent `/apps/mozy` permanent redirect to new root | `../mcrudra-web/middleware.ts`, `app/apps/mozy/*`; old/new host access, rollback plan |
| Parent sitemap uses request-time `now` | Use verified content modification dates or omit | sibling sitemap route; unchanged content gives stable lastmod |
| Old parent content/links remain | Audit domain ownership field and explicit path map; preserve unrelated products | inventory; no blanket redirect of parent blog |
| Performance not freshly measured | Audit360/390/768/1280width, reduced motion, LCP/CLS; optimize actual hero/screens if needed | no claim of current CWV pass; collect mobile Lighthouse + field data if available |

**Live observations:** HTTPS home/hub/article/privacy/robots/sitemap200; missing test path404; `/blog/`308→`/blog`. Public pages had initialH1/canonical. The live MOZY sitemap contained33URLs; parent sitemap44URLs. Parent `/apps/mozy` still returned200 rather than redirecting. Detailed responses are saved in [live-http-checks.json](live-http-checks.json). Server Cloudflare/OpenNext. HTTP root first returned403 in the Python request context; a subsequent system curl GET returned200 on HTTP without redirect. Verify edge behavior and enforce HTTPS consistently before cutover. Local Python failed DNS in sandbox then local certificate chain outside sandbox; system curl succeeded with certificate verification. Those tool failures are not origin downtime. No authenticated CDN/WAF logs, response variants for genuine bot IPs, full security settings, search-console access or install analytics were available.

**Proposed robots adjustment for the new public site** (preserve all deliberate private-path and training rules discovered at deployment):

```text
User-agent: *
Allow: /
Disallow: /api/
Disallow: /checkout/

User-agent: OAI-SearchBot
Allow: /
Disallow: /api/
Disallow: /checkout/

Sitemap: https://mozy.mcrudra.com/sitemap.xml
```

Current live GPTBot policy allows crawling; do not silently reverse or infer training preference from search opt-in. Retain its existing separate policy when moving hosts. Review old `/_next/` block only on the old Next host because render resources may be needed; new Vite asset paths must be accessible. robots is not authorization and disallow is not noindex.

[OpenAI crawler documentation](https://developers.openai.com/api/docs/bots) and its linked [searchbot IP list](https://openai.com/searchbot.json) were accessed on audit date. OAI-SearchBot governs search crawling; GPTBot preference is independent; ChatGPT-User is user-triggered, not automatic search indexing. CDN exceptions, if logs prove necessary, should match validated published IPs and public paths narrowly; don't disable WAF or trust a user-agent string alone. No access guarantee inferred from our curl response.

**Migration mapping:** accompanying inventory enumerates all31 slugs and historical ownership. Same-domain `/blog/{slug}` URLs should retain ownership/path during this hosting change. Old `mcrudra.com/apps/mozy/blog/{slug}` equivalents should301/308 to verified same slug on MOZY; parent `/blog/attention-economy-explained` remains parent-owned until duplicate ownership settled. Old parent `/apps/mozy` → MOZY `/`; `/apps/mozy/blog` → MOZY `/blog`; `/apps/mozy/privacy` → MOZY `/privacy` after policy reconciled. Preserve `/download` links using a real selector page or relevant redirect (current local router has no dedicated route). MOXY/moxstudio.tech links need owner-confirmed legacy path inventory before redirects; do not guess. Update parent nav/cards, store website/privacy links and contextual article anchors. Verify each old URL status/Location/final200/canonical, no loops or unrelated homepage destinations. [Google migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) supports per-URL mapping and permanent equivalents; same-domain hosting cutover is not automatically a domain move.

## 7. Internal links, facts configuration and structured data

Homepage links to mechanism, setup by platform, pricing, privacy and help. Mechanism links to both setup guides; setup links to troubleshooting/privacy/pricing; comparison links to official native guidance and MOZY setup. Problem guides link contextually to mechanism only where useful. Journal groups actual topics and links every retained article using anchors. Related articles should be curated by subject rather than first three matching a generic pillar. Every new help/trust page gets navigation/footer links and is in the prerender manifest.

Current `src/data/productFacts.ts` appeared during the session and encodes strong values without per-fact evidence. Extend it rather than create a competing constant file. Proposed type (not applied):

```ts
type Evidence<T> = {
  value: T | null;
  status: 'store-observed' | 'source-reviewed' | 'device-tested' | 'unverified';
  sources: string[];
  checkedOn: string;
  platform: 'android' | 'ios' | 'both';
  region?: string;
  appVersion?: string;
  limitation?: string;
};
```

Use independent entries for regional offers, sensor source, permissions, ratios/rounding/reset, selected-app scope, network/billing, bypass and accessibility. Never use false/zero defaults to mean unknown. Homepage FAQ, pricing, metadata, demo calculator, privacy summary and structured data consume verified facts. Editorial articles refer to one canonical mechanism guide rather than duplicating volatile prices everywhere. Unknown facts are omitted from definitive claims or explicitly unresolved. Do not reshape mobile-app architecture for a website facts file.

Proposed schema graph: stable `https://mozy.mcrudra.com/#app`; publisher `https://mcrudra.com/#publisher` only after confirming public identity (no invented legal entity); article `{canonical}#article`; breadcrumb `{canonical}#breadcrumb`. SoftwareApplication with verified platform/category/download; offers only actual visible region/terms, no invented ratings. BlogPosting matches visible title, responsible editorial organization and actual update date; preserve original publication date only where provenance exists. BreadcrumbList matches displayed navigation. A substantive repair can use today's modification date, never silently redate original publication. Owner biography/About and corrections policy need real identity; publisher disclosure can be truthful without fabricating a named scientific reviewer.

[Google article guidance](https://developers.google.com/search/docs/appearance/structured-data/article) and [software application guidance](https://developers.google.com/search/docs/appearance/structured-data/software-app) were consulted; semantic schema validity is separate from rich-result eligibility. Do not manufacture reviews/offers to satisfy a rich-result field. Google's [current updates](https://developers.google.com/search/updates) state FAQ rich results were discontinued in2026; keep useful visible FAQs, not a rich-result promise. [AI search guidance](https://developers.google.com/search/docs/appearance/ai-features) describes normal eligibility and no special AI markup requirement. `llms.txt` remains optionalP3, not a ranking requirement. Structured data is not a ChatGPT recommendation switch.

## 8. Original evidence and free discovery

Create one small **MOZY permission and balance behaviour table**, surfaced within mechanism/help pages. Fields: platform/app version/OS/device/region/date/tester; permission purpose; source of steps; starting balance; earned/spent/debt; rounding; reset; offline outcome; essential-app behavior; observed bypass limit; screenshot/reference. Perform one controlled supported-device run per platform, and mark untested cells. Repeat after balance, permission or billing changes; quarterly link check. Ordinary HTML table first; optionalCSV only if useful. This is product verification, not clinical effectiveness research.

Free channels researched in live-research.md: Product Hunt allows free founder launch with accurate pricing; Show HN is conditional on a usable product and substantive founder demonstration; AlternativeTo has a free moderation queue that can take months and requires platform/availability eligibility. Prepare disclosure, real screenshots and useful demonstration afterP0. Do not solicit votes/fake reviews or post into research threads. No submissions have been made. Independent reviewers should receive no scripted verdict; record outcome/referrals separately from endorsements.

ChatGPT integration is deferred, not assessed as an implementation recommendation. No MCP endpoint should be built for rankings. If later requested, first verify current official submission requirements and a real utility (e.g. routine planning); app deep-link import is unverified. Initial website work stands alone.

## 9. Measurement and validation

| Baseline | Actual observation | Missing evidence |
|---|---|---|
| Local articles |31; pre-repair19outline-heavy | See implementation report for post-repair body checks |
| Public server | Cloudflare/OpenNext; sampled routes200 and meaningful HTML | All-route crawl, WAF logs, correct new-host assignment |
| Crawl policy | Public OAI-SearchBot allowed; private API/checkout exclusions | Genuine crawler request success/logs |
| Metadata | Sampled live self canonicals; local central metadata/prerender | Full production post-cutover validation |
| Lint | Passed during audit | Fresh build/content checks during implementation |
| Impressions/clicks/indexed pages | — | Search Console/Bing access or export |
| ChatGPT referrals/citations | — | Referrer logs and repeatable observation set |
| Store clicks/installs/subscriptions | — | Website event collector and store reporting; clicks are not installs |
| CWV | — | Current mobile lab/field measurements |

Use existing analytics first; none integrated in inspected website files. An app Firebase SDK does not establish website analytics access. If a free existing endpoint is available, propose event `store_click` with route, store, placement, referrer origin and allowlistedUTM source/medium/campaign. Exclude health data, app selections, user IDs and arbitrary query strings. Aggregate landing route/referrer; retain `chatgpt.com` source when supplied, never fabricate it. Direct/referrer-stripped traffic remains unattributed. Store attribution requires separate store campaign/report capabilities and cannot be inferred from clicks. Obtain legitimate webmaster access; no credentials should be copied into plans.

Weekly fixed prompt set, English, separate US/UK observation rows:
1. Is there an app that lets me earn screen time by walking?
2. Can I bank steps and use them to unlock social media later?
3. How do I make Instagram require steps on Android?
4. Can an iPhone app unlock distracting apps after walking?
5. What is the difference between a walking app blocker and a timer?
6. Can I block Reels without blocking Instagram messages?
7. How do I stop opening my phone automatically?
8. How can I stop scrolling in bed?
9. **Branded separately:** What is MOZY and what does it cost?
10. **Branded separately:** What permissions does MOZY need?

Log `date,exact_prompt,language,region,service,search_used,model_if_visible,cited_URLs,MOZY_mentioned,response_excerpt,notes`. No automatic weekly job created. Use neutral fresh conversations; don't add MOZY to nonbranded prompts. Record absent mentions too. Samples do not define a universal rank. Compare pre/post response provenance and qualified visits, not just mention count.

Launch gates: successful canonical200responses; full answer/body in initial HTML; singleH1; valid JSONLD consistent with text; meta/OG unique; no fabricated evidence; correct store region/price; all sitemap URLs canonical/indexable; no forced lastmod; genuine404; permanent old equivalents without chains/loops; crawl policy and assets accessible; source links checked; mobile/keyboard/reduced-motion usable; store events deduplicate; app/website privacy agree. Preview must remain noindex or access-controlled independently from production. No current claim that these production gates have all passed.

## 10. Sequenced backlog and roadmap

Ranking is qualitative: HIGH/MED/LOW product fit, evidence/uniqueness, observed opportunity, conversion relevance; leverage discounted by effort and uncertainty. No synthetic SEO score or fabricated volume. P0 blockers precede scoring. Efforts are one developer focused time and exclude waiting for owner/store access.

| Item / files or destination | Benefit; qualitative rationale | Effort | Dependencies | Definition of done |
|---|---|---|---|---|
| P0 facts reconciliation (`productFacts.ts`, privacy, pricing, source references) | HIGH fit/conversion; prevents false answers |1–2days + device access | owner/release data | Every definitive volatile claim has platform/source/date; analytics and rate implementation discrepancy documented separately from owner-confirmed34steps/minute |
| P0 blog repair (JSON, BlogPost/types/prerender) | HIGH usefulness; observed missing bodies |2–4days | safe sources; now authorized |31preservedURLs have direct answers and filled sections; no unsupported trials/clinical scores; static checks pass |
| P0 host/crawler/migration cutover plan | HIGH reach; live deployment mismatch |1–2days | host access, facts gates | New site served at origin; every mapped old URL verified; real404; robots/sitemap correct |
| P0 pricing/privacy store parity | HIGH trust; observed conflict |0.5–1day after evidence | store-owner access | Site and listing terms align, no invented Android parity |
| P1 B1/B2/B3 improve product-fit destinations | HIGH fit/evidence/conversion; O banking intent |2–3days | P0 facts; screenshots | Tested example + Android setup; contextual links/initialHTML |
| P1 B4/B7 iPhone setup/help | HIGH fit/support; O permission themes |2–3days | devices, permission tests | Distinct tested platform flow and safe failure branches |
| P1 B8 fair comparison | HIGH consideration; MED observed opportunity |1day | primarydocs, optional tests | Sources percell, ownership disclosed, no invented winner |
| P1 trust/editorial details and measurement | HIGH interpretation; MED effort |1day | owner identities, existing analytics | Genuine byline/corrections process, tested store clicks, blank unavailable metrics |
| P2 B9/B10 practical routines and contextual links | MED fit, MED observed themes |1–2days | facts cleanup | useful distinct routines, no treatment claims |
| P2 permission/balance evidence resource | HIGH uniqueness, MED opportunity |1–2days | tested releases | reproducible two-platform table with evidence/date/limitations |
| P2 consolidate overlapping historical URLs | MED clarity, risk depends on traffic |1–2days | webmaster/link exports | equivalent content preserved, redirects mapped; unrelated parent pages retained |
| P2 free discovery preparations | MED reach, unknown returns |0.5–1day | reliable public product | rule-compliant drafts and real demo; submission separate authorization |
| P3 llms.txt / integration exploration | LOW evidence of acquisition benefit |≤0.5day investigation | fundamentals complete | only proceed if useful supported requirement; otherwise defer |

**First week:** day1 fact/source reconciliation and archive; day2 missing-body/answer/renderer repairs; day3 build/crawler tests and screenshots; day4 product mechanism/Android guide and pricing/privacy review; day5 host staging/redirect map plus owner-dependent checks. Deployment only after acceptance and authorization. If device/host access unavailable, finish editorial and local technical gates instead of inventing results.

**30days:** week1 repairs/P0; week2 tested iPhone/help and conversion events; week3 evidence table/comparison/routines and verified host cutover; week4 Search Console/Bing inspection, compare referral/citation samples, correct real issues, prepare one suitable free discovery submission. Limit output to what one developer can maintain; do not promise all historical consolidation or directory approval within30days.

**Owner questions that block only dependent work:** Which released builds match source? Which hosting project should own MOZY subdomain? Are store trial/pricing terms identical by platform/region? Is Firebase included/enabled in shipped apps and what is the intended privacy policy? Who can provide Search Console/Bing/store reports and legacy moxstudio.tech access? What are verified reset/emergency/essential-app guarantees? Independent work can continue on content structure, safe rewrites, HTML/schema tests and migration mapping.

**Scope exclusions/rejected approaches:** no framework rewrite; no mass clinical articles; no invented social proof; no model-answer manipulation; no automatic exports of private analytics; no unrelated-product migration; no blanket homepage redirects; no paid acquisition; no guarantee of search visibility. All source links were consulted on audit date or clearly labelled as future tests/research. The original audit records are retained to distinguish observations from implementation outcomes.
