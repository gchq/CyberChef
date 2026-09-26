/**
 * End-to-end tests for the Google Translate Operation via Nightwatch.
 *
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

const browserUtils = require("./browserUtils.js");
require("dotenv").config();

module.exports = {

    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl)
            .useCss()
            .waitForElementNotPresent("#preloader", 10000)
            .click("#auto-bake-label");
    },

    "Google Translate: Missing Key Validation": function (browser) {
        browserUtils.loadRecipeConfig(browser, [
            {
                op: "Authenticate Google Cloud",
                args: [
                    "API Key",
                    { option: "UTF8", string: "" },
                    "",
                    true
                ]
            },
            {
                op: "Google Translate",
                args: [
                    "en",
                    "es"
                ]
            }
        ], "Hello World");

        browser.waitForElementNotVisible("#snackbar-container", 6000);
        browserUtils.bake(browser);
        browser.pause(2000);
        browser.execute(function () {
            return window.app.manager.output.outputEditorView.state.doc.toString();
        }, [], function ({ value }) {
            browser.assert.ok(value.includes("No Google Cloud credentials found") || value.includes("Please provide Google Cloud credentials"), "Expected auth missing error.");
        });
    },

    "Google Translate: Successful PAT Translation": function (browser) {
        const testToken = browserUtils.getTestPAT();
        if (!testToken) {
            console.log("Skipping live API test: No PAT available.");
            return;
        }

        browserUtils.loadRecipeConfig(browser, [
            {
                op: "Authenticate Google Cloud",
                args: [
                    "Personal Access Token (PAT)",
                    { option: "UTF8", string: testToken },
                    "cyberchefcloud",
                    true
                ]
            },
            {
                op: "Google Translate",
                args: [
                    "en",
                    "es"
                ]
            }
        ], "Hello");

        browser.waitForElementNotVisible("#snackbar-container", 6000);
        browserUtils.bake(browser);
        browser.pause(2000);
        browser.saveScreenshot("tests/browser/output/success_pat_debug.png");
        browser.execute(function () {
            return window.app.manager.output.outputEditorView.state.doc.toString();
        }, [], function ({ value }) {
            browser.assert.ok(value.includes("Hola"), "Expected translation 'Hola'");
        });
    },

    after: function (browser) {
        browser.end();
    }
};
