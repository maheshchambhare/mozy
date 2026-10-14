# Mozy Race: step competitions (research and plan)

Date: 14 October 2026 · Owner: Mahesh Chambhare (MCRUDRA) · Status: **research and planning only; no app or website code was changed.**

- This file is part of the `step-challenges/` folder, which exists identically in both projects: the app repo (`/Users/mahesh/Desktop/Projects/react-native/stepscroll`) and the website repo (`/Users/mahesh/Desktop/Projects/mcrudra.com/MOZY`). Start at `README.md`. The build-oriented files are `FEATURES.md` (what to build, by project), `CONTRACT.md` (the interface), `APP.md`, `WEB.md`, `BACKEND.md` and `DECISIONS.md`. The visual version is `report.html`.
- App code snapshot: branch `step-challenges` = `mozyv3` at `42a5291`. Website snapshot: `mcrudra.com/MOZY` branch `step-challenges` = `main` at `ef5809a`. File references are `path:line` at those commits and may drift.
- Builds on `growth-research/MOZY_GROWTH_RESEARCH.md` and `growth-research/IMPLEMENTATION_PLAN.md` (12 Oct 2026) and `v3/06-STEP-CIRCLES-AND-CLOUDFLARE.md` (22 Sep 2026). Where they disagree, this file is newer; section 1 lists every difference.
- The owner's request (14 Oct 2026): a competition feature to grow Mozy organically. Device-based accounts with only a name; daily steps collected; global, country, friends and family leaderboards (daily, weekly, monthly); share cards; awards on the landing page; rankings in the app; Cloudflare free services; cost-effective and fast.

---

## 0. How to use this file (for AI coding tools)

| Label | Meaning |
|---|---|
| FACT | Verified in code, official documentation or published research on 14 Oct 2026 |
| INFERRED | Reasoned from code or docs but not run on a device. Verify before relying on it |
| UNVERIFIED | A source was found but could not be confirmed. Re-check before relying on it |
| PROPOSAL | A recommendation. Needs the owner's approval before implementation |
| DECISION | Approved by the owner. **None yet**: every product change here is a PROPOSAL |

ID scheme: C = hard constraints, F = code findings, R = research principles, X = ideas, A = architecture items, D = owner decisions, K = metrics.

### Hard constraints (never violate)

- **C1 · Owner's data rule (was P1).** Only a race name and one step total per race day leave the phone, plus the minimum account fields in section 6, and only after an explicit opt-in. Never upload hourly or per-walk steps, minutes earned or spent, app usage, blocked-app lists, Screen Time data, GPS, contacts. Never store IP addresses.
- **C2 · Screen Time data never leaves the device** (Apple DPLA 3.3.3(P); was P2).
- **C3 · No contact upload.** Invites travel only through the user's own share sheet, link or QR code (was P3).
- **C4 · Reward real outcomes only, and only with cosmetics.** Never reward share taps, link clicks, installs, ratings or reviews (was P4). Never pay race rewards in screen minutes or money.
- **C5 · Recorded numbers only.** Boards and cards show stored values. Never seed fake users or invent numbers (was P5).
- **C6 · The race is free on both platforms**, including cards and invites (was P6). Blocked on iPhone today by F-P1, see D6.
- **C7 · Public visibility is the user's explicit choice (replaces P7).** "Only my crews" must always be possible. No feed, chat, comments, bios, photos or interaction with strangers; strangers can only see name, pet look, flag and steps on boards. Phase 2 reactions are fixed stickers inside crews only.
- **C8 · Store and legal must-dos (section 3.4) ship with the feature**: UGC filter, report, block and contact info; in-app and web deletion; prominent disclosure and consent; updated App Store privacy label and Play Data safety form; age-rating answers; minors handling.
- **C9 · Privacy copy is rewritten in the same release** (was P8): the website's "No account, ever" (`PrivacyPage.tsx:25-26,35,82`), the Trust screen, both store forms.
- **C10 · No device identifiers on the server.** Never use or store `ANDROID_ID`, IDFV or similar as an account key or next to names or steps. The account is a random token kept in Keychain / Block Store (section 7.2).
- **C11 · No marketing use of a person's steps** without their separate permission (Apple 5.1.3(i)). Aggregates are fine.
- **C12 · The wallet and the blocker never depend on the race backend.** If the API is down, Mozy behaves exactly as today.
- **C13 · No prizes of monetary value.**

---

## 1. What changes from the earlier plans

| Earlier position | Source | Now |
|---|---|---|
| P7: "Friends only. No public feed, likes, comments or global leaderboards" | Growth study §0 and §10 | **Superseded by the owner's request of 14 Oct 2026** for global and country boards. Replaced by C7 |
| A-3: end-to-end encrypted league relay | Growth study §5 | Not possible for public boards (the server must read totals to rank them). Replaced by a minimal plain backend (section 7) |
| S3: step duels with no server, data in the `#fragment` | Implementation plan §3 | Server-backed step-offs with a short code in the path (`/d/{code}`). Link previews can then name the challenger; crawlers never see a `#fragment` |
| "No public global rankings", private circles of 2–8 | `v3/06` | Superseded (C7). Crew size 2–50 |
| Installation identity with limited recovery | `v3/06` | Token in iCloud Keychain / Block Store plus a recovery code (section 7.2) |
| P1: only a name and step totals leave the phone | Owner, 12 Oct | **Kept as C1.** New fields: random id, pet look, visibility, UTC offset, optional country code (D2) |
| "No account, ever"; "steps and name never leave the phone" | Website `/privacy` (`PrivacyPage.tsx:25-26,35,82`) | Must be rewritten (C9, D14). App Store label "Data Not Collected" and Play "No data collected" change too |

---

## 2. Findings from the code (FACT)

| ID | Finding | Evidence | Consequence |
|---|---|---|---|
| F-C1 | No backend, account, device id, network code or secure storage exists | No fetch/axios/XHR/WebSocket in `src`; no URLSession/OkHttp in native code; no keychain or secure-store library | All server work is new; add one secure-storage module |
| F-C2 | iOS counts steps with CMPedometer only (no HealthKit entitlement) and can rebuild the last 7 days in reset-hour windows | `ios/mozy/StepCounterModule.swift:47-136`; `ios/mozy/WidgetSync.swift:396-450`; `Info.plist:74` | A 4 AM race day is a small native addition |
| F-C3 | Android counts walked steps after a ride filter (Play Services activity transitions for IN_VEHICLE/ON_BICYCLE + walking rhythm) | `RideRecognition.kt:42-78`; `StepFilter.kt:3-25`; `StepTrackingService.kt:542-587` | Android race steps already exclude bus and bike rides; iOS has no ride filter |
| F-C4 | Daily snapshot `history_YYYY-MM-DD` = `walked,earned,consumed,stepPenalty,freedomPass`; JS history trimmed to 45 days | `StepTrackingService.kt:589-597`; `MozyRules.swift:240-270`; `useUserStore.ts:490,827` | Only `walked` is ever uploaded |
| F-C5 | "Today" starts at a user-adjustable reset hour: default 4 AM, Settings offers 12–9 AM; native mirrors exist | `creditEngine.ts:58-70,93-96`; `useUserStore.ts:89-96,1479-1484`; `SettingsScreen.tsx:2922-2953`; `MozyDay.kt:16-56`; `WidgetSync.swift:219-256` | The race needs one fixed day (D3) |
| F-C6 | Onboarding name stored as MMKV `user_name`, trimmed, max 20 characters, capitalised; no content rules; Settings allows 18 | `Step4Name.tsx:24,71-77,136-142`; `SettingsScreen.tsx:2493` | Pre-fill the race name; add the filter |
| F-C7 | No notification library; no push (no `aps-environment`, no FCM); local notifications only from native code | `package.json:18-37`; `ShortsDetectionModule.swift:708-715`; `StepTrackingService.kt:145-173` | Phase 1 local; phase 2 FCM |
| F-C8 | Only `mozy://` links (routes `plead`, `freedom-pass`, ignored until setup is done); no Associated Domains, no App Links `autoVerify` | `src/navigation/linking.ts:16-25`; `mozy.entitlements`; `AndroidManifest.xml:84-89` | Universal Links / App Links are phase 0 work |
| F-C9 | No share or QR libraries; S1–S3 of the implementation plan are not built | `IMPLEMENTATION_PLAN.md:304-411` | Build one card renderer for race cards and S1/S2 |
| F-C10 | One native stack, no tabs (`bottom-tabs` installed but unused); routes now include `Guide` (bug 98); Home header has Freedom Pass, Stats, Settings | `RootNavigator.tsx:11,32,45-162`; `types/index.ts:290-312`; `CommandCenter.tsx:603-628`; `HomeScreen.tsx:229-245` | Race = one new stack screen + a fourth header button |
| **F-P1** | **iPhone: a non-subscriber cannot get past the onboarding paywall** (close button hidden, dismiss returns early, Back blocked) | `PaywallScreen.tsx:538-541,805-809,1115-1127`; `setupStage.ts:17-20` | **Every iPhone invite ends at a payment screen until D6 is decided** |
| F-C11 | Analytics: Firebase wrapper sends only from Android release builds; nothing on iOS; PostHog not in the app | `src/utils/analytics.ts:8-21` | Measure iOS through server counts |
| F-C12 | MMKV store `mozy-storage` is unencrypted | `src/services/storage.ts:6-12` | Never keep the race token there |
| F-W1 | Website: Vite 8 + React 19 + wouter, prerendered pages; Worker `mozy` serves static assets only (no `main` script); unknown paths get the 404 page | `package.json:8,18-34`; `wrangler.toml:3-16`; `scripts/prerender.mjs:23-58` | `/j/*` and `/d/*` need a small Worker script with `run_worker_first` |
| F-W2 | README says mozy.mcrudra.com is still served by the mcrudra-web Worker (its middleware rewrites the host to `/apps/mozy`); README's "Going live on mozy.mcrudra.com" lists the switch | `README.md` | The domain switch (WEB.md W0) is a prerequisite for invite links |
| F-W3 | Website look: night `#0b0e1a`, moon `#f6f3ea`, ink `#1e251c`, green `#28763e`, sprout `#63d586`, orange `#ff9a4d`; Fredoka, Nunito | `src/story.css:7-29`; `index.html:33-36` | Web boards follow the site's look |
| F-W4 | Website PostHog captures full URLs and has no hash handling | site `src/lib/analytics.ts` | Never put names or totals in URLs |
| F-T1 | App theme: `D` = `#FAF9F7` / `#121212` / `#FF8A00` / `#6B7280`; setup `S` adds `#FAF7F2`, `#1C1917`, `#B85F00`, `#10B981`; Plus Jakarta Sans 400–800; world accents desert `#F59E0B`, city `#818CF8`, park `#34D399`; mascot drawn with Views (no Rive in the app) | `OnboardingShared.tsx:41-50`; `setup/SetupParts.tsx:33-60`; `src/theme/fonts.ts:1-7`; `CommandCenter.tsx:43-113`; `components/companions/*` | Mockups use these |

