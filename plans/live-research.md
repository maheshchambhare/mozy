# MOZY live discovery research — 2026-10-03

Read-only supporting research for the requested audit/plan. Access date throughout: **2026-10-03** (Asia/Kolkata). No submissions, purchases, app installations, account access, or device tests performed. Public listing text establishes what the publisher claims, not independent proof that every behavior works. Search-result samples are not volumes, rankings, representative survey results, or complete indexing evidence.

## 1. Product facts verified from live listings

Sources: [Apple US listing](https://apps.apple.com/us/app/mozy-walk-to-earn-screen-time/id6792097497), [Google Play listing](https://play.google.com/store/apps/details?id=com.moxstudio.mozy). The repository's `src/data/landing.ts:2–3` links the same IDs.

| Fact | Observed value | Source | Confidence / limitation |
|---|---|---|---|
| iPhone listing | “Mozy: Walk to Earn Screen Time”; Mahesh Chambhare; iOS 16.4+; English | Apple US | High, listing observation; no installation |
| iPhone price | Free download; description requires active paid subscription for features. Listed US IAP: monthly $4.99, yearly $29.99 | Apple US | High for observed storefront; trials and actual checkout unverified |
| iPhone mechanism | Publisher describes 34 steps/minute, configurable movement intensity, selected-app locking at exhausted balance; Screen Time and HealthKit | Apple US | Medium for behavior; test ratio/settings and supported step sources |
| iPhone privacy | Publisher declares no account, on-device activity, and no collected data; Apple labels privacy disclosure unverified | Apple US | Publisher claim; network/purchase dependencies untested |
| iPhone scope/accessibility | Listing says Reels/Shorts blocking; accessibility features not declared | Apple US | Feature-only blocking remains unverified; don't equate nondeclaration with inaccessibility |
| iPhone region | US page readable; GB/DE requests failed in research tool | Apple US; failed requests | US listing observed; Europe availability unresolved, failure is not absence |
| Android listing | “Mozy: Walk to Unlock Apps”; mcrudra; generic page localized to Australia (English) | Google Play | High for listing; US parameterized requests failed |
| Android mechanism | Earn throughout day, spend balance, relock on exhaustion; built-in step sensors/no GPS; Accessibility Service detects selected foreground apps | Google Play | Publisher description, not device verification |
| Android scope | Description mentions Reels/Shorts; disclosure describes selected-app detection | Google Play | Whole-app mechanism described; feature-only filtering unverified |
| Android privacy | Publisher declares on-device personal data; no collected/shared data in Data safety | Google Play | Self-reported; no independent audit |
| Android pricing/compatibility | IAP disclosed, premium widgets named; exact price, minimum OS, trial/free limits not exposed in fetched page | Google Play | UNVERIFIED beyond visible IAP |
| Android release | Updated September 2, 2026; release notes mention 2.0.2 and debt/penalty handling | Google Play | Current behavior of penalties unverified |
| Android identity links | Website/privacy links point to moxstudio.tech | Google Play | High, observed mismatch with repository's mozy.mcrudra.com origin |

Store-derived summaries above are deliberately concise. Links should be rechecked before publishing pricing. Do not expand US or AU observations into worldwide availability. Apple compatibility also lists other Apple devices, but the storefront says designed for iPhone/not verified for macOS: no Mac marketing recommendation from this research.

**Unresolved product facts:** balance expiry/reset/banking across days; schedules; debt rules; exceptions/emergency access; essential-app handling; Android OS support and region matrix; Android account requirement; trial duration and renewal/cancellation specifics; iOS watch/import/manual step handling; offline first-launch/purchase validation; actual network analytics; bypass limitations; physical accessibility alternatives. Require app source or documented device tests before definitive copy.

## 2. Strong findings

### [FACT-01] Separate platform facts and pricing before expanding acquisition copy

- **Evidence:** `src/data/landing.ts:7,10–11` generalizes step sensing/account behavior and defers all pricing; live platform disclosures differ (sources above). The Android release describes debt/penalty behavior absent from landing FAQs.
- **Impact:** Visitors cannot determine fit or cost; new pages risk repeating claims that apply to one platform only.
- **Effort:** M (1–2 days including device checks and fact configuration).
- **Risk:** LOW; source text changes only after factual verification.
- **Confidence:** HIGH that information is incomplete; MED for product behavior until tested.
- **Fix sketch:** Capture versioned Android/iOS facts with source, region and verification status. Reuse them for homepage, setup, pricing, privacy and structured data; show unknowns rather than defaulting to parity.

### [FACT-02] Clarify whole-app versus Reels/Shorts blocking

- **Evidence:** `src/data/landing.ts:8` talks about selecting apps; both store descriptions mention short-form features while Android discloses app-level detection.
- **Impact:** People seeking to retain messages or long-form videos may install expecting an unsupported selective filter.
- **Effort:** S–M (2–6 hours testing plus copy).
- **Risk:** LOW; avoids overclaiming but may require store-description edits outside website project.
- **Confidence:** HIGH ambiguity; capability itself UNVERIFIED.
- **Fix sketch:** Test Instagram feed/messages/Reels and YouTube videos/Shorts individually on both platforms. Put the observed scope in setup/help and avoid a new feature-targeting page until supported by evidence.

### [DIRECTION-01] Answer balance, permissions and cost before broad neuroscience topics

- **Evidence:** `src/data/landing.ts:6–11` already establishes earning/spending and platform uncertainty. Observed public questions below ask banking and tracking; existing article slug `walk-to-earn-screen-time` can carry this intent.
- **Impact:** A reproducible example helps a closely matched visitor choose and configure MOZY, and gives search systems a concrete answer.
- **Effort:** M–L (2–4 days for tested examples plus focused page updates).
- **Risk:** LOW if unknown behaviors remain gated.
- **Confidence:** HIGH grounding; opportunity size unknown.
- **Fix sketch:** Upgrade the existing walk-to-earn guide and add distinct Android/iPhone setup guidance only where steps differ. Include a tested balance ledger and visible platform caveats, not generic medical claims.

### [DISCOVERY-01] Reconcile publisher and destination links across storefronts

- **Evidence:** `src/data/landing.ts:25` names mozy.mcrudra.com while Play website/privacy use moxstudio.tech; Apple's links use mozy.mcrudra.com.
- **Impact:** Users and external catalogues encounter inconsistent official destinations.
- **Effort:** S after ownership/access confirmation.
- **Risk:** MED; old-host links may be intentionally maintained and need relevant redirects.
- **Confidence:** HIGH mismatch; correct migration path awaits owner/host audit.
- **Fix sketch:** Verify moxstudio.tech ownership and linked paths, then plan coordinated store link updates and redirects. Do not infer that unrelated legacy content belongs to MOZY.

## 3. Observed language, not invented search demand

These are public discussion observations, **not actual search-query logs**. Several threads are founder promotions; their phrasing shows category vocabulary but does not establish independent demand. User replies are useful questions, not representative market validation.

| Observed language / issue | Provenance | What can be learned |
|---|---|---|
| “Does it unlock the app immediately once you hit the steps, or can you ‘bank’ steps and use them as screen time later?” | [Walkgate discussion, July 2026](https://www.reddit.com/r/iosapps/comments/1usowui/i_sit_at_desk_a_lot_so_i_built_an_app_that_block/) — commenter within founder thread | Explain immediate milestone unlock versus spendable balance; document rollover |
| “How does it track how many steps? Does it require connecting to Apple Health to pull the step data?” | Same Walkgate thread, commenter | Separate tracking source and permission instructions by platform |
| “For example if 1000 steps unlocks 10 minutes of Reddit, do I get 30 minutes after a 3000 step walk?” | [StepBloc AppHookup discussion](https://www.reddit.com/r/AppHookup/comments/1dig3py/ios_stepbloc_walk_to_unblock_lifetime_access_iap/) | Worked earning examples are more useful than slogans; these numbers are not MOZY facts |
| Requests for additional exercise options; report of one selected app failing to unlock | Same StepBloc discussion | Include suitability/alternative movement limitations and troubleshooting; don't promise alternatives |
| “How do you actually stop wasting time on TikTok/Reels/Shorts?” | [r/nosurf discussion](https://www.reddit.com/r/nosurf/comments/1mw434k/how_do_you_actually_stop_wasting_time_on/) | People distinguish short-form feeds from other useful functions. Replies include repeated promotional-looking copy: do not use these as evidence of product effectiveness |
| A user describes deleting an exhausted timer to add another 10–20 minutes | [Google Android Community question](https://support.google.com/android/thread/457538309/an-useful-feature-for-digital-wellbeing?hl=en) | Users want flexibility as well as restriction. Avoid portraying every override as failure |

No MOZY Search Console data was available in this research. No ChatGPT query-frequency or rank claim is made.

## 4. Consolidated intent candidates

All exact questions below are **hypothesized user questions**, synthesized from observed language (O) or product-fit reasoning (H). They are not recorded search queries. Parent plan should consolidate these with the full content audit. Proposed paths are recommendations, not implemented routes.

| Exact question | Keyword family; evidence | Audience / intent | Existing destination | Action / primary proposed destination | Unique material / dependencies | Priority |
|---|---|---|---|---|---|---|
| Can I earn screen time by walking, and bank it for later? | walk to earn, step blocker; O banking/ratio questions | Both, mechanism/consideration | `/blog/walk-to-earn-screen-time` | Update existing canonical | Versioned step→minute→spent ledger; rollover/reset tests | P1 |
| How do I make Instagram require steps on Android? | Android step app blocker; H + verified platform difference | Android, setup | Android guide corpus; none verified as exact setup page | `/help/android-setup` new if corpus lacks equivalent | Actual permission screens, battery behavior, compatibility, bypass/essential apps | P1 |
| Can my iPhone unlock distracting apps after walking? | iPhone walking blocker; O Health question | iPhone, setup | None obvious in slug inventory | `/help/iphone-setup` | Screen Time/Health permissions, ratios, device/version test | P1 |
| Is MOZY free, and what does it cost? | MOZY pricing; H + store evidence | Branded, purchase | Homepage FAQ | `/pricing` with concise homepage answer | Current regional billing, free limits, trial/cancellation verification | P1 |
| What permissions does MOZY need, and does it work offline? | private app blocker, no account; O tracking question + H offline | Both, trust | `/privacy` | Update privacy with linked permission guidance | App behavior/source review, account/network distinction, purchase validation | P1 |
| How is walking different from Screen Time or Digital Wellbeing limits? | walking versus timers; H, observed timer friction | Both, comparison | `/blog/digital-wellbeing-vs-mozy` | Update existing page; broaden only if useful | Date/version-controlled tests and ownership disclosure; free built-in alternatives | P1 |
| Can MOZY block Reels or Shorts without blocking the whole app? | Reels-only/Shorts-only; O topic + store ambiguity | Both, capability | Homepage generic apps FAQ | Help/setup section first; defer standalone | Test feature selection separately from app selection | P0 facts/P1 copy |
| Why are my steps not counting or my apps still blocked? | MOZY troubleshooting; O category failure example | Branded, support | None obvious | `/help` troubleshooting hub then anchors | Sensor/permission/restart/debt/balance test cases; actual support reports | P1 |
| How can I stop opening my phone automatically? | habitual checking; H | Both, problem-solving | `/blog/how-to-stop-checking-phone` | Update existing | Concrete routine with app-free options; no unsupported neuroscience | P2 |
| How can I stop scrolling in bed or first thing in the morning? | nighttime/morning scrolling; H | Both, routine | `/blog/how-to-stop-doomscrolling`; bedtime article | Consolidate via content audit; use one canonical per distinct intent | Native schedules plus safe alternatives; do not prescribe night walking | P2 |
| Can I bypass MOZY or access essential apps in an emergency? | app blocker emergency; H + mechanism comparisons | Both, suitability/support | None exact | Setup/help section, not a thin new page | Controlled bypass/exception tests, accessibility limitations | P1 |

Branded intents (pricing, permissions, setup troubleshooting) should be measured separately from non-branded earning/walking discovery. Do not create one page per question wording. Aim for roughly 8–12 destinations across the final entire plan, counting updated existing pages and core trust pages.

## 5. Competitor mechanisms verified from official sources

| Comparator | What official source supports as of access | Use in proposed comparison | Limits |
|---|---|---|---|
| Apple Screen Time | Scheduled Downtime and per-app daily limits; limits can be ignored by default, with stronger blocking options documented | Explain scheduled/time-budget friction accurately | Don't claim all settings/child setups are trivially bypassable. [Apple guide](https://support.apple.com/guide/iphone/set-schedules-with-screen-time-iphb0c7313c9/ios) |
| Android Digital Wellbeing | App timers close/dim apps at limit, reset at midnight, can be deleted to resume; device/account differences exist | Explain time-budget option and built-in alternative | OS/device behavior varies. [Google guide](https://support.google.com/android/answer/9346420?hl=en-en) |
| one sec | Breathing intervention; free for one app; paid Pro broadens features, iOS/Android feature parity differs | Compare moment-of-opening pause with earned balance | No price quoted; do not reuse efficacy claims without original studies. [Official Pro matrix](https://tutorials.one-sec.app/en/articles/3036418), [platforms](https://one-sec.app/platforms/) |
| Brick | Physical device rescan to leave blocking; five emergency releases; Android12+/iOS17+; page displays $59 hardware | Compare object-based physical separation with walking | Currency/checkout/region not confirmed; price illustrative observed display only. [Official Brick](https://getbrick.com/) |

MOZY should disclose it publishes the comparison, link competing official documentation, and distinguish source-described behavior from hands-on results. This research did not install or test any comparator. No “best” winner is supported.

## 6. Three zero-budget discovery candidates

1. **Product Hunt — viable after facts/pricing cleanup.** Officially free to launch; use founder's personal account (company accounts cannot post), finish onboarding, submit real product URL plus store links, correct pricing label, product name and a useful gallery. Founder can self-submit. Prepare an honest walkthrough and answer feedback; do not buy promotion. [Posting rules](https://help.producthunt.com/en/articles/479557-how-to-post-a-product), [free-launch confirmation](https://help.producthunt.com/en/articles/7950405-ad-campaigns). Suitability: consumer mobile product is usable and listed; independent readers can evaluate. No launch or endorsement guaranteed.

2. **Show HN — conditional technical founder demonstration.** Submit only when people can try the actual product, explain personal work/technical choices and be available to discuss. Title starts Show HN. A landing page, blog article, fundraiser or signup-only promise is not a suitable Show HN. Don't ask friends for votes/comments. [Official guidelines](https://news.ycombinator.com/showhn.html). Suitability: platform permission/balance design makes a substantive engineering demo possible. Optional new release alone may not meet novelty bar. No paid placement needed; community review not guaranteed.

3. **AlternativeTo — suitable directory candidate, slow free queue.** Verified email, real released English-language software, platform/licence fields, clean official/store URLs; no UTM in official link and no links in description. Submit app, not advertising profile. Correctly label paid versus genuinely functional free tier; US-wide or Europe-wide eligibility must be verified. Free queue can take months; skip optional paid priority. Moderators can decline similar/low-effort products. [FAQ and submission rules](https://alternativeto.net/faq/). Suitability: app-blocker alternative with distinct mechanism, pending region confirmation. Do not schedule approval as a 30-day deliverable.

No Reddit posting recommendation: public discussions were used as research, and current full subreddit rules/account eligibility were not verified. Don't turn research threads into unsolicited promotion. None of these channels automatically yields reviews, backlinks, search placement, or ChatGPT recommendations. Measure resulting referrals and clicks separately from installs.

## 7. Small original evidence resource proposal

Grounding: `src/data/landing.ts:7–10` already raises ratio/platform/permission questions; observed users ask banking and step source. Build a **two-platform MOZY permission and balance behavior guide**, not a giant app database. Present ordinary HTML tables beside reproducible screenshots. Fields: app version; OS/device; region; permission purpose; step source; tested starting balance; earned steps; conversion setting; expected versus observed minutes; selected app; depleted-balance response; midnight/reset behavior; offline result; essential-app exception; bypass limitation; test date; tester; evidence link. Unknowns explicitly untested. No sensitive device data in screenshots.

Run proposed tests on one supported iPhone and one Android device, then expand only where OEM behavior warrants. Repeat after balance/permission/billing changes; quarterly source-link checks. Public guide can consolidate repeated FAQ questions, support tickets and setup content. No clinical outcomes or testimonial claims are needed. Optional CSV only if users request reusable tabular data.
