/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

const utils = require("./browserUtils.js");

// Certificate fixture shared with the Public Key from Certificate operation tests.
const certificate = `-----BEGIN CERTIFICATE-----
MIIBfTCCASegAwIBAgIUeisK5Nwss2DGg5PCs4uSxxXyyNkwDQYJKoZIhvcNAQEL
BQAwEzERMA8GA1UEAwwIUlNBIHRlc3QwHhcNMjExMTE5MTcyMDI2WhcNMzExMTE3
MTcyMDI2WjATMREwDwYDVQQDDAhSU0EgdGVzdDBcMA0GCSqGSIb3DQEBAQUAA0sA
MEgCQQDyq9A6emHSLczn5Omu5muy+AReC53pTGCrW6Bi65OoobahT2RUSzXCYuvB
757fLLTKz+dLeo6sFkNhIzHZI+n7AgMBAAGjUzBRMB0GA1UdDgQWBBRO+jvkqq5p
pnQgwMMnRoun6e7eiTAfBgNVHSMEGDAWgBRO+jvkqq5ppnQgwMMnRoun6e7eiTAP
BgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA0EAR/5HAZM5qBhU/ezDUIFx
gmUGoFbIb5kJD41YCnaSdrgWglh4He4melSs42G/oxBBjuCJ0bUpqWnLl+lJkv1z
IA==
-----END CERTIFICATE-----`;

/**
 * @param {Browser} browser
 * @param {Array} recipe
 * @param {string} input
 * @param {string} expected
 */
function checkRecipe(browser, recipe, input, expected) {
    browser.url("about:blank").url(browser.launchUrl + "#recipe=" + encodeURIComponent(JSON.stringify(recipe)))
        .waitForElementNotPresent("#preloader", 10000)
        .waitForElementPresent("#rec-list li.operation")
        .sendKeys("#input-text .cm-content", input);
    utils.bake(browser);
    browser.expect.element("#output-text .cm-content").text.to.contain(expected).before(15000);
}

module.exports = {
    before: browser => browser.resizeWindow(1280, 800),

    "Parse a certificate from a lazy-loaded module": browser => {
        checkRecipe(browser, [{op: "Parse X.509 certificate", args: ["PEM"]}], certificate,
            "Serial number:");
    },

    "Load a compression module and run successive operations": browser => {
        checkRecipe(browser, [{op: "Gzip", args: []}, {op: "Gunzip", args: []}], "module loading test",
            "module loading test");
        utils.expectOutput(browser, "module loading test");
    },

    after: browser => browser.end()
};
