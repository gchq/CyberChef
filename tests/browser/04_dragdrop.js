/**
 * Tests for the drag and drop surfaces: adding, reordering and removing operations, favourites,
 * text argument drops, file drops onto the input, and the pane splitters.
 *
 * Three techniques are used, and each test says which one it is:
 *
 *   A - a genuine native HTML5 drag, driven through the Chrome DevTools Protocol. Chromium will not
 *       synthesise native drag events from WebDriver mouse input, so `Input.setInterceptDrags` plus
 *       `Input.dispatchDragEvent` is the only way to reach the real path, dataTransfer included.
 *       Chrome only: there is no CDP in safaridriver or geckodriver, so these tests skip themselves
 *       when it is unavailable.
 *   B - SortableJS's pointer-event fallback mode plus the WebDriver Actions API. Real pointer input
 *       and real Sortable logic, but through the fallback code path and with no dataTransfer.
 *   C - synthetic DragEvents carrying a hand-built DataTransfer. Proves the app's handlers behave,
 *       not that the browser will ever call them. The only option for file drops, since WebDriver
 *       cannot perform an OS-level file drop at all.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

const utils = require("./browserUtils.js");

/**
 * Set in `before`. Technique A tests return early when CDP is not reachable.
 */
let nativeDragSupported = false;

/**
 * Logs and reports that a Technique A test cannot run in this browser.
 *
 * @param {string} name - The test name
 * @returns {boolean} Always true, so callers can `if (skipNative(...)) return;`
 */
function skipNative(name) {
    console.log(`SKIPPED "${name}": native drag and drop needs the Chrome DevTools Protocol, ` +
        "which this driver does not provide. See the Technique notes at the top of this file.");
    return true;
}

/**
 * Clears the recipe and waits for it to empty.
 *
 * @param {Browser} browser - Nightwatch client
 */
function clearRecipe(browser) {
    browser
        .useCss()
        .waitForElementNotVisible("#snackbar-container", 10000)
        .click("#clr-recipe")
        .waitForElementNotPresent("#rec-list li.operation", 2000);
}

/**
 * Puts an operation into the search results, which is itself a Sortable seed list, so that a single
 * predictable stub can be dragged from a known position.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} opName - The operation to search for
 */
function searchFor(browser, opName) {
    browser
        .useCss()
        .clearValue("#search")
        .setValue("#search", opName)
        .waitForElementVisible("#search-results li.operation", 2000);
    browser.expect.element("#search-results li.operation").text.to.contain(opName);
}

