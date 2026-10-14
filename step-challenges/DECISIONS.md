# Decisions for Mozy Race

Every product choice in this folder is a PROPOSAL until the owner answers here. When a decision is made, set its status to **DECIDED**, write the answer and the date, and update any file that depended on it (the "Affects" column names them).

Status on 14 Oct 2026: all OPEN.

## Summary

| ID | Question | Recommendation | Affects | Status |
|---|---|---|---|---|
| D1 | Public world and country boards? | Yes; each racer chooses "everyone" or "only my crews" at joining, with nothing pre-selected | X3, X4, X14, X15, X18; B4 | OPEN |
| D2 | Store a country code? | Yes, from the phone's region setting (no GPS, no IP), editable, "hide my flag" | X4, X18; B4; privacy labels | OPEN |
| D3 | What is a race day? | Fixed 4 AM–4 AM local, Mozy's default day | B3; every board | OPEN |
| D4 | Race names: free text or generated? | Free text, pre-filled from the onboarding name, filtered, with report and block | B4, B8 | OPEN |
| D5 | Minimum age and minors | 13+ to join (birth month and year); public boards 16+; under-13 stays local; India under-18 path before 13 May 2027; parental approval in Texas, Utah, Louisiana | B4, B8 | OPEN |
| D6 | Can invited iPhone users race without paying? | Yes: a closable iPhone paywall with a free core, or a skip for people arriving with an invite | B9; X5 on iPhone | OPEN, **biggest blocker** |
| D7 | Cloudflare plan | Free for development and beta; Workers Paid ($5/month) from public launch day | B1 | OPEN |
| D8 | Notifications | Local in phase 1; Firebase Cloud Messaging push in phase 2 | X9, X19 | OPEN |
| D9 | Prizes | None; cosmetics only (crowns, leaf colours, hats) | X10, X14, X26 | OPEN |
| D10 | Names on the public website | Show public race names and flags with rounded step counts; keep name lists out of search engines (`noindex`) | X3, X14 | OPEN |
| D11 | How long data is kept | Daily totals 40 days, monthly totals 25 months, inactive profiles deleted after 13 months, deletion on request at once | B1, B8 | OPEN |
| D12 | Names of things | "Mozy Race"; crews; step-off; leagues seed → sprout → sapling → bloom → grove | All UI copy | OPEN |
| D13 | App Store age-rating answers | Accept 13+ for contests; avoid the "social media" answer: no feed, reactions only inside crews | B8, X13, X23 | OPEN |
| D14 | The privacy promise | Replace "No account, ever" with "No sign-up, ever. If you join the race, only your race name and one step total per day leave your phone. Delete it any time." | B8; website `/privacy`; Trust screen | OPEN |
| D15 | Recovery code for new phones | Yes ("Mozy ID") | B2 | OPEN |
| D16 | League scoring | Leagues count steps up to 20,000 a day; other boards show plain steps | X11 | OPEN |
| D17 | Family fairness mode (% of each person's own goal) | Yes, phase 2, optional per crew (the daily goal would leave the phone: one number beyond C1) | X35 | OPEN |
| D18 | Where does the backend code live? | In the website repo as its own Worker folder `race-api/` | B1; `BACKEND.md`, `WEB.md` | OPEN |
| D19 | API address | `https://api.mozy.mcrudra.com/v1` (its own hostname) | `CONTRACT.md`; B1, B7 | OPEN |

## Details

### D1 · Public world and country boards
- **Options:** (a) public boards with an explicit choice at joining (recommended); (b) crews only, as the 12 Oct growth study proposed (P7); (c) public by default.
- **Why (a):** you asked for global and country boards. GDPR's privacy by default (Art. 25(2)) rules out (c) for EU users. StepUp is private by default; Samsung sets visibility per audience.
- **Answer:**

### D2 · Country code
- **Options:** (a) from the phone's region setting, editable, hideable (recommended); (b) derived from the IP address by Cloudflare (`request.cf.country`); (c) none.
- **Why (a):** no permission and no location data. Apple and Google would count an IP-derived country as approximate location. Declare "Coarse Location" anyway to be safe.
- **Answer:**

### D3 · Race day
- **Options:** (a) 4 AM–4 AM local (recommended); (b) midnight to midnight (Apple, Fitbit, StepUp); (c) each user's own reset hour (not fair: a day can be stretched by changing the setting).
- **Why (a):** for most users the race number equals Home's number (Mozy's default day starts at 4 AM, `creditEngine.ts:58-70`), and late-night walks count for "tonight".
- **Answer:**

### D4 · Race names
- **Options:** (a) free text with a filter (recommended); (b) generated names only ("sprouty walker 4821").
- **Why (a):** it's personal and fits WhatsApp sharing. It needs a filter, report and block, which Apple 1.2 and Play require anyway.
- **Answer:**

