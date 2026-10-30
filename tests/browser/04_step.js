/**
 * Regression tests for stepping through recipes.
 *
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
            .waitForElementNotPresent("#preloader", 10000)
            .click("#auto-bake-label");
    },

    "Step skips comments and disabled operations when choosing the next breakpoint": browser => {
        const recipeConfig = [
            {
                op: "To Upper case",
                args: ["All"]
            },
            {
                op: "Comment",
                args: ["Skip while stepping"]
            },
            {
                op: "ROT13",
                args: [true, true, false, 13],
                disabled: true
            },
            {
                op: "To Hex",
                args: ["Space", 0]
            }
        ];

        utils.setInput(browser, "a", false);

        browser
            .urlHash("recipe=" + JSON.stringify(recipeConfig))
            .waitUntil(async function() {
                const result = await this.execute(function() {
                    return document.querySelectorAll("#rec-list li.operation").length;
                });
                return result.value === recipeConfig.length;
            }, 5000)
            .waitForElementNotVisible("#output-loader", 10000)
            .click("#step")
            .waitForElementNotVisible("#output-loader", 10000)
            .waitUntil(async function() {
                const result = await this.execute(function() {
                    return window.app.manager.output.outputEditorView.state.doc.toString();
                });
                return result.value === "A";
            }, 5000);

        browser.execute(function() {
            return document.querySelector("#rec-list li.operation.break .op-title")?.textContent;
        }, [], function({value}) {
            browser.expect(value).to.equal("To Hex");
        });

        browser
            .click("#step")
            .waitForElementNotVisible("#output-loader", 10000)
            .waitUntil(async function() {
                const result = await this.execute(function() {
                    return window.app.manager.output.outputEditorView.state.doc.toString();
                });
                return result.value === "41";
            }, 5000);

        browser.execute(function() {
            return document.querySelector("#rec-list li.operation.break .op-title")?.textContent || null;
        }, [], function({value}) {
            browser.expect(value).to.equal(null);
        });
    },

    after: browser => {
        browser.end();
    }
};
