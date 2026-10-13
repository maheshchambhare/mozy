import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics'
import { getAttribution } from './lib/attribution'
import { installInteractionTracking } from './lib/interactions'

// Work out where this visit came from before the first render, so store links carry it; then start analytics.
getAttribution()
installInteractionTracking()
initAnalytics()

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// The home page is prerendered from this same tree (scripts/prerender.mjs), so React adopts that HTML instead of
// throwing it away and building all ~3,400 elements again, which kept phones busy for a long moment on load.
// Other pages prerender without the router's lazy boundaries, so they still render fresh.
if (window.location.pathname === '/' && root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
