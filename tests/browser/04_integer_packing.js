/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

const utils = require("./browserUtils.js");

/**
 * Load a fresh page to avoid input-worker messages from a previous recipe.
 * @param {Browser} browser
 * @param {Object[]} recipe
 * @param {string} input
 * @param {string} expected
 * @param {string} marker
 */
function checkRecipe(browser, recipe, input, expected, marker=expected) {
    browser.url("about:blank")
        .url(browser.launchUrl + "#recipe=" + encodeURIComponent(JSON.stringify(recipe)))
        .useCss()
        .waitForElementNotPresent("#preloader", 10000)
        .waitForElementPresent("#rec-list li.operation", 10000)
        .execute(() => {
            const automatic = document.getElementById("auto-bake");
            if (automatic && automatic.checked) document.getElementById("auto-bake-label").click();
        })
        .click("#input-text .cm-content")
        .sendKeys("#input-text .cm-content", input);
    browser.expect.element("#input-text .cm-content").text.to.equal(input).before(10000);
    utils.bake(browser);
    browser.expect.element("#output-text .cm-content").text.to.contain(marker).before(10000);
    utils.expectOutput(browser, expected);
}

module.exports = {
    "Packing matches the requested byte sequence": browser => {
        checkRecipe(browser, [{op: "Pack Integers", args: ["32", ",", "Hex", "Big endian"]}],
            "19022842, 1234567", "01 22 43 fa 00 12 d6 87");
    },

    "Raw bytes retain signed 64-bit precision": browser => {
        const input = "-9223372036854775808, 9223372036854775807";
        checkRecipe(browser, [
            {op: "Pack Integers", args: ["64", ",", "Raw", "Little endian"]},
            {op: "Unpack Integers", args: ["64", true, ", ", "Raw", "Little endian"]}
        ], input, input);
    },

    "An incomplete word reports its byte width": browser => {
        checkRecipe(browser, [
            {op: "From Hex", args: ["Auto"]},
            {op: "Unpack Integers", args: ["32", false, ", ", "Raw", "Big endian"]}
        ], "ff", "Input length must be a multiple of 4 bytes.");
    },

    after: browser => browser.end()
};
