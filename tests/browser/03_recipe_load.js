/**
 * Regression tests for recipe loading behaviour.
 *
 * @author C85297 [95289555+C85297@users.noreply.github.com]
 * @copyright Crown Copyright
 * @license Apache-2.0
 */

const utils = require("./browserUtils.js");

module.exports = {
    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl)
            .useCss()
            .waitForElementNotPresent("#preloader", 10000);
    },

    "Recipe load preserves populated arguments": browser => {
        const inputFormat = "HH:mm:ss a MMM DD, YYYY ";
        const input = "10:20:30 pm Sep 26, 2019 ";

        utils.loadRecipe(
            browser,
            "Translate DateTime Format",
            input,
            [
                "Standard date and time",
                inputFormat,
                "UTC",
                "DD/MM/YYYY HH:mm:ss",
                "UTC"
            ]
        );

        browser.execute(() => {
            return Array.from(document.querySelectorAll("#rec-list li.operation .arg"))
                .map(arg => arg.value);
        }, [], function({value}) {
            browser.expect(value[1]).to.equal(inputFormat);
        });
    },

    after: browser => {
        browser.end();
    }
};
