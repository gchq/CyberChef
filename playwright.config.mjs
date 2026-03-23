/**
 * Playwright configuration for CyberChef E2E tests.
 * Replaces Nightwatch browser testing setup.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/browser",
    testMatch: "**/*.spec.mjs",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    timeout: 30000,

    use: {
        baseURL: "http://localhost:8080",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
    ],

    webServer: {
        command: "npm run dev:server",
        url: "http://localhost:8080",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
