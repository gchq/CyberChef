/**
 * Playwright E2E tests for CyberChef.
 * Replaces Nightwatch browser tests.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import { test, expect } from "@playwright/test";

test.describe("CyberChef App", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        // Wait for the app to fully load
        await page.waitForSelector("#preloader", { state: "hidden", timeout: 30000 });
    });

    test("should load the app", async ({ page }) => {
        await expect(page).toHaveTitle(/CyberChef/);
    });

    test("should have operations panel", async ({ page }) => {
        const opsPanel = page.locator("#operations");
        await expect(opsPanel).toBeVisible();
    });

    test("should have input and output panels", async ({ page }) => {
        await expect(page.locator("#input")).toBeVisible();
        await expect(page.locator("#output")).toBeVisible();
    });

    test("should search for operations", async ({ page }) => {
        const searchBox = page.locator("#search");
        await searchBox.fill("Base64");
        // Wait for search results
        await page.waitForTimeout(500);
        const results = page.locator("#search-results .op-title");
        await expect(results.first()).toBeVisible();
    });

    test("should encode to Base64", async ({ page }) => {
        // Type input
        const inputEditor = page.locator("#input-text .cm-content");
        await inputEditor.click();
        await page.keyboard.type("Hello, World!");

        // Search and add the operation
        const searchBox = page.locator("#search");
        await searchBox.fill("To Base64");
        await page.waitForTimeout(500);

        // Click on the operation to add it
        const toBase64Op = page.locator("#search-results .op-title").filter({ hasText: "To Base64" });
        await toBase64Op.first().dblclick();

        // Wait for bake
        await page.waitForTimeout(2000);

        // Check output
        const outputEditor = page.locator("#output-text .cm-content");
        await expect(outputEditor).toContainText("SGVsbG8sIFdvcmxkIQ==");
    });

    test("should handle recipe URL loading", async ({ page }) => {
        // Navigate to a recipe URL
        await page.goto("/#recipe=To_Base64('A-Za-z0-9%2B/%3D')&input=SGVsbG8");
        await page.waitForSelector("#preloader", { state: "hidden", timeout: 30000 });
        await page.waitForTimeout(2000);

        // Verify the recipe loaded
        const recipeList = page.locator("#rec-list .op-title");
        await expect(recipeList.first()).toContainText("To Base64");
    });
});
