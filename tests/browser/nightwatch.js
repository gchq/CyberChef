/**
 * Tests to ensure that the app loads correctly in a reasonable time and that operations can be run.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
module.exports = {
    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl);
    },

    "Loading screen": browser => {
        // Check that the loading screen appears and then disappears within a reasonable time
        browser
            .waitForElementVisible("#preloader", 300)
            .waitForElementNotPresent("#preloader", 10000);
    },

    "App loaded": browser => {
        browser.useCss();
        // Check that various important elements are loaded
        browser.expect.element("#operations").to.be.visible;
        browser.expect.element("#recipe").to.be.visible;
        browser.expect.element("#input").to.be.present;
        browser.expect.element("#output").to.be.present;
        browser.expect.element(".op-list").to.be.present;
        browser.expect.element("#rec-list").to.be.visible;
        browser.expect.element("#controls").to.be.visible;
        browser.expect.element("#input-text").to.be.visible;
        browser.expect.element("#output-text").to.be.visible;
    },

    "Operations loaded": browser => {
        browser.useXpath();
        // Check that an operation in every category has been populated
        browser.expect.element("//li[contains(@class, 'operation') and text()='To Base64']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='To Binary']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='AES Decrypt']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='PEM to Hex']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Power Set']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Parse IP range']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Remove Diacritics']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Sort']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='To UNIX Timestamp']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Extract dates']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Gzip']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Keccak']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='JSON Beautify']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Detect File Type']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Play Media']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Disassemble x86']").to.be.present;
        browser.expect.element("//li[contains(@class, 'operation') and text()='Register']").to.be.present;
    },

    "Recipe can be run": browser => {
        const toHex = "//li[contains(@class, 'operation') and text()='To Hex']";
        const op = "#rec-list .operation .op-title";

        // Check that operation is visible
        browser
            .useXpath()
            .expect.element(toHex).to.be.visible;

        // Add it to the recipe by double clicking
        browser
            .useXpath()
            .moveToElement(toHex, 10, 10)
            .useCss()
            .waitForElementVisible(".popover-body", 1000)
            .doubleClick();

        // Confirm that it has been added to the recipe
        browser
            .useCss()
            .waitForElementVisible(op)
            .expect.element(op).text.to.contain("To Hex");

        // Enter input
        browser
            .useCss()
            .setValue("#input-text", "Don't Panic.")
            .click("#bake");

        // Check output
        browser
            .useCss()
            .waitForElementNotVisible("#stale-indicator", 1000)
            .expect.element("#output-text").to.have.value.that.equals("44 6f 6e 27 74 20 50 61 6e 69 63 2e");

        // Clear recipe
        browser
            .useCss()
            .moveToElement(op, 10, 10)
            .waitForElementNotPresent(".popover-body", 1000)
            .click("#clr-recipe")
            .waitForElementNotPresent(op);
    },

    "Test every module": browser => {
        browser.useCss();

        // BSON
        loadOp("BSON deserialise", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Ciphers
        loadOp("AES Encrypt", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Code
        loadOp("XPath expression", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Compression
        loadOp("Gzip", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Crypto
        loadOp("MD5", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Default
        loadOp("Fork", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Diff
        loadOp("Diff", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Encodings
        loadOp("Encode text", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Image
        loadOp("Extract EXIF", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // PGP
        loadOp("PGP Encrypt", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // PublicKey
        loadOp("Hex to PEM", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Regex
        loadOp("Strings", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Shellcode
        loadOp("Disassemble x86", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // URL
        loadOp("URL Encode", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // UserAgent
        loadOp("Parse User Agent", browser)
            .waitForElementNotVisible("#output-loader", 5000);
    },

    after: browser => {
        browser.end();
    }
};

/**
 * Clears the current recipe and loads a new operation.
 *
 * @param {string} opName
 * @param {Browser} browser
 */
function loadOp(opName, browser) {
    return browser
        .useCss()
        .click("#clr-recipe")
        .urlHash("op=" + opName);
}
