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

    "Invalid percent delimiter reaches operation validation": browser => {
        browser
            .url("about:blank")
            .url(browser.launchUrl + "#recipe=To_Hex('%',0)&input=aGVsbG8")
            .waitForElementNotPresent("#preloader", 10000)
            .waitForElementPresent("#rec-list li.operation", 10000);
        utils.bake(browser);
        utils.expectOutput(browser, "Delimiter cannot be empty.");
    },

    "Query links decode valid escapes beside literal percent signs": browser => {
        browser
            .url("about:blank")
            .url(browser.launchUrl + "?recipe=To_Hex('Per%63ent',0)&input=aGVsbG8&note=100%")
            .waitForElementNotPresent("#preloader", 10000)
            .waitForElementPresent("#rec-list li.operation", 10000);
        utils.bake(browser);
        utils.expectOutput(browser, "%68%65%6c%6c%6f");
    },

    "Percent signs remain usable in free-text recipe arguments": browser => {
        browser
            .url("about:blank")
            .url(browser.launchUrl + "#recipe=Find_/_Replace({'option':'Simple%20string','string':'%'},'percent',true,false,true,false)&input=NTAl")
            .waitForElementNotPresent("#preloader", 10000)
            .waitForElementPresent("#rec-list li.operation", 10000);
        utils.bake(browser);
        utils.expectOutput(browser, "50percent");
    },

    after: browser => {
        browser.end();
    }
};
