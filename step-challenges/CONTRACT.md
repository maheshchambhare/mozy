# Mozy Race: the contract between app, backend and website

The app, the `mozy-race` backend and the website build against this file. Change it here first, in both copies of the folder. Everything is a PROPOSAL until the decisions it cites (D-numbers in `DECISIONS.md`) are made. **FACT** marks identifiers read from the code on 14 Oct 2026.

## 1. Addresses and environments

| Environment | API base | Website | D1 database |
|---|---|---|---|
| Local | `http://localhost:8787/v1` (`wrangler dev`) | `http://localhost:5173` (`npm run dev`) or `:8787` (`npm run cf:preview`) | local D1 (Miniflare) |
| Staging | `https://mozy-race-staging.<account>.workers.dev/v1` | the site's `*.workers.dev` preview | `mozy-race-staging` |
| Production | `https://api.mozy.mcrudra.com/v1` (D19) | `https://mozy.mcrudra.com` | `mozy-race` |

The app reads the API base from one constant in `src/race/config.ts`, and only release builds point at production.

## 2. Identity and auth (C10, D15)

- An account is a random `profile_id` plus a 256-bit bearer **token**. The server stores only `sha256(token)`, and never a device ID.
- Every authenticated call sends `Authorization: Bearer <token>` and `X-Mozy-Client: <ios|android>/<app version> (<build>)`.
- **Where the token lives:**
  - iOS: the Keychain, accessible after first unlock, **synchronizable** (iCloud Keychain);
  - Android: Block Store, plus Keystore-backed local storage;
  - never in MMKV, which is unencrypted (`src/services/storage.ts:6-12`).
- **Recovery code:** 80 random bits as Crockford base32, shown as `MZ-XXXX-XXXX-XXXX-XXXX`. The server stores `sha256(code)`. Using it rotates the token.
- A `401` means the token is unknown or revoked. The app then offers "restore with Mozy ID" or "start fresh".

## 3. Formats and rules

| Thing | Format | Rule |
|---|---|---|
| `profile_id` | `p_` + 22 base62 chars | Random, never derived from the device |
| `crew_id` | `c_` + 22 base62 chars | Random |
| Crew invite code | 6 chars from `23456789ABCDEFGHJKMNPQRSTUVWXYZ` | Case-insensitive input, shown upper-case, no 0/O/1/I/L |
| Step-off code | Same alphabet, 6 chars | Phase 2 |
| Race day `day` | `YYYY-MM-DD` | The local date on which a 4 AM–4 AM window starts (D3). A walk at 01:30 on 15 Oct counts for `2026-10-14` |
| Week key | ISO week `2026-W42` | Starts Monday 04:00 local |
| Month key | `2026-10` | Starts on the 1st at 04:00 local |
| `tz_min` | Integer UTC offset in minutes, −720…+840 | Sent with every upload; the server uses the latest |
| `steps` | Integer 0…100,000 | The race total for that day; the latest value wins (it may go down after Android removes ride steps) |
| Race name | 2–16 chars: letters, digits, space, `.`, `_`, `-` | NFKC-normalised; blocklists; reserved words; no links, `@`, emails or phone numbers |
| Crew name | 2–24 chars | Same filter as names |
| `pet` | `cream` · `peach` · `mint` · `lilac` · `sky` | The pet look for avatars (D12 may rename) |
| `country` | ISO 3166-1 alpha-2 or `null` | From the phone's region setting (D2) |
| `visibility` | `public` · `crews` | Chosen at joining, never pre-selected (D1) |
| `age_band` | `13-15` · `16-17` · `18+` | From birth month and year on the phone. Only the band is sent (D5); public boards need `16-17` or `18+` |
| Board key | `<scope>:<period>:<key>`, e.g. `world:day:2026-10-14`, `IN:week:2026-W42`, `world:month:2026-10` | Scope is `world` or a country code |
| Times | Unix seconds (`built_at`, `synced_at`) | – |

**Corrections window:** a day accepts uploads until 36 hours after it ends locally. Boards say `"live": true` until every time zone has closed that day.

## 4. Endpoints

All bodies are JSON, UTF-8. Errors look like this:

```json
{ "error": { "code": "name_rejected", "message": "That name can't be used. Try another." } }
```

| Code | Meaning |
|---|---|
| 400 `bad_request` | Malformed input |
| 401 `unauthorized` | Unknown or revoked token |
| 403 `forbidden` | Not a member, blocked, or too young for this board |
| 404 `not_found` | – |
| 409 `conflict` | Crew full, already a member, too many crews |
| 422 `name_rejected` | With `reason`: `blocked`, `reserved`, `length` or `characters` |
| 426 `upgrade_required` | App too old for this API |
| 429 `rate_limited` | Includes `Retry-After` |
| 503 `paused` | Race paused (quota protection); the app shows cached boards |

### POST /v1/profile (opt in)

