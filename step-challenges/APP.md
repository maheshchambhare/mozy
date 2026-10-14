# Mozy Race in the React Native app

This is the build plan for the **Mozy app** repo: `/Users/mahesh/Desktop/Projects/react-native/stepscroll`, feature worktree `.claude/worktrees/step-challenges`, branch `step-challenges` (from `mozyv3`).

**The other parts:**
- **Website:** `/Users/mahesh/Desktop/Projects/mcrudra.com/MOZY`, feature worktree `.claude/worktrees/step-challenges`, branch `step-challenges` (from `main`). It serves the invite pages `/j/{code}` and `/d/{code}`, the link files that make those URLs open the app, the public leaderboard, and the deletion form. Its plan is `WEB.md` in the same folder.
- **Backend:** the `mozy-race` Cloudflare Worker + D1; its code lives where D18 decides (recommended: the website repo, `race-api/`). Its plan is `BACKEND.md`.
- **Shared shapes** (API, links, codes, events): `CONTRACT.md`. **Order of work:** `FEATURES.md`. **Open decisions:** `DECISIONS.md`.

References are `path:line` at `42a5291`.

---

## 1. What the app has today (FACT)

| Area | Today | Where |
|---|---|---|
| Steps on iOS | CMPedometer only (no HealthKit entitlement). Live updates from the logical-day start; `getTodaySteps`; the native side can rebuild the last 7 reset-hour windows | `ios/mozy/StepCounterModule.swift:47-136`; `ios/mozy/WidgetSync.swift:396-450` |
| Steps on Android | `TYPE_STEP_COUNTER` in a foreground service; the ride filter removes bus and bike steps; daily snapshot `history_YYYY-MM-DD` = `walked,earned,consumed,stepPenalty,freedomPass` | `StepTrackingService.kt:42,93,420,542-597`; `RideRecognition.kt:42-78`; `StepFilter.kt:3-25` |
| Day boundary | Logical day starts at a user-adjustable reset hour (default 4 AM; Settings offers 12–9 AM) | `src/services/creditEngine.ts:58-70,93-96`; `useUserStore.ts:89-96`; `SettingsScreen.tsx:2922-2953`; `MozyDay.kt:16-56`; `WidgetSync.swift:219-256` |
| Name | MMKV `user_name`, trimmed, ≤20 characters at onboarding (≤18 in Settings), no content rules | `src/screens/onboarding/Step4Name.tsx:24,71-77,136-142`; `SettingsScreen.tsx:2493` |
| Storage | Zustand persist in MMKV `mozy-storage`, **unencrypted** | `useUserStore.ts:1947-1949`; `src/services/storage.ts:6-12` |
| Network | None: no fetch, axios, URLSession or OkHttp | – |
| Background | iOS `BGAppRefreshTask` for steps; Android WorkManager workers exist | `ios/mozy/AppDelegate.swift:60-71`; `DailyResetWorker.kt`; `StepTrackingWatchdogWorker.kt` |
| Notifications | No library, no push. iOS asks permission natively; Android posts from the service | `ShortsDetectionModule.swift` (~:708); `useNotificationPermission.ts:44-54`; `StepTrackingService.kt:145-173` |
| Links | `mozy://` only (`plead`, `freedom-pass`); links are ignored until setup is done; no Associated Domains; no App Links | `src/navigation/linking.ts:16-25`; `ios/mozy/mozy.entitlements`; `AndroidManifest.xml:84-89` |
| Navigation | One native stack, no tabs (`bottom-tabs` installed, unused). Routes include Home, Stats, Settings, Paywall, Guide (new, bug 98), Plead | `RootNavigator.tsx:11,32,45-162`; `src/types/index.ts:290-312` |
| Home header | Freedom Pass, Stats, Settings | `CommandCenter.tsx:603-628`; `HomeScreen.tsx:229-245` |
| iPhone paywall | Can't be closed by a non-subscriber during onboarding | `PaywallScreen.tsx:538-541,805-809,1115-1127`; `setupStage.ts:17-20` |
| Sharing | None (only a debug log share); no view-shot, sharing or QR libraries | `src/screens/sandbox/NativeTestBench.tsx:58` |
| Analytics | Firebase, Android release builds only | `src/utils/analytics.ts:8-21` |
| Theme | `D` = `#FAF9F7` / `#121212` / `#FF8A00` / `#6B7280`; `S` adds `#FAF7F2`, `#1C1917`, `#B85F00`, `#10B981` and more; Plus Jakarta Sans 400–800; `CTAButton`; mascot views | `OnboardingShared.tsx:41-50,364`; `setup/SetupParts.tsx:33-60`; `src/theme/fonts.ts:1-7`; `src/components/companions/*` |
| Identifiers | iOS bundle `com.mcrudra.mozy.app`, Team `4J34FUNCUZ`; Android package `com.moxstudio.mozy` | `ios/*.xcodeproj/project.pbxproj`; `android/app/build.gradle:54-56` |

---

## 2. New code, by layer (PROPOSAL)

