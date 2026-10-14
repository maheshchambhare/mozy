# Mozy Race backend: the `mozy-race` Worker and D1

This is the plan for the new backend. It isn't created yet. Where its code lives is D18; recommended: the **website repo** (`/Users/mahesh/Desktop/Projects/mcrudra.com/MOZY`, branch `step-challenges`), folder `race-api/`, deployed as its own Worker. Its address is D19; recommended: `https://api.mozy.mcrudra.com/v1`.

**Who calls it:**
- **The app** (`/Users/mahesh/Desktop/Projects/react-native/stepscroll`, see `APP.md`): authenticated calls such as profile, steps, boards and crews.
- **The website** (see `WEB.md`): public, cached reads (boards, stats, awards, invite previews) and the deletion form.

Every request and response shape is in `CONTRACT.md`. The reasoning, cost model and limits are in `PLAN.md` §7–§8.

---

## 1. Ground rules

| Rule | Why |
|---|---|
| Store only what `PLAN.md` §6 lists | C1: a race name, pet, optional country, visibility, age band, UTC offset, and one total per race day |
| No device IDs, no IP addresses, no Authorization headers in logs | C1, C10 |
| A racer's change costs **one written row**; no second index on `day_steps` | D1 bills index writes as rows |
| Upload and "my ranks" in one call | Requests run out first on the Free plan |
| Every public read is edge-cached | A million page views cost a few thousand API calls |
| Workers Paid ($5) from public launch | The Free plan stops at 100k requests a day until 00:00 UTC (D7) |
| The app must work when this is down | C12 |

## 2. Folder layout (if D18 = website repo)

```text
race-api/
  package.json            wrangler, typescript, vitest, @cloudflare/vitest-pool-workers (no web framework needed)
  wrangler.toml
  migrations/
    0001_init.sql         schema from PLAN.md §7.4 + the indexes below
  data/blocklists/        name filter word lists (English, Hindi/Hinglish, other top languages; check each list's licence)
  src/
    index.ts              fetch() router + scheduled() dispatcher
    env.ts                binding types
    http.ts               json(), error(), cors(), cache headers, body size limit (4 KB)
    auth.ts               bearer → sha256 → profile; recovery codes
    validate.ts           CONTRACT §3 checks (days window, ranges, enums)
    names.ts              NFKC, leetspeak folding, blocklists, reserved words
    profile.ts · steps.ts · crews.ts · boards.ts · public.ts · safety.ts
    limits.ts             rate limits (see §6)
    cron/snapshots.ts     every 10 min: world and country boards for live days, weeks, months
    cron/hourly.ts        close race days whose zone passed 04:00 (+36 h finality); crowns; Monday/1st closes
    cron/daily.ts         period_base refresh, monthly_totals, retention cleanup, counts
  test/                   vitest in the Workers runtime (Miniflare)
```

The site's own build must ignore `race-api/` (it has its own `package.json`).

## 3. `wrangler.toml` (sketch)

```toml
name = "mozy-race"
main = "src/index.ts"
compatibility_date = "2026-10-01"

[[d1_databases]]
binding = "DB"
database_name = "mozy-race"
database_id = "<from: npx wrangler d1 create mozy-race>"
migrations_dir = "migrations"

[triggers]
crons = ["*/10 * * * *", "5 * * * *", "30 2 * * *"]   # boards · hourly closes · daily upkeep (Free allows 5)

[vars]
SITE_ORIGIN = "https://mozy.mcrudra.com"

# routes: custom domain api.mozy.mcrudra.com (set in the dashboard or with [[routes]] custom_domain = true)
# secrets (npx wrangler secret put …): RECOVERY_PEPPER; phase 2: FCM_SERVICE_ACCOUNT

[env.staging]
name = "mozy-race-staging"
# its own D1: mozy-race-staging
```

## 4. Schema notes (full DDL in `PLAN.md` §7.4)

- `profiles`: add `CREATE UNIQUE INDEX profiles_token ON profiles(token_hash)` and `CREATE UNIQUE INDEX profiles_recovery ON profiles(recovery_hash)`. These are written rarely, so the extra index rows are cheap.
- `day_steps`: primary key `(day, profile_id)`, `WITHOUT ROWID`, **no other index**.
  - A board build reads one day's range.
  - A crew read looks up `(day, member)` pairs.
  - `country` and `public` are copied in at write time so boards need no join.
- `crew_members`: an index by `profile_id` for "my crews".
- `board_snapshots.sorted`: every total, descending, packed as int32. D1's 2 MB limit holds about 500k totals; beyond that, store a 1,000-bucket histogram plus the exact top 10,000.

## 5. Key flows

**Upload (`PUT /v1/steps`)**
1. Auth: hash the token and look up the profile (one indexed read).
2. Validate: each day is today or yesterday in `tz_min` (±1 for travel) and within the 36-hour window; steps are 0–100,000.
3. One `db.batch()`. For each day:
   ```sql
   INSERT INTO day_steps (day, profile_id, steps, country, public, updated_at) VALUES (?, ?, ?, ?, ?, ?)
   ON CONFLICT(day, profile_id) DO UPDATE SET steps = excluded.steps, updated_at = excluded.updated_at
   WHERE day_steps.steps <> excluded.steps;
   ```
   Also update `profiles.last_sync_at` and `tz_min`, but only when they changed or more than an hour has passed (fewer writes).
