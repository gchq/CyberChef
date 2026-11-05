/**
 * Regression tests for touch interaction with operations.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

module.exports = {
    before: browser => {
        browser
            .resizeWindow(480, 800)
            .url(browser.launchUrl)
            .useCss()
            .waitForElementNotPresent("#preloader", 10000);
    },

    "Touch tap adds an operation without changing mouse clicks": browser => {
        browser.execute(() => {
            const operation = Array.from(document.querySelectorAll(".op-list li.operation"))
                .find(el => el.textContent === "A1Z26 Cipher Decode");
            const event = (type, pointerType, x, y) => new PointerEvent(type, {
                bubbles: true,
                pointerId: 7,
                pointerType,
                clientX: x,
                clientY: y
            });

            operation.dispatchEvent(event("pointerdown", "touch", 10, 10));
            operation.dispatchEvent(event("pointerup", "touch", 10, 10));
            const afterTap = document.querySelectorAll("#rec-list li.operation").length;

            operation.dispatchEvent(event("pointerdown", "mouse", 10, 10));
            operation.dispatchEvent(event("pointerup", "mouse", 10, 10));
            const afterMouse = document.querySelectorAll("#rec-list li.operation").length;

            operation.dispatchEvent(event("pointerdown", "touch", 10, 10));
            operation.dispatchEvent(event("pointerup", "touch", 30, 30));
            const afterMove = document.querySelectorAll("#rec-list li.operation").length;
            const recipeName = document.querySelector("#rec-list .op-title")?.textContent;

            return {afterTap, afterMouse, afterMove, recipeName};
        }, [], ({value}) => {
            browser.expect(value.afterTap).to.equal(1);
            browser.expect(value.afterMouse).to.equal(1);
            browser.expect(value.afterMove).to.equal(1);
            browser.expect(value.recipeName).to.equal("A1Z26 Cipher Decode");
        });
    },

    after: browser => browser.end()
};
