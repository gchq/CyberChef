/**
 * Tests to ensure that the app loads correctly in a reasonable time and that operations can be run.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

const utils = require("./browserUtils.js");

module.exports = {
    before: (browser) => {
        browser.resizeWindow(1280, 800).url(browser.launchUrl);
    },

    "Loading screen": (browser) => {
        // Check that the loading screen appears and then disappears within a reasonable time
        browser
            .waitForElementVisible("#preloader", 300)
            .waitForElementNotPresent("#preloader", 10000);
    },

    "App loaded": (browser) => {
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

    "Operations loaded": (browser) => {
        browser.useXpath();
        // Check that an operation in every category has been populated
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='To Base64']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='To Binary']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='AES Decrypt']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='PEM to Hex']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Power Set']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Parse IP range']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Remove Diacritics']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Sort']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='To UNIX Timestamp']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Extract dates']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Gzip']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Keccak']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='JSON Beautify']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Detect File Type']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Play Media']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Disassemble x86']",
        ).to.be.present;
        browser.expect.element(
            "//li[contains(@class, 'operation') and text()='Register']",
        ).to.be.present;
    },

    "Recipe can be run": (browser) => {
        const toHex = "//li[contains(@class, 'operation') and text()='To Hex']";
        const op = "#rec-list .operation .op-title";

        // Check that operation is visible
        browser.useXpath().expect.element(toHex).to.be.visible;

        // Add it to the recipe by double clicking
        browser
            .useXpath()
            .moveToElement(toHex, 10, 10)
            .useCss()
            .waitForElementVisible(".popover-body", 1000)
            .doubleClick("xpath", toHex);

        // Confirm that it has been added to the recipe
        browser
            .useCss()
            .waitForElementVisible(op, 100)
            .expect.element(op)
            .text.to.contain("To Hex");

        // Enter input
        browser
            .useCss()
            .sendKeys("#input-text .cm-content", "Don't Panic.")
            .pause(1000)
            .click("#bake");

        // Check output
        browser
            .useCss()
            .waitForElementNotVisible("#stale-indicator", 1000)
            .expect.element("#output-text .cm-content")
            .text.that.equals("44 6f 6e 27 74 20 50 61 6e 69 63 2e");

        // Clear recipe
        browser
            .useCss()
            .moveToElement(op, 10, 10)
            .waitForElementNotPresent(".popover-body", 1000)
            .click("#clr-recipe")
            .waitForElementNotPresent(op);
    },

    "Test every module": (browser) => {
        browser.useCss();

        // BSON
        loadOp("BSON deserialise", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Charts
        loadOp("Entropy", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Ciphers
        loadOp("AES Encrypt", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Code
        loadOp("XPath expression", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Compression
        loadOp("Gzip", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Crypto
        loadOp("MD5", browser).waitForElementNotVisible("#output-loader", 5000);

        // Default
        loadOp("Fork", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Diff
        loadOp("Diff", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Encodings
        loadOp("Encode text", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Hashing
        loadOp("Streebog", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Image
        loadOp("Extract EXIF", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // PGP
        loadOp("PGP Encrypt", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // PublicKey
        loadOp("Hex to PEM", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Regex
        loadOp("Strings", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // Shellcode
        loadOp("Disassemble x86", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // URL
        loadOp("URL Encode", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // UserAgent
        loadOp("Parse User Agent", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        // YARA
        loadOp("YARA Rules", browser).waitForElementNotVisible(
            "#output-loader",
            5000,
        );

        browser.click("#clr-recipe");
    },

    "Move around the UI": (browser) => {
        const otherCat =
                "//a[contains(@class, 'category-title') and contains(@data-target, '#catOther')]",
            genUUID =
                "//li[contains(@class, 'operation') and text()='Generate UUID']";

        browser.useXpath();

        // Scroll to a lower category
        browser.getLocationInView(otherCat).expect.element(otherCat).to.be
            .visible;

        // Open category
        browser.click(otherCat).expect.element(genUUID).to.be.visible;

        // Add op to recipe
        /* mouseButtonUp drops wherever the actual cursor is, not necessarily in the right place,
        so we can't test Sortable.js properly using Nightwatch. html-dnd doesn't work either.
        Instead of relying on drag and drop, we double click on the op to load it. */
        browser
            .getLocationInView(genUUID)
            .moveToElement(genUUID, 10, 10)
            .doubleClick("xpath", genUUID)
            .useCss()
            .waitForElementVisible(".operation .op-title", 1000)
            .waitForElementNotVisible("#stale-indicator", 1000)
            .expect.element("#output-text .cm-content")
            .text.which.matches(/[\da-f-]{36}/);

        browser.click("#clr-recipe");
    },

    Search: (browser) => {
        // Search for an op
        browser
            .useCss()
            .clearValue("#search")
            .setValue("#search", "md5")
            .useXpath()
            .waitForElementVisible(
                "//ul[@id='search-results']//b[text()='MD5']",
                1000,
            );
    },

    "Alert bar": (browser) => {
        // Bake nothing to create an empty output which can be copied
        utils.clear(browser);
        utils.bake(browser);

        // Alert bar shows and contains correct content
        browser
            .click("#copy-output")
            .waitForElementVisible("#snackbar-container")
            .waitForElementVisible("#snackbar-container .snackbar-content")
            .expect.element("#snackbar-container .snackbar-content")
            .text.to.equal("Copied raw output successfully.");

        // Alert bar disappears after the correct amount of time
        // Should disappear after 2000ms
        browser
            .waitForElementNotPresent(
                "#snackbar-container .snackbar-content",
                2500,
            )
            .waitForElementNotVisible("#snackbar-container");
    },

    after: (browser) => {
        browser.end();
    },
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
