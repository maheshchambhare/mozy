import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics'
import { getAttribution } from './lib/attribution'
import { installInteractionTracking } from './lib/interactions'

// Work out where this visit came from before the first render, so store links carry it; then start analytics.
getAttribution()
installInteractionTracking()
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
