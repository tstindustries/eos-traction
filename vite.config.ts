import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Served from https://<user>.github.io/eos-traction/ in production.
  // Routing is hash-based, so no SPA rewrite rules are needed on Pages.
  base: process.env.GITHUB_PAGES ? '/eos-traction/' : '/',
  plugins: [react(), tailwindcss()],
})
