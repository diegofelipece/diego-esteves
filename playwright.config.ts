import { defineConfig, devices } from '@playwright/test';

const basePath = process.env.SITE_BASE_PATH || '';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  testIgnore: '**/local/**',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:4173${basePath}/`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'node tests/static-server.mjs',
    url: `http://127.0.0.1:4173${basePath}/`,
  },
});
