/**
 * End-to-end tests for the GCloud Read File Operation via Nightwatch.
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

    "GCloud Read File: Retrieve simple text object": function (browser) {
        const testToken = browserUtils.getTestPAT();
        if (!testToken) {
            console.log("Skipping live API test: No PAT available.");
            return;
        }

        const gcsUri = "gs://cyber-chef-cloud-examples/test.txt";

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
                op: "GCloud Read File",
                args: []
            }
        ], gcsUri);

        browser.waitForElementNotVisible("#snackbar-container", 6000);
        browserUtils.bake(browser);
        browser.pause(5000);
        browser.saveScreenshot("tests/browser/output/read_file_success.png");
        browser.execute(function () {
            return window.app.manager.output.outputEditorView.state.doc.toString();
        }, [], function ({ value }) {
            // test.txt holds sample prose, so just assert the read succeeded.
            browser.assert.ok(
                value.length > 0 && !value.includes("GCS API Error"),
                `Expected successful read, got: ${value}`
            );
        });
    },

    after: function (browser) {
        browser.end();
    }
};