4. Above the review line (40,000), set `status = 2`. The row stays visible to the person and their crews but is skipped by public boards.
5. Response: world and country ranks from the in-memory or D1 snapshot (binary search), plus crew ranks (a small live query; see `CONTRACT.md` §4).

**Board snapshot (Cron, every 10 min)**
1. Live race days are the dates that are still "today" or within the correction window in any zone, usually 2–3 dates.
2. For each live day: `SELECT profile_id, steps, country, public, status FROM day_steps WHERE day = ?`. That's one primary-key range; rows read equal that day's racers.
3. Build `world` and every `country` board in memory:
   - only public, 16+, `status = 0` rows count;
   - sort descending;
   - rank with ties (1, 2, 2, 4);
   - percentile `1 − (rank − 1) / n`;
   - top 100 names (one `SELECT … WHERE id IN (…)` for display fields);
   - a histogram.
4. **Week and month:** add the live days to `period_base` (finished days summed once a day by `cron/daily.ts`). A month never re-reads 30 days.
5. Write one `board_snapshots` row per board and keep a copy in module memory. Public endpoints also go through `caches.default`, which needs the custom domain.

**Crew board:** `SELECT d.profile_id, SUM(d.steps) FROM day_steps d WHERE d.day IN (…period days…) AND d.profile_id IN (SELECT profile_id FROM crew_members WHERE crew_id = ?) GROUP BY d.profile_id`. That's ≤50 members × ≤31 days of rows, cached 60 s per crew and period.

**Closing days, crowns, awards (`cron/hourly.ts`)**
- Each hour, find the UTC offsets where local time just passed 04:00.
- Close yesterday's race day for crews in those zones and award crowns.
- On Mondays, close the week. On the 1st, close the month: awards, `monthly_totals`.
- Finality: results are marked final 36 hours after the last zone ends, and are still shown as "provisional" until then.

**Deletion (`DELETE /v1/profile`, `POST /v1/deletion-request`)**
- One batch deletes the profile, `day_steps`, `monthly_totals`, `crew_members`, `crowns`, `reports` and `blocks` rows for that id.
- Crews owned by the person pass to the longest-standing member, or are deleted if empty.
- Award rows become anonymous ("a mozy walker").
- The next snapshot drops the person.

## 6. Limits and protection

| Concern | Approach |
|---|---|
| Free-plan CPU (10 ms per request) | Plain `fetch` router, no heavy libraries; WebCrypto SHA-256; precomputed snapshots. Cron builds above ~10k racers need Paid (30 s CPU) |
| Free plan: 50 D1 queries per invocation | Batch statements; snapshot builds by board group |
| Rate limits | Steps: compare with `last_sync_at` (no extra writes). Creates, joins and reports: small counters per profile per day. Per-IP limits (profile creation, recovery): approximate counters in `caches.default`; Turnstile on the `/delete` form. The Workers Rate Limiting binding may replace these if it's available on the account's plan (unconfirmed) |
| Abuse | Review line 40,000/day, hard limit 100,000, more than ~250 steps a minute flagged (`PLAN.md` §7.10); phase 2 attestation (App Attest, Play Integrity) for the top of public boards |
| Names | `names.ts` + blocklists; 3 distinct reports → hidden until reviewed |
| Quotas | Analytics Engine counters (free tier); owner turns on Cloudflare usage notifications; when a limit gets close, `next_sync_s` rises to 3,600 and the API answers `503 paused` |

## 7. Admin and review

- A tiny `/admin` (in this Worker) behind **Cloudflare Access**, owner-only:
  - list reports;
  - unhide or rename a name;
  - clear `status = 2` reviews;
  - look up a crew by code.
- Until it exists, the same jobs are D1 console queries.
- No admin endpoint is reachable without Access.

## 8. Environments and deploy

```bash
cd race-api && npx wrangler d1 create mozy-race
```

```bash
cd race-api && npx wrangler d1 migrations apply mozy-race --remote
```

```bash
cd race-api && npx wrangler deploy
```

- Local: `npx wrangler dev` (local D1). The app's debug build points at it.
- Staging: `--env staging` with its own D1.
- Production: the custom domain from D19.
- Backups: D1 Time Travel keeps 7 days on Free and 30 days on Paid.

## 9. Tests (vitest in the Workers runtime)

- **Auth:** an unknown token gets 401; recovery rotates the token.
- **Upload:** a repeat upload writes nothing; the window rules hold (`out_of_window`, `future`); a total can go down.
- **Ranking:** ties share a rank; percentile maths; private and under-review rows are left out of public boards; 13–15 age bands never appear publicly.
- **Crews:** a non-member gets 403; the size cap returns 409; a block hides the person.
- **Deletion:** no row with the id is left in any table.
- **Public endpoints:** steps rounded to 100; no IDs; CORS headers.
- **Load:** a representative load (e.g. 5,000 synthetic racers) stays under the per-request CPU and the per-invocation query limits.

## 10. Suggested order

1. `0001_init.sql`, `auth.ts`, `profile.ts`, `steps.ts`, `DELETE` (B1).
2. `crews.ts` + crew board (X1).
3. `cron/snapshots.ts`, `boards.ts`, `public.ts` (X3, X4).
4. `cron/hourly.ts` (crowns, closes); `safety.ts` (B8).
5. `cron/daily.ts` (period_base, retention); admin.
6. Phase 2: leagues, step-offs, reactions, push, awards.