Cloudflare account (read on 14 Oct 2026 through the connector, FACT): Workers `mozy` (created 11 Oct), `mcrudra`, `veil-landingpage`; no D1 databases, KV namespaces or Hyperdrive configs; R2 not enabled.

---

## 3. Research

### 3.1 Behavioural science (R1–R15)

| ID | Principle | Evidence (FACT unless marked) | Design consequence |
|---|---|---|---|
| R1 | Small groups beat big pools | N-effect: told 10 rivals, quiz time 28.95 s vs 33.15 s for 100; motivation 4.07 vs 2.00 (of 7) for 10 vs 10,000 rivals (Garcia & Tor 2009). Local dominance: rank in a small local group outweighs standing in a big pool (Zell & Alicke 2010) | Crews, family and leagues are home; world is the backdrop |
| R2 | Competition is the strongest proven lever for steps | STEP UP (n=602, 24 weeks): competition groups of 3 with a weekly leaderboard +920 steps/day (95% CI 513–1,328), +569 twelve weeks after; support +689/+428; collaboration +637/+126 n.s. (Patel 2019). Comparison groups went to ~90% more classes than non-comparison; support-only did worst, 16.8 vs 20.3 control (Zhang 2016) | Weekly ranked groups are the engine |
| R3 | Keep rivals reachable | Reachable stars inspire, unreachable deflate (Lockwood & Kunda 1997). Big-fish-little-pond in 26 countries, N=103,558, β=−.20 (Marsh & Hau 2003) | Leagues matched by 2–4-week average and time zone |
| R4 | Show the gap | Goal gradient: ~20% faster purchases near a free coffee; 12-stamp card with 2 pre-filled done in 12.7 vs 15.6 days (Kivetz, Urminsky & Zheng 2006) | ±3 ranks and "418 steps to pass riya" |
| R5 | Put a line near most people | Competitiveness 6.05 at #100/#101 (a bonus cut-off) vs 4.29 at #50/#51; also rises near the bottom (Garcia, Tor & Gonzalez 2006). Effort U-shaped after first or last place (Gill et al. 2019) | Promotion/drop zones, top 3 per group, daily crowns |
| R6 | Fresh starts | Gym visits +33.4% at the start of a week, +14.4% month, +47.1% semester (11,912 students; Dai, Milkman & Riis 2014) | Monday resets, monthly awards, festival and New Year weeks |
| R7 | Teams and families | BE FIT (200 adults, 94 families): goals met on 53% vs 32% of days, +953 steps/day, +494 after (Patel 2017). Gamification meta-analysis: competition + collaboration best for behaviour (Sailer & Homner 2020). Team-vs-team had the highest attendance, 38.5 vs 20.3 (Zhang 2016) | Family crews with a shared goal; crew-vs-crew weeks |
| R8 | Make each person essential (Köhler effect) | Cycling 21.9 min when the workout ended as the first partner stopped vs 10.6 alone (Irwin 2012); slightly stronger virtual partners lengthen planks (Feltz, Kerr & Irwin 2011) | Buddy quests (X32) |
| R9 | Loss framing, sparingly | Loss-framed reward: goal met 45% of days vs 30% control; gain 35%, lottery 36% n.s. (Patel 2016). Being passed sparks competition (Garcia & Tor 2007); pressure weakens intrinsic motivation (Reeve & Deci 1996) | ≤1 "you were passed" alert/day, always with the gap |
| R10 | Streaks need repair | 93% continue after an intact streak, 69% after a broken one, 85% if repairable (Silverman & Barasch 2022). Megastudy of 54 interventions, 61,293 gym members: best = reward for returning after a miss (Milkman 2021). Duolingo Streak Wager +14% 7-day retention (2017) | Streak freezes earned by walking; "welcome back" crown (X31) |
| R11 | Score healthy behaviour, cap the rest | Duolingo re-weighted league points toward effective lessons (+~1.8M minutes/day, 2024). Tracking raises quantity but lowers enjoyment (Etkin 2016) | Leagues count steps up to a daily cap (D16) |
| R12 | Percentile on big boards | Pool standing barely matters when local rank is known (Zell & Alicke 2010) | "top 12% in india this week"; exact ranks inside leagues and crews |
| R13 | Protect the bottom | Last-place aversion (Kuziemko 2014); losing lowers perceived competence (Reeve & Deci 1996); fitness is where users rate leaderboards most favourably (Jia et al., CHI 2017). UNVERIFIED: Hanus & Fox 2015 (motivation fell with leaderboards) | Most improved, hide-my-rank option, never a "last" label |
| R14 | Rivals | Runners ran faster when a rival was in the race (Kilduff 2014; effect size ≈5 s/km UNVERIFIED) | Rival of the week (X21) |
| R15 | Effects fade | Gamification effect on activity g=0.42 → 0.15 at follow-up (Mazeas 2022); +489 steps/day average called "trivial" (Nishi 2024); 8% of 54 interventions persisted (Milkman 2021) | Seasons, re-matching, events; no health-outcome claims |

**Gen Z (FACT, Strava Year in Sport 2025, 30,000+ people, 2 Dec 2025):** Gen Z 75% more likely to name a race or event as main motivation; 39% more Gen Z than Gen X use fitness to meet people; new clubs ~4× in 2025 (running clubs 3.5×); headline "Doomscrolling Is Out, Movement Is In". 55% of Gen Z say social connection is their top reason to join a fitness group (Strava, Aug 2025). Twice as many Gen Z as Gen X find starting a new sport intimidating → rookie week (X33). India-specific Gen Z data: UNVERIFIED (not found).

