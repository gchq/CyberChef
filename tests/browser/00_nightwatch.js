/**
 * Tests to ensure that the app loads correctly in a reasonable time and that operations can be run.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

const utils = require("./browserUtils.js");

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
        browser.expect.element("//li[contains(@class, 'operation') and text()='Escape Smart Characters']").to.be.present;
    },

    "Operation popover descriptions render HTML safely": browser => {
        const favouritesCat = "//a[contains(@class, 'category-title') and contains(@data-target, '#catFavourites')]",
            op = "//ul[@id='search-results']//li[contains(@class, 'operation') and contains(., 'Escape Smart Characters')]";

        browser
            .useCss()
            .clearValue("#search")
            .setValue("#search", "Escape Smart Characters")
            .useXpath()
            .waitForElementVisible(op, 1000)
            .moveToElement(op, 10, 10)
            .useCss()
            .waitForElementVisible(".popover-body code:last-of-type", 1000)
            .expect.element(".popover-body code:last-of-type").text.to.contain("\"Hello\" -- world...");

        browser
            .useCss()
            .moveToElement("#operations .title", 1, 1)
            .waitForElementNotPresent(".popover-body", 1000)
            .clearValue("#search")
            .useXpath()
            .getLocationInView(favouritesCat)
            .click(favouritesCat);
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
            .doubleClick("xpath", toHex);

        // Confirm that it has been added to the recipe
        browser
            .useCss()
            .waitForElementVisible(op, 100)
            .expect.element(op).text.to.contain("To Hex");

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
            .expect.element("#output-text .cm-content").text.that.equals("44 6f 6e 27 74 20 50 61 6e 69 63 2e");

        // Clear recipe
        browser
            .useCss()
            .moveToElement(op, 10, 10)
            .waitForElementNotPresent(".popover-body", 1000)
            .click("#clr-recipe")
            .waitForElementNotPresent(op);
    },

    /**
     * Dragging an operation that is already in the recipe fires the same dragover and drop events on
     * any text argument it passes over as a text drag from outside the app does. Only the
     * dragInProgress flag tells the two apart, so if the recipe list Sortable stops maintaining it,
     * the operation's title silently overwrites the argument.
     */
    "Recipe operation dragged over a text argument": browser => {
        const secondArg = "#rec-list li.operation:nth-of-type(2) textarea.arg";

        // Two operations, each with a text argument to drop onto
        browser
            .useCss()
            .click("#clr-recipe")
            .urlHash("recipe=JWT_Verify('secret')JWT_Verify('secret')")
            .waitForElementVisible(secondArg, 2000);

        // Control: a text drag from outside the app is still written into the argument, proving the
        // drop handler is reached at all
        browser.execute(function() {
            const arg = document.querySelector("#rec-list li.operation textarea.arg"),
                dataTransfer = new DataTransfer();

            dataTransfer.setData("Text", "dropped text");
            arg.dispatchEvent(new DragEvent("dragover", {bubbles: true, cancelable: true, dataTransfer: dataTransfer}));
            arg.dispatchEvent(new DragEvent("drop", {bubbles: true, cancelable: true, dataTransfer: dataTransfer}));
            return arg.value;
        }, [], function({value}) {
            browser.expect(value).to.equal("dropped text");
        });

        // Start a genuine Sortable drag on the second operation. Sortable itself picks the drag up
        // from the pointerdown and dragstart pair, and fills the dataTransfer from its setData.
        browser.execute(function() {
            const ops = document.querySelectorAll("#rec-list li.operation"),
                handle = ops[1].querySelector(".op-title"),
                rect = handle.getBoundingClientRect();

            window.dragTest = {
                op: ops[1],
                arg: ops[0].querySelector("textarea.arg"),
                dataTransfer: new DataTransfer()
            };
            window.dragTest.arg.value = "not overwritten";

            handle.dispatchEvent(new PointerEvent("pointerdown", {
                bubbles: true,
                cancelable: true,
                pointerType: "mouse",
                button: 0,
                buttons: 1,
                clientX: rect.left + 5,
                clientY: rect.top + 5
            }));
            window.dragTest.op.dispatchEvent(new DragEvent("dragstart", {
                bubbles: true,
                cancelable: true,
                dataTransfer: window.dragTest.dataTransfer,
                clientX: rect.left + 5,
                clientY: rect.top + 5
            }));
        });

        // Sortable raises its start event a tick after the dragstart
        browser
            .pause(100)
            .execute(function() {
                return window.app.manager.recipe.dragInProgress;
            }, [], function({value}) {
                browser.expect(value).to.equal(true);
            });

        // Drag the operation over the other operation's argument and drop it there
        browser.execute(function() {
            const op = window.dragTest.op,
                arg = window.dragTest.arg,
                dataTransfer = window.dragTest.dataTransfer,
                rect = arg.getBoundingClientRect(),
                init = {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dataTransfer,
                    clientX: rect.left + 5,
                    clientY: rect.top + 5
                };

            arg.dispatchEvent(new DragEvent("dragover", init));
            arg.dispatchEvent(new DragEvent("drop", init));
            op.dispatchEvent(new DragEvent("dragend", init));

            return {
                argValue: arg.value,
                dragText: dataTransfer.getData("Text"),
                dragInProgress: window.app.manager.recipe.dragInProgress
            };
        }, [], function({value}) {
            // The operation title is what would have been written if the drop were not ignored
            browser.expect(value.dragText).to.equal("JWT Verify");
            browser.expect(value.argValue).to.equal("not overwritten");
            browser.expect(value.dragInProgress).to.equal(false);
        });

        browser
            .click("#clr-recipe")
            .waitForElementNotPresent("#rec-list li.operation");
    },
    "Test every module": browser => {
        browser.useCss();

        // BSON
        loadOp("BSON deserialise", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        // Charts
        loadOp("Entropy", browser)
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

        // Hashing
        loadOp("Streebog", browser)
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

        // YARA
        loadOp("YARA Rules", browser)
            .waitForElementNotVisible("#output-loader", 5000);

        browser.click("#clr-recipe");
    },

    "Move around the UI": browser => {
        const otherCat = "//a[contains(@class, 'category-title') and contains(@data-target, '#catOther')]",
            genUUID = "//li[contains(@class, 'operation') and text()='Generate UUID']";

        browser.useXpath();

        // Scroll to a lower category
        browser
            .getLocationInView(otherCat)
            .expect.element(otherCat).to.be.visible;

        // Open category
        browser
            .useCss()
            .waitForElementNotVisible("#snackbar-container", 10000)
            .useXpath()
            .click(otherCat)
            .expect.element(genUUID).to.be.visible;

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
            .expect.element("#output-text .cm-content").text.which.matches(/[\da-f-]{36}/);

        browser.click("#clr-recipe");
    },

    "Search": browser => {
        // Search for an op
        browser
            .useCss()
            .clearValue("#search")
            .setValue("#search", "md5")
            .useXpath()
            .waitForElementVisible("//ul[@id='search-results']//b[text()='MD5']", 1000);
    },

    "Alert bar": browser => {
        // Bake nothing to create an empty output which can be copied
        utils.clear(browser);
        utils.bake(browser);

        // Alert bar shows and contains correct content
        browser
            .waitForElementNotVisible("#snackbar-container")
            .click("#copy-output")
            .waitForElementVisible("#snackbar-container .snackbar-content")
            .expect.element("#snackbar-container .snackbar-content").text.to.equal("Copied raw output successfully.");

        // Alert bar disappears after the correct amount of time
        // Should disappear after 2000ms
        browser
            .waitForElementNotPresent("#snackbar-container .snackbar-content", 2500)
            .waitForElementNotVisible("#snackbar-container");
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
