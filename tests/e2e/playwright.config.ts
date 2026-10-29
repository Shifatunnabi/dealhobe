import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '.', outputDir: '../../test-results/e2e', fullyParallel: false, workers: 1,
  timeout: 90_000, expect: { timeout: 12_000 },
  reporter: [['list'], ['json', { outputFile: path.resolve('test-results/e2e-results.json') }], ['html', { outputFolder: path.resolve('test-results/e2e-html'), open: 'never' }]],
  use: { baseURL: 'http://localhost:3100', trace: 'retain-on-failure', screenshot: 'only-on-failure', actionTimeout: 15_000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } },
  ],
});
