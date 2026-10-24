/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

const utils = require("./browserUtils.js");

module.exports = {
    before: browser => {
        browser.resizeWindow(1280, 800)
            .url(browser.launchUrl)
            .useCss()
            .waitForElementNotPresent("#preloader", 10000)
            .click("#auto-bake-label");
    },

    "Number-word preset": browser => {
        utils.loadRecipe(browser, "Multi-character Substitution", "thsetwfinize",
            ["Two-letter number words", "{}"]);
        utils.bake(browser);
        utils.expectOutput(browser, "372590");
    },

    "Custom longest match is non-cascading": browser => {
        utils.loadRecipe(browser, "Multi-character Substitution", "ababa",
            ["Custom", '{"ab":"Y","aba":"X","X":"wrong"}']);
        utils.bake(browser);
        utils.expectOutput(browser, "Xba");
    },

    "Invalid dictionary is shown in the output": browser => {
        utils.loadRecipe(browser, "Multi-character Substitution", "one", ["Custom", "{"]);
        utils.bake(browser);
        utils.expectOutput(browser, "Custom dictionary must be a JSON object mapping non-empty strings to strings.");
    },

    after: browser => browser.end()
};