Request:
```json
{ "name": "mahesh", "pet": "peach", "country": "IN", "visibility": "public", "age_band": "18+",
  "tz_min": 330, "platform": "android", "rules_version": 1, "consent_version": 1 }
```
201 response:
```json
{ "id": "p_3kQ9xV2mN8bW6vC5tYh1Lr", "token": "u7Jx…43 chars…", "tag": 4821,
  "recovery_code": "MZ-7KQ2-9XWD-4HPT-B3NC" }
```

### PATCH /v1/profile · DELETE /v1/profile
- `PATCH` with any of `name`, `pet`, `country`, `visibility` returns 200 with the profile.
- `DELETE` returns 204. It removes the profile, memberships, daily and monthly rows, crowns, reports and blocks at once.

### POST /v1/profile/recover
Request `{ "recovery_code": "MZ-7KQ2-9XWD-4HPT-B3NC" }` → 200 `{ "id": "…", "token": "…" }`. The old token is revoked. Rate-limited hard.

### PUT /v1/steps (upload and get ranks in one call)

Request:
```json
{ "days": [ { "day": "2026-10-14", "steps": 8432 }, { "day": "2026-10-13", "steps": 11020 } ], "tz_min": 330 }
```
200 response:
```json
{
  "accepted": ["2026-10-14", "2026-10-13"], "rejected": [],
  "next_sync_s": 300, "min_app_version": "2.1.0",
  "me": {
    "day": "2026-10-14",
    "world":   { "rank": 1204, "n": 6690, "pct": 82, "as_of": 1791991800 },
    "country": { "code": "IN", "rank": 311, "n": 1480, "pct": 79, "as_of": 1791991800 },
    "crews": [ { "id": "c_…", "name": "sharma fam", "rank": 2, "n": 6, "gap_to_next": 312, "next_name": "papa" } ]
  }
}
```
- `rejected` items carry a reason: `out_of_window`, `future` or `out_of_range`.
- World and country ranks come from the last snapshot (`as_of`).
- Crew ranks are live.

### GET /v1/me/boards?period=day|week|month
Returns my world, country and crew standings for the period, with `around` (3 above, 3 below) and the `top` 3 for world and country. Each row has the shape `{ "rank": 2, "id": "p_…", "name": "papa", "pet": "peach", "country": "IN", "steps": 9214, "synced_at": 1791991520, "crown": true, "me": false }`.

### GET /v1/boards/{scope}/{period}/{key} (public, no auth)
```json
{ "key": "world:week:2026-W42", "built_at": 1791991800, "live": true, "n": 6690,
  "top": [ { "rank": 1, "name": "ana", "pet": "peach", "country": "BR", "steps": 152300 } ],
  "hist": { "bucket": 5000, "counts": [212, 980, 1640, 1702, 1190, 610, 240, 80, 24, 12] } }
```
- Public boards round steps to the nearest 100 (D10) and leave out IDs.
- Only `visibility = public` profiles aged 16+ that aren't under review appear.

