# Mozy Race (step challenges): start here

This folder is the complete plan for **Mozy Race**, Mozy's step-competition feature: crews, family, country and world leaderboards, share cards, awards and a public web leaderboard. Status on 14 October 2026: **planning only. Nothing is built, and every product choice waits for the owner's decisions in `DECISIONS.md`.**

The feature spans two projects plus one new backend. **This same folder exists in both projects**, so whichever project you open, you have the whole plan and know where the other side is.

## The projects

| | Mozy app | Mozy website | Race backend (new) |
|---|---|---|---|
| What | React Native app (iOS 16.4+, Android 8+): counts steps, blocks apps, will show the race | Landing page, pricing, journal, privacy (Vite + React 19, prerendered, Cloudflare Workers static assets) | Cloudflare Worker `mozy-race` + D1 database `mozy-race`: accounts, step totals, boards, crews |
| Main checkout | `/Users/mahesh/Desktop/Projects/react-native/stepscroll` | `/Users/mahesh/Desktop/Projects/mcrudra.com/MOZY` | Not created yet (decision D18) |
| Feature branch | `step-challenges` (based on `mozyv3`) | `step-challenges` (based on `main`) | – |
| Feature worktree | `stepscroll/.claude/worktrees/step-challenges` | `MOZY/.claude/worktrees/step-challenges` | – |
| This plan's folder | `step-challenges/` at the repo root | `step-challenges/` at the repo root | – |
| GitHub | `maheshchambhare/stepscroll` (private) | `maheshchambhare/mozy` (public) | – |
| Live | App Store id6792097497 · Google Play `com.moxstudio.mozy` | https://mozy.mcrudra.com (still served by the mcrudra-web Worker; see `WEB.md`, W0) | `https://api.mozy.mcrudra.com` (proposed, D19) |
| Its own build notes | `APP.md` | `WEB.md` | `BACKEND.md` |

Build in the feature worktrees, never in the main checkouts: other sessions work there.

## How the three parts talk to each other

```text
            ┌─────────────────────────── Mozy app (phone) ───────────────────────────┐
            │ steps counted on the phone · race screens · share cards · invites     │
            └──────┬───────────────────────────────▲─────────────────────────┬──────┘
   PUT /v1/steps   │ name + 1 total per day        │ my ranks, boards        │ opens
   (bearer token)  ▼                               │                         │ https://mozy.mcrudra.com/j/{code}
            ┌──────────────── mozy-race Worker + D1 (Cloudflare) ─────────────┐  │ (Universal Link / App Link)
            │ profiles · day_steps · crews · board snapshots every 10 min     │  │
            └──────┬──────────────────────────────────────────────────────────┘  │
   GET /v1/public/*│ cached board JSON, invite previews                            │
                   ▼                                                              │
            ┌──────────────── mozy.mcrudra.com (website) ─────────────────────┐  │
            │ /leaderboard · /awards · /j/{code} · /d/{code} · /delete        │◄─┘
            │ /.well-known/apple-app-site-association · assetlinks.json       │──► friend without Mozy: store link
            └──────────────────────────────────────────────────────────────────┘    (Play referrer carries the code)
```

The exact shapes (endpoints, JSON, link formats, codes, OG tags, analytics events) are in **`CONTRACT.md`**. Both projects build against it; change it there first.

## Files

| File | Read it when | What it holds |
|---|---|---|
| `README.md` | First | This map |
| `DECISIONS.md` | Before building anything | D1–D19: the owner's open questions, recommendations, and a place to record answers |
| `FEATURES.md` | Choosing what to build first | Foundations B1–B10 and features X1–X36, each with app, web and backend work, dependencies, effort and suggested bundles |
| `CONTRACT.md` | Building any side | The interface between app, backend and website |
| `APP.md` | Working in the app repo | React Native and native (Swift, Kotlin) plan, with current file references |
| `WEB.md` | Working in the website repo | Pages, Worker script, link files, design rules for the site |
| `BACKEND.md` | Building the API | Worker + D1 layout, migrations, crons, limits, tests, deploy |
| `PLAN.md` | For the reasoning | The complete research and plan: constraints C1–C13, code findings, research R1–R15, product, architecture, cost, rules, roadmap, sources |
| `report.html` | For a visual overview | The same plan with mockups, diagrams and a cost calculator (open in a browser) |

## Rules for anyone building from this (people or AI tools)

1. **Read the hard constraints C1–C13 in `PLAN.md` §0.** Above all: only a race name and one step total per day leave the phone (C1); no device IDs on the server (C10); the wallet and the blocker never depend on the race backend (C12).
2. **Check `DECISIONS.md`.** Don't build anything whose decision is still OPEN.
3. **Use the shared shapes.** Code against `CONTRACT.md`; if the contract must change, change it in both copies of this folder.
4. **Stay in scope.** Don't change onboarding or the paywall (except D6 when it is decided) or unrelated screens.
5. **Match each project's look.** App: Mozy's theme (`APP.md` §Design). Website: `BRAND_DESIGN_LANGUAGE.md` and `.agents/rules/mozy-brand-memory.md` in the website repo.
6. **Respect the owner's git rules.** Leave pushes and anything needing a GitHub login to the owner.

## Keeping the two copies identical

The app repo copy is the source of truth. After editing it, copy it over and check:

```bash
rsync -a --delete /Users/mahesh/Desktop/Projects/react-native/stepscroll/.claude/worktrees/step-challenges/step-challenges/ /Users/mahesh/Desktop/Projects/mcrudra.com/MOZY/.claude/worktrees/step-challenges/step-challenges/
```

```bash
diff -r /Users/mahesh/Desktop/Projects/react-native/stepscroll/.claude/worktrees/step-challenges/step-challenges /Users/mahesh/Desktop/Projects/mcrudra.com/MOZY/.claude/worktrees/step-challenges/step-challenges && echo identical
```

## Snapshot

Written against app `step-challenges` = `mozyv3` at `42a5291` and website `step-challenges` = `main` at `ef5809a`. File references are `path:line` at those commits and may drift.

*Prepared with Claude for Mahesh Chambhare · MCRUDRA · mcrudra.com · @mcrudrax*
