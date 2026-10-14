# Mozy Race: feature catalogue

Use this file to choose what to build first. Every item lists the work in each project, what it depends on, and a rough size:
- **S**: a few days.
- **M**: 1–2 weeks.
- **L**: more than 2 weeks.
- **–**: no work in that project.

**Foundations (B1–B10)** must exist before any race feature works. **Features (X1–X36)** are optional, and the owner picks them. Evidence for each idea is in `PLAN.md` (R = research, C = constraint); API shapes are in `CONTRACT.md`.

---

## Foundations

### B1 · Race backend skeleton
- **What:** the `mozy-race` Worker and D1 database, covering:
  - profiles (create, edit, delete);
  - the step upload with validation;
  - bearer-token auth and rate limits;
  - the Cron skeleton and health checks.
- **Backend:** schema migration `0001`, plus endpoints `POST/PATCH/DELETE /v1/profile`, `POST /v1/profile/recover` and `PUT /v1/steps`. Details in `BACKEND.md`.
- **App:** –. **Website:** –.
- **Needs:** D7, D11, D18, D19.
- **Size:** backend M.
- **Done when:**
  - a test client can create a profile, upload two days and delete everything;
  - repeated uploads write nothing;
  - bad input is rejected.

### B2 · Race identity in the app
- **What:** "no sign-up" accounts. A random token lives in the iOS Keychain (synchronizable, so it survives reinstalls and reaches new iPhones) or in Android Block Store, plus a "Mozy ID" recovery code. No device IDs (C10).
- **App:**
  - native modules `RaceIdentity` for iOS (Swift, Keychain, DeviceCheck bit) and Android (Kotlin, Block Store);
  - `src/race/identity.ts`;
  - a restore prompt on a fresh install;
  - a recovery code screen.
- **Backend:** recovery endpoint (in B1).
- **Website:** –.
- **Needs:** B1, D15.
- **Size:** app M.
- **Done when:** deleting and reinstalling Mozy signs straight back in on both platforms, and the recovery code works on a second phone.

### B3 · Race-day steps and sync
- **What:** today's and yesterday's totals for the fixed race day (D3, 4 AM–4 AM local), sent at the right moments with retry and backoff.
- **App:**
  - iOS: `CMPedometer` query for race-day windows in `StepCounterModule.swift`;
  - Android: a 4 AM bucket in `StepTrackingService.kt` for users whose reset hour isn't 4;
  - `src/race/raceDay.ts` (pure, tested) and `src/race/sync.ts`.
- **Backend:** `PUT /v1/steps` (in B1).
- **Website:** –.
- **Needs:** B1, B2, D3.
- **Size:** app M.
- **Done when:** totals match Home for default users, survive reboots and time-zone changes, and are never counted twice.

### B4 · Join flow and consent
- **What:** 3 screens:
  1. intro;
  2. race name, pet colour and country flag;
  3. who sees you (no default), plus birth month and year, race rules and consent.
- **App:** `src/screens/race/JoinRaceFlow.tsx`; name check mirroring the server.
- **Backend:** the name filter and age-band rules.
- **Website:** race rules and privacy text on `/privacy`.
- **Needs:** B1, B2, D1, D2, D4, D5, D12, D14.
- **Size:** app M, backend S, web S.
- **Done when:**
  - nothing leaves the phone before consent;
  - an under-13 can't join;
  - a rejected name gets a clear message.

### B5 · Race screen shell and entry points
- **What:**
  - the Race screen with arena tabs, period chips, hero card, rows, empty states and loading;
  - a fourth Home header button;
  - a one-time Home card.
- **App:**
  - `RaceScreen.tsx` and `src/components/race/*`;
  - `CommandCenter.tsx:603-628` and `HomeScreen.tsx:229-245`;
  - a new route in `RootNavigator.tsx` and `types/index.ts:290`.
- **Backend:** `GET /v1/me/boards`.
- **Website:** –.
- **Needs:** B4.
- **Size:** app M.
- **Done when:** the screen matches mockups A–B in `report.html` and works offline with cached boards.

### B6 · Links into the app
- **What:**
  - Universal Links (iOS) and App Links (Android) for `https://mozy.mcrudra.com/j/*` and `/d/*`;
  - `mozy://race` routes;
  - an invite that arrives before setup is finished waits until setup is done.
