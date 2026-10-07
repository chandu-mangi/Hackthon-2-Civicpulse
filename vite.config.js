import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' makes the built files use relative paths, so the app works when
// served from a sub-folder (GitHub Pages: /Hackthon-2-Civicpulse/) and not only from "/".
export default defineConfig({
  base: './',
  plugins: [react()],
})
