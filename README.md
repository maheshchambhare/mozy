# Mozy website (mozy.mcrudra.com)

The landing page, pricing, privacy policy and journal for [Mozy](https://mozy.mcrudra.com/), by [mcrudra.com](https://mcrudra.com/).
Vite + React 19 + GSAP, prerendered to static HTML and hosted on Cloudflare (Workers static assets).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run build` | Type-check, build and prerender every page into `dist/` |
| `npm run cf:preview` | Build, then serve `dist/` with Cloudflare's own server at http://localhost:8787 (headers, redirects and 404s behave as in production) |
| `npm run cf:deploy` | Build and upload to the Worker named in `wrangler.toml` (needs `npx wrangler login` once) |
| `npm run lint` / `npm run test:content` | Lint; check the built journal pages |
| `npm run mcs:gate` / `npm run mcs:check` | MCS search, speed and truth checks on `dist/` (Python, local only) |
| `npm run og:render` | Re-render the share banner `public/assets/og-banner.jpg` from `src/og/` (needs Google Chrome) |

## Cloudflare

The site deploys as a Worker with static assets (Workers & Pages → Create → Import a repository). `wrangler.toml` holds the setup:
`npx wrangler deploy` runs `npm run build` itself (the `[build]` command) and uploads `dist/`.

Workers Builds settings:

- Build command: leave empty (or `npm run build`; it only builds twice)
- Deploy command: `npx wrangler deploy` (the default)
- Root directory: the folder that holds this README (`/` for github.com/maheshchambhare/mozy)
- Node version: from `.nvmrc` (22)
- The Worker's name in the dashboard must match `name` in `wrangler.toml` (`mozy`)

No environment variables are required. Optional build variables (Settings → Build → Variables):

- `VITE_APP_STORE_PROVIDER_TOKEN`: Apple provider token (`pt`) for App Store campaign links
- `VITE_POSTHOG_HOST`: a reverse proxy for PostHog, for example `https://mozy.mcrudra.com/ingest`
- `VITE_POSTHOG_KEY`: only if the PostHog project changes (the current public key is the default)

How the build fits Cloudflare:

- Each page is prerendered as `dist/<path>.html` (`/pricing` → `pricing.html`); `html_handling = "auto-trailing-slash"` serves it at the canonical address, and `/pricing/` and `/pricing.html` redirect to `/pricing`.
- `not_found_handling = "404-page"` serves `dist/404.html` with a real 404 status.
- `public/_headers` sets security headers, caches the hashed bundles in `/_app/` for a year and keeps `*.workers.dev` previews out of search results.
- `public/_redirects` sends the old `/download` store link to `/get`.
- Analytics only count visits on mozy.mcrudra.com, never on preview addresses.

### Going live on mozy.mcrudra.com

mozy.mcrudra.com is currently served by the mcrudra-web Worker (its `middleware.ts` rewrites the host to `/apps/mozy`). To switch:

1. Deploy this Worker and check its `*.workers.dev` address.
2. In the mcrudra-web Worker, remove the `mozy.mcrudra.com` route or custom domain. Then in this Worker, Settings → Domains & Routes → add `mozy.mcrudra.com` as a custom domain.
3. Re-check the share preview with the Facebook Sharing Debugger or LinkedIn Post Inspector.