```text
src/race/
  config.ts          API base per environment (CONTRACT §1)
  api.ts             fetch wrapper: bearer token, X-Mozy-Client, timeouts, error codes → typed results
  identity.ts        token and recovery code via the native RaceIdentity module (never MMKV)
  raceDay.ts         pure 4 AM race-day maths (DST, travel, reset hour ≠ 4) · unit-tested
  sync.ts            when to upload, offline queue, backoff, next_sync_s
  store.ts           zustand slice: profile (non-secret), boards cache, pending invite, notification state
  names.ts           mirror of the server's name rules (fast feedback; the server decides)
  share.ts           card models from stored values only (C5)
  types.ts
src/screens/race/
  RaceScreen.tsx         arena tabs (crews · country · world), period chips, hero card, rows   (mockups A–B)
  JoinRaceFlow.tsx       3 steps: intro · profile · who sees you + age + rules + consent      (B4)
  RaceProfileScreen.tsx  edit name, pet, flag, visibility · Mozy ID · leave crews · delete    (B2, B8)
  CreateCrewSheet.tsx · JoinCrewSheet.tsx (paste or type a code) · InviteSheet.tsx (share + QR)
  ShareCardSheet.tsx     preview → share (X6)
src/components/race/
  HeroRankCard.tsx · BoardRow.tsx · PetAvatar.tsx (wraps companions/MozyFace, adds pet colours and crown)
  ArenaTabs.tsx · PeriodChips.tsx · cards/{TodayCard, WeekResultCard, PercentileCard}.tsx
ios/mozy/
  RaceIdentityModule.swift (+ .m)   Keychain item (synchronizable, after-first-unlock), DeviceCheck bit
  StepCounterModule.swift           + getRaceDays(): today's and yesterday's 4 AM windows via queryPedometerData
  mozy.entitlements                 + com.apple.developer.associated-domains: applinks:mozy.mcrudra.com
android/app/src/main/java/com/moxstudio/mozy/
  RaceIdentityModule.kt             Block Store client (+ Keystore-backed local copy)
  InstallReferrerModule.kt          reads mozy_crew={CODE} once at first launch
  StepTrackingService.kt            + 4 AM race bucket when the user's reset hour isn't 4
  RaceSyncWorker.kt                 WorkManager job: upload at most every 30 min when changed
  AndroidManifest.xml               + https intent filter, autoVerify, for mozy.mcrudra.com /j/ and /d/
```

**New libraries** (each needs a native rebuild):
- `react-native-view-shot` and `expo-sharing` for share cards;
- `react-native-qrcode-svg` (uses the existing `react-native-svg`);
- `com.google.android.gms:play-services-auth-blockstore`;
- `com.android.installreferrer:installreferrer`.

Phase 2 adds `@react-native-firebase/messaging`. Check whether `expo-secure-store` can set `kSecAttrSynchronizable`; if not, keep the small Swift module above.

---

## 3. How each foundation lands in the app

### B2 · Identity
1. **On join:** call `POST /v1/profile`, then store the token and recovery code natively (iOS Keychain; Android Block Store plus a local copy). Keep only non-secret fields in the zustand slice.
2. **On launch:**
   - read the token;
   - if there is none and DeviceCheck says "this phone had a profile" (iOS) or Block Store returned nothing (Android), offer **restore with Mozy ID** or **start fresh**;
   - never create a duplicate silently.
3. **On `401`:** clear the local profile and offer restore.
4. **Never:** IDFV, `ANDROID_ID` or any device id on the server (C10).

### B3 · Race-day steps and sync
- **iOS:** `getRaceDays()` queries `CMPedometer` for [today 04:00, now] and [yesterday 04:00, today 04:00] in local time. CMPedometer keeps 7 days, so a missed day can be repaired the next time the app opens.
- **Android:**
  - users whose reset hour is 4 (the default) already have the race total in `history_YYYY-MM-DD`'s `walked` field;
  - everyone else gets a parallel 4 AM bucket in `StepTrackingService` (walked steps only, after the ride filter);
  - expose both through `StepCounterModule.kt`.
- **When to sync:**
  - on app open;
  - while the app is open, when steps grew ≥250 and ≥5 minutes passed;
  - when leaving the app;
  - Android in the background: `RaceSyncWorker` every ≥30 minutes, only when changed;
  - iOS in the background: piggyback on the existing `BGAppRefreshTask` (`AppDelegate.swift:60-71`), best effort.
- **Resilience:** keep the last unsent totals; retry with exponential backoff and jitter; respect `next_sync_s`; on `503 paused` show "race paused" and keep cached boards.
- **Never affect the wallet** (C12): race code only reads step totals; it never writes to the wallet or progression state.

### B4 · Join flow
- **Screen 1: intro.** "race your friends on steps"; crews, your country, the world; "Only your race name and one step total per day leave your phone."
- **Screen 2: profile.**
  - race name pre-filled from MMKV `user_name` (F-C6), checked by `names.ts`;
  - 5 pet colours;
  - country flag pre-filled from the device region (`Locale`), with "hide my flag".
- **Screen 3: who sees you.**
  - two equal buttons with nothing pre-selected: "everyone" or "only my crews";
  - birth month and year, converted to an age band on the phone; under 13 → "the race isn't available", and nothing is sent;
  - the race rules and a consent line with the privacy link.