module.exports = {
    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl)
            .waitForElementNotPresent("#preloader", 10000);

        utils.cdpAvailable(browser, available => {
            nativeDragSupported = available;
        });
    },

    afterEach: browser => {
        // A Technique A test that fails between nativeDragStart and nativeDrop never reaches the
        // drop. Without this, drag interception and the setData patch would stay on for later tests.
        utils.nativeDragCancel(browser);
    },

    /**
     * T1 (Technique A). The core "get an operation into the recipe" interaction.
     */
    "Drag an operation from the list into the recipe": browser => {
        if (!nativeDragSupported && skipNative("Drag an operation from the list into the recipe")) return;

        // setInput clears the recipe, so the input has to be in place before the drag
        utils.setInput(browser, "hello", false);
        searchFor(browser, "To Base64");

        utils.nativeDragAndDrop(browser, "#search-results li.operation", "#rec-list", {x: 190, y: 30});

        // Sortable's setData wrote the operation name into the real dataTransfer
        utils.expectDragPayload(browser, "To Base64");

        browser.expect.elements("#rec-list li.operation").count.to.equal(1);
        utils.expectRecipeOrder(browser, ["To Base64"]);

        // pull: "clone" means the stub is still in the list it came from
        browser.expect.element("#search-results li.operation").to.be.present;

        utils.dragInProgress(browser, false);
        utils.removeIntent(browser, false);

        // The operation is a real, bakeable one, not just a list item that got moved
        utils.bake(browser);
        utils.expectOutput(browser, "aGVsbG8=");
    },

    /**
     * T2 (Technique A). Guards the popover teardown in createSortableSeedList's onStart: the dragged
     * stub has its popover disposed, and opSortEnd is responsible for putting one back on whichever
     * element stayed behind in the operations list.
     */
    "Dragging an operation into the recipe does not break its popover": browser => {
        if (!nativeDragSupported && skipNative("Dragging an operation into the recipe does not break its popover")) return;

        clearRecipe(browser);
        searchFor(browser, "To Base64");

        utils.nativeDragAndDrop(browser, "#search-results li.operation", "#rec-list", {x: 190, y: 30});

        browser.execute(function() {
            return document.querySelector("#search-results li.operation").getAttribute("data-toggle");
        }, [], function({value}) {
            browser.expect(value).to.equal("popover");
        });

        browser
            .moveToElement("#search-results li.operation", 10, 10)
            .waitForElementVisible(".popover-body", 2000)
            .moveToElement("#search", 10, 10)
            .waitForElementNotPresent(".popover-body", 2000);

        clearRecipe(browser);
    },

    /**
     * T3 (Technique A). Reordering has to change the bake result and the URL hash, the latter
     * proving that onSort dispatched a statechange.
     */
    "Reorder operations in the recipe": browser => {
        if (!nativeDragSupported && skipNative("Reorder operations in the recipe")) return;

        clearRecipe(browser);
        utils.setInput(browser, "abc", false);
        browser
            .urlHash("recipe=To_Hex('Space',0)To_Base64('A-Za-z0-9%2B/%3D')")
            .waitForElementPresent("#rec-list li.operation:nth-of-type(2)", 3000)
            .pause(200);

        utils.expectRecipeOrder(browser, ["To Hex", "To Base64"]);
        utils.bake(browser);
        // "abc" -> To Hex -> "61 62 63" -> To Base64
        utils.expectOutput(browser, "NjEgNjIgNjM=");

        // Drag the second operation over the top edge of the first. The .arg filter means a drag
        // started on an argument is not a Sortable drag at all, so the title is the handle.
        utils.nativeDragAndDrop(
            browser,
            "#rec-list li.operation:nth-of-type(2) .op-title",
            "#rec-list li.operation:nth-of-type(1) .op-title",
            {x: 20, y: 2}
        );

        utils.expectRecipeOrder(browser, ["To Base64", "To Hex"]);

        utils.bake(browser);
        // "abc" -> To Base64 -> "YWJj" -> To Hex
        utils.expectOutput(browser, "59 57 4a 6a");

        browser.execute(function() {
            return decodeURIComponent(window.location.hash);
        }, [], function({value}) {
            browser.expect(value).to.contain("recipe=To_Base64('A-Za-z0-9+/=')To_Hex('Space',0)");
        });

        clearRecipe(browser);
    },

    /**
     * T4 (Technique A). Dragging an operation off the recipe list removes it. removeIntent is set by
     * the dragleave on #rec-list and acted on in onEnd.
     */
    "Drag an operation out of the recipe to remove it": browser => {
        if (!nativeDragSupported && skipNative("Drag an operation out of the recipe to remove it")) return;

        clearRecipe(browser);
        utils.setInput(browser, "abc", false);
        browser
            .urlHash("recipe=To_Base64('A-Za-z0-9%2B/%3D')")
            .waitForElementPresent("#rec-list li.operation", 3000)
            .pause(200);

        utils.nativeDragStart(browser, "#rec-list li.operation .op-title", {x: 20, y: 10});
        utils.dragInProgress(browser, true);

        // Leave the recipe list entirely
        utils.nativeDragOver(browser, "#operations", {x: 120, y: 500});
        utils.removeIntent(browser, true);
        // dragleave also resets the progress indicator
        browser.execute(function() {
            return window.app.progress;
        }, [], function({value}) {
            browser.expect(value).to.equal(0);
        });

        utils.nativeDrop(browser);
        browser.pause(200);

        browser.waitForElementNotPresent("#rec-list li.operation", 2000);
        utils.dragInProgress(browser, false);
        browser.execute(function() {
            return window.app.progress;
        }, [], function({value}) {
            browser.expect(value).to.equal(0);
        });

        utils.bake(browser);
        utils.expectOutput(browser, "abc");
    },

    /**
     * T5 (Technique A). The regression case for T4's mechanism: re-entering the list has to clear
     * removeIntent again, otherwise a wobbly drag would delete the operation.
     */
    "Dragging out and back in does not remove the operation": browser => {
        if (!nativeDragSupported && skipNative("Dragging out and back in does not remove the operation")) return;

        clearRecipe(browser);
        browser
            .urlHash("recipe=To_Base64('A-Za-z0-9%2B/%3D')")
            .waitForElementPresent("#rec-list li.operation", 3000)
            .pause(200);

        utils.nativeDragStart(browser, "#rec-list li.operation .op-title", {x: 20, y: 10});
        utils.nativeDragOver(browser, "#operations", {x: 120, y: 500});
        utils.removeIntent(browser, true);

        utils.nativeDragOver(browser, "#rec-list", {x: 190, y: 40});
        utils.removeIntent(browser, false);

        utils.nativeDrop(browser);
        browser.pause(200);

        browser.expect.elements("#rec-list li.operation").count.to.equal(1);
        utils.expectRecipeOrder(browser, ["To Base64"]);
        utils.dragInProgress(browser, false);

        clearRecipe(browser);
    },

    /**
     * T6 (Technique A). favDrop reads dataTransfer.getData("Text"), so this one genuinely needs a
     * native drag - neither the Sortable fallback nor a synthetic event dispatched at the category
     * would carry the payload the handler reads.
     */
    "Drop an operation on the Favourites category": browser => {
        if (!nativeDragSupported && skipNative("Drop an operation on the Favourites category")) return;

        clearRecipe(browser);
        searchFor(browser, "To Base64");

        utils.expectCategoryOps(browser, "#catFavourites", [
            "To Base64", "From Base64", "To Hex", "From Hex", "To Hexdump", "From Hexdump",
            "URL Decode", "Regular expression", "Entropy", "Fork", "Magic"
        ]);

        // Something that is not already a favourite, so addFavourite does not bail out early
        searchFor(browser, "To Binary");

        utils.nativeDragStart(browser, "#search-results li.operation", {x: 40, y: 10});
        utils.nativeDragOver(browser, "#categories a", {x: 40, y: 12});

        browser.expect.element("#categories a").to.have.attribute("class").which.contains("favourites-hover");

        utils.nativeDrop(browser);
        browser.pause(400);

        browser.expect.element("#categories a").to.have.attribute("class").which.does.not.contain("favourites-hover");
        browser.waitForElementPresent("#catFavourites li.operation", 2000);
        browser.expect.element("#catFavourites").text.to.contain("To Binary");

        // The other two favDragover branches - the Edit button and the image inside it - only need
        // the handler to be reached, so a synthetic dragover is enough. This does not prove the
        // browser routes a real drag to those nodes, only that the handler walks up to the <a>.
        browser.execute(function() {
            window.app.manager.recipe.dragInProgress = true;
            const results = {};
            const dispatch = function(el) {
                const dt = new DataTransfer();
                dt.setData("Text", "To Binary");
                el.dispatchEvent(new DragEvent("dragover", {bubbles: true, cancelable: true, dataTransfer: dt}));
            };
            const cat = document.querySelector("#categories a");

            cat.classList.remove("favourites-hover");
            dispatch(document.getElementById("edit-favourites"));
            results.viaEditButton = cat.classList.contains("favourites-hover");

            cat.classList.remove("favourites-hover");
            dispatch(document.querySelector("#edit-favourites i"));
            results.viaEditButtonIcon = cat.classList.contains("favourites-hover");

            cat.classList.remove("favourites-hover");
            window.app.manager.recipe.dragInProgress = false;
            return results;
        }, [], function({value}) {
            browser.expect(value.viaEditButton).to.equal(true);
            browser.expect(value.viaEditButtonIcon).to.equal(true);
        });

        // Favourites persist to localStorage, so put them back before the next test
        browser
            .click("#edit-favourites")
            .waitForElementVisible("#favourites-modal", 2000)
            .click("#reset-favourites")
            .waitForElementNotVisible("#favourites-modal", 2000)
            .pause(300);
        browser.expect.element("#catFavourites").text.to.not.contain("To Binary");
    },

    /**
     * T7 (Technique C). Guards the early return at the top of favDragover. This proves the handler
     * ignores a non-operation drag; it does not prove the browser would deliver one.
     */
    "Favourites category ignores non-operation drags": browser => {
        browser.useCss();
        utils.dragInProgress(browser, false);

        utils.syntheticDragEvent(browser, "#categories a", "dragover", {text: "some dragged text"});

        browser.expect.element("#categories a").to.have.attribute("class")
            .which.does.not.contain("favourites-hover");

        // Control: with the flag set, the same event does add the cue, so a handler that silently
        // stopped being reached would fail this test rather than pass it
        browser.execute(function() {
            window.app.manager.recipe.dragInProgress = true;
        });
        utils.syntheticDragEvent(browser, "#categories a", "dragover", {text: "some dragged text"});
        browser.expect.element("#categories a").to.have.attribute("class").which.contains("favourites-hover");

        browser.execute(function() {
            window.app.manager.recipe.dragInProgress = false;
            document.querySelector("#categories a").classList.remove("favourites-hover");
        });
    },

    /**
     * T8 (Technique B). The favourites editor has its own Sortable with its own removeIntent, and no
     * dataTransfer is involved in any of it, so the fallback path is a fair test of the real logic.
     */
    "Reorder and remove favourites in the editor": browser => {
        browser
            .useCss()
            .waitForElementNotVisible("#snackbar-container", 10000)
            .click("#edit-favourites")
            .waitForElementVisible("#favourites-modal", 2000)
            .waitForElementVisible("#edit-favourites-list li.operation", 2000)
            .pause(300);

        utils.expectCategoryOps(browser, "#edit-favourites-list", [
            "To Base64delete", "From Base64delete", "To Hexdelete", "From Hexdelete",
            "To Hexdumpdelete", "From Hexdumpdelete", "URL Decodedelete", "Regular expressiondelete",
            "Entropydelete", "Forkdelete", "Magicdelete"
        ]);

        utils.setForceFallback(browser, "#edit-favourites-list", true);

        // Drag the second entry above the first
        utils.fallbackDragAndDrop(
            browser,
            "#edit-favourites-list li.operation:nth-of-type(2)",
            "#edit-favourites-list li.operation:nth-of-type(1)",
            {sourceOffset: {x: 40, y: 10}, targetOffset: {x: 40, y: 2}}
        );
        browser.expect.element("#edit-favourites-list li.operation:nth-of-type(1)").text.to.contain("From Base64");

        // Drag an entry out of the list entirely, which sets the editor's own removeIntent
        browser.expect.elements("#edit-favourites-list li.operation").count.to.equal(11);
        utils.fallbackDragAndDrop(
            browser,
            "#edit-favourites-list li.operation:nth-of-type(11)",
            "#favourites-modal .modal-header",
            {sourceOffset: {x: 40, y: 10}}
        );
        browser.expect.elements("#edit-favourites-list li.operation").count.to.equal(10);

        // The remove icon is a Sortable filter, handled by onFilter rather than by a drag
        browser
            .click("#edit-favourites-list li.operation:nth-of-type(1) .remove-icon")
            .pause(200);
        browser.expect.elements("#edit-favourites-list li.operation").count.to.equal(9);

        browser
            .click("#save-favourites")
            .waitForElementNotVisible("#favourites-modal", 2000)
            .pause(400);

        // From Base64 was moved to the top and then deleted with the remove icon; Magic was the
        // eleventh entry and was dragged out of the list
        utils.expectCategoryOps(browser, "#catFavourites", [
            "To Base64", "To Hex", "From Hex", "To Hexdump", "From Hexdump",
            "URL Decode", "Regular expression", "Entropy", "Fork"
        ]);

        browser
            .waitForElementNotVisible("#snackbar-container", 10000)
            .click("#edit-favourites")
            .waitForElementVisible("#favourites-modal", 2000)
            .click("#reset-favourites")
            .waitForElementNotVisible("#favourites-modal", 2000)
            .pause(400);
        utils.expectCategoryOps(browser, "#catFavourites", [
            "To Base64", "From Base64", "To Hex", "From Hex", "To Hexdump", "From Hexdump",
            "URL Decode", "Regular expression", "Entropy", "Fork", "Magic"
        ]);
    },

    /**
     * T9 (Technique C). File drops cannot be performed by WebDriver at all, so the DataTransfer is
     * hand-built. This proves textArgDrop reads the file and fires a statechange; it does not prove
     * that a real OS drag reaches the handler.
     */
    "Drop a file onto a text argument": browser => {
        clearRecipe(browser);
        browser
            .urlHash("recipe=JWT_Verify('secret')")
            .waitForElementVisible("#rec-list li.operation textarea.arg", 3000)
            .pause(200);

        utils.syntheticDrop(browser, "#rec-list li.operation textarea.arg", {
            files: [utils.makeFile("secret.txt", "text/plain", "mysecret")],
            cueSelector: "#rec-list li.operation textarea.arg"
        }, observed => {
            browser.expect(observed.cueAfterDragover).to.equal(true);
            browser.expect(observed.cueAfterDrop).to.equal(false);
        });

        // FileReader is asynchronous, so the value arrives after the drop returns. Nightwatch's
        // expect assertions poll, so this waits rather than checking once.
        browser.expect.element("#rec-list li.operation textarea.arg").to.have.value.that.equals("mysecret");

        // The reader also fires a statechange, which is observable in the URL hash once the app's
        // state debounce has run
        browser.pause(500);
        browser.execute(function() {
            return decodeURIComponent(window.location.hash);
        }, [], function({value}) {
            browser.expect(value).to.contain("JWT_Verify('mysecret')");
        });

        clearRecipe(browser);
    },

    /**
     * T10 (Technique C). textArgDrop takes text over a file when both are present. Same caveat as
     * T9: handler behaviour only.
     */
    "Text beats file on a text argument drop": browser => {
        clearRecipe(browser);
        browser
            .urlHash("recipe=JWT_Verify('secret')")
            .waitForElementVisible("#rec-list li.operation textarea.arg", 3000)
            .pause(200);

        utils.syntheticDrop(browser, "#rec-list li.operation textarea.arg", {
            text: "from the text",
            files: [utils.makeFile("secret.txt", "text/plain", "from the file")]
        });

        browser.expect.element("#rec-list li.operation textarea.arg").to.have.value.that.equals("from the text");

        // Give the FileReader every chance to overwrite it, then check that it did not
        browser.pause(500);
        browser.expect.element("#rec-list li.operation textarea.arg").to.have.value.that.equals("from the text");

        clearRecipe(browser);
    },

    /**
     * T11 (Technique C). Mirrors the file assertions in 01_io.js, but reached through the drop
     * handler rather than the hidden file input.
     *
     * entryMode "stub" is doing real work here: Chrome returns null from webkitGetAsEntry() for
     * every item of a script-built DataTransfer, including file items, so without a stand-in
     * FileSystemFileEntry the FileSystemEntry branch of inputDrop cannot be reached from a test at
     * all. The stub is the only thing simulated; getAllFileEntries, getFile and loadUIFiles all run
     * for real. This does not prove a real OS drag produces the entries the app expects.
     */
    "Drop a file onto the input": browser => {
        browser.useCss().click("#clr-io").pause(300);

        utils.syntheticDrop(browser, "#input-text", {
            files: [utils.sampleFile("files/TowelDay.jpeg", "image/jpeg")],
            entryMode: "stub",
            cueSelector: "#input-text"
        }, observed => {
            browser.expect(observed.cueAfterDragover).to.equal(true);
            browser.expect(observed.cueAfterDrop).to.equal(false);
        });

        browser
            .pause(300)
            .waitForElementVisible("#input-text .cm-file-details", 5000)
            .waitForElementVisible("#input-text .cm-file-details .file-details-name", 5000);
        browser.expect.element("#input-text .cm-file-details .file-details-name").text.that.equals("TowelDay.jpeg");
        browser.expect.element("#input-text .cm-file-details .file-details-size").text.that.equals("61,379 bytes");
        browser.expect.element("#input-text .cm-file-details .file-details-type").text.that.equals("image/jpeg");
        browser.expect.element("#input-text .cm-file-details .file-details-loaded").text.that.equals("100%");

        browser.click("#clr-io").pause(300);
    },

    /**
     * T12 (Technique C). Two files should open two input tabs.
     *
     * This one uses entryMode "none", which removes webkitGetAsEntry so that inputDrop takes its
     * dataTransfer.files fallback branch - the path browsers without the non-standard
     * FileSystemEntry API take, which matters for the Safari and Firefox support the suite is
     * heading towards. As above, it does not prove a real OS drag reaches the handler.
     */
    "Drop multiple files onto the input opens multiple tabs": browser => {
        browser.useCss().click("#clr-io").pause(300);

        utils.syntheticDrop(browser, "#input-text", {
            files: [
                utils.sampleFile("files/TowelDay.jpeg", "image/jpeg"),
                utils.sampleFile("files/Hitchhikers_Guide.jpeg", "image/jpeg")
            ],
            entryMode: "none"
        });

        browser
            .waitForElementVisible("#input-tabs li:nth-of-type(2)", 5000)
            .waitForElementVisible("#input-text .cm-file-details", 5000);
        browser.expect.elements("#input-tabs li").count.to.equal(2);

        // The tabs themselves are only labelled "Tab n"; the file name for the active tab lives in
        // the side panel, so step through them. The files are loaded in parallel, so the order the
        // tabs end up in is not guaranteed.
        //
        // changeTab flips the tab highlight synchronously but then posts to the input worker, and
        // the details panel is only rebuilt when that reply arrives in setFile. Waiting for the
        // panel to be *visible* therefore proves nothing - the previous tab's panel is still there,
        // so the wait passes immediately and the read returns the wrong file. Tag the current panel
        // node instead and wait for it to be replaced, which is exactly the worker round trip.
        // (The same race exists in the folder upload test at 01_io.js:643, where it is harmless
        // only because that test asserts on whichever name it happens to read.)
        const names = [];
        for (let i = 1; i < 3; i++) {
            browser.execute(function() {
                const panel = document.querySelector("#input-text .cm-file-details");
                if (panel) panel.dataset.stale = "1";
            });

            browser
                .click(`#input-tabs li:nth-of-type(${i})`)
                .waitForElementVisible(`#input-tabs li:nth-of-type(${i}).active-input-tab`, 3000)
                .waitForElementVisible("#input-text .cm-file-details:not([data-stale]) .file-details-name", 3000)
                .getText("#input-text .cm-file-details:not([data-stale]) .file-details-name", function(result) {
                    names.push(result.value);
                });
        }
        browser.perform(function() {
            browser.expect(names.slice().sort().join(", "))
                .to.equal("Hitchhikers_Guide.jpeg, TowelDay.jpeg");
        });

        browser.click("#clr-io").pause(300);
        browser.waitForElementNotVisible("#input-tabs-wrapper", 3000);
    },

    /**
     * T13 (Technique C). A drop can carry items that are not files: dragging an image out of
     * another browser window brings text/html and text/uri-list items along with the file.
     * webkitGetAsEntry() returns null for those, and getAllFileEntries used to push the null onto
     * its queue and then dereference entry.isFile, throwing a TypeError and loading nothing - not
     * even the valid file beside it. Regression guard for the null check in
     * InputWaiter.getAllFileEntries.
     */
    "Dropping a non-file DataTransfer item on the input does not throw": browser => {
        browser.useCss().click("#clr-io").pause(300);
        utils.recordPageErrors(browser);

        utils.syntheticDrop(browser, "#input-text", {
            // A text/html item rather than text/plain, so inputDrop's "the editor handles text
            // itself" early return does not fire and we reach the file handling
            strings: [{type: "text/html", data: "<b>dragged from another window</b>"}],
            files: [utils.makeFile("dropped.txt", "text/plain", "still loads")],
            entryMode: "stub"
        });

        browser.pause(1500);
        utils.expectNoPageErrors(browser);
        browser.expect.element("#input-text .cm-file-details .file-details-name").text.that.equals("dropped.txt");

        // Insurance: if the null check in getAllFileEntries is ever dropped, the TypeError raises
        // webpack-dev-server's overlay, which would swallow the clicks of every test after this one
        utils.dismissDevServerOverlay(browser);
        browser.click("#clr-io").pause(300);
    },

    /**
     * T14 (Technique C). The mirror of the existing text-argument guard in 00_nightwatch.js, for
     * InputWaiter: an operation being dragged must not look like a file drop to the input.
     */
    "Dragging an operation over the input is ignored": browser => {
        browser.useCss().click("#clr-io").pause(300);

        browser.execute(function() {
            window.app.manager.recipe.dragInProgress = true;
        });
        utils.syntheticDragEvent(browser, "#input-text", "dragover", {});
        browser.expect.element("#input-text").to.have.attribute("class").which.does.not.contain("dropping-file");

        // Control: with the flag cleared the same event does add the cue
        browser.execute(function() {
            window.app.manager.recipe.dragInProgress = false;
        });
        utils.syntheticDragEvent(browser, "#input-text", "dragover", {});
        browser.expect.element("#input-text").to.have.attribute("class").which.contains("dropping-file");

        browser.execute(function() {
            document.getElementById("input-text").classList.remove("dropping-file");
        });
    },

    /**
     * T15 (Technique C). inputDragleave only clears the cue when the pointer has actually left
     * #input-text, because dragleave fires constantly while moving between CodeMirror lines. The
     * legacy e.fromElement property it reads is the event's relatedTarget for drag events.
     */
    "Dragleave within the input editor keeps the drop cue": browser => {
        browser.useCss().click("#clr-io").pause(300);

        utils.syntheticDragEvent(browser, "#input-text", "dragover", {});
        browser.expect.element("#input-text").to.have.attribute("class").which.contains("dropping-file");

        // Moving from one node inside the editor to another must not clear it
        utils.syntheticDragEvent(browser, "#input-text", "dragleave", {relatedTarget: "#input-text .cm-content"});
        browser.expect.element("#input-text").to.have.attribute("class").which.contains("dropping-file");

        // Leaving for something outside the editor must
        utils.syntheticDragEvent(browser, "#input-text", "dragleave", {relatedTarget: "#operations"});
        browser.expect.element("#input-text").to.have.attribute("class").which.does.not.contain("dropping-file");
    },

    /**
     * T16 (Actions API). Split.js works off plain mouse events, so no special technique is needed.
     */
    "Pane splitters can be dragged": browser => {
        browser
            .useCss()
            .waitForElementNotVisible("#snackbar-container", 10000)
            .click("#reset-layout")
            .pause(300);

        browser.perform(async function() {
            /**
             * Drags a Split.js gutter and reports the size of the pane before and after.
             *
             * @param {string} selector - CSS selector matching the gutters
             * @param {number} index - Which gutter to drag
             * @param {Object} by - How far to drag it, in CSS pixels
             * @param {string} paneId - The pane whose size to measure
             * @param {string} dimension - "width" or "height"
             * @returns {Promise<{before: number, after: number}>}
             */
            const dragGutter = async function(selector, index, by, paneId, dimension) {
                const before = await browser.execute(function(paneId, dimension) {
                    return document.getElementById(paneId).getBoundingClientRect()[dimension];
                }, [paneId, dimension]);

                const gutter = await utils.pointFor(browser, selector, null, index);
                await browser.driver.actions({async: true})
                    .move({x: gutter.x, y: gutter.y, origin: "viewport"})
                    .press()
                    .move({x: gutter.x + by.x / 2, y: gutter.y + by.y / 2, origin: "viewport", duration: 20})
                    .move({x: gutter.x + by.x, y: gutter.y + by.y, origin: "viewport", duration: 20})
                    .release()
                    .perform();

                const after = await browser.execute(function(paneId, dimension) {
                    return document.getElementById(paneId).getBoundingClientRect()[dimension];
                }, [paneId, dimension]);
                return {before: before, after: after};
            };

            // The first horizontal gutter sits between #operations and #recipe, the second between
            // #recipe and #IO
            const cols = await dragGutter(".gutter.gutter-horizontal", 0, {x: 100, y: 0}, "operations", "width");
            browser.expect(cols.after).to.be.greaterThan(cols.before + 50);

            const rows = await dragGutter(".gutter.gutter-vertical", 0, {x: 0, y: -100}, "input", "height");
            browser.expect(rows.after).to.be.lessThan(rows.before - 50);
        });

        browser.click("#reset-layout").pause(300);
        browser.execute(function() {
            return document.getElementById("operations").getBoundingClientRect().width;
        }, [], function({value}) {
            // resetLayout puts the columns back to 20/30/50 of the 1280px window, less the gutters
            browser.expect(value).to.be.within(240, 260);
        });
    },

    /**
     * T17 (Technique C, touch events). RecipeWaiter binds touchend on #rec-list to recompute
     * removeIntent from elementFromPoint, which is how removal works for touch users. Nothing else
     * in the suite goes near it. Synthetic touch events prove the handler's arithmetic, not that a
     * real touch drag reaches it.
     */
    "Touch drag out of the recipe sets the remove intent": browser => {
        clearRecipe(browser);
        browser
            .urlHash("recipe=To_Base64('A-Za-z0-9%2B/%3D')")
            .waitForElementPresent("#rec-list li.operation", 3000)
            .pause(200);

        browser.execute(function() {
            const recList = document.getElementById("rec-list"),
                op = recList.querySelector("li.operation"),
                inside = recList.getBoundingClientRect(),
                outside = document.getElementById("operations").getBoundingClientRect();

            /**
             * Dispatches a touch sequence ending at the given point.
             *
             * @param {number} x - clientX of the final touch
             * @param {number} y - clientY of the final touch
             */
            const touchTo = function(x, y) {
                ["touchstart", "touchmove", "touchend"].forEach(function(type) {
                    const touch = new Touch({identifier: 1, target: op, clientX: x, clientY: y});
                    op.dispatchEvent(new TouchEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        changedTouches: [touch],
                        touches: type === "touchend" ? [] : [touch],
                        targetTouches: type === "touchend" ? [] : [touch]
                    }));
                });
            };

            window.app.manager.recipe.removeIntent = false;
            touchTo(Math.round(outside.left + outside.width / 2), Math.round(outside.top + outside.height - 60));
            const afterOutside = window.app.manager.recipe.removeIntent;

            touchTo(Math.round(inside.left + inside.width / 2), Math.round(inside.top + 10));
            const afterInside = window.app.manager.recipe.removeIntent;

            window.app.manager.recipe.removeIntent = false;
            return {afterOutside: afterOutside, afterInside: afterInside};
        }, [], function({value}) {
            browser.expect(value.afterOutside).to.equal(true);
            browser.expect(value.afterInside).to.equal(false);
        });

        clearRecipe(browser);
    },

    after: browser => {
        browser.end();
    }
};
