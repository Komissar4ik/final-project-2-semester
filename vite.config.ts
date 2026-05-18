import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function getBasePath() {
  const pagesUrl = process.env.CI_PAGES_URL;

  if (!pagesUrl) {
    return '/';
  }

  return `${new URL(pagesUrl).pathname.replace(/\/$/, '')}/`;
}

export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
})
