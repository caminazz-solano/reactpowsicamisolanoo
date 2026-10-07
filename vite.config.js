import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const githubPagesSpaFallback = {
  name: 'github-pages-spa-fallback',
  apply: 'build',
  async closeBundle() {
    await copyFile(resolve('dist/index.html'), resolve('dist/404.html'))
  },
}

// https://vite.dev/config/
export default defineConfig({
  base: '/spapowsicamisolano/',
  plugins: [react(), githubPagesSpaFallback],
})
