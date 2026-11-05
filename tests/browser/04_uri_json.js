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
    "JSON preserves repeated query parameters": browser => {
        checkRecipe(browser, [{op: "Parse URI", args: [true]}],
            "https://example.com/?q=one&q=two", JSON.stringify({
                Protocol: "https:", Hostname: "example.com", "Path name": "/",
                Arguments: {q: ["one", "two"]}
            }, null, 4), '"two"');
    },

    "Default output remains text": browser => {
        checkRecipe(browser, [{op: "Parse URI", args: []}], "/path?q=test",
            "Path name:\t/path\nArguments:\n\tq = test\n", "q = test");
    },

    "JSON query values retain literal markup": browser => {
        checkRecipe(browser, [{op: "Parse URI", args: [true]}], "/?q=%3Cscript%3E",
            JSON.stringify({"Path name": "/", Arguments: {q: ["<script>"]}}, null, 4), "<script>");
    },

    after: browser => browser.end()
};