- **App:**
  - Associated Domains entitlement `applinks:mozy.mcrudra.com`;
  - Android intent filter with `autoVerify`;
  - routes in `linking.ts:16-25`;
  - a pending invite stored in MMKV.
- **Website:** `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` (`CONTRACT.md` §5).
- **Backend:** –.
- **Needs:** B7.
- **Size:** app S–M, web S.
- **Done when:** tapping an invite in WhatsApp opens Mozy on both platforms.

### B7 · Website live on mozy.mcrudra.com, plus a Worker script
- **What:**
  - move mozy.mcrudra.com from the mcrudra-web Worker to the `mozy` site Worker (the README's "Going live" steps);
  - add a small Worker entry for dynamic pages (`/j/*`, `/d/*`).
- **Website:** see `WEB.md` W0–W1.
- **Owner:** the Cloudflare dashboard domain switch.
- **Needs:** –.
- **Size:** web S–M.
- **Done when:** mozy.mcrudra.com serves this repo's build, and `/j/TEST01` returns a page with per-link OG tags.

### B8 · Safety, deletion and compliance
- **What:**
  - report and block;
  - a review tool;
  - deletion in the app and on the web;
  - updated privacy policy, App Store privacy label, Play Data safety form and age-rating answers;
  - minor gating per D5;
  - the Texas, Utah and Louisiana significant-change flow.
- **App:** report and block UI; "delete my race profile".
- **Website:** `/delete` and the rewritten `/privacy`.
- **Backend:** `POST /v1/reports`, `POST /v1/blocks` and `POST /v1/deletion-request`; auto-hide after 3 reports; an admin view behind Cloudflare Access.
- **Owner:** the store forms.
- **Needs:** D5, D13, D14.
- **Size:** app S, web S, backend S.
- **Done when:** the `PLAN.md` §3.4 checklist is all ticked.

### B9 · iPhone free path
- **What:** whatever D6 decides, so that invited iPhone users can race without paying.
- **App:** a `PaywallScreen.tsx` / `setupStage.ts` change (owner decision; touches the paywall, so only after D6).
- **Website:** pricing copy if needed.
- **Needs:** D6.
- **Size:** app S–M.
- **Done when:** a fresh iPhone install from an invite reaches the race without a purchase.

### B10 · Measurement
- **What:** the race events in `CONTRACT.md` §8: Firebase on Android, PostHog on the website, and the server's own daily counts (iOS has no analytics today).
- **App, web and backend:** S each.
- **Needs:** B1.
- **Done when:** K1–K10 in `PLAN.md` §11 can be read every week.

---

## Features

### X1 · Crews (friends) · phase 1
- **What:** groups of 2–50 people who know each other, with today, week and month boards. Up to 5 crews per person. Joining is by link, QR code or a 6-character code.
- **User story:** as a walker I want to race my friends this week, so that I walk more and have a reason to message them.
- **App:**
  - Crews tab;
  - crew picker;
  - create-crew sheet;
  - crew board;
  - leave crew;
  - an owner can remove members.
- **Backend:** `crews` and `crew_members`; `POST /v1/crews`; `POST /v1/crews/join`; `GET /v1/crews/{id}/board` (read live, cached 60 s); `DELETE /v1/crews/{id}/members/{me|id}`.
- **Website:** – (invites are X5).
- **Needs:** B1–B6, B8.
- **Size:** app M, backend M.
- **Evidence:** R1, R2.
- **Done when:** two phones in one crew see each other's totals within a sync.

### X2 · Family crews · phase 1
- **What:** a crew of kind "family", with its own icon and copy. A shared family goal bar comes in phase 2, and fairness mode is X35.
- **App:** S. **Backend:** S (`kind`). **Website:** –.
- **Needs:** X1.
- **Evidence:** R7 (BE FIT +953 steps a day).

### X3 · World board · phase 1
- **What:** everyone public:
  - percentile first ("top 18%");
  - the top 3;
  - the 3 people above and below you;
  - today, week and month.
- **App:** the World tab (mockup B).
- **Backend:**
  - a snapshot Cron every 10 minutes;
  - `period_base`;
  - rank lookup;
  - `GET /v1/me/boards`;
  - `GET /v1/boards/world/...`.
- **Website:** `/leaderboard` (mockup E).
- **Needs:** B1–B5, B8, D1, D10.
- **Size:** app M, backend M, web M.
- **Evidence:** R12, R13.
- **Done when:** ranks are right across time zones and the page loads from the edge cache.

### X4 · Country board · phase 1
- **What:** the same as X3 for each country. A country's ranks appear once it has ≥10 public walkers; below that the board says "be the first walker from Kenya".
- **App:** the country tab with a flag. **Backend:** a board per country. **Website:** `/leaderboard/{country}`.
- **Needs:** X3, D2.
- **Size:** app S, backend S, web S.

### X5 · Invites · phase 1
- **What:**
  - invite links `mozy.mcrudra.com/j/{code}`, a QR code and the share-sheet text;
  - the Play install referrer carries the code through an Android install;
  - an iPhone paste button (`UIPasteControl`) and manual code entry.
- **App:**
  - invite sheet;
  - QR screen;
  - Install Referrer read once at first launch;
  - paste and enter code;
  - a pending invite kept through onboarding.
- **Website:** `/j/{code}` page (mockup F) with per-link OG title, a fixed OG image and store buttons.
- **Backend:** `GET /v1/public/invite/{code}`.
- **Needs:** B6, B7, X1; D6 for iPhone.
- **Size:** app M, web M, backend S.
- **Done when:** all three cases in `PLAN.md` §5.3 work.

### X6 · Share cards · phase 1
- **What:** cards rendered on the phone:
  - formats: 9:16 story, square, and text;
  - templates: today in my crew, week result, percentile (top half only);
  - every card has a QR code and the short link.
- **App:** `react-native-view-shot`, `expo-sharing` and `react-native-qrcode-svg` (native rebuild); card templates; a once-a-day offer after passing someone.
- **Website:** the OG image asset.
- **Backend:** –.
- **Needs:** X1 or X3 for the numbers.
- **Size:** app M, web S.
- **Evidence:** Duolingo percentile cards raised sharing.

### X7 · Week grid text · phase 1, can ship before the backend
- **What:** `🟩🟩🟨🟩⬜🟩🟩 · 52,140 steps` plus the link. It adds "#2 in sharma fam" once crews exist.
- **App:** S (local data only). **Web / backend:** –.
- **Needs:** only local history; X1 for the rank line.
- **Evidence:** Wordle's emoji grid.

### X8 · "Steps to pass" nudge · phase 1
- **What:** the hero card shows the gap to the next person.
- **App:** S. **Backend:** the gap comes in board responses.
- **Needs:** X1 or X3.
- **Evidence:** R4 (goal gradient).

### X9 · Overtake notifications, local · phase 1
- **What:** "papa passed you · 140 steps behind". At most 2 race notifications a day, none 22:00–08:00, and each type can be switched off.
- **App:**
  - rank comparison after each sync;
  - Android: from the step service all day;
  - iPhone: only when the app wakes.
- **Needs:** X1, B3, D8.
- **Size:** app S–M.
- **Evidence:** R9.

### X10 · Crowns · phase 1
- **What:** the day's and week's top walker in each crew gets a 👑 on their pet until the next result.
- **Backend:** the `crowns` table plus a daily and Monday Cron. **App:** the crown on avatars and cards.
- **Needs:** X1, D9.
- **Size:** app S, backend S.
- **Evidence:** R5.

### X11 · Weekly leagues · phase 2
- **What:**
  - groups of 30 matched by 2–4-week step average and time zone (±3 h);
  - tiers, starting with 5;
  - top 7 move up and bottom 5 drop;
  - points are steps capped per day (D16).
- **Backend:** a Monday matchmaking Cron, `league_members`, league boards and results. **App:** the League screen (mockup C), tier badges and result cards.
- **Gate:** ≥500 people racing weekly.
- **Needs:** X3, D16.
- **Size:** app M, backend L.
- **Evidence:** R3, R5; Duolingo +17%.

### X12 · Step-offs (1v1) · phase 2
- **What:** challenge one person for 1, 3 or 7 days via `/d/{code}`; a result card and "rematch".
- **Backend:** `duels` and endpoints. **App:** a challenge sheet, step-off screen and result. **Website:** `/d/{code}`.
- **Needs:** X5 infrastructure.
- **Size:** app M, backend M, web S.

### X13 · Pet reactions · phase 2
- **What:** 5 fixed stickers between crew members. No text (C7).
- **Backend:** `reactions`, rate-limited. **App:** a sticker tray on rows.
- **Needs:** X1, D13.
- **Size:** app S, backend S.

### X14 · Hall of fame and monthly awards · phase 2
- **What:** awards on the 1st of each month:
  - walker of the month (world, and each country with ≥50 walkers);
  - most improved;
  - iron walker;
  - top crew.

  They appear on the website, as in-app badges and on cards. A "this month's walkers" strip on the landing page needs the owner's OK (the story's chapter order is fixed).