- **iOS:** update the Motion purpose string (`Info.plist:74`) to mention the race. In Texas, Utah and Louisiana, minors wait for parental approval (D5, PermissionKit).

### B5 · Race screen and entry points
- **Header button:** a fourth Home header button (trophy), wired like the other three (`CommandCenter.tsx:603-628` → `HomeScreen.tsx:229-245`).
- **Home card:** shown once after the first goal day ("race your friends on steps").
- **Route:** a new `Race` route in `RootStackParamList` (`types/index.ts:290`) and `RootNavigator.tsx`.
- **States:** offline shows cached boards with "synced 12 min ago"; empty states say "start a crew" and "be the first walker from {country}"; while loading, the previous boards stay visible at reduced opacity.

### B6 · Links
- **iOS:** add Associated Domains `applinks:mozy.mcrudra.com` to `ios/mozy/mozy.entitlements` (App ID capability in the Apple developer portal too).
- **Android:** add an intent filter with `android:autoVerify="true"` for `https` + `mozy.mcrudra.com` + path prefixes `/j/` and `/d/`.
- **Routes:** in `linking.ts:16-25`, add `Race: 'race'`, `JoinCrew: 'race/join'`, `Duel: 'race/duel'`, and map the https paths `/j/:code` and `/d/:code`.
- **Before setup is done:** links are ignored today, so store `pending_race_invite` in MMKV and show "join sharma fam?" after Home loads.
- **Android referrer:** read `mozy_crew={CODE}` from the Install Referrer once at first launch and treat it as a pending invite.

### B8 · Safety and deletion
- **Report:** long-press a row to report the name. **Block:** from the same menu.
- **Profile screen:** "delete my race profile" with a confirmation, then `DELETE /v1/profile`, then clear the token and slice.
- **Elsewhere:** show the Mozy ID with "save it somewhere safe", and a contact email (Apple 1.2).

### B9 · iPhone free path
Wait for D6. It touches `PaywallScreen.tsx` and `setupStage.ts`; don't change them before the decision.

---

## 4. Features in the app (summary; full list in `FEATURES.md`)

| Feature | App work |
|---|---|
| X1 Crews | Crews tab, crew picker, create/join/leave, crew board, owner remove |
| X3/X4 World and country | Tabs, percentile ring, top 3, around you |
| X5 Invites | Invite sheet (share text + optional card), QR screen, paste button (`UIPasteControl`), code entry, referrer |
| X6 Cards | `ShareCardSheet`, 3 templates, 9:16 + square + text; QR with `?src=race_qr`; offered at most once a day |
| X7 Week grid | Text share from local history; can ship before the backend |
| X8 Gap nudge | Hero card line "312 steps to pass papa" |
| X9 Overtakes | Compare crew ranks after each sync; ≤2 a day; quiet hours 22:00–08:00; per-type switches |
| X10 Crowns | Crown on `PetAvatar` and cards |
| X22 Race your Mozy | Local-only pace-setter at your last-week average; can ship before the backend |

---

## 5. Design (follow the app's theme)

- **Theme:** use the `D` and `S` tokens, Plus Jakarta Sans, white text on `#FF8A00`, lowercase copy, the 3D `CTAButton`, and animated icons with no illustrations. This is the owner's rule from the setup redesign.
- **Avatars:** pets are built from the existing companion views (`companions/MozyFace.tsx` and friends), recoloured per `pet`. No photos.
- **Mockups:** A–D in `report.html` are concept direction, not final designs. Agree on the screens with the owner before building, and change only the screens he names.
- **Out of scope:** onboarding (`OnboardingStep*`) and the paywall (except D6).

---

## 6. Tests

- **Jest unit tests** (`__tests__/race/`):
  - `raceDay.ts`: a 01:30 walk, DST switches, travel across offsets, reset hour ≠ 4;
  - payload builder;
  - gap and rank helpers;
  - name rules;
  - link parsing (`/j/SHRM7Q`, `mozy://race/join?c=…`, referrer string);
  - the sync scheduler (backoff, `next_sync_s`, offline queue).
- **Worktree setup:** in a worktree, link `node_modules` and `src/constants/bypass.ts` from the main checkout first, or 7 suites fail falsely.
- **Device checks** (the owner's vivo 1951 and an iPhone):
  - reinstall restores the account;
  - an invite opens the app when it's installed;
  - Play referrer join on a fresh Android install;
  - paste join on iPhone;
  - totals equal Home's for a default user;
  - airplane mode then reconnect;
  - deletion removes the profile from a second phone's crew board.

## 7. Suggested order inside the app

1. `raceDay.ts` + native race-day getters, with tests (B3, no backend needed).
2. X7 week grid and X22 race your Mozy (local only; quick wins while the backend is built).
3. `RaceIdentity` native modules (B2).
4. `api.ts` + `sync.ts` against the local `wrangler dev` backend (B1 must exist).
5. Join flow (B4) → Race screen (B5) → crews (X1) → links and invites (B6, X5) → cards (X6) → crowns and nudges (X8–X10).
6. Safety and deletion (B8) before any public build.
