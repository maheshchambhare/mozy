import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Hashed JS/CSS go to /_app/ (cached for a year in public/_headers); public/assets keeps its plain file names.
  build: { cssCodeSplit: false, assetsDir: '_app' },
})
