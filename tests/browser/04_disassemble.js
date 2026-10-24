/**
 * Regression tests for disassembly address changes in a running worker.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
const utils = require("./browserUtils.js");

module.exports = {
    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl)
            .useCss()
            .waitForElementNotPresent("#preloader", 10000)
            .click("#auto-bake-label");
    },

    "Reset disassembly address between bakes": browser => {
        utils.loadRecipe(browser, "Disassemble x86", "FFE0",
            ["64", "Full x86 architecture", "16", "1234567812345678", false, true]);
        browser.waitForElementVisible("#stale-indicator", 5000)
            .waitForElementNotVisible("#snackbar-container", 6000);
        utils.bake(browser);
        browser.assert.textContains("#output-text .cm-content", "1234567812345678 JMP RAX");

        browser.execute(() => {
            window.disassemblyTestWorker = window.app.manager.worker.chefWorkers[0].worker;
        });
        utils.loadRecipe(browser, "Disassemble x86", "FFE0",
            ["64", "Full x86 architecture", "16", "0", false, true]);
        browser.waitForElementVisible("#stale-indicator", 5000)
            .waitForElementNotVisible("#snackbar-container", 6000);
        utils.bake(browser);
        browser.assert.textContains("#output-text .cm-content", "0000000000000000 JMP RAX");

        browser.execute(() => {
            const sameWorker = window.disassemblyTestWorker ===
                window.app.manager.worker.chefWorkers[0].worker;
            delete window.disassemblyTestWorker;
            return sameWorker;
        }, [], ({value}) => {
            browser.assert.strictEqual(value, true, "The same worker handles both recipes");
        });
    },

    after: browser => {
        browser.end();
    }
};
