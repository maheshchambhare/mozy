# Mozy Race on the website

This is the build plan for the **Mozy website** repo: `/Users/mahesh/Desktop/Projects/mcrudra.com/MOZY`, feature worktree `.claude/worktrees/step-challenges`, branch `step-challenges` (from `main`). The site is live at https://mozy.mcrudra.com.

**The other parts:**
- **App:** `/Users/mahesh/Desktop/Projects/react-native/stepscroll`, feature worktree `.claude/worktrees/step-challenges`, branch `step-challenges` (from `mozyv3`). It counts steps, shows the race, creates the invite links this site serves, and opens when someone taps `/j/{code}` or `/d/{code}` on a phone with Mozy installed. Its plan is `APP.md` in the same folder.
- **Backend:** the `mozy-race` Cloudflare Worker + D1. Recommended home: this repo, as its own Worker in `race-api/` (D18). Its plan is `BACKEND.md`. The site only reads its public endpoints.
- **Shared shapes** (API, links, OG tags, events): `CONTRACT.md`. **Order of work:** `FEATURES.md`. **Open decisions:** `DECISIONS.md`.

References are `path:line` at `ef5809a`.

---

## 1. What the site has today (FACT)

| Area | Today | Where |
|---|---|---|
| Stack | Vite 8, React 19, wouter 3, GSAP, posthog-js; every page prerendered to static HTML | `package.json`; `scripts/prerender.mjs` |
| Pages | `/`, `/pricing`, `/blog`, `/blog/:slug`, `/privacy`, `/get` (picks a store by device), 404 | `src/App.tsx` (Switch); `src/routes.ts` (loaders and prefetch); `scripts/prerender.mjs` (route list, sitemap); `src/data/metadata.ts` (`pageMeta`) |
| Hosting | Worker `mozy` with static assets only: no `main` script, `html_handling = "auto-trailing-slash"`, `not_found_handling = "404-page"` | `wrangler.toml` |
| **Domain** | **mozy.mcrudra.com is still served by the mcrudra-web Worker** (its middleware rewrites the host to `/apps/mozy`). README "Going live on mozy.mcrudra.com" lists the switch | `README.md` |
| Headers and redirects | Security headers, cache rules, `noindex` on `*.workers.dev`; `/download` → `/get` | `public/_headers`; `public/_redirects` |
| Analytics | PostHog (US host), production only; attribution from `utm_*` and `src` (QR) | `src/lib/analytics.ts`; `src/lib/attribution.ts:41-55`; `src/lib/interactions.ts` |
| Privacy promises | "No account, ever"; steps and name never leave the phone | `src/pages/PrivacyPage.tsx:25-26,35,82` |
| Design rules | Keep `BRAND_DESIGN_LANGUAGE.md`; Moz the mascot is the SVG in `src/components/story/Moz.tsx`; tokens in `src/design-system/tokens.css` and `src/story.css`; Fredoka headlines, Nunito body, Baloo 2 logo, Caveat notes; product claims only from `src/data/productFacts.ts` | `.agents/rules/mozy-brand-memory.md` |
| Story order | The landing page is a scroll story; keep its chapter order, the `st-` prefix and reduced motion | `docs/SCROLL_STORY_REDESIGN.md` |

---

## 2. Work items (PROPOSAL)

### W0 · Go live on mozy.mcrudra.com (prerequisite for every link)
The owner follows README's three steps:
1. Deploy this Worker and check its `*.workers.dev` address.
2. Remove `mozy.mcrudra.com` from the mcrudra-web Worker.
3. Add it as a custom domain on `mozy`.

Then re-check the share preview. Until this happens, `/j/…` links would hit the old site.

### W1 · A Worker entry for dynamic pages (B7)
Today unknown paths return the 404 page, so `/j/{code}` and `/d/{code}` need code. The plan is a few dozen lines:

```toml
# wrangler.toml additions (sketch)
main = "worker/index.ts"
[assets]
directory = "./dist"
binding = "ASSETS"
html_handling = "auto-trailing-slash"
not_found_handling = "404-page"
run_worker_first = ["/j/*", "/d/*"]     # everything else stays plain static (free, unlimited)
[vars]
RACE_API = "https://api.mozy.mcrudra.com/v1"
```

`worker/index.ts`, for `/j/{code}`:
1. Validate the code against the alphabet in `CONTRACT.md` §3.
2. Fetch `GET {RACE_API}/public/invite/{code}`, cached about 5 minutes.
3. Fetch the prerendered template `dist/race-invite.html` through `env.ASSETS`.
4. Rewrite `<title>`, `og:title`, `og:description` and `og:url` with HTMLRewriter (`CONTRACT.md` §6), and set `robots: noindex`.
5. Return the page. If the code is unknown or the API fails, return the same template with generic text ("You're invited to race on Mozy").

`/d/{code}` works the same way (phase 2). HTMLRewriter is light work, well inside the Free plan's 10 ms of CPU.

### W2 · App link files (B6)
- `public/.well-known/apple-app-site-association` (no extension) and `public/.well-known/assetlinks.json`, with the contents in `CONTRACT.md` §5.
- Add to `public/_headers`:
  ```
  /.well-known/apple-app-site-association
    Content-Type: application/json
  ```
- The Android fingerprint comes from Play Console → App integrity (the owner reads it there).
- Check both files with Apple's and Google's validators after W0.

