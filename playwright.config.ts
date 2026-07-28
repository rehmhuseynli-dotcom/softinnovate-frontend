import { defineConfig, devices } from '@playwright/test';

/**
 * madde 18: "Frontend/E2E: Cypress veya Playwright". Bu proje Playwright'ı
 * seçti. Testler `npm run dev` ile ayakta olan bir instance'a karşı çalışır
 * (webServer bloğu bunu otomatik başlatır).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