- **Backend:** an awards Cron and `GET /v1/public/awards/{month}`. **Website:** `/awards`, `/awards/{yyyy-mm}`. **App:** badges and cards.
- **Needs:** X3, X4, D9, D10.
- **Size:** app S, backend M, web M.
- **Rule:** never use a winner's steps in marketing without separate permission (C11).

### X15 · Weekly world total ticker · phase 2
- **What:** "41,882,310 steps walked by Mozy walkers this week" on the website. Shown only once the number is worth showing.
- **Backend:** `GET /v1/public/stats`. **Website:** a ticker on `/leaderboard` and optionally the landing page.
- **Needs:** X3.
- **Size:** backend S, web S.

### X16 · Most improved board · phase 2
- **What:** gain against your own last 4 weeks; fair to beginners.
- **Backend:** baselines from daily and monthly rows. **App:** a tab or filter.
- **Needs:** X3.
- **Size:** S each.
- **Evidence:** R13.

### X17 · Consistency board · phase 2
- **What:** days with at least 8,000 steps in the week or month.
- **Backend:** S. **App:** S.
- **Needs:** X3.
- **Evidence:** R13.

### X18 · Country cup · phase 2
- **What:** countries ranked by average steps per active walker (minimum 50 walkers).
- **Backend:** S. **App:** S. **Website:** S.
- **Needs:** X4.

