import { defineConfig, devices } from '@playwright/test';

const basePath = process.env.SITE_BASE_PATH || '';

export default defineConfig({
  testDir: './tests/local',
  workers: 1,
  timeout: 90000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://127.0.0.1:4175${basePath}/admin/`,
    trace: 'retain-on-failure',
  },
  webServer: [
    { command: 'npm run cms:local', port: 8081, timeout: 30000 },
    { command: 'npm run cms:start', url: `http://127.0.0.1:4175${basePath}/admin/`, timeout: 30000 },
  ],
});
