/**
 * End-to-end tests for Cloud Operations via Nightwatch.
 * 
 * NOTE: Tests that execute real API calls will be skipped if the required API keys
 * are not found in the environment variables (e.g. running in a public CI pipeline).
 * 
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

const browserUtils = require("./browserUtils.js");
require('dotenv').config();

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
        let testToken = process.env.CYBERCHEF_GCP_TEST_TOKEN;

        if (!testToken || testToken === "YOUR_OAUTH_TOKEN_HERE") {
            try {
                testToken = require('child_process').execSync('gcloud auth print-access-token', { stdio: 'pipe', encoding: 'utf-8' }).trim();
            } catch (e) {
                console.log("No valid CYBERCHEF_GCP_TEST_TOKEN found and gcloud failed. Skipping live PAT API test.");
                return;
            }
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

    "Google Translate: Successful API Key Translation": function (browser) {
        const testKey = process.env.CYBERCHEF_GCP_TEST_KEY;

        if (!testKey || testKey === "YOUR_API_KEY_HERE") {
            console.log("No valid CYBERCHEF_GCP_TEST_KEY found in environment variables. Skipping live API test.");
            return;
        }

        browserUtils.loadRecipeConfig(browser, [
            {
                op: "Authenticate Google Cloud",
                args: [
                    "API Key",
                    { option: "UTF8", string: testKey },
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
        ], "Hello");

        browser.waitForElementNotVisible("#snackbar-container", 6000);
        browserUtils.bake(browser);
        browser.pause(2000);
        browser.saveScreenshot("tests/browser/output/success_apikey_debug.png");
        browser.execute(function () {
            return window.app.manager.output.outputEditorView.state.doc.toString();
        }, [], function ({ value }) {
            browser.assert.ok(value.includes("Hola"), "Expected translation 'Hola'");
        });
    },

    // ─── GCloud List Bucket ────────────────────────────────────────────────────

    "GCloud List Bucket: Missing Creds Validation": function (browser) {
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
                op: "GCloud List Bucket",
                args: [
                    "audio/",
                    "GCS URIs (one per line)"
                ]
            }
        ], "cyber-chef-cloud-examples");

        browser.waitForElementNotVisible("#snackbar-container", 6000);
        browserUtils.bake(browser);
        browser.pause(2000);
        browser.saveScreenshot("tests/browser/output/list_bucket_no_key.png");
        browser.execute(function () {
            return window.app.manager.output.outputEditorView.state.doc.toString();
        }, [], function ({ value }) {
            browser.assert.ok(value.includes("No Google Cloud credentials found") || value.includes("Please provide Google Cloud credentials"));
        });
    },

    "GCloud List Bucket: Lists audio/ files from cyber-chef-cloud-examples": function (browser) {
        let testToken = process.env.CYBERCHEF_GCP_TEST_TOKEN;

        if (!testToken || testToken === "YOUR_OAUTH_TOKEN_HERE") {
            try {
                testToken = require("child_process").execSync("gcloud auth print-access-token", { stdio: "pipe", encoding: "utf-8" }).trim();
            } catch (e) {
                console.log("No valid token found and gcloud failed. Skipping GCloud List Bucket live test.");
                return;
            }
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
                op: "GCloud List Bucket",
                args: [
                    "audio/",
                    "GCS URIs (one per line)"
                ]
            }
        ], "cyber-chef-cloud-examples");

        browser.waitForElementNotVisible("#snackbar-container", 6000);
        browserUtils.bake(browser);
        browser.pause(5000);
        browser.saveScreenshot("tests/browser/output/list_bucket_live.png");
        browser.execute(function () {
            return window.app.manager.output.outputEditorView.state.doc.toString();
        }, [], function ({ value }) {
            browser.assert.ok(value.includes("gs://cyber-chef-cloud-examples/audio/"), `Expected gs:// URIs, got: ${value}`);
            browser.assert.ok(value.includes("she_achieves_great_results_f55548.mp3"), `Expected audio filename in output, got: ${value}`);
        });
    },

    // ─── GCloud Speech to Text ─────────────────────────────────────────────────

    "GCloud Speech to Text: GCS URI mode returns transcription to browser": function (browser) {
        let testToken = process.env.CYBERCHEF_GCP_TEST_TOKEN;

        if (!testToken || testToken === "YOUR_OAUTH_TOKEN_HERE") {
            try {
                testToken = require("child_process").execSync("gcloud auth print-access-token", { stdio: "pipe", encoding: "utf-8" }).trim();
            } catch (e) {
                console.log("No valid token found and gcloud failed. Skipping GCloud Speech to Text live test.");
                return;
            }
        }

        const gcsUri = "gs://cyber-chef-cloud-examples/audio/she_achieves_great_results_f55548.mp3";

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
                op: "GCloud Speech to Text",
                args: [
                    "GCS URI (gs://...)",
                    "en-US",
                    "latest_long",
                    "Return to CyberChef",
                    "cyber-chef-cloud-examples",
                    30
                ]
            }
        ], gcsUri);


        browser.waitForElementNotVisible("#snackbar-container", 6000);
        browserUtils.bake(browser);
        // LRO jobs on short files typically complete in ~5 seconds; allow up to 30s here
        browser.pause(30000);
        browser.saveScreenshot("tests/browser/output/speech_to_text_browser.png");
        browser.execute(function () {
            return window.app.manager.output.outputEditorView.state.doc.toString();
        }, [], function ({ value }) {
            browser.assert.ok(
                value.toLowerCase().includes("she achieves great results"),
                `Expected transcript, got: ${value}`
            );
        });
    },

    "GCloud Speech to Text: GCS URI mode writes transcript to GCS output/ bucket": function (browser) {
        let testToken = process.env.CYBERCHEF_GCP_TEST_TOKEN;

        if (!testToken || testToken === "YOUR_OAUTH_TOKEN_HERE") {
            try {
                testToken = require("child_process").execSync("gcloud auth print-access-token", { stdio: "pipe", encoding: "utf-8" }).trim();
            } catch (e) {
                console.log("No valid token found and gcloud failed. Skipping GCloud Speech to Text GCS write test.");
                return;
            }
        }

        const gcsUri = "gs://cyber-chef-cloud-examples/audio/she_achieves_great_results_f55548.mp3";

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
                op: "GCloud Speech to Text",
                args: [
                    "GCS URI (gs://...)",
                    "en-US",
                    "latest_long",
                    "Write to GCS",
                    "cyber-chef-cloud-examples",
                    30
                ]
            }
        ], gcsUri);

        browser.waitForElementNotVisible("#snackbar-container", 6000);
        browserUtils.bake(browser);
        browser.pause(30000);
        browser.saveScreenshot("tests/browser/output/speech_to_text_gcs_write.png");
        browser.execute(function () {
            return window.app.manager.output.outputEditorView.state.doc.toString();
        }, [], function ({ value }) {
            browser.assert.ok(
                value.includes("gs://cyber-chef-cloud-examples/output/audio/she_achieves_great_results_f55548.mp3/speech-to-text/text.txt"),
                `Expected GCS output URI, got: ${value}`
            );
        });
    },

    after: function (browser) {
        browser.end();
    }
};

