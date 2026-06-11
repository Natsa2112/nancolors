import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 15000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4321',
    headless: true,
  },
  webServer: {
    command: 'pnpm astro dev',
    port: 4321,
    timeout: 30000,
  },
})
