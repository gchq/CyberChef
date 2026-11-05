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

    "ULID binary encoding and decoding": browser => {
        utils.loadRecipe(browser, ["From Hex", "To ULID", "From ULID", "To Hex"],
            "01563e3ab5d3d6764c61efb99302bd5b", [[], [], [], ["None", 0]]);
        utils.bake(browser);
        utils.expectOutput(browser, "01563e3ab5d3d6764c61efb99302bd5b");
    },

    "ULID generation in the worker": browser => {
        utils.loadRecipe(browser, "Generate ULID", "", []);
        utils.bake(browser);
        utils.expectOutput(browser, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
    },

    "ULID overflow is shown in the output": browser => {
        utils.loadRecipe(browser, "From ULID", "8" + "0".repeat(25), []);
        utils.bake(browser);
        utils.expectOutput(browser, "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).");
    },

    after: browser => browser.end()
};