### X19 · Push notifications (FCM) · phase 2
- **What:** overtakes, Sunday "final hours", weekly results and awards, delivered even when the app is asleep. FCM delivers to iPhones too.
- **App:** `@react-native-firebase/messaging`; registering a push token. **Backend:** `push_tokens`; an FCM HTTP v1 sender (OAuth JWT via WebCrypto, UNVERIFIED end to end).
- **Needs:** X9, D8; a privacy-label update.
- **Size:** app M, backend M.

### X20 · Founder crew "walk with mahesh" · phase 2
- **What:** an official crew anyone can join from a public code, with a raised size cap; MCX content from real walks only.
- **Backend:** an `official` flag and cap. **App:** a badge.
- **Needs:** X1 (or X23).
- **Size:** S.

### X21 · Rival of the week · phase 2
- **What:** one person just ahead of you with a similar average, shown on the Race screen.
- **Backend:** S. **App:** S.
- **Needs:** X3 or X11.
- **Evidence:** R14.

### X22 · Race your Mozy · phase 1 or 2, can ship before the backend
- **What:** your pet walks at your own last-week pace, and you race it. It's always labelled as your Mozy, never a fake person (C5).
- **App:** S (local data only). **Web / backend:** –.
- **Evidence:** StepUp's bots give everyone a beatable rival.

### X23 · Open crews · phase 3
- **What:** college, office or gym crews of up to 500, ranked by average, joined by code only (no search).
- **Backend:** M. **App:** M. More moderation work.
- **Needs:** X1, B8, D13.

### X24 · Race widget · phase 3
- **What:** "#2 in sharma fam · 312 to pass papa" on the Home Screen.
- **App:** M (WidgetKit plus an Android widget; Mozy already has widgets).
- **Needs:** X1.

### X25 · iOS Live Activity · phase 3
- **What:** Sunday's final hours of a crew week or league, live on the Lock Screen.
- **App:** M.
- **Needs:** X1 or X11, and X19.

### X26 · Seasons · phase 3
- **What:** quarterly seasons with cosmetic rewards for the tier reached.
- **Backend:** M. **App:** M.
- **Needs:** X11, D9.
- **Evidence:** R15.