**Duolingo leagues (reference):** first tested 2018, modelled on FarmVille 2; 10 tiers; weekly; matched on similar habits and time zone; private profiles opt out; top 10 of Diamond go to a tournament (Duolingo blog, 3 May 2023). S-1 (28 Jun 2021): leaderboards raised learning time "almost 20%"; former CPO: +17% and 3× highly engaged learners (Lenny's Newsletter, 28 Feb 2023). League size ~30 and promotion counts: UNVERIFIED (third-party guides).

**Avoid:** one giant global board as the default; cheer feeds with no comparison; "last place" labels; overtaken alerts without the gap; uncapped raw-step scoring in leagues; unrepairable streaks; real names public by default; paying winners in screen time.

### 3.2 How the big products run step competitions

| Product | Who competes | Scoring | Reset | Standout (FACT unless marked) |
|---|---|---|---|---|
| Apple Fitness | 1v1 with a sharing friend | 1 point per 1% of own rings, cap 600/day | 7 days from next midnight | Fair across fitness levels; ahead/behind alerts; tie = both win; per-friend hide/mute |
| Fitbit → Google Health | Invited friends | Raw steps; "Goal Day": everyone who hits their own goal wins | 24 h (creator's TZ), workweek, weekend | Challenges, Adventures and Open Groups removed 27 Mar 2023 ("limited number of active users"), backlash; Google Health (May 2026) keeps only a weekly friends board |
| Samsung Health | 1v1 or 2 teams up to 10; monthly global challenge | Raw steps | Custom; monthly | Global top 10 + top-10%/30% lines; visibility Anyone/Friends/No one; Together off for under-18s outside Korea (Sep 2026); "challenge users walk 22%+ more" (vendor claim) |
| Garmin | Connections | Raw steps | Day, weekend, week | Push on lead changes; badges; Connect+ exclusives |
| Strava | Segments, clubs, group challenges (≤25) | Time, distance | Clubs weekly (Sun 23:59 club TZ) | Local Legend = most efforts in 90 days; "Lost KOM" emails; 4.45M activities removed May 2025, 2.3M e-bike + 1.6M vehicle Jan 2026 |
| Peloton | Class, "Here Now", tags | Output | Per class; monthly challenges | Following/tag filters make huge boards feel intimate; high fives |
| Duolingo | Auto-matched cohorts (~30, secondary) | Weekly XP | Weekly, local TZ | 10 leagues; matched by prior-week engagement and TZ; +17% learning time |
| StepUp | Friends; groups up to 15,000 | Raw steps, no manual entry | Daily/weekly at local midnight; monthly | Country top 100; Mystery Mode; bots give everyone a beatable rival; private by default; free with ads; 4.8★ from 144K ratings |
| Pacer | Individual, team, team-average | Steps or goal days, optional cap | Local midnight, 1–4 weeks | Free challenges; join by link, code, QR |
| WeWard | Leagues; weekly friends board | Steps → Wards (~25/day cap, third-party) | Daily | Walking Mode (iOS, Jul 2026) locks apps until a step goal |
| Sweatcoin | Friend streak contests | Verified steps (~65% of recorded convert) | Daily | GPS and motion verification |
| Pikmin Bloom | Co-op groups ≤5 | Shared target | Monday | No friends leaderboard; players say shakers rule out competition (user reports) |
| Corporate (MoveSpring, YuMuuv, Personify, Stridekick) | Teams ranked by average | Caps 20,000–50,000/day | Local days, 24–72 h grace | "If only first place wins, most quit by week two" (YuMuuv) |

**Direct rivals (FACT from App Store listings; years partly inferred):** Stroll (steps to screen time) added global and country boards for day/week/month on 21 Sep 2026; Lockt added monthly leagues with Amazon vouchers on 28 Jun 2026; WalkLock and Steppin have friend challenges; WeWard's Walking Mode copies the app lock. None of Opal, one sec, Unrot, Pushscroll, touch grass, ScreenZen, Brick or Jomo ranks steps (Jomo Squads rank least screen time; Opal shows contacts' screen time). **Mozy's edge must be families, the pet, fairness and privacy**, not the existence of a leaderboard.

**Takeaways:** weekly is the main clock; score families against their own goals (D17, X35); leagues and percentiles over one giant board; a beatable rival for everyone (StepUp uses bots; Mozy uses the pet, labelled as your Mozy, never a fake person, X22); few, timely notifications; local day close plus a grace period; status, not cash (WeRun's daily #1 led people to buy pendulums; prize challenges saw 200,000-step days); ship only what can be maintained (Fitbit); links/QR/codes suit device-based accounts; private by default, global opt-in, minors gated; friend streaks (Duolingo Friend Streak +22%, X36); competing stays free (StepUp, Pacer).

### 3.3 Sharing and invites

| Finding | Evidence (FACT unless marked) | Consequence |
|---|---|---|
| Percentile beats raw stats | Duolingo added XP percentile to its year-in-review card and share rates rose; top 10% made over half of shares; "Top 6%!" / "Top 1%!" most shared (Duolingo blog 2021, 2022) | Percentile cards, top half only |
| India shares more | Duolingo: India and Brazil had below-average open rates but the highest share rates | WhatsApp-first design |
| Everyone needs a card | Spotify Wrapped 2025: 200M+ engaged users in 24 h, 500M+ shares (TechCrunch, 4 Dec 2025); Duolingo "learner styles" card lifted shares among non-top users | Identity labels computed on the phone |
| Spoiler-free text spreads | Wordle: 90 players (1 Nov 2021) → 300K+ (2 Jan 2022) → 2M+ a week later, after the emoji grid | Week-grid text (X7) |
| Novelty fades | BeReal 21.6M → 73.5M users (Jul–Aug 2022), then DAU ~15M → ~6M; Gas #1 then shut Nov 2023 | Novelty mechanics are tests (X29) |
| Never paywall the recap | Strava made Year in Sport subscriber-only (Dec 2025) and got a backlash (road.cc) | C6 |
| Instagram Stories | Facebook App ID required since Jan 2023; background ≥720×1280, 9:16; links in shared stories can't be tapped (Meta docs) | QR + short link on every card |
| WhatsApp previews | `og:title`, `og:description`, `og:url` non-empty; `<head>` in the first 300 KB; image <600 KB, ≥300 px wide; crawler sends `Accept-Language` (Meta docs) | One 1200×630 JPEG under 300 KB per page type |
| iMessage previews | No JavaScript; server redirects fine; images ≥900 px wide (Apple TN3156) | Server-rendered meta via Worker |
| Deep links | Firebase Dynamic Links shut down 25 Aug 2025; paid attribution SDKs cost money and end iOS "Data Not Collected"; Play Install Referrer is free and exact; iOS: paste button (UIPasteControl) avoids the paste alert; Apple bans fingerprinting | Own links + referrer + paste code; no SDK |
| Snapchat, TikTok | Snap needs review for links and lists "direct app downloads" as abuse; TikTok Share Kit shares media only | Skip in v1 |
| Realistic virality | K>1 "unrealistic", ~0.5 good (Andrew Chen); Extole health & wellness medians (Mar 2026): 28% share, 14.7% sign up, 3.4% convert; Duolingo: friends → 5.6× course completion, Friend Streak +22% daily lessons | Plan K = 0.1–0.3 (K5) |
| India comparables | StepSetGo claims 10M+ users (App Store listing); WhatsApp 500M+ users in India is widely reported (UNVERIFIED primary source) | |
| Slang | "Aura" was Sprout Social's 2025 word (31.97B impressions); YPulse: slang reads as cringe when it doesn't fit the brand; "touch grass" is a rival app's name | Light slang, re-check at launch; don't use "touch grass" as a name |

### 3.4 Store and legal requirements (FACT from official pages unless marked; not legal advice)

| Requirement | Source | Plan |
|---|---|---|
| Race names, crew names and reactions are UGC: filter before posting, in-app report, block abusive users, published contact info, timely responses; Apple may ask for a compliance plan | Apple 1.2 (guidelines updated 8 Jun 2026); Play UGC policy (also terms accepted before posting and a definition of objectionable content) | §7.11; race rules shown at joining; contact on the site and in the app |
| Automatically generated ("guest") accounts must be deletable in the app, including content others could see; deactivation is "insufficient". Play also needs a web deletion link in Play Console | Apple 5.1.1(v) and "Offering account deletion"; Play account deletion policy | `DELETE /v1/profile` + web form |
| Consent before upload; steps were collected to earn minutes, so sharing them is a new purpose (5.1.2(ii)); easy withdrawal; core app works without joining; Play: prominent in-app disclosure + affirmative tap, not only in the privacy policy | Apple 5.1.1(ii), 5.1.2(i–ii); Play User Data | Join flow §5.1; update `NSMotionUsageDescription` |
| Motion & Fitness data: no advertising, marketing or data mining; disclose the specific data; never store it in iCloud | Apple 5.1.3(i–ii) | C11; steps stay on Cloudflare; Keychain holds only a token |
| Privacy label: Fitness; User ID (screen name); Name if real names are invited; Other User Content; Coarse Location if a country is stored (self-chosen country: declare to be safe); Device ID only if IDFV/App Attest key ids are stored. All linked to the user, App Functionality | Apple App Privacy details | Update in the same release |
| Play Data safety: Name (incl. nickname), User IDs, Device or other IDs (if any), Approximate location (if IP-derived), Fitness info, Other UGC, Other actions (reactions), deletion URL; re-check the Health apps declaration; resubmit the content-rating questionnaire | Play Data safety; Health apps declaration; content ratings | Update in the same release |
| Age rating: "Contests" (rankings, fitness contests) frequent → 13+; "Social media" (interacting with UGC through a feed or similar discovery) → 13+, 16+ in Australia, with a Social Media label. Questionnaire answers mandatory since 31 Jan 2026; social-media answers from Sept 2026 | Apple age ratings; Apple news 9 Jul 2026 | Accept 13+; avoid the social-media answer (D13). Whether a names-and-ranks board counts: UNVERIFIED |
| US state laws: Texas SB 2420 (from 4 Jun 2026), Utah (6 May 2026), Louisiana (1 Jul 2026) cover new Apple Accounts; a change to data categories or rating is a "significant change" needing a minor's parent's approval; use Declared Age Range (iOS 26+) and PermissionKit; handle RESCIND_CONSENT; age data only for compliance | Apple news; Texas SB 2420 §121.053–.055 | Race behind a flag for minors there until approved |
| Play Age Signals API (beta): Texas accounts created after 28 May 2026; Brazil since 17 Mar 2026; target audience 13+; Families policy if children are included | Play Age Signals; Families policy | Use for age-appropriate defaults |
| GDPR: step totals tracked over time likely health data (Art. 9) → explicit, withdrawable consent; privacy by default (Art. 25(2)) → public must be the user's own choice; breach notice 72 h (Art. 33); possibly an EU representative (Art. 27, INFERRED) | GDPR; WP29 2015 annex; EDPB 03/2020; ICO | Explicit consent screen; nothing public by default; 40-day retention |
| India DPDP: Rules notified 13 Nov 2025; Rule 4 from 13 Nov 2026; Rules 3, 5–16, 22–23 from 13 May 2027. Itemised standalone notice; free, specific, informed consent; erasure on withdrawal; breach notice to users and the Board within 72 h; grievances within 90 days; **verifiable parental consent for under-18s**; no tracking or behavioural monitoring of children; penalties up to ₹250 crore (not re-verified) | DPDP Act 2023; DPDP Rules 2025 (secondary summary; official PDF blocked) | Notice/consent from day one; under-18 path by May 2027 (D5) |
| COPPA (amended rule, compliance from 22 Apr 2026): persistent identifiers and screen names that work as contact info are personal information; public posting by children needs parental consent; neutral age screen | FTC | Birth month/year screen; under-13 stays local |
| Australia under-16 social media ban (from 10 Dec 2025): services whose sole or primary purpose is supporting users' health are excluded; Mozy is probably excluded (UNVERIFIED) | Online Safety (Age-Restricted Social Media Platforms) Rules 2025 | Keep a written self-assessment |
| Open items (UNVERIFIED) | Apple 5.1.1(ix) may require an organisation seller account for apps handling sensitive data; India IT Rules 2021 duties (e.g. grievance officer) for UGC hosts | Check before launch |

---

## 4. The product: Mozy Race (PROPOSAL)

One line: **race your crew, your family, your country and the world on steps, with your Mozy as your racer.**

### 4.1 Arenas

| Arena | Who | Size | Default period | Why | Phase |
|---|---|---|---|---|---|
| Crews | Friends, college, office, gym | 2–50 | This week | R1, R2; the invite engine | 1 |
| Family | A crew of type "family" | 2–50 | This week | R7; WhatsApp-native relatives | 1 |
| Country | Everyone public with that flag | Any | Today | National pride sharing | 1 |
| World | Everyone public | Any | This week | The owner's global board; percentile first (R12) | 1 |
| Leagues | 30 similar walkers, matched weekly by average and time zone | 30 | Week | R3, R5; makes the world winnable | 2 |
| Step-offs | 1v1 for 1, 3 or 7 days | 2 | Custom | The most direct invite | 2 |

### 4.2 What every board shows

- Today / week / month tabs. All-time totals only as personal bests.
- A hero card with the rank and **the gap to the next person** (R4).
- Percentile on country and world boards (R12). Below the median, lead with personal progress ("+2,140 on last week").
- Top 3 + the 3 people above and below you on big boards.
- "synced 12 min ago" on every row and a "resting" tag for anyone with no sync today.
- Phase 2 alternative wins: most improved (vs own last 4 weeks), most consistent (days ≥ 8,000), crowns (R13).

### 4.3 Awards (cosmetic only, C4)

| Award | Winner | Cadence | Shown |
|---|---|---|---|
| Crew crown 👑 | Top walker of the day and of the week in each crew | Daily, weekly | On the pet in boards and cards; later the widget |
| League move-up | Top 7 of each league | Weekly | Card, tier badge |
| Walker of the month | #1 world; #1 in each country with ≥50 public walkers | Monthly | Web hall of fame, card, badge |
| Most improved | Biggest gain on own previous month (≥100,000 steps that month) | Monthly | Hall of fame |
| Iron walker | Most days ≥ 8,000 steps in the month | Monthly | Hall of fame |
| Top crew | Highest average per member (crews of ≥4), with the owner's OK | Monthly | Hall of fame |
| Personal bests | Best day, best week | Any time | Profile, cards |

Rewards: crowns, leaf colours, hats for the pet (the hat reward that is never granted today, F19 in the growth study, finally gets a use).

### 4.4 Share cards (rendered on the phone, recorded numbers only, C5)

Formats: 9:16 story (1080×1920), square (1080×1080), WhatsApp text. Every card has a QR code and `mozy.mcrudra.com/j/{code}`.

| Card | Trigger | Example |
|---|---|---|
| Today in my crew | Any time; offered once after passing someone | "#1 in sharma fam today · 12,431 steps" |
| Week result | Monday after the crew week closes | "riya won sharma fam, week 42 👑" |
| Percentile | Weekly, top half only | "top 9% in india this week 🇮🇳" |
| Week grid (text) | Any time | `🟩🟩🟨🟩⬜🟩🟩 · 52,140 steps · #2 in sharma fam` + link |
| League move-up (phase 2) | Monday | "moved up to bloom league 🌸" |
| Step-off result (phase 2) | End of a step-off | "step-off won: 9,120 vs 8,432 😤 rematch?" |
| Award | When won | "walker of the month · india · october 2026" |

Identity labels ("weekend warrior") may be computed on the phone from local history; they never need the server (C1).

### 4.5 Names (D12)

"Mozy Race" (tabs: crews · {country} · world); leagues **seed → sprout → sapling → bloom → grove** (later forest, canopy, summit, sky, legend); 1v1 **step-off**. Don't use "touch grass" as a name (a rival app).

### 4.6 Screens

Mockups A–F in `report.html` (concept only). App screens use F-T1 tokens, white text on `#FF8A00`, lowercase copy, pets as avatars; website screens use F-W3.
- A · race, crews, today: hero "#2 of 6 · 312 steps to pass papa", rows with pets, crowns, sync time, "invite to race".
- B · race, world, week: percentile ring, top 3, around you.
- C · league (phase 2): tier banner, promotion zone, "1,840 steps from moving up", drop zone.
- D · share card 9:16.
- E · `/leaderboard`: top list, histogram, weekly total.
- F · `/j/{code}`: crew name, size, code, store buttons; no member totals for outsiders.

Entry: a fourth Home header button (trophy) (`CommandCenter.tsx:603-628`), plus a one-time Home card after the first goal day. One new stack screen (`RootNavigator.tsx`). Onboarding and the paywall are out of scope except D6.

---

## 5. Experience flows (PROPOSAL)

**5.1 Joining (3 screens)**
1. Intro: "race your friends on steps" · crews, your country, the world · "Only your race name and one step total per day leave your phone."
2. Profile: race name (pre-filled from `user_name`, 2–16 chars), pet colour (5), country flag (pre-filled from the phone's region setting; "hide my flag").
3. Who sees you: "everyone (world, country, crews and mozy.mcrudra.com)" or "only my crews", **nothing pre-selected**; birth month and year (D5); race rules and consent with the privacy link; done → boards.

**5.2 Starting a crew:** race → crews → "start a crew" → name + friends/family → share sheet with "race me on mozy this week 🏁 I'm on 8,902 steps today. join sharma fam: mozy.mcrudra.com/j/SHRM7Q" → optional "show QR".

**5.3 Opening an invite**

| Friend's phone | Flow |
|---|---|
| Mozy installed | Universal Link / App Link opens Mozy → "join sharma fam?" → quick profile if needed → board |
| Android, no Mozy | `/j/{code}` → Play with `&referrer={code}` → install → onboarding → "you were invited to sharma fam · join?" (Install Referrer, read once) |
| iPhone, no Mozy | `/j/{code}` shows the code and "copy code & get mozy" → App Store → onboarding → **paywall (F-P1, D6)** → race screen with a UIPasteControl paste button and manual entry |

**5.4 Daily loop:** walk → sync → rank moves → "papa passed you · 140 steps behind" (≤2 race notifications/day, none 22:00–08:00) → walk → pass → one card offer → share.
**5.5 Weekly loop:** Sunday "final hours" (phase 2) → Monday 4 AM close → crown + result card → fresh week (R6).
**5.6 Monthly:** awards on the 1st → web hall of fame → winners' card and badge.
**5.7 Leaving:** "delete my race profile" → all server data deleted at once; Mozy keeps working (C12).

---

## 6. Exactly what leaves the phone (PROPOSAL; D2)

| Field | Example | Why | Visible to |
|---|---|---|---|
| Race name | mahesh | Who is who | Crews; public boards if "everyone" |
| Pet look | peach | Avatar without photos | Same |
| Country (optional) | IN | Country boards; from the region setting, never GPS or IP | Public boards |
| One step total per race day | 8,432 | The race | Same as the name |
| Visibility | everyone / crews only | Consent | Server only |
| UTC offset | +330 | Which day is "today" | Server only |
| Random profile id, token hash, recovery-code hash | – | The account | Server only |
| Birth year band (13–15 / 16–17 / 18+) | 18+ | Age rules (D5) | Server only |
| Crew memberships, reports, blocks | – | Features | Server only |

Never: hourly or per-walk steps, minutes, app usage, blocked apps, Screen Time data, GPS, contacts, device identifiers, IP addresses (C1, C2, C10).

---

## 7. Architecture (PROPOSAL)

### 7.1 Pieces

```text
Mozy app (iOS, Android)
  ├─ race module: profile, sync, boards, crews, share cards        (new JS + small native additions)
  └─ HTTPS + bearer token ──► mozy-race Worker (new, Cloudflare, own hostname e.g. api.mozy.mcrudra.com)
                                ├─ D1 "mozy-race"                     (source of truth)
                                ├─ Cron every 10 min                  (board snapshots)
                                ├─ Cron daily / Monday / 1st          (close periods, crowns, awards, cleanup)
                                └─ Cache API + in-memory cache        (public boards)
mozy.mcrudra.com (existing static site, Worker "mozy")
  ├─ /leaderboard, /awards          prerendered shells; data from the API (edge-cached)
  └─ /j/{code}, /d/{code}           small Worker script (run_worker_first) sets per-link OG tags
```

- Separate Worker from the website, so site deploys can't break the API.
- No KV (Free: 1,000 writes/day), no R2 (not enabled), no Durable Objects in phase 1; Durable Objects are the later path for live races.

### 7.2 Identity: "no sign-up" accounts (C10)

The owner asked for accounts "based on the device ID" with automatic re-login. Apps can no longer read a permanent hardware id, and Google's User Data policy says persistent device identifiers (Android 8+ `ANDROID_ID` is one) may not be linked to other personal and sensitive user data. The same effect comes from a random token kept in each platform's secure backup:

| Situation | iPhone | Android |
|---|---|---|
| Opt in | Server creates a random `profile_id` and a 256-bit token; the app stores the token in the Keychain, accessible after first unlock, **synchronizable** (iCloud Keychain) so it follows the user to a new iPhone. It is a credential, not health data, so 5.1.3(ii) does not apply | Same token stored in **Block Store** (16 entries × 4 KB; survives uninstall when backup is on; restores to a new phone; enable cloud backup only with end-to-end encryption) with Android Keystore-backed local storage |
| Reinstall, same phone | Keychain items normally survive app deletion (reported on iOS 17.5; Apple says "don't rely on that") → signed straight back in. DeviceCheck bit 0 = "this phone had a race profile", so a fresh install offers **restore** instead of creating a duplicate | Block Store hands the token back → signed in. Auto Backup (client-side encrypted) is a second layer |
| New phone | iCloud Keychain brings the token; otherwise the recovery code | Block Store device-to-device or cloud restore; otherwise the recovery code |
| Fallback | "Mozy ID" recovery code (e.g. `MZ-7KQ2-9XWD`, ≥60 random bits) shown in the race profile; entering it rotates the token | Same |

- The server stores `sha256(token)` and `sha256(recovery code)` only.
- DeviceCheck bit 1 and Play Integrity device recall (beta; 3 bits that survive reinstall and factory reset, abuse use only) can flag abusive devices without storing an id.
- App Attest keys don't survive reinstall or migration: re-attest after a restore and link the new key.
- New modules: one secure-storage module (Keychain + Block Store; `expo-secure-store` covers the local part, Block Store needs a small native module).

### 7.3 Step sync contract

**Race day** (D3): fixed **4 AM–4 AM local**, independent of the user's reset-hour setting (F-C5).
- iOS: `CMPedometer.queryPedometerData(from: 4 AM, to: now)` for today and yesterday.
- Android: walked steps after the ride filter; if the user's reset hour is 4, the existing `history_YYYY-MM-DD` snapshot is the race day, otherwise keep one extra 4 AM bucket in `StepTrackingService`.
- Week: Monday 4 AM local. Month: the 1st, 4 AM.

**Payload** (the whole upload): `{"days":[{"day":"2026-10-14","steps":8432},{"day":"2026-10-13","steps":11020}],"tz_min":330}`

**Server rules**
- Accept today and yesterday in the user's offset (±1 day for travel); corrections close 36 h after a day ends; boards say "live" until then.
- Integer 0–100,000; values above the review line (7.10) are stored but kept off public boards until reviewed.
- Idempotent upsert, one row per user per day, written only on change: `INSERT ... ON CONFLICT(day, profile_id) DO UPDATE SET steps = excluded.steps, updated_at = ? WHERE steps <> excluded.steps`.
- Totals may go down (Android takes back ride steps), so the latest value wins.
- The response carries the user's ranks (one call does both jobs).

**When to sync:** on opening Mozy; while open, when steps grew ≥250 and ≥5 min passed; on leaving. Android: from the step service at most every 30 min when changed. iOS: on open plus the existing background refresh (`AppDelegate.swift:115,131`). The server can return `next_sync_s` to slow everyone down.

### 7.4 Data model (D1)

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,                 -- random 128-bit id
  token_hash BLOB NOT NULL,            -- sha256(bearer token); no device id is stored (C10)
  recovery_hash BLOB UNIQUE,           -- sha256(Mozy ID recovery code)
  name TEXT NOT NULL,                  -- 2..16 chars, filtered
  tag INTEGER NOT NULL,                -- 4 digits, profile only
  pet TEXT NOT NULL,
  country TEXT,                        -- ISO 3166 alpha-2 or NULL
  public INTEGER NOT NULL,             -- 1 = world, country, web; 0 = crews only
  age_band INTEGER NOT NULL,           -- 1 = 13-15, 2 = 16-17, 3 = 18+
  tz_min INTEGER NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1,     -- league tier (phase 2)
  status INTEGER NOT NULL DEFAULT 0,   -- 0 ok, 1 name hidden, 2 steps under review, 3 banned
  created_at INTEGER NOT NULL, last_sync_at INTEGER
);
-- One row per person per race day; key keeps a day together; no second index → 1 written row per change
CREATE TABLE day_steps (
  day TEXT NOT NULL, profile_id TEXT NOT NULL, steps INTEGER NOT NULL,
  country TEXT, public INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY (day, profile_id)
) WITHOUT ROWID;
CREATE TABLE crews (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  kind TEXT NOT NULL, owner_id TEXT NOT NULL, size INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL);
CREATE TABLE crew_members (crew_id TEXT NOT NULL, profile_id TEXT NOT NULL, joined_at INTEGER NOT NULL,
  PRIMARY KEY (crew_id, profile_id)) WITHOUT ROWID;
CREATE INDEX crew_members_by_profile ON crew_members (profile_id);
CREATE TABLE board_snapshots (key TEXT PRIMARY KEY, built_at INTEGER NOT NULL, n INTEGER NOT NULL,
  top TEXT NOT NULL, sorted BLOB NOT NULL);          -- top 100 JSON; all totals descending as int32
CREATE TABLE period_base (period TEXT PRIMARY KEY, through_day TEXT NOT NULL, totals BLOB NOT NULL);
CREATE TABLE monthly_totals (month TEXT NOT NULL, profile_id TEXT NOT NULL, steps INTEGER NOT NULL,
  PRIMARY KEY (month, profile_id)) WITHOUT ROWID;
CREATE TABLE awards (period TEXT, kind TEXT, scope TEXT, profile_id TEXT, crew_id TEXT, value INTEGER,
  PRIMARY KEY (period, kind, scope));
CREATE TABLE crowns (crew_id TEXT, period TEXT, profile_id TEXT, PRIMARY KEY (crew_id, period));
CREATE TABLE reports (reporter_id TEXT, target_id TEXT, reason TEXT, created_at INTEGER,
  PRIMARY KEY (reporter_id, target_id));
CREATE TABLE blocks (profile_id TEXT, blocked_id TEXT, PRIMARY KEY (profile_id, blocked_id)) WITHOUT ROWID;
-- Phase 2: league_members(week, cohort, profile_id, tier), duels, push_tokens, reactions
```

D1 limits that shape this (FACT): Free 500 MB per database, 50 queries per Worker invocation (1,000 on Paid); rows/strings/BLOBs ≤ 2,000,000 bytes, so a `sorted` snapshot holds up to ~500k totals before switching to a histogram; each index adds a written row.

### 7.5 API (v1)

| Method and path | Purpose |
|---|---|
| `POST /v1/profile` | Opt in: name, pet, country, visibility, age band, tz → `{id, token, tag, recovery_code}` |
| `POST /v1/profile/recover` | Recovery code → new token |
| `PATCH /v1/profile` · `DELETE /v1/profile` | Edit; delete everything (Apple 5.1.1(v), Play) |
| `PUT /v1/steps` | Upload today and yesterday → my ranks + `next_sync_s` |
| `GET /v1/me/boards?period=day\|week\|month` | My rank, percentile, neighbours in world, country, crews |
| `GET /v1/boards/{scope}/{period}/{key}` | Public snapshot (top 100, n, built_at), edge-cached |
| `POST /v1/crews` · `POST /v1/crews/join` | Create → code and link; join by code |
| `GET /v1/crews/{id}/board?period=` | Crew board, live, cached 60 s |
| `DELETE /v1/crews/{id}/members/{me\|id}` | Leave; owner removes a member |
| `POST /v1/reports` · `POST /v1/blocks` | Report a name; block a person |
| `GET /v1/public/invite/{code}` | Invite page: crew name, size, inviter's name; no totals |
| `GET /v1/public/stats` · `GET /v1/public/awards/{month}` | Website ticker and hall of fame |
| `POST /v1/deletion-request` | Web deletion form (Play requirement) with recovery code |

### 7.6 Ranks without big bills

1. Every 10 min a Cron reads each live race day once (`WHERE day = ?`, one primary-key range) and builds every world and country board for the open days.
2. Week and month boards = **frozen base + live tail**: once a day, finished days are summed into `period_base`; every 10 min only the live days are added. A month board never re-reads 30 days.
3. Snapshots keep the top 100 and a sorted list of all totals. Rank = binary search (ties share a rank: 1, 2, 2, 4); percentile = `1 − (rank − 1) / n`.
4. "Around you" = one small query in the steps range near the user.
5. Crew and league boards (≤50 people) are read live: members × days rows, cached 60 s.

### 7.7 Crews, leagues, step-offs

- Crews: friends or family, 2–50 people, ≤5 crews per person; filtered name; join by link, QR or 6-character code; owner can remove; anyone can leave.
- Crowns: daily and weekly crew winners; worn by the pet until the next result.
- Leagues (phase 2): each Monday, active walkers join a group of 30 in their tier, matched by 2–4-week average (R3) and time zone ±3 h (the week ends together). Top 7 up, bottom 5 down, tier 1 never drops. Points = steps capped at 20,000/day (D16, R11). Start with 5 tiers. Launch only when ≥500 people race weekly.
- Step-offs (phase 2): 1v1 for 1, 3 or 7 days via `/d/{code}`; result card and "rematch".

### 7.8 Notifications

| Phase | How | Sends |
|---|---|---|
| 1 | Local notifications after a sync: Android's step service syncs all day; iPhone only when the app wakes | "papa passed you · 140 steps behind"; "you're #1 in sharma fam 👑" |
| 2 | Push via Firebase Cloud Messaging HTTP v1 (Firebase is already in the app; FCM also delivers to iPhones). Worker-side OAuth2 JWT (RS256 via WebCrypto) is documented piecewise but no Cloudflare example confirms the full flow (UNVERIFIED). Direct APNs needs HTTP/2, which Cloudflare doesn't document for outbound fetch (UNVERIFIED) | Overtakes, Sunday "final hours", weekly result, awards |

Rules: ≤2 race notifications/day, none 22:00–08:00 local, per-type switches, the gap always included (R9), never guilt copy.

### 7.9 Web pages (website repo)

| Path | What | Data |
|---|---|---|
| `/leaderboard`, `/leaderboard/{country}` | World and country boards, today/week/month, histogram, weekly total ticker | `GET /v1/boards/...` (edge-cached) |
| `/awards`, `/awards/{yyyy-mm}` | Hall of fame | `GET /v1/public/awards/...` |
| `/j/{code}` | Crew invite: crew name, size, inviter, store buttons, "open in mozy", copyable code | `GET /v1/public/invite/{code}`; per-link OG title; fixed OG image |
| `/d/{code}` | Step-off invite (phase 2) | Same |
| `/delete` | Web deletion request (Play) | `POST /v1/deletion-request` |
| `/.well-known/apple-app-site-association`, `/.well-known/assetlinks.json` | Universal Links / App Links | Static |

- Needs a small Worker entry with `run_worker_first` for `/j/*` and `/d/*` (F-W1); confirm which Worker serves mozy.mcrudra.com (F-W2).
- One fixed 1200×630 OG image per page type (<300 KB). Per-user OG images (satori/workers-og) have no published CPU benchmark and probably exceed Free's 10 ms CPU (UNVERIFIED); revisit on Paid with a cache.
- Web boards: show public race names and flags, round step counts on the web (e.g. 152.3k), `noindex` for name lists; index only totals and country stats (D10).

### 7.10 Anti-cheat

| Layer | Rule | Evidence |
|---|---|---|
| Source | Only Mozy's own sensor steps (CMPedometer, TYPE_STEP_COUNTER with the ride filter). No HealthKit/Health Connect import, so no manual entries | Fitbit, StepUp and MoveSpring exclude manual steps; F-C2, F-C3 |
| Shakers | Phone shakers produce ~6,000–7,000 steps/hour (100–117 per minute), the same as brisk walking, so cadence limits don't catch them. A phone on a bike crank logged 1,277 steps in 10 minutes | Sixth Tone 2018; Tudor-Locke 2019; TestDevLab 2026 |
| Review line | Public boards: totals above **40,000/day** wait for review before appearing (MoveSpring calls >40,000 "uncommon"; caps elsewhere 20,000–50,000). Hard limit 100,000. Flag syncs implying >250 steps/minute sustained (INFERRED; no source gives a ceiling) | MoveSpring, NYC (35,000), Pacer (~30,000), YuMuuv (20,000) |
| Crews | Friends see each other's real numbers; the review line guards only public boards | Case studies: friends' boards need only caps |
| Attestation (phase 2) | App Attest (iOS) and Play Integrity (Android) once a day for anyone near the top of a public board. App Attest can't detect a compromised OS and keys die on reinstall; Play Integrity's default quota is 10,000/day; device recall (beta) survives reinstall | Apple and Google docs |
| Response | Review, don't accuse: flagged days stay visible to the person and their crews but wait before public boards; quiet exclusion, not bans. "Some people flagged as cheating were actually training hard" | Duolingo drops irregular XP; organiser guidance |
| Incentive | No prizes (C13): prize challenges drew 200,000-step days and pendulum purchases | Boston College 2016; WeRun |
| Later (on the phone only) | A gait-regularity score computed on the device (shakers are more regular than real walking) could add a flag without uploading motion data (C1) | Tomlein et al. 2012 (INFERRED fit) |

### 7.11 Moderation and safety

- Names: 2–16 characters; letters, digits, spaces, `.`, `_`, `-`; Unicode NFKC; leetspeak folding; multilingual blocklist incl. Hindi/Hinglish; reserved words (mozy, mcrudra, admin, official, support); no URLs, `@`, emails or phone numbers (contact info under COPPA). Crew names use the same filter.
- Report: long-press any name; 3 distinct reporters auto-hide it ("walker 4821") until reviewed; aim to respond within 24–48 h.
- Block: hides a person from your boards and removes them from crews you own.
- No other free text: no chat, bios, photos. Phase 2 reactions: 5 fixed pet stickers inside crews.
- Review: a small `/admin` page behind Cloudflare Access, or the D1 console.
- Race rules (terms) accepted at joining (Play UGC). Contact email shown in the app and on the site (Apple 1.2).

### 7.12 Retention and deletion (D11)

- Daily totals 40 days; monthly totals 25 months; profiles with no sync for 13 months deleted automatically.
- `DELETE /v1/profile` removes profile, memberships, daily and monthly rows, crowns, reports and blocks at once; the next board build drops the person; hall-of-fame entries become "a mozy walker".
- No IP addresses in D1 or logs.

### 7.13 Failure modes

| Trigger | Response |
|---|---|
| Any daily quota at 50% | Alert the owner (Cloudflare usage notifications or a Cron check) |
| 70% | `next_sync_s` → 60 min; crew cache → 5 min |
| 85% | Snapshots only; phones keep unsent totals and retry with backoff |
| Free limit hit | API errors until 00:00 UTC (error 1027); app shows last boards with "race paused". Hence Workers Paid at launch (D7) |
| API down | Blocking, earning and Home unaffected (C12) |

---

## 8. Cost (FACT prices; PROPOSAL usage model)

Prices (Cloudflare docs; pages updated 21 Apr – 12 Oct 2026):

| | Free | Workers Paid ($5/month) |
|---|---|---|
| Requests | 100,000/day; over the limit error 1027 until 00:00 UTC | 10M/month, then $0.30/M |
| CPU | 10 ms per invocation | 30M CPU-ms/month, then $0.02/M CPU-ms; 30 s default, 5 min max |
| D1 rows read | 5M/day | 25B/month, then $0.001/M |
| D1 rows written | 100k/day (index writes count) | 50M/month, then $1.00/M |
| D1 storage | 5 GB total; 500 MB per database; 10 databases | 5 GB, then $0.75/GB-month; 10 GB per database |
| Cron triggers | 5 | 250 |
| KV | 100k reads, 1k writes/day | 10M reads, 1M writes/month |
| Durable Objects (SQLite) | Available: 100k requests/day | $0.15/M requests after 1M |
| Queues | 10,000 ops/day | 1M/month, then $0.40/M |
| Static assets | Free and unlimited | Same |

Model: 6 syncs + 3 board views per racer per day; crews of 6; boards rebuilt every 10 min; ~3 ms CPU per request; daily rows 40 days; monthly totals 25 months.

| Daily racers | Requests/day | Rows written/day | Rows read/day | Free plan (tightest limit) | Paid per month |
|---:|---:|---:|---:|---|---:|
| 100 | 3,044 | 3,606 | 44,500 | Yes (4%) | $5.00 |
| 1,000 | 11,144 | 9,060 | 445,000 | Yes (requests 11%) | $5.00 |
| 5,000 | 47,144 | 33,300 | 2,225,000 | Yes (requests 47%) | $5.00 |
| 10,000 | 92,144 | 63,600 | 4,450,000 | Barely (requests 92%) | $5.00 |
| 30,000 | 272,144 | 184,800 | 13,350,000 | No | $5.00 |
| 100,000 | 902,144 | 609,000 | 44,500,000 | No | ~$11 |
| 300,000 | 2,702,144 | 1,821,000 | 133,500,000 | No | ~$35 |
| 1,000,000 | 9,002,144 | 6,063,000 | 445,000,000 | No | ~$231 |

Recommendations (PROPOSAL): build and beta on Free; switch to Workers Paid on public launch day (D7); turn on usage notifications; keep the 50/70/85% checks. Requests run out first, so combining upload and ranks in one call is the biggest saving. Play Integrity's default quota is 10,000 requests/day; request an increase early if each upload is attested (approval up to a week).

---

## 9. Idea bank (PROPOSAL)

Pull = brings new people; Keep = brings people back (1–5). Effort: S days, M 1–2 weeks, L more.

| ID | Idea | Pull | Keep | Effort | Phase | Note |
|---|---|:-:|:-:|:-:|:-:|---|
| X1 | Crews (friends), today/week/month | 5 | 5 | M | 1 | Invite engine (R1, R2) |
| X2 | Family crew type | 4 | 4 | S | 1 | R7; family goal bar in phase 2 |
| X3 | World board: percentile, top 3, around you | 2 | 3 | M | 1 | R12 |
| X4 | Country board with flags | 3 | 3 | S | 1 | D2 |
| X5 | Invites: links, QR, `/j/` page, Play referrer | 5 | 2 | M | 1 | |
| X6 | Share cards: today, week result, percentile | 4 | 2 | M | 1 | One renderer with S1/S2 |
| X7 | WhatsApp week-grid text | 3 | 2 | S | 1 | Wordle pattern |
| X8 | "steps to pass" nudge | 1 | 4 | S | 1 | R4 |
| X9 | Overtake notifications (local) | 2 | 4 | S–M | 1 | R9 |
| X10 | Daily and weekly crowns on the pet | 2 | 4 | S | 1 | R5 |
| X11 | Weekly leagues, 30 people, plant tiers | 2 | 5 | L | 2 | Gate: ≥500 weekly racers |
| X12 | Step-offs (1v1) | 5 | 3 | M | 2 | |
| X13 | 5 pet reactions inside crews | 1 | 3 | S | 2 | No chat (C7) |
| X14 | Web hall of fame + monthly awards | 3 | 2 | M | 2 | |
| X15 | Weekly world total ticker on the website | 2 | 1 | S | 2 | Only when worth showing |
| X16 | Most improved board | 1 | 4 | S | 2 | R13 |
| X17 | Consistency board (days ≥ 8,000) | 1 | 4 | S | 2 | R13 |
| X18 | Country cup (average per walker) | 4 | 2 | S | 2 | ≥50 walkers per country |
| X19 | Push notifications (FCM) | 1 | 4 | M | 2 | iPhone overtakes |
| X20 | Founder crew "walk with mahesh" | 3 | 2 | S | 2 | MCX content, real walks only |
| X21 | Rival of the week | 1 | 4 | S | 2 | R14 |
| X22 | Race your Mozy: the pet walks at your own last-week pace | 1 | 3 | S | 2 | Beatable rival for solo users; never a fake person (C5) |
| X23 | Open crews (college, office, gym), ≤500, ranked by average | 5 | 3 | M | 3 | Moderation at scale |
| X24 | Race widget on the Home Screen | 2 | 4 | M | 3 | |
| X25 | iOS Live Activity for Sunday's final hours | 1 | 3 | M | 3 | |
| X26 | Seasons with cosmetic rewards | 2 | 4 | M | 3 | R15 |
| X27 | Events: New Year week, National Walking Day | 4 | 3 | S each | 3 | R6; growth study §7 dates |
| X28 | "Last walker standing" crew game | 3 | 3 | M | 3 | Experiment |
| X29 | "Walk o'clock" daily window | 2 | 2 | M | Test | BeReal novelty fades |
| X30 | Race Wrapped with percentile | 5 | 1 | M | Dec | |
| X31 | Streak freezes earned by walking, repair, "welcome back" crown | 1 | 4 | S | 2 | R10 |
| X32 | Buddy quests (both must finish) | 2 | 4 | M | 2 | R8 |
| X33 | Rookie week (new racers together) | 2 | 3 | S | 2 | Gen Z intimidation |
| X34 | Crew vs crew week (average per member) | 4 | 4 | M | 2 | R7 |
| X35 | Family goal-day mode: score by % of each person's own goal | 3 | 4 | M | 2 | Apple, Fitbit; D17 |
| X36 | Friend streaks: both walk ≥5,000 to keep it alive | 3 | 4 | M | 2 | Duolingo Friend Streak +22% |

Never build: cash or gift-card prizes; screen minutes as rewards; chat or comments; photos; public profiles or following strangers; contact upload or "people near you"; ranking by app use; shaming the bottom; paid boosts; a named person's steps in marketing without separate permission.

Phase 1: X1–X10. Phase 2: X11–X22, X31–X36. Phase 3: X23–X28, X30.

---

## 10. Roadmap (PROPOSAL)

| Phase | Target dates | Scope | Gate |
|---|---|---|---|
| 0 · Decide and prepare | 14–24 Oct 2026 | D1–D19; website domain switch (WEB.md W0); free iPhone path (D6); privacy policy, labels and Trust copy drafts; secure storage (Keychain + Block Store); Universal Links / App Links files; confirm which Worker serves mozy.mcrudra.com | Decisions recorded; links open the app on both platforms |
| 1 · Crews and world | 27 Oct – 30 Nov 2026 | `mozy-race` Worker + D1 on Free; race day in native code; race screen (crews, country, world); invites + `/j/`; share card + week grid; local overtake notifications; `/leaderboard`; deletion in app and web; name filter, report, block; age screen | Beta with 50–200 testers: invite → join works on both stores; boards right across time zones; deletion works |
| Launch | Early Dec 2026 | Workers Paid ($5); store labels and age rating live; MCX founder content from real crews only (C11) | – |
| 2 · Leagues and awards | Dec 2026 – Jan 2027 | X11–X22, X31–X36 | League members retain better than non-members |
| 3 · Seasons | 2027 | New Year week 1–7 Jan 2027 (fresh start; Health & Fitness spending peaks in January); X23–X28; India under-18 consent path before 13 May 2027 | – |

---

## 11. Metrics (PROPOSAL)

| ID | Metric | First target |
|---|---|---|
| K1 | Weekly active users who create a race profile | ≥35% |
| K2 | Profiles in a crew with ≥2 people | ≥40% |
| K3 | Invites shared per new profile in 7 days | ≥1.0 |
| K4 | `/j/` visits that end in a crew join | ≥15% |
| K5 | Viral factor K | 0.1–0.3 realistic; >0.5 excellent |
| K6 | Day-7 and day-30 retention, racers vs non-racers | Racers clearly higher |
| K7 | Steps/day before vs after joining a crew | Up (STEP UP: +920) |
| K8 | Weekly users who share a card | ≥10% |
| K9 | Cost per 1,000 daily racers; quota headroom | ≤$0.10; <50% of any limit |
| K10 | Reports and step reviews per 1,000 racers | Low and falling |

Events (Firebase on Android, PostHog on the site; never names, codes or totals): `race_intro_viewed`, `race_profile_created {visibility}`, `crew_created {kind}`, `invite_shared`, `crew_joined {entry: link|code|referrer|qr}`, `board_viewed {scope, period}`, `card_shared {template}`, `race_notification_opened {type}`, `race_profile_deleted`. iOS numbers come from server counts (F-C11).

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| Empty boards at launch | Crews first (work with 2 people); country ranks only at ≥10 public walkers; web shows totals until ≥100 public walkers; never seed fake users (C5) |
| iPhone paywall blocks invited friends | D6 |
| Cheating | 7.10; no prizes (C13) |
| Privacy backlash | Opt-in, exact field list, rewritten copy, delete any time (C1, C9) |
| Store rules and age ratings | 3.4; no feed (C7); 13+ |
| Minors | D5; Texas/Utah/Louisiana parental approval; India under-18 path by May 2027 |
| Viral spike breaks the API | Paid from launch; app works without the API (C12) |
| Notification fatigue | ≤2/day, quiet hours, switches |
| Over-exercise or obsession | Rest days never punished; weekly resets; "resting" tag; no late-night nudges; percentile for the bottom half; league cap (D16) |
| iPhone vs Android fairness | Only Android filters rides; watch per-platform distributions; add an iPhone ride filter (bug 84 path) if needed |
| Impersonation | Token required for every write; long, rate-limited recovery codes; attestation in phase 2 |
| Marketing misuse of data | C11 |

---

## 13. Decisions for the owner

| ID | Question | Recommendation |
|---|---|---|
| D1 | Public world and country boards | Yes, with an explicit "everyone" / "only my crews" choice at joining, nothing pre-selected |
| D2 | Store a country code | Yes, from the phone's region setting (no GPS, no IP), editable, "hide my flag" |
| D3 | Race day | Fixed 4 AM–4 AM local (matches Mozy's default day). Alternative: midnight |
| D4 | Race names | Free text, pre-filled from the onboarding name, filtered, report and block. Alternative: generated names only |
| D5 | Age | 13+ to join (birth month/year); public boards 16+; under-13 local only; India under-18 path before 13 May 2027 or keep them out there; parental approval for minors in Texas, Utah, Louisiana |
| D6 | iPhone paywall | Let invited iPhone users race without paying (a closable paywall with a free core, or a skip for invite arrivals). Biggest blocker |
| D7 | Cloudflare plan | Free for beta, Workers Paid ($5) from launch day |
| D8 | Push | Local in phase 1; FCM in phase 2 |
| D9 | Prizes | None; cosmetics only |
| D10 | Names on the web | Show public race names and flags; round web step counts; `noindex` name lists |
| D11 | Retention | Daily 40 days; monthly 25 months; inactive profiles deleted after 13 months |
| D12 | Names of things | Mozy Race; crews; step-off; seed → sprout → sapling → bloom → grove |
| D13 | Store age rating | Accept 13+; avoid the "social media" answer (no feed, reactions only inside crews) |
| D14 | Privacy promise | "No sign-up, ever. If you join the race, only your race name and one step total per day leave your phone. Delete it any time." |
| D15 | Recovery code | Yes ("Mozy ID") |
| D16 | League scoring | Steps capped at 20,000/day in leagues; plain steps elsewhere |
| D17 | Family fairness mode | Phase 2, optional per crew: score by % of each person's own daily goal (needs the goal to leave the phone, one number beyond C1) |
| D18 | Where the backend code lives | Website repo, `race-api/`, deployed as its own Worker |
| D19 | API address | `https://api.mozy.mcrudra.com/v1` |

---

## 14. Sources

**Behavioural science**

- Festinger 1954, A theory of social comparison processes, Human Relations 7(2): https://doi.org/10.1177/001872675400700202
- Garcia & Tor 2009, The N-effect, Psychological Science 20(7): https://public.websites.umich.edu/~smgarcia/pubs/n-effect.pdf
- Garcia, Tor & Gonzalez 2006, Ranks and rivals, PSPB 32(7): https://public.websites.umich.edu/~smgarcia/pubs/ranksandrivals.pdf
- Garcia & Tor 2007, Rankings, standards, and competition, OBHDP: https://cris.haifa.ac.il/en/publications/rankings-standards-and-competition-task-vs-scale-comparisons/
- Zell & Alicke 2010, The local dominance effect, PSPR 14(4): https://doi.org/10.1177/1088868310366144
- Alicke, Zell & Bloom 2010, Mere categorization and the frog-pond effect, Psychological Science 21(2): https://doi.org/10.1177/0956797609357718
- Marsh & Hau 2003, Big-fish-little-pond effect in 26 countries, American Psychologist 58(5): https://doi.org/10.1037/0003-066X.58.5.364
- Lockwood & Kunda 1997, Superstars and me, JPSP 73(1): https://doi.org/10.1037/0022-3514.73.1.91
- Gill et al. 2019, First-place loving and last-place loathing, Management Science 65(2): https://doi.org/10.1287/mnsc.2017.2907
- Kuziemko et al. 2014, Last-place aversion, QJE 129(1): https://doi.org/10.1093/qje/qjt035
- Reeve & Deci 1996, Elements of the competitive situation, PSPB 22(1): https://doi.org/10.1177/0146167296221003
- Landers & Landers 2014, Leaderboards and time-on-task, Simulation & Gaming 45(6): https://doi.org/10.1177/1046878114563662
- Jia, Liu, Yu & Voida 2017, Designing leaderboards for gamification, CHI '17: https://doi.org/10.1145/3025453.3025826
- Sailer & Homner 2020, The gamification of learning: a meta-analysis, Educational Psychology Review 32: https://doi.org/10.1007/s10648-019-09498-w
- Patel et al. 2019, STEP UP randomized trial, JAMA Internal Medicine 179(12): https://doi.org/10.1001/jamainternmed.2019.3505
- Penn Medicine news on STEP UP, Sep 2019: https://pennmedicine.org/news/news-releases/2019/september/using-a-wearable-device-to-exercise-more-add-competition-to-improve-your-results
- Patel et al. 2017, BE FIT family gamification trial, JAMA Internal Medicine 177(11): https://doi.org/10.1001/jamainternmed.2017.3458
- Zhang et al. 2016, Support or competition? Preventive Medicine Reports 4: https://pmc.ncbi.nlm.nih.gov/articles/PMC5008041/
- Patel et al. 2016, Framing financial incentives, Annals of Internal Medicine 164(6): https://doi.org/10.7326/M15-1635
- Dai, Milkman & Riis 2014, The fresh start effect, Management Science 60(10): https://doi.org/10.1287/mnsc.2014.1901
- Kivetz, Urminsky & Zheng 2006, The goal-gradient hypothesis resurrected, JMR 43(1): https://home.uchicago.edu/ourminsky/Goal-Gradient_Illusionary_Goal_Progress.pdf
- Feltz, Kerr & Irwin 2011, Buddy up (Köhler effect), JSEP 33(4): https://doi.org/10.1123/jsep.33.4.506
- Irwin et al. 2012, Aerobic exercise is promoted when partners are slightly better, Annals of Behavioral Medicine 44(2): https://doi.org/10.1007/s12160-012-9367-4
- Silverman & Barasch 2022, On or off track: streaks, JCR 49(6): https://doi.org/10.1093/jcr/ucac029
- Milkman et al. 2021, Megastudies improve the impact of applied behavioural science, Nature 600: https://doi.org/10.1038/s41586-021-04128-4
- Etkin 2016, The hidden cost of personal quantification, JCR 42(6): https://doi.org/10.1093/jcr/ucv095
- Kilduff 2014, Driven to win: rivalry, motivation, and performance, SPPS 5(8): https://doi.org/10.1177/1948550614539770
- Mazeas et al. 2022, Gamification and physical activity: meta-analysis, JMIR 24(1): https://doi.org/10.2196/26779
- Nishi et al. 2024, Gamified apps and step counts, eClinicalMedicine 76: https://doi.org/10.1016/j.eclinm.2024.102798
- Hanus & Fox 2015, Computers & Education 80 (unverified): https://doi.org/10.1016/j.compedu.2014.08.019

**Duolingo, Strava and other products**

- Duolingo S-1 filing, 28 Jun 2021: https://www.sec.gov/Archives/edgar/data/1562088/000162828021013065/duolingos-1.htm
- Lenny's Newsletter, How Duolingo reignited user growth, 28 Feb 2023: https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth
- Duolingo blog, Leagues and leaderboards, 3 May 2023: https://blog.duolingo.com/duolingo-leagues-leaderboards/
- Duolingo blog, Time spent learning well, 13 Jun 2024: https://blog.duolingo.com/time-spent-learning-well
- Duolingo blog, How streaks keep learners committed, 10 May 2017: https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals
- Duolingo blog, Friends and social features, 6 Jun 2023: https://blog.duolingo.com/friends-social-features/
- Duolingo blog, Product lessons from Friend Streak, 20 Sep 2024: https://blog.duolingo.com/product-lessons-friend-streak/
- Duolingo blog, Year in Review behind the scenes, 8 Dec 2022: https://blog.duolingo.com/year-in-review-behind-the-scenes
- Duolingo blog, 2020 Year in Review, 3 May 2021: https://blog.duolingo.com/duolingo-2020-year-in-review
- Strava Year in Sport 2025 press release, 2 Dec 2025: https://press.strava.com/articles/strava-releases-12th-annual-year-in-sport-trend-report-2025
- Strava mid-year data, 26 Aug 2025: https://press.strava.com/articles/strava-mid-year-data-shows-how-athletes-are-tracking-toward-2025-goals
- Strava privacy features, 14 Apr 2026: https://press.strava.com/articles/in-a-world-of-digital-oversharing-strava-is-reminding-users-that-some
- road.cc, Strava Year in Sport now subscriber-only, 23 Dec 2025: https://road.cc/content/news/strava-year-sport-now-only-subscribers-317425
- TechCrunch, Spotify Wrapped 2025, 4 Dec 2025: https://techcrunch.com/2025/12/04/spotify-says-wrapped-2025-is-its-biggest-yet-with-200m-users-in-its-first-day
- Wordle (Wikipedia) and The Spinoff, 13 Jan 2022: https://thespinoff.co.nz/media/13-01-2022/those-coloured-boxes-on-twitter-are-new-zealands-fault
- Receiptify (Studio for Creative Inquiry): https://studioforcreativeinquiry.org/project/receiptify
- BeReal (Wikipedia): https://en.wikipedia.org/wiki/BeReal
- Gas (Wikipedia): https://en.wikipedia.org/wiki/Gas_(app)
- BGR, Apple Music Replay 2025: https://www.bgr.com/2041453/apple-music-replay-2025-now-available-how-to-find
- StepSetGo on the App Store (India): https://apps.apple.com/in/app/stepsetgo-step-into-rewards/id1434541801
- MoEngage on Sweatcoin, 20 Apr 2023: https://moengage.com/blog/get-to-know-your-customers-day-sweatcoin
- TechCrunch, the touch grass app, 17 Mar 2025: https://techcrunch.com/2025/03/17/this-app-limits-your-screen-time-by-making-you-literally-touch-grass/
- Sprout Social, Social Dictionary 2025: https://media.sproutsocial.com/uploads/2025/12/Social-Dictionary.pdf
- YPulse, coolest and cringiest brand moves, 27 Oct 2025: https://www.ypulse.com/article/2025/10/27/the-coolest-and-cringiest-things-brands-do-according-to-gen-z/

**Step-competition products and anti-cheat**

- Apple, Share Activity and compete (Apple Watch User Guide): https://support.apple.com/guide/watch/apd68a69f5c7/watchos
- Apple Support, Activity sharing (HT207014), 10 Mar 2026: https://support.apple.com/en-us/HT207014
- 9to5Google, Fitbit removing Challenges and Adventures, 17 Feb 2023: https://9to5google.com/2023/02/17/fitbit-challenges-adventures
- 9to5Google, Fitbit Challenges and Groups removed, 27 Mar 2023: https://9to5google.com/2023/03/27/fitbit-challenges-groups-removed
- 9to5Google, Google Health and Fitbit features, 7 May 2026: https://9to5google.com/2026/05/07/google-health-fitbit-features
- Samsung Support, Together challenges: https://www.samsung.com/us/support/answer/ANS10001382
- Samsung Newsroom, group challenge feature, 5 Jan 2021: https://news.samsung.com/uk/achieve-your-new-years-resolution-with-new-group-challenge-feature-in-samsung-health
- SamMobile, Samsung Health Together ending for minors, 9 Sep 2026: https://www.sammobile.com/news/samsung-health-together-feature-ending-minor-users
- Garmin blog, Connect challenges, 14 Oct 2016: https://www.garmin.com/en-US/blog/?p=25788
- Strava Support, segment leaderboards and Local Legends: https://support.strava.com/hc/en-us/articles/360043099552
- Strava Support, club leaderboards: https://support.strava.com/hc/en-us/articles/216918347
- BikeRadar, Strava cracks down on leaderboard cheats, 21 May 2025: https://www.bikeradar.com/news/strava-cracks-down-on-leaderboard-cheats
- BikeRadar, Strava deletes 2.3M e-bike activities, 28 Jan 2026: https://www.bikeradar.com/news/strava-deletes-2-3m-electric-bike-activities
- Peloton blog, community features: https://www.onepeloton.com/blog/peloton-community-features
- Duolingo blog, Friend Streak, 5 Aug 2024: https://blog.duolingo.com/friend-streak
- Snapchat Support, Snapstreaks: https://help.snapchat.com/hc/en-us/articles/7012394193684
- Pacer, step challenges: https://www.mypacer.com/step-challenge
- Pacer blog, step challenge rules, 20 Jul 2026: https://blog.mypacer.com/blog/step-challenge-rules
- StepUp on the App Store: https://apps.apple.com/us/app/-/id979101825
- StepUp website: https://thestepupapp.com
- WeWard terms (EU), 25 Sep 2026: https://www.wewardapp.com/eu-cgu-12-24-en
- WeWard blog, Walking Mode, 8 Jul 2026: https://www.wewardapp.com/blog/walking-mode
- Sweatcoin, verification algorithm: https://swcapp.com/verification-algorithm
- Pikmin Bloom, weekly challenges FAQ: https://scopelyexplore.helpshift.com/hc/en/11-pikmin-bloom/faq/2143-weekly-challenges
- Pokémon GO, gameplay fairness policy: https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/39-gameplay-fairness-policy-1701994322
- Opal Help, how Opal reports screen time: https://help.opalapp.com/v3/how-when-and-where-does-opal-report-your-screen-time
- Jomo Help, Squads: https://help.jomo.so/en/article/how-do-squads-work-on-jomo-1poxmiy
- Stroll on the App Store (global and country boards, v1.6): https://apps.apple.com/us/app/stroll-steps-to-screen-time/id6782306709
- Lockt on the App Store (monthly leagues, v2.5.1): https://apps.apple.com/us/app/lockt-walk-to-unlock/id6744921343
- WalkLock on the App Store: https://apps.apple.com/us/app/walklock-walk-to-unlock-apps/id1633153202
- Steppin on the App Store: https://apps.apple.com/us/app/steppin-steps-for-screen-time/id6737981423
- MoveSpring Help, step caps and grace periods: https://help.movespring.com/en/articles/4195562
- NYC Steptember 2020 challenge rules (35,000/day cap): https://www.nyc.gov/assets/olr/downloads/pdf/wellness/steptember2020-challenge-rules-guidelines.pdf
- YuMuuv, wellness challenge rewards guide: https://www.yumuuv.com/blog/wellness-challenge-rewards-guide
- Personify Health Help, challenge rules: https://personifyhealth.zendesk.com/hc/en-us/articles/28341969035419
- Stridekick, keeping challenge prizes fair: https://www.stridekick.com/blog/12-ways-to-keep-challenge-prizes-fun-fair-and-cheater-proof
- Sixth Tone, WeRun step-faking pendulums, 28 Jun 2018: https://www.sixthtone.com/news/1002530
- The Heights (Boston College), 200,000-step days, 23 Oct 2016: https://www.bcheights.com/?p=123351
- Tudor-Locke et al. 2019, walking cadence thresholds, IJBNPA: https://ijbnpa.biomedcentral.com/track/pdf/10.1186/s12966-019-0769-6
- TestDevLab, can you cheat fitness apps (updated 31 Mar 2026): https://www.testdevlab.com/blog/testing-fitness-apps-can-you-cheat-the-algorithm
- Apple, HKMetadataKeyWasUserEntered: https://developer.apple.com/documentation/healthkit/hkmetadatakeywasuserentered
- Android Health Connect, metadata and recording method: https://developer.android.com/health-and-fitness/health-connect/metadata
- Apple, Assessing fraud risk (App Attest): https://developer.apple.com/documentation/devicecheck/assessing-fraud-risk
- Play Integrity verdicts: https://developer.android.com/google/play/integrity/verdicts

**Sharing, previews and invites**

- Meta, Sharing to Instagram Stories: https://developers.facebook.com/docs/instagram-platform/sharing-to-stories/
- react-native-share, shareSingle: https://react-native-share.github.io/react-native-share/docs/share-single
- Snap Creative Kit overview and review rules: https://developers.snap.com/snap-kit/creative-kit/overview
- TikTok Share Kit (iOS), Aug 2026: https://developers.tiktok.com/doc/share-kit-ios-quickstart-v2
- WhatsApp, link previews: https://developers.facebook.com/docs/whatsapp/link-previews
- WhatsApp blog, 16 Jun 2025 (Updates tab): https://blog.whatsapp.com/helping-you-find-more-channels-and-businesses-on-whatsapp
- Apple TN3156, Rich previews for Messages: https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages
- Meta, images for link sharing: https://developers.facebook.com/docs/sharing/webmasters/images/
- Firebase Dynamic Links FAQ (shut down 25 Aug 2025): https://firebase.google.com/support/dynamic-links-faq/
- AppsFlyer Zero plan update 2026: https://www.appsflyer.com/zero-update-2026/
- Airbridge, attribution pricing comparison, 2 Sep 2026: https://www.airbridge.io/tips/mobile-attribution-pricing-plans-contract-terms
- Google Play Install Referrer: https://developer.android.com/google/play/installreferrer/library
- Apple UIPasteControl: https://developer.apple.com/documentation/uikit/uipastecontrol
- Apple, User privacy and data use (no fingerprinting): https://developer.apple.com/app-store/user-privacy-and-data-use/
- Andrew Chen, More retention, more viral growth: https://andrewchen.com/more-retention-more-viral-growth/
- Extole, referral benchmarks, 16 Mar 2026: https://success.extole.com/en/articles/11199311-how-to-measure-and-benchmark-your-referral-program-success
- ReferralHero, fitness app referral case study, 2026: https://referralhero.com/blog/fitness-app-referral-program-case-study
- Lazyweb, share of apps with referral by vertical, Jul 2026: https://www.lazyweb.com/research/percent-apps-referral-invite-by-vertical

**Store rules, privacy law and identity**

- Apple App Review Guidelines (updated 8 Jun 2026): https://developer.apple.com/app-store/review/guidelines/
- Apple, Offering account deletion in your app: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Apple, App privacy details: https://developer.apple.com/app-store/app-privacy-details/
- Apple, Age ratings values and definitions: https://developer.apple.com/help/app-store-connect/reference/age-ratings-values-and-definitions/
- Apple news, social media age-rating questions, 9 Jul 2026: https://developer.apple.com/news/?id=tlur8uvi
- Apple news, Declared Age Range and state laws: https://developer.apple.com/news/?id=sg176nne
- Apple news, significant change approvals: https://developer.apple.com/news/?id=f5zj08ey
- Apple, Age assurance: https://developer.apple.com/support/age-assurance
- Texas SB 2420: https://capitol.texas.gov/tlodocs/89R/billtext/html/SB02420F.htm
- Google Play, User Generated Content policy: https://support.google.com/googleplay/android-developer/answer/9876937
- Google Play, Account deletion requirements: https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play, User Data policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play, Data safety form: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play, Health apps declaration: https://support.google.com/googleplay/android-developer/answer/16679511
- Google Play, Content ratings: https://support.google.com/googleplay/android-developer/answer/9898843
- Google Play, Age Signals API (beta): https://developer.android.com/google/play/age-signals/overview
- Google Play, Families policy: https://support.google.com/googleplay/android-developer/answer/9893335
- GDPR (Regulation 2016/679): https://eur-lex.europa.eu/eli/reg/2016/679/oj
- Article 29 Working Party, health data in apps and devices (annex, 2015): https://ec.europa.eu/justice/article-29/documentation/other-document/files/2015/20150205_letter_art29wp_ec_health_data_after_plenary_annex_en.pdf
- EDPB Guidelines 03/2020: https://www.edpb.europa.eu/system/files/documents/files/file1/edpb_guidelines_202003_healthdatascientificresearchcovid19_en.pdf
- UK ICO, What is special category data: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/
- SCC Online, DPDP Rules 2025 notified, 14 Nov 2025 (secondary): https://www.scconline.com/blog/post/2025/11/14/meity-notified-digital-personal-data-protection-rules-2025/
- FTC, COPPA FAQ: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- Australia, Online Safety (Age-Restricted Social Media Platforms) Rules 2025: https://www.legislation.gov.au/F2025L00889/latest/text
- Apple, identifierForVendor: https://developer.apple.com/documentation/uikit/uidevice/identifierforvendor
- Apple, kSecAttrSynchronizable: https://developer.apple.com/documentation/security/ksecattrsynchronizable
- Apple, Restricting keychain item accessibility: https://developer.apple.com/documentation/security/restricting-keychain-item-accessibility
- Apple Developer Forums, keychain after app deletion: https://developer.apple.com/forums/thread/36442
- Apple, DeviceCheck (DCDevice): https://developer.apple.com/documentation/devicecheck/dcdevice
- Apple, Establishing your app's integrity (App Attest): https://developer.apple.com/documentation/devicecheck/establishing-your-app-s-integrity
- Android 8.0 behaviour changes (ANDROID_ID): https://developer.android.com/about/versions/oreo/android-8.0-changes
- Android, Best practices for unique identifiers: https://developer.android.com/identity/user-data-ids
- Android, Block Store: https://developer.android.com/identity/block-store
- Android, Auto Backup: https://developer.android.com/identity/data/autobackup
- Play Integrity API overview and device recall: https://developer.android.com/google/play/integrity/overview

**Cloudflare**

- Workers limits (12 Oct 2026): https://developers.cloudflare.com/workers/platform/limits/
- Workers pricing (2 Oct 2026): https://developers.cloudflare.com/workers/platform/pricing/
- Workers Static Assets billing: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- D1 limits: https://developers.cloudflare.com/d1/platform/limits/
- KV pricing: https://developers.cloudflare.com/kv/platform/pricing/
- KV limits: https://developers.cloudflare.com/kv/platform/limits/
- Durable Objects pricing: https://developers.cloudflare.com/durable-objects/platform/pricing/
- Durable Objects limits: https://developers.cloudflare.com/durable-objects/platform/limits/
- R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Queues pricing: https://developers.cloudflare.com/queues/platform/pricing/
- Cache API: https://developers.cloudflare.com/workers/runtime-apis/cache/
- Rate Limiting binding: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- WAF rate limiting rules: https://developers.cloudflare.com/waf/rate-limiting-rules/
- Turnstile plans: https://developers.cloudflare.com/turnstile/plans/
- Workers Analytics Engine pricing: https://developers.cloudflare.com/analytics/analytics-engine/pricing/
- HTMLRewriter: https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/
- Workers Web Crypto: https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
- Firebase Cloud Messaging HTTP v1: https://firebase.google.com/docs/cloud-messaging/send/v1-api
- Google OAuth 2.0 for service accounts: https://developers.google.com/identity/protocols/oauth2/service-account
- workers-og (satori + resvg on Workers): https://github.com/kvnang/workers-og

Internal: growth-research/MOZY_GROWTH_RESEARCH.md and IMPLEMENTATION_PLAN.md (12 Oct 2026); v3/06-STEP-CIRCLES-AND-CLOUDFLARE.md (22 Sep 2026); app code at f5cbd05 and 42a5291; website code at ef5809a; Cloudflare account read through the connector on 14 Oct 2026.

*Prepared with Claude for Mahesh Chambhare · MCRUDRA · mcrudra.com · @mcrudrax*