### D5 · Age
- **Recommendation:**
  - 13+ to join, asked as birth month and year;
  - public boards 16+;
  - under-13s keep Mozy local only;
  - Texas, Utah and Louisiana: minors need a parent's approval (Apple PermissionKit) before the race turns on;
  - India: DPDP needs verifiable parental consent for under-18s from 13 May 2027, so build that path by then or keep under-18s in India out of the race.
- **Context:** Samsung turned off its Together challenges for under-18s outside Korea in Sep 2026.
- **Answer:**

### D6 · iPhone access (biggest blocker)
- **Problem:** a non-subscriber can't get past the iPhone onboarding paywall. Its close button is hidden, dismiss returns early and Back is blocked (`PaywallScreen.tsx:538-541, 805-809, 1115-1127`; `setupStage.ts:17-20`). So every iPhone invite ends at a payment screen.
- **Options:**
  - (a) a closable paywall with a free core, the 12 Oct growth study's recommendation;
  - (b) a skip for people who arrive with an invite;
  - (c) leave it, and accept the race only grows on Android.
- **Answer:**

### D7 · Cloudflare plan
- **Why:** the Free plan stops at 100,000 requests a day until 00:00 UTC (error 1027). The $5 plan has no daily cliff and stays at $5 up to roughly 30,000–50,000 daily racers (`PLAN.md` §8).
- **Answer:**

### D8 · Notifications
- **Phase 1:** local notifications, no new service. Android's step service runs all day; iPhone gets them only when Mozy wakes.
- **Phase 2:** Firebase Cloud Messaging (Firebase is already in the app). It adds a push token, which means one more privacy-label line.
- **Answer:**

### D9 · Prizes
- **Why none:** prize challenges drew 200,000-step days and pendulum purchases (`PLAN.md` §7.10). Prizes also bring sweepstakes and tax rules.
- **Answer:**

### D10 · Names on the web
- **Options:**
  - (a) names, flags and rounded steps, with `noindex` on name lists (recommended);
  - (b) totals and country stats only, no names;
  - (c) everything indexable.
- **Answer:**

### D11 · Retention
- **Why short:** step totals tracked over time are likely health data under GDPR. 40 days covers monthly boards and 4-week "most improved" baselines.
- **Answer:**

### D12 · Names of things
- **Proposed:**
  - "Mozy Race", with tabs crews · {country} · world;
  - "step-off" for 1v1;
  - leagues named after the sprout on Mozy's head: seed → sprout → sapling → bloom → grove (later forest, canopy, summit, sky, legend).
- **Avoid:** "touch grass", which is a rival app's name.
- **Answer:**

### D13 · Store age rating
- **Context:** Apple marks frequent contests 13+. "Social media" means interacting with user content through a feed or similar discovery: 13+, 16+ in Australia, plus a Social Media label.
- **Recommendation:** accept 13+ and design to avoid the social-media answer. Re-answer the questionnaire in the race release.
- **Answer:**

### D14 · The privacy promise
- **Why:** the website `/privacy` page says "No account, ever" and that steps and name never leave the phone (`PrivacyPage.tsx:25-26,35,82`). The App Store label says "Data Not Collected". All of these change in the race release.
- **Answer:**

### D15 · Recovery code
- **Why:** iCloud Keychain and Block Store cover most reinstalls and new phones. A code covers the rest (Keychain off, factory reset, switching between iPhone and Android).
- **Answer:**

### D16 · League scoring
- **Why:** uncapped raw steps let one ultra-walker win every week, and they reward faking. Duolingo re-weighted league points toward healthy use, and Apple caps competition points at 600 a day.
- **Answer:**

### D17 · Family fairness mode
- **Why:** with plain steps, a grandmother can't beat a college student. Apple scores the % of each person's own goal, and Fitbit's "Goal Day" lets everyone who hits their goal win.
- **Cost:** the daily goal must leave the phone.
- **Answer:**

### D18 · Where the backend code lives
- **Options:**
  - (a) the website repo, as `race-api/` with its own `wrangler.toml`, deployed as a separate Worker (recommended): both are Cloudflare and TypeScript, the web pages are its first consumer, and the owner keeps two repos;
  - (b) a new repo `mozy-race-api`;
  - (c) the app repo.
- **Answer:**

### D19 · API address
- **Options:**
  - (a) `https://api.mozy.mcrudra.com/v1`, a separate hostname on the `mozy-race` Worker (recommended): site deploys can't break it, and there's no route clash with the site Worker;
  - (b) `https://mozy.mcrudra.com/api/v1` through the site Worker.
- **Note:** (a) needs CORS for the website.
- **Answer:**