### X27 · Events · phase 3
- **What:** time-boxed challenges: New Year week (1–7 Jan), National Walking Day, festival weeks.
- **Backend:** S each. **App:** S. **Website:** an event page.
- **Needs:** X1 or X3.
- **Evidence:** R6.

### X28 · "Last walker standing" · phase 3, experiment
- **What:** a crew game where the lowest walker each day is out, until one is left.
- **Backend:** M. **App:** M.
- **Needs:** X1.

### X29 · "Walk o'clock" · test only
- **What:** a daily random window; steps inside it count for a mini-board.
- **Conflict:** this needs a total for the window, which goes beyond one total per day (C1). It needs the owner's OK. Novelty fades (BeReal).
- **Backend:** M. **App:** M.

### X30 · Race Wrapped · December
- **What:** a monthly or yearly recap with percentile, built mostly on the phone.
- **App:** M. **Backend:** S (percentiles).
- **Needs:** X3.

### X31 · Streak freezes, repair and "welcome back" · phase 2
- **What:** a race streak (days ≥5,000), freezes earned by walking, and a way to repair a broken streak.
- **App:** S–M. **Backend:** S.
- **Needs:** X1.
- **Evidence:** R10.

### X32 · Buddy quests · phase 2
- **What:** two people, a shared target; both must finish.
- **Backend:** M. **App:** M.
- **Needs:** X1.
- **Evidence:** R8 (Köhler effect).

### X33 · Rookie week · phase 2
- **What:** new racers spend their first league week with other newcomers.
- **Backend:** S.
- **Needs:** X11.
- **Evidence:** Gen Z find starting intimidating.

### X34 · Crew vs crew · phase 2
- **What:** two crews race for a week, ranked by average per member.
- **Backend:** M. **App:** M. **Website:** S (result page, optional).
- **Needs:** X1.
- **Evidence:** R7.

### X35 · Family goal-day mode · phase 2
- **What:** each person scores the % of their own daily goal.
- **Backend:** S. **App:** S.
- **Needs:** X2, D17.
- **Evidence:** Apple and Fitbit.

### X36 · Friend streaks · phase 2
- **What:** a streak with one friend; you both walk ≥5,000 steps to keep it alive.
- **Backend:** M. **App:** M.
- **Needs:** X1.
- **Evidence:** Duolingo Friend Streak +22%.

---

## How the pieces depend on each other

```text
B7 website live ─► B6 links ─► X5 invites ─► X12 step-offs
B1 backend ─► B2 identity ─► B3 steps & sync ─► B4 join ─► B5 race screen ─┬─► X1 crews ─┬─► X2 family ─► X35 goal-day
                                                                           │             ├─► X8, X9, X10, X13, X31, X32, X34, X36
                                                                           │             └─► X23 open crews ─► X20
                                                                           └─► X3 world ─► X4 country ─► X18 cup
                                                                                   └─► X11 leagues ─► X21, X26, X33
B8 safety & compliance and B9 iPhone path: required before any public launch
No backend needed: X7 week grid, X22 race your Mozy
```

## Bundles to choose from (examples, not a decision)

| Bundle | Contents | Gives you | Rough size |
|---|---|---|---|
| **0 · Quick wins, no backend** | X7, X22 (+ the S2 daily card from the growth plan) | Something to share while the backend is built | ~1–2 weeks of app work |
| **A · Crews MVP** | B1–B10 + X1, X2, X5, X6, X8, X9 (Android), X10 | The invite engine: race friends and family, share, invite | ~5–7 weeks across the three parts |
| **B · Public boards** | X3, X4 + `/leaderboard` | The global and country race you asked for | +2–3 weeks after A's foundations |
| **C · Leagues** | X11, X21, X33 (+ X19 push) | A winnable global race for everyone | +3–4 weeks; needs ≥500 weekly racers |
| **D · Awards and web** | X14, X15, X18 | Hall of fame, landing-page social proof | +2 weeks |
| **E · Retention extras** | X13, X16, X17, X31, X32, X34–X36 | Reasons to come back | Pick and mix |

The foundations take the longest. Most of B1–B9 is needed whichever bundle comes first, because every bundle except 0 needs accounts, sync, links and compliance.