### Crews
| Call | Request | Response |
|---|---|---|
| `POST /v1/crews` | `{ "name": "sharma fam", "kind": "family" }` | 201 `{ "id": "c_…", "code": "SHRM7Q", "invite_url": "https://mozy.mcrudra.com/j/SHRM7Q" }` |
| `POST /v1/crews/join` | `{ "code": "SHRM7Q" }` | 200 `{ "crew": { "id", "name", "kind", "size" } }` · 404 · 409 full |
| `GET /v1/crews/{id}/board?period=` | – | 200 `{ "crew": {…}, "period": "week", "key": "2026-W42", "rows": [ … ] }` |
| `DELETE /v1/crews/{id}/members/me` | – | 204 (the owner may also delete another member's id) |

### Safety
| Call | Request | Response |
|---|---|---|
| `POST /v1/reports` | `{ "target": "p_…", "reason": "name" }` | 202. After 3 distinct reporters the name shows as "walker 4821" until reviewed |
| `POST /v1/blocks` | `{ "target": "p_…" }` | 204 |
| `POST /v1/deletion-request` (web form, no token) | `{ "recovery_code": "MZ-…" }` | 202 |

### Public data for the website
| Call | Response |
|---|---|
| `GET /v1/public/invite/{code}` | `{ "crew_name": "sharma fam", "kind": "family", "size": 6, "inviter": "riya" }`. Never totals or member names |
| `GET /v1/public/stats` | `{ "week": "2026-W42", "total_steps": 41882300, "walkers": 6690 }` |
| `GET /v1/public/awards/{yyyy-mm}` | `{ "month": "2026-10", "awards": [ { "kind": "walker_of_month", "scope": "world", "name": "ana", "country": "BR", "steps": 612300 } ] }` |

### Phase 2 (shape to be detailed when chosen)
`/v1/leagues/current`, `/v1/duels`, `/v1/reactions`, `/v1/push-token`.

## 5. Links

| Purpose | Address |
|---|---|
| Crew invite (web + Universal/App Link) | `https://mozy.mcrudra.com/j/{CODE}` |
| Step-off invite | `https://mozy.mcrudra.com/d/{CODE}` |
| App scheme (fallback; exists today, FACT `linking.ts:17`) | `mozy://race`, `mozy://race/join?c={CODE}`, `mozy://race/duel?c={CODE}` |
| App Store | `https://apps.apple.com/app/id6792097497?ct=race_invite` (FACT app id) |
| Google Play with the code as install referrer | `https://play.google.com/store/apps/details?id=com.moxstudio.mozy&referrer=mozy_crew%3D{CODE}`. The app reads `mozy_crew={CODE}` once at first launch (FACT package) |
| Share-card and invite attribution (the site already reads these, FACT `src/lib/attribution.ts:41-55`) | `?utm_source=mozy_app&utm_medium=share&utm_campaign=race_invite&utm_content=<template>`; QR codes use `?src=race_qr` |

**`https://mozy.mcrudra.com/.well-known/apple-app-site-association`** (served as `application/json`; FACT Team ID `4J34FUNCUZ`, bundle `com.mcrudra.mozy.app`):
```json
{ "applinks": { "details": [ { "appIDs": ["4J34FUNCUZ.com.mcrudra.mozy.app"],
  "components": [ { "/": "/j/*" }, { "/": "/d/*" } ] } ] } }
```

**`https://mozy.mcrudra.com/.well-known/assetlinks.json`** (the fingerprint is the **Play app-signing** SHA-256 from Play Console → App integrity; still to look up):
```json
[ { "relation": ["delegate_permission/common.handle_all_urls"],
    "target": { "namespace": "android_app", "package_name": "com.moxstudio.mozy",
                "sha256_cert_fingerprints": ["<PLAY APP SIGNING SHA-256>"] } } ]
```

## 6. Link previews (OG) for `/j/` and `/d/`

| Tag | Value |
|---|---|
| `og:title` | `{inviter} invited you to race in {crew} on Mozy` |
| `og:description` | `{size} walkers · the weekly race resets Monday` |
| `og:url` | The canonical link |
| `og:image` | `https://mozy.mcrudra.com/assets/race/og-invite.jpg` (fixed, 1200×630, under 300 KB) |
| `robots` | `noindex` |

WhatsApp needs non-empty `og:title`, `og:description` and `og:url`, and the `<head>` within the first 300 KB. iMessage runs no JavaScript, so the tags must be in the server's HTML.

## 7. Caching, limits, CORS, versions

| What | Rule |
|---|---|
| Public boards, stats, awards | `Cache-Control: public, max-age=60, s-maxage=300` |
| Invite preview | `public, max-age=300` |
| Personal and crew data | `private, max-age=30` |
| CORS | Public endpoints allow `https://mozy.mcrudra.com` (and the staging site); authenticated endpoints aren't called from browsers |
| Rate limits, per profile | `PUT /v1/steps` ≤1 per minute (burst 3) · board reads ≤30 per minute · crew creates ≤5 a day · joins ≤20 a day · reports ≤20 a day |
| Rate limits, per IP (never stored) | Profile creates ≤5 an hour · recovery attempts ≤10 a day |
| Versions | Breaking changes go to `/v2`. Responses carry `min_app_version`, and `426` forces an update prompt |

## 8. Analytics events (never names, codes, totals or IDs)

| Event | Where | Properties |
|---|---|---|
| `race_intro_viewed` | App | `entry`: `home_button`, `home_card`, `invite` |
| `race_profile_created` | App | `visibility`, `has_country` |
| `crew_created` | App | `kind` |
| `invite_shared` | App | `channel`: `sheet` or `qr`; `template` |
| `crew_joined` | App | `entry`: `link`, `code`, `referrer`, `qr`, `paste` |
| `board_viewed` | App | `scope`: `crew`, `country` or `world`; `period` |
| `card_shared` | App | `template`, `format` |
| `race_notification_opened` | App | `type` |
| `race_profile_deleted` | App | – |
| `race_join_page_viewed` | Website (PostHog) | `has_app_link` |
| `store_click` (exists today) | Website | add `entry: join` on `/j/` |
| `race_board_page_viewed` | Website | `scope`, `period` |
| Daily counts | Backend (Analytics Engine or D1) | new profiles, active racers, uploads, crews, joins, reports, deletions |

The app's Firebase wrapper sends only from Android release builds (FACT `src/utils/analytics.ts:8-21`), so iPhone numbers come from the backend counts.

## 9. Who can see what (enforced by the API)

| Data | Owner | Crew members | Public boards and website | Anyone with an invite link |
|---|---|---|---|---|
| Race name, pet | ✓ | ✓ | ✓ if public, 16+ and not hidden | Inviter's name only |
| Country | ✓ | ✓ | ✓ if public | – |
| Daily, weekly and monthly totals | ✓ | ✓ exact | ✓ rounded to 100, if public | – |
| Profile id | ✓ | ✓ (for report and block) | – | – |
| Age band, tz offset, token, recovery hash | Server only | – | – | – |
