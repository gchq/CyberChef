/**
 * Tests to ensure that the app loads correctly in a reasonable time and that operations can be run.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

module.exports = {
    // desktop UI
    before: browser => {
        browser
            .resizeWindow(500, 800)
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
        browser.expect.element("#operations-dropdown").to.be.present;
        browser.expect.element("#search").to.be.visible;
        browser.expect.element("#categories").to.be.present;
        browser.expect.element("c-category-list").to.be.present;
        browser.expect.element("c-category-li").to.be.present;
        browser.expect.element("c-operation-list").to.be.present;
        browser.expect.element("c-operation-li").to.be.present;
        browser.expect.element("#recipe").to.be.visible;
        browser.expect.element("#rec-list").to.be.visible;
        browser.expect.element("#controls").to.be.visible;
        browser.expect.element("#input").to.be.visible;
        browser.expect.element("#output").to.be.visible;
        browser.expect.element("#input-text").to.be.visible;
        browser.expect.element("#output-text").to.be.visible;
    },

    "Recipe can be run": browser => {
        const toHex = "//li[contains(@class, 'operation')]/span[text()='To Hex']";
        const op = "#rec-list .operation .op-title";

        browser
            .useCss()
            .click("#search")
            .expect.element("#categories").to.be.visible;

        // Check that operation is visible
        browser
            .useXpath()
            .expect.element(toHex).to.be.visible;

        // Add it to the recipe by double clicking
        browser
            .useXpath()
            .moveToElement(toHex, 10, 10)
            .doubleClick("xpath", toHex)
            .expect.element("//li[contains(@class, 'selected')]").to.be.visible;

        browser
            .useCss()
            .click("#close-ops-dropdown-icon")
            .waitForElementNotVisible("#categories", 1000);

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
            .click("#clr-recipe")
            .waitForElementNotPresent(op);
    },

    "Move around the UI": browser => {
        const otherCat = "//a[contains(@class, 'category-title') and contains(@data-target, '#catOther')]",
            genUUID = "//li[contains(@class, 'operation')]/span[text()='Generate UUID']";

        browser
            .useCss()
            .setValue("#search", "")
            .click("#search")
            .expect.element("#categories").to.be.visible;

        browser.useXpath();

        // Scroll to a lower category
        browser
            .getLocationInView(otherCat)
            .expect.element(otherCat).to.be.visible;

        // Open category
        browser
            .click(otherCat)
            .expect.element(genUUID).to.be.visible;

        // Add op to recipe
        /* mouseButtonUp drops wherever the actual cursor is, not necessarily in the right place,
        so we can't test Sortable.js properly using Nightwatch. html-dnd doesn't work either.
        Instead of relying on drag and drop, we double click on the op to load it. */
        browser
            .getLocationInView(genUUID)
            .doubleClick("xpath", genUUID)
            .useCss()
            .click("#close-ops-dropdown-icon")
            .waitForElementNotVisible("#categories", 1000)
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
            .waitForElementVisible("//div[@id='search-results']//strong[text()='MD5']", 1000)
            .useCss()
            .setValue("#search", "")
            .click("#close-ops-dropdown-icon")
            .waitForElementNotVisible("#categories", 1000);

    },

    after: browser => {
        browser.end();
    }
};
