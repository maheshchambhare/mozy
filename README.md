# Mozy website (mozy.mcrudra.com)

The landing page, pricing, privacy policy and journal for [Mozy](https://mozy.mcrudra.com/), by [mcrudra.com](https://mcrudra.com/).
Vite + React 19 + GSAP, prerendered to static HTML and hosted on Cloudflare Pages.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run build` | Type-check, build and prerender every page into `dist/` |
| `npm run cf:preview` | Build, then serve `dist/` with Cloudflare's own Pages server at http://localhost:8788 (headers, redirects and 404s behave as in production) |
| `npm run cf:deploy` | Build and upload `dist/` to the Pages project named in `wrangler.toml` (needs `npx wrangler login` once) |
| `npm run lint` / `npm run test:content` | Lint; check the built journal pages |
| `npm run mcs:gate` / `npm run mcs:check` | MCS search, speed and truth checks on `dist/` (Python, local only) |
| `npm run og:render` | Re-render the share banner `public/assets/og-banner.jpg` from `src/og/` (needs Google Chrome) |

## Cloudflare Pages

Connect the Git repository in the Cloudflare dashboard (Workers & Pages → Create → Pages → Connect to Git) with:

- Framework preset: None (or Vite)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: the folder that holds this README (leave empty when it is the repository root)
- Node version: from `.nvmrc` (22)

No environment variables are required. Optional ones (Production and Preview):

- `VITE_APP_STORE_PROVIDER_TOKEN`: Apple provider token (`pt`) for App Store campaign links
- `VITE_POSTHOG_HOST`: a reverse proxy for PostHog, for example `https://mozy.mcrudra.com/ingest`
- `VITE_POSTHOG_KEY`: only if the PostHog project changes (the current public key is the default)

How the build fits Pages:

- Each page is prerendered as `dist/<path>.html` (`/pricing` → `pricing.html`), so Pages serves the canonical address without a trailing slash; `/pricing/` and `/pricing.html` redirect to `/pricing`.
- `dist/404.html` is served with a real 404 status for unknown addresses.
- `public/_headers` sets security headers, caches the hashed bundles in `/_app/` for a year and keeps `*.pages.dev` previews out of search results.
- `public/_redirects` sends the old `/download` store link to `/get`.
- Analytics only count visits on mozy.mcrudra.com, never on `*.pages.dev` previews.

### Going live on mozy.mcrudra.com

mozy.mcrudra.com is currently served by the mcrudra-web Worker (its `middleware.ts` rewrites the host to `/apps/mozy`). To switch:

1. Deploy this project on Pages and check the `*.pages.dev` address.
2. In the Pages project, Custom domains → add `mozy.mcrudra.com`. If Cloudflare reports the name is in use, first remove the `mozy.mcrudra.com` route or custom domain from the mcrudra-web Worker, then add it here.
3. Re-check the share preview with the Facebook Sharing Debugger or LinkedIn Post Inspector.