### W3 · New pages
Each page follows the existing pattern:
- a component in `src/pages/`;
- a route in `src/App.tsx`;
- a loader and prefetch in `src/routes.ts`;
- a route in `scripts/prerender.mjs`;
- metadata in `src/data/metadata.ts`.

| Path | Component | Prerender | Indexing | Data |
|---|---|---|---|---|
| `/leaderboard` | `LeaderboardPage` | Yes (shell + aggregate copy) | `index` (names load on the client) | `GET /v1/boards/world/{period}/{key}`, `/v1/public/stats` |
| `/leaderboard/{country}` | Same, with country | Shells for countries with ≥10 public walkers | `index` | `GET /v1/boards/{CC}/…` |
| `/awards`, `/awards/{yyyy-mm}` | `AwardsPage` | Yes | `index` for totals and copy; name lists `noindex` per D10 | `GET /v1/public/awards/{month}` |
| `/j/{code}` | `RaceInvitePage` (template `race-invite.html`) | Template only | `noindex`, unlisted | Worker-injected + `GET /v1/public/invite/{code}` |
| `/d/{code}` | `StepOffInvitePage` (phase 2) | Template only | `noindex`, unlisted | Same pattern |
| `/delete` | `DeleteRacePage`: enter a Mozy ID to delete a race profile (Play rule) | Yes | `noindex` | `POST /v1/deletion-request` |
| `/privacy` | Rewritten for D14 | Yes | `index` | – |

**Invite page** (mockup F):
- crew name and size, and the inviter's name;
- the code in large type, with "copy code & get mozy";
- buttons: "open in mozy" (the `mozy://race/join?c=` fallback), App Store (`ct=race_invite`) and Google Play (with `referrer=mozy_crew%3D{CODE}`);
- one line about privacy;
- **never** member totals or member names.

**Leaderboard page** (mockup E):
- percentile-first copy ("who walked the most this week?");
- the top 10 with pets (`Moz.tsx` recoloured) and flags;
- a "how the world walked" histogram (use the site's chart rules: one hue, labelled axes, a table twin);
- the weekly total ticker (X15) once it's worth showing;
- "get mozy";
- names appear only when the board has ≥100 public walkers (otherwise totals only), with steps rounded to 100.

### W4 · Landing page tie-in (owner approval needed)
"Awards in our landing page" without breaking the scroll story:
- **(a)** a small "this week's walkers" strip after the final chapter, before the footer: weekly total, walker of the month, link to `/awards`;
- **(b)** a "race your friends" chapter (bigger change; the agent rule says keep the chapter order).

Recommended: (a). Add product facts to `src/data/productFacts.ts` only once the race ships, marked verified (agent rule 6). Never use an individual's steps in marketing copy without their separate permission (C11).

### W5 · Privacy, rules and contact (B8)
- Rewrite `/privacy` (D14). List exactly what the race sends (`PLAN.md` §6), retention (D11), deletion (in the app and at `/delete`), the age rules (D5), and a contact address for reports (Apple 1.2).
- Publish the race rules (what's allowed, what gets reviewed, no prizes) as a section or a page.

### W6 · Analytics
- New events per `CONTRACT.md` §8: `race_join_page_viewed`, `race_board_page_viewed`, and `store_click` with `entry: join`.
- **Strip invite codes from PostHog.** It records full URLs (F-W4). In `src/lib/analytics.ts`, sanitise `$current_url`, `$pathname` and the referrer so `/j/SHRM7Q` becomes `/j/:code` before sending (posthog-js `before_send` / property sanitising). A code is an invitation key; it shouldn't sit in analytics.
- Share links carry `utm_source=mozy_app&utm_medium=share&utm_campaign=race_invite&utm_content=<template>`; QR codes carry `src=race_qr`. The attribution module already reads both.

### W7 · Share image
`public/assets/race/og-invite.jpg`: 1200×630, under 300 KB, drawn with Moz and the site's palette. Render it with the existing `npm run og:render` pipeline (`src/og/`).

### W8 · The backend folder (if D18 = this repo)

```text
race-api/                 separate Worker "mozy-race"; its own package.json and wrangler.toml
  wrangler.toml           D1 binding, crons, custom domain api.mozy.mcrudra.com (D19)
  migrations/0001_init.sql
  src/…                   see BACKEND.md
```

- The site's build (`npm run build` at the root) must not include `race-api/`.
- Deploy `race-api/` separately: `npx wrangler deploy` from that folder, or a second Workers Builds project with root directory `race-api`.

---

## 3. Checks

- `npm run build` prerenders the new pages; `npm run cf:preview` serves them with real 404s, headers and the Worker routes on `:8787`.
- Previews:
  - WhatsApp, the Facebook Sharing Debugger and iMessage show the per-link title for `/j/TEST01`;
  - unknown codes show the generic invite.
- AASA and assetlinks validate (after W0); an iPhone and an Android phone open Mozy from a WhatsApp invite.
- `npm run mcs:gate`: page weight and speed budgets still pass; `/j/`, `/d/` and `/delete` are `noindex` and stay out of the sitemap.
- No invite codes appear in PostHog events.

## 4. Suggested order on the website

1. W0 domain switch (owner, dashboard).
2. W2 link files, then W1 Worker entry with the generic invite template.
3. W5 privacy rewrite (ships with the race release).
4. `/j/` invite page and `/delete`.
5. `/leaderboard`, `/awards` and the landing strip when bundles B or D are chosen.
