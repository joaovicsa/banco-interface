import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30 * 1000,
    retries: 1,
    use: {
        baseURL: 'http://localhost:3000',
        headless: true,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'Chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'npm run start',
        port: 3000,
        reuseExistingServer: !process.env.CI,
    },
});
