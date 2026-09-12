/**
 * Utility functions for browser tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

/** @function
 * Clears the recipe and input
 *
 * @param {Browser} browser - Nightwatch client
 */
function clear(browser) {
    browser
        .useCss()
        .click("#clr-recipe")
        .click("#clr-io")
        .waitForElementNotPresent("#rec-list li.operation")
        .expect.element("#input-text .cm-content").text.that.equals("");
}

/** @function
 * Sets the input to the desired string
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} input - The text to populate the input with
 * @param {boolean} [type=true] - Whether to type the characters in by using sendKeys,
 *      or to set the value of the editor directly (useful for special characters)
 */
function setInput(browser, input, type=true) {
    clear(browser);
    if (type) {
        browser
            .useCss()
            .sendKeys("#input-text .cm-content", input)
            .pause(100);
    } else {
        browser.execute(text => {
            window.app.setInput(text);
        }, [input]);
        browser.pause(100);
    }
    expectInput(browser, input);
}

/** @function
 * Triggers a bake
 *
 * @param {Browser} browser - Nightwatch client
 */
function bake(browser) {
    browser
        // Let any pending debounced inputChange/stateChange (~20ms each) fire so the
        // worker has the latest input buffer before we ask it to bake.
        .pause(50)
        // Ensure we're not currently busy
        .waitForElementNotVisible("#output-loader", 10000)
        .expect.element("#bake span").text.to.equal("BAKE!");

    browser
        .click("#bake")
        .waitForElementNotVisible("#stale-indicator", 10000)
        .waitForElementNotVisible("#output-loader", 10000);
}

/** @function
 * Sets the character encoding in the input or output
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} io - Either "input" or "output"
 * @param {string} enc - The encoding to be set
 */
function setChrEnc(browser, io, enc) {
    io = `#${io}-text`;
    browser
        .useCss()
        .waitForElementNotVisible("#snackbar-container", 6000)
        .click(io + " .chr-enc-value")
        .waitForElementVisible(io + " .chr-enc-select .cm-status-bar-select-scroll")
        .click("link text", enc)
        .waitForElementNotVisible(io + " .chr-enc-select .cm-status-bar-select-scroll")
        .expect.element(io + " .chr-enc-value").text.that.equals(enc);
}

/** @function
 * Sets the end of line sequence in the input or output
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} io - Either "input" or "output"
 * @param {string} eol - The sequence to set
 */
function setEOLSeq(browser, io, eol) {
    io = `#${io}-text`;
    browser
        .useCss()
        .waitForElementNotVisible("#snackbar-container", 6000)
        .click(io + " .eol-value")
        .waitForElementVisible(io + " .eol-select .cm-status-bar-select-content")
        .click(`${io} .cm-status-bar-select-content a[data-val=${eol}]`)
        .waitForElementNotVisible(io + " .eol-select .cm-status-bar-select-content")
        .expect.element(io + " .eol-value").text.that.equals(eol);
}

/** @function
 * Copies whatever is currently selected
 *
 * @param {Browser} browser - Nightwatch client
 */
function copy(browser) {
    browser.perform(function() {
        const actions = this.actions({async: true});

        // Ctrl + Ins used as this works on Windows, Linux and Mac
        return actions
            .keyDown(browser.Keys.CONTROL)
            .keyDown(browser.Keys.INSERT)
            .keyUp(browser.Keys.INSERT)
            .keyUp(browser.Keys.CONTROL);
    });
}

/** @function
 * Pastes into the target element
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} el - Target element selector
 */
function paste(browser, el) {
    browser
        .click(el)
        .perform(function() {
            const actions = this.actions({async: true});

            // Shift + Ins used as this works on Windows, Linux and Mac
            return actions
                .keyDown(browser.Keys.SHIFT)
                .keyDown(browser.Keys.INSERT)
                .keyUp(browser.Keys.INSERT)
                .keyUp(browser.Keys.SHIFT);
        })
        .pause(100);
}

/** @function
 * Loads a recipe and input
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string|Array<string>} opName - name of operation to be loaded, array for multiple ops
 * @param {string} input - input text for test
 * @param {Array<string>|Array<Array<string>>} args - arguments, nested if multiple ops
 */
function loadRecipe(browser, opName, input, args) {
    let recipeConfig;

    if (typeof(opName) === "string") {
        recipeConfig = JSON.stringify([{
            "op": opName,
            "args": args
        }]);
    } else if (opName instanceof Array) {
        recipeConfig = JSON.stringify(
            opName.map((op, i) => {
                return {
                    op: op,
                    args: args.length ? args[i] : []
                };
            })
        );
    } else {
        throw new Error("Invalid operation type. Must be string or array of strings. Received: " + typeof(opName));
    }

    setInput(browser, input, false);
    browser
        .urlHash("recipe=" + recipeConfig)
        .waitForElementPresent("#rec-list li.operation");
}

/** @function
 * Tests whether the output matches a given value
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string|RegExp} expected - The expected output value
 * @param {boolean} [waitNotNull=false] - Wait for the output to not be empty before testing the value
 * @param {number} [waitWindow=1000] - The number of milliseconds to wait for the output to be correct
 */
function expectOutput(browser, expected, waitNotNull=false, waitWindow=1000) {
    if (waitNotNull && expected !== "") {
        browser.waitUntil(async function() {
            const output = await this.execute(function() {
                return window.app.manager.output.outputEditorView.state.doc.toString();
            });
            return output.length;
        }, waitWindow);
    }

    browser.execute(expected => {
        return window.app.manager.output.outputEditorView.state.doc.toString();
    }, [expected], function({value}) {
        if (expected instanceof RegExp) {
            browser.expect(value).match(expected);
        } else {
            browser.expect(value).to.be.equal(expected);
        }
    });
}

/** @function
 * Tests whether the input matches a given value
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string|RegExp} expected - The expected input value
 */
function expectInput(browser, expected) {
    browser.execute(expected => {
        return window.app.manager.input.inputEditorView.state.doc.toString();
    }, [expected], function({value}) {
        if (expected instanceof RegExp) {
            browser.expect(value).match(expected);
        } else {
            browser.expect(value).to.be.equal(expected);
        }
    });
}

/** @function
 * Uploads a file using the #open-file input
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} filename - A path to a file in the samples directory
 */
function uploadFile(browser, filename) {
    const filepath = require("path").resolve(__dirname + "/../samples/" + filename);

    // The file input cannot be interacted with by nightwatch while it is hidden,
    // so we temporarily expose it for the purposes of this test.
    browser.execute(() => {
        document.getElementById("open-file").style.display = "block";
    });
    browser
        .pause(100)
        .setValue("#open-file", filepath)
        .pause(100);
    browser.execute(() => {
        document.getElementById("open-file").style.display = "none";
    });
    browser.waitForElementVisible("#input-text .cm-file-details");
}

/** @function
 * Uploads a folder using the #open-folder input
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} foldername - A path to a folder in the samples directory
 */
function uploadFolder(browser, foldername) {
    const folderpath = require("path").resolve(__dirname + "/../samples/" + foldername);

    // The folder input cannot be interacted with by nightwatch while it is hidden,
    // so we temporarily expose it for the purposes of this test.
    browser.execute(() => {
        document.getElementById("open-folder").style.display = "block";
    });
    browser
        .pause(100)
        .setValue("#open-folder", folderpath)
        .pause(500);
    browser.execute(() => {
        document.getElementById("open-folder").style.display = "none";
    });
    browser.waitForElementVisible("#input-text .cm-file-details");
}


/**
 * Bitmask of the drag operations a dispatched CDP drag will allow.
 *
 * Blink's DragOperation bits are Copy=1, Link=2, Generic=4, Private=8, Move=16. SortableJS sets
 * `dropEffect = "move"` on every dragover it accepts, so a mask that omits bit 16 makes Chromium
 * resolve the drag to "no operation" and silently swallow the drop - it sends dragleave/dragend
 * instead. Allow everything.
 */
const DRAG_OPERATIONS_ALL = 31;

/** @function
 * Reports whether the Chrome DevTools Protocol is reachable from this session.
 *
 * Technique A (native drag via CDP) is Chrome-only: `safaridriver` and `geckodriver` expose no CDP
 * endpoint. Tests that need it should check this in `before` and skip themselves rather than fail.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {function} callback - Called with `true` if CDP commands can be sent
 */
function cdpAvailable(browser, callback) {
    browser.perform(async function() {
        if (typeof browser.driver?.sendAndGetDevToolsCommand !== "function") {
            callback(false);
            return;
        }
        try {
            await browser.driver.sendAndGetDevToolsCommand("Browser.getVersion", {});
            callback(true);
        } catch (err) {
            callback(false);
        }
    });
}

/** @function
 * Sends a one-way Chrome DevTools Protocol command.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} command - CDP method name, e.g. "Input.dispatchDragEvent"
 * @param {Object} params - CDP method parameters
 * @returns {Promise}
 */
function cdp(browser, command, params) {
    return browser.driver.sendAndGetDevToolsCommand(command, params);
}

/** @function
 * Resolves a selector to a viewport point, optionally offset from the element's top left corner.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} selector - CSS selector for the element
 * @param {Object} [offset] - Offset in CSS pixels from the element's top left corner. Defaults to
 *      the centre of the element.
 * @param {number} [index=0] - Which match to use, when the selector matches several elements
 * @returns {Promise<{x: number, y: number}>}
 */
async function pointFor(browser, selector, offset, index) {
    return await browser.execute(function(selector, offset, index) {
        const el = document.querySelectorAll(selector)[index || 0];
        if (!el) throw new Error("No element matches " + selector);
        const r = el.getBoundingClientRect();
        return {
            x: Math.round(offset ? r.left + offset.x : r.left + r.width / 2),
            y: Math.round(offset ? r.top + offset.y : r.top + r.height / 2)
        };
    }, [selector, offset || null, index || 0]);
}

/**
 * Set by nativeDragStart and cleared once the drag has been torn down, so that nativeDragCancel can
 * tell whether there is anything to undo.
 */
let nativeDragActive = false;

/** @function
 * Technique A, step 1. Begins a genuine native HTML5 drag on an element.
 *
 * Chromium will not synthesise native drag events from WebDriver mouse input, so we drive it with
 * CDP instead: `Input.setInterceptDrags` hands the drag over to us, and a press plus a few moves on
 * the source is enough for the renderer to fire a real `dragstart`. That means SortableJS's own
 * `onStart` and `setData` run for real - we capture what `setData` wrote by patching
 * `DataTransfer.prototype.setData` for the duration of the drag, which saves us needing a
 * bidirectional CDP session to receive `Input.dragIntercepted`.
 *
 * Must be paired with nativeDrop or nativeDragCancel so that interception is turned back off.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} sourceSelector - CSS selector for the element to drag
 * @param {Object} [offset] - Offset from the source element's top left corner
 */
function nativeDragStart(browser, sourceSelector, offset) {
    browser.perform(async function() {
        nativeDragActive = true;

        await browser.execute(function() {
            window.__dragPayload = null;
            // A drag that was never torn down leaves its wrapper in place. Saving that as the
            // original would make the new wrapper call itself, so only ever save the real one.
            if (!window.__origSetData) window.__origSetData = DataTransfer.prototype.setData;
            DataTransfer.prototype.setData = function(format, data) {
                window.__dragPayload = {format: format, data: data};
                return window.__origSetData.call(this, format, data);
            };
        });

        const from = await pointFor(browser, sourceSelector, offset);
        await cdp(browser, "Input.setInterceptDrags", {enabled: true});

        const mouse = (type, x, y, buttons) => cdp(browser, "Input.dispatchMouseEvent", {
            type: type, x: x, y: y, button: "left", buttons: buttons, clickCount: 1
        });

        await mouse("mousePressed", from.x, from.y, 1);
        // Sortable ignores a single jump: it needs the pointer to actually travel
        for (let i = 1; i <= 6; i++) {
            await mouse("mouseMoved", from.x + i * 4, from.y + i * 3, 1);
        }

        // Remember where the drag is, so the first nativeDragOver travels from the source rather
        // than teleporting to the target. Anything that reacts to crossing a boundary - the recipe
        // list's dragleave, for one - only fires if the drag actually passes over the edge.
        await browser.execute(function(pt) {
            window.__dragLast = pt;
        }, [{x: from.x + 24, y: from.y + 18}]);

        const payload = await browser.execute(function() {
            return window.__dragPayload;
        });
        // Stash the DragData the rest of the drag will carry. This is the real payload Sortable's
        // setData wrote, so drop handlers that read dataTransfer see exactly what the app produced.
        await browser.execute(function(data, mask) {
            window.__dragData = {
                items: [{mimeType: "text/plain", data: data}],
                files: [],
                dragOperationsMask: mask
            };
        }, [(payload && payload.data) || "", DRAG_OPERATIONS_ALL]);
    });
}

/** @function
 * Technique A, step 2. Drags the in-progress native drag over a target, in several steps.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} targetSelector - CSS selector for the element to drag over
 * @param {Object} [offset] - Offset from the target element's top left corner
 * @param {number} [steps=6] - Number of intermediate dragOver events to emit
 */
function nativeDragOver(browser, targetSelector, offset, steps=6) {
    browser.perform(async function() {
        const to = await pointFor(browser, targetSelector, offset);
        const data = await browser.execute(function() {
            return window.__dragData;
        });
        const from = await browser.execute(function() {
            return window.__dragLast || null;
        });
        if (!from) throw new Error("nativeDragOver called without a drag in progress");
        const start = from;

        await cdp(browser, "Input.dispatchDragEvent", {type: "dragEnter", x: start.x, y: start.y, data: data});
        for (let i = 1; i <= steps; i++) {
            await cdp(browser, "Input.dispatchDragEvent", {
                type: "dragOver",
                x: Math.round(start.x + (to.x - start.x) * i / steps),
                y: Math.round(start.y + (to.y - start.y) * i / steps),
                data: data
            });
        }
        // Chromium turns the first dragOver over a new element into a dragenter on it plus a
        // dragleave on the one before, and no dragover at all. Anything listening for dragover -
        // the recipe list clearing removeIntent, or Sortable accepting the drop - would never hear
        // about the last step of the journey, so settle with a couple more at the same point.
        for (let i = 0; i < 2; i++) {
            await cdp(browser, "Input.dispatchDragEvent", {type: "dragOver", x: to.x, y: to.y, data: data});
        }
        await browser.execute(function(pt) {
            window.__dragLast = pt;
        }, [to]);
    });
}

/** @function
 * Technique A, step 3. Drops the in-progress native drag at the current position and stops
 * intercepting drags.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} [targetSelector] - Optional selector to drop on. Defaults to wherever the last
 *      nativeDragOver left the pointer.
 * @param {Object} [offset] - Offset from the target element's top left corner
 */
function nativeDrop(browser, targetSelector, offset) {
    browser.perform(async function() {
        let to;
        try {
            to = targetSelector ?
                await pointFor(browser, targetSelector, offset) :
                await browser.execute(function() {
                    return window.__dragLast;
                });
            const data = await browser.execute(function() {
                return window.__dragData;
            });

            await cdp(browser, "Input.dispatchDragEvent", {type: "drop", x: to.x, y: to.y, data: data});
        } finally {
            await endNativeDrag(browser, to);
        }
    });
}

/** @function
 * Technique A. Abandons the native drag nativeDragStart began, if one is still in progress, and
 * turns drag interception back off. The page sees the drag end without a drop - dragleave then
 * dragend, as it would if the user pressed Escape.
 *
 * Input.dispatchDragEvent documents a "cancel" type, but Chrome rejects it as an unexpected event
 * type. Instead this drops with no operations allowed, which Chromium resolves as it does any drop
 * it cannot perform (see DRAG_OPERATIONS_ALL): no drop event, just dragleave and dragend.
 *
 * Safe to call at any time and any number of times: with no drag in progress it does nothing. That
 * makes it fit for an afterEach hook, which is where it is needed - a test that fails between
 * nativeDragStart and nativeDrop never reaches the drop, and without this the interception and the
 * setData patch would outlive it into whatever runs next, a retry of the same test included.
 *
 * @param {Browser} browser - Nightwatch client
 */
function nativeDragCancel(browser) {
    browser.perform(async function() {
        if (!nativeDragActive) return;

        let at = null;
        try {
            at = await browser.execute(function() {
                return window.__dragLast;
            });
            const data = await browser.execute(function() {
                return window.__dragData;
            });
            // nativeDragStart may have failed before recording a position or payload
            const point = at || {x: 0, y: 0};
            await cdp(browser, "Input.dispatchDragEvent", {
                type: "drop", x: point.x, y: point.y,
                data: Object.assign({items: []}, data, {dragOperationsMask: 0})
            });
        } catch (err) {
            // Only likely if the page or the CDP session has gone. The teardown still has to run.
        } finally {
            await endNativeDrag(browser, at);
        }
    });
}

/**
 * Shared by nativeDrop and nativeDragCancel. Releases the mouse button nativeDragStart pressed,
 * turns drag interception off and restores DataTransfer.prototype.setData.
 *
 * Every step is attempted even if an earlier one fails, and nothing is thrown: this runs after a
 * failure as often as not, and should neither mask that failure nor leave the job half done.
 * __dragPayload is deliberately kept, because expectDragPayload reads it after the drop.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {{x: number, y: number}} [at] - Where to release the mouse. Defaults to the viewport origin.
 * @returns {Promise}
 */
async function endNativeDrag(browser, at) {
    nativeDragActive = false;
    const point = at || {x: 0, y: 0};
    const attempt = async step => {
        try {
            await step();
        } catch (err) {
            // Carry on with the next step regardless
        }
    };

    await attempt(() => cdp(browser, "Input.dispatchMouseEvent", {
        type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1
    }));
    await attempt(() => cdp(browser, "Input.setInterceptDrags", {enabled: false}));
    await attempt(() => browser.execute(function() {
        if (window.__origSetData) DataTransfer.prototype.setData = window.__origSetData;
        window.__origSetData = null;
        window.__dragLast = null;
        window.__dragData = null;
    }));
}

/** @function
 * Technique A. Performs a complete native HTML5 drag and drop, exercising the browser's own drag
 * implementation and the real dataTransfer contents.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} sourceSelector - CSS selector for the element to drag
 * @param {string} targetSelector - CSS selector for the element to drop onto
 * @param {Object} [targetOffset] - Offset from the target element's top left corner
 * @param {Object} [sourceOffset] - Offset from the source element's top left corner
 */
function nativeDragAndDrop(browser, sourceSelector, targetSelector, targetOffset, sourceOffset) {
    nativeDragStart(browser, sourceSelector, sourceOffset);
    nativeDragOver(browser, targetSelector, targetOffset);
    nativeDrop(browser, targetSelector, targetOffset);
    browser.pause(200);
}

/** @function
 * Returns the payload SortableJS wrote into the dataTransfer during the last native drag.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} expected - The expected payload
 */
function expectDragPayload(browser, expected) {
    browser.execute(function() {
        return window.__dragPayload;
    }, [], function({value}) {
        browser.expect(value && value.data).to.equal(expected);
    });
}

/** @function
 * Switches a SortableJS list into its pointer-event fallback mode, for Technique B.
 *
 * CyberChef does not export Sortable onto `window`, but every Sortable instance stores itself on its
 * element under a `Sortable<timestamp>` own property, which is enough to reach `option()`.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} selector - CSS selector for the Sortable list
 * @param {boolean} enabled - Whether to force the fallback path
 */
function setForceFallback(browser, selector, enabled) {
    browser.execute(function(selector, enabled) {
        const el = document.querySelector(selector);
        const key = Object.keys(el).find(k => k.indexOf("Sortable") === 0);
        if (!key) throw new Error("No Sortable instance found on " + selector);
        el[key].option("forceFallback", enabled);
        return true;
    }, [selector, enabled]);
}

/** @function
 * Technique B. Drags one element onto another using SortableJS's pointer-event fallback path and a
 * real WebDriver pointer, driven as a single Actions chain so the button stays down throughout.
 *
 * This exercises Sortable's real reordering logic and the real DOM outcome, but through the fallback
 * code path rather than native HTML5 drag and drop. It does not populate a `dataTransfer`, so it
 * cannot cover anything that reads one. It is, however, the code path touch users get.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} sourceSelector - CSS selector for the element to drag
 * @param {string} targetSelector - CSS selector for the element to drop onto
 * @param {Object} [opts]
 * @param {Object} [opts.sourceOffset] - Offset from the source element's top left corner
 * @param {Object} [opts.targetOffset] - Offset from the target element's top left corner
 * @param {number} [opts.steps=12] - Number of intermediate pointer moves
 */
function fallbackDragAndDrop(browser, sourceSelector, targetSelector, opts) {
    const options = opts || {};
    browser.perform(async function() {
        const from = await pointFor(browser, sourceSelector, options.sourceOffset);
        const to = await pointFor(browser, targetSelector, options.targetOffset);
        const steps = options.steps || 12;

        let chain = browser.driver.actions({async: true})
            .move({x: from.x, y: from.y, origin: "viewport"})
            .press();
        for (let i = 1; i <= steps; i++) {
            chain = chain.move({
                x: Math.round(from.x + (to.x - from.x) * i / steps),
                y: Math.round(from.y + (to.y - from.y) * i / steps),
                origin: "viewport",
                duration: 20
            });
        }
        await chain.release().perform();
    });
    browser.pause(300);
}

/** @function
 * Builds a descriptor for a File to be constructed inside the page by syntheticDrop.
 *
 * A File object cannot cross the WebDriver boundary, so we pass its ingredients instead. Note this
 * differs from the signature sketched in the plan (no `browser` argument) because the File has to be
 * built inside the same `execute` block as the DataTransfer that carries it.
 *
 * @param {string} name - File name
 * @param {string} type - MIME type
 * @param {string} contents - File contents, base64 if `base64` is set
 * @param {boolean} [base64=false] - Whether `contents` is base64 encoded
 * @returns {Object}
 */
function makeFile(name, type, contents, base64=false) {
    return {name: name, type: type, contents: contents, base64: !!base64};
}

/** @function
 * Builds a File descriptor from a file in the tests/samples directory.
 *
 * @param {string} filename - Path relative to tests/samples, e.g. "files/TowelDay.jpeg"
 * @param {string} type - MIME type
 * @returns {Object}
 */
function sampleFile(filename, type) {
    const fs = require("fs"),
        path = require("path"),
        buf = fs.readFileSync(path.resolve(__dirname + "/../samples/" + filename));
    return makeFile(path.basename(filename), type, buf.toString("base64"), true);
}

/**
 * The body of syntheticDrop, serialised into the page. Kept as a named function so the JSDoc above
 * syntheticDrop can describe the options in one place.
 *
 * @param {string} selector - Element to dispatch the events on
 * @param {Object} opts - See syntheticDrop
 * @returns {Object} Observations made between the dragover and the drop
 */
function syntheticDropInPage(selector, opts) {
    const el = document.querySelector(selector);
    if (!el) throw new Error("No element matches " + selector);

    const dt = new DataTransfer();
    if (opts.text) dt.setData("Text", opts.text);
    (opts.strings || []).forEach(s => dt.items.add(s.data, s.type));
    (opts.files || []).forEach(f => {
        let body;
        if (f.base64) {
            const bin = atob(f.contents),
                bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            body = bytes;
        } else {
            body = f.contents;
        }
        dt.items.add(new File([body], f.name, {type: f.type}));
    });

    // Chrome returns null from webkitGetAsEntry() for every item of a script-built DataTransfer,
    // including file items, so the FileSystemEntry branch of InputWaiter.inputDrop is unreachable
    // without help. entryMode says what to do about it:
    //   "raw"   - leave it alone; what a script-built DataTransfer really does
    //   "stub"  - return a minimal FileSystemFileEntry for file items and null for string items,
    //             which is what a real OS drag produces
    //   "none"  - remove webkitGetAsEntry entirely, so the code takes its dataTransfer.files
    //             fallback branch (the path Firefox and Safari take)
    const proto = DataTransferItem.prototype,
        origDesc = Object.getOwnPropertyDescriptor(proto, "webkitGetAsEntry");
    if (opts.entryMode === "stub") {
        proto.webkitGetAsEntry = function() {
            if (this.kind !== "file") return null;
            const file = this.getAsFile();
            return {
                isFile: true,
                isDirectory: false,
                name: file.name,
                file: function(resolve) {
                    resolve(file);
                }
            };
        };
    } else if (opts.entryMode === "none") {
        delete proto.webkitGetAsEntry;
    }

    const rect = el.getBoundingClientRect(),
        init = {
            bubbles: true,
            cancelable: true,
            dataTransfer: dt,
            clientX: Math.round(rect.left + rect.width / 2),
            clientY: Math.round(rect.top + rect.height / 2)
        };

    const observed = {};
    if (opts.dragover !== false) {
        el.dispatchEvent(new DragEvent("dragover", init));
        observed.cueSelector = opts.cueSelector || null;
        if (opts.cueSelector) {
            const cueEl = document.querySelector(opts.cueSelector);
            observed.cueAfterDragover = !!cueEl && cueEl.classList.contains("dropping-file");
        }
    }
    if (opts.drop !== false) {
        el.dispatchEvent(new DragEvent("drop", init));
        if (opts.cueSelector) {
            const cueEl = document.querySelector(opts.cueSelector);
            observed.cueAfterDrop = !!cueEl && cueEl.classList.contains("dropping-file");
        }
    }

    // Put the prototype back however we found it, even if the handler threw
    if (opts.entryMode === "stub" || opts.entryMode === "none") {
        if (origDesc) {
            Object.defineProperty(proto, "webkitGetAsEntry", origDesc);
        } else {
            delete proto.webkitGetAsEntry;
        }
    }
    return observed;
}

/** @function
 * Technique C. Dispatches a synthetic dragover/drop pair carrying a hand-built DataTransfer.
 *
 * This proves the app's handlers behave, not that the browser will ever call them. It is the only
 * option for file drops - WebDriver cannot perform an OS-level file drop at all - and for asserting
 * on cue classes and on the dragInProgress guards.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} targetSelector - Element to dispatch the events on. The listener may be on an
 *      ancestor; the events bubble.
 * @param {Object} opts
 * @param {string} [opts.text] - Text payload, set as "Text"
 * @param {Array<{type: string, data: string}>} [opts.strings] - Extra string items
 * @param {Array<Object>} [opts.files] - File descriptors from makeFile or sampleFile
 * @param {string} [opts.entryMode="raw"] - "raw", "stub" or "none"; see syntheticDropInPage
 * @param {string} [opts.cueSelector] - Element to check for the ".dropping-file" cue class
 * @param {boolean} [opts.dragover=true] - Whether to dispatch the dragover
 * @param {boolean} [opts.drop=true] - Whether to dispatch the drop
 * @param {function} [callback] - Receives the observations made around the drop
 */
function syntheticDrop(browser, targetSelector, opts, callback) {
    browser.execute(syntheticDropInPage, [targetSelector, opts || {}], function({value}) {
        if (callback) callback(value);
    });
}

/** @function
 * Dispatches a single synthetic drag event, for the cases where only one half of the interaction
 * matters.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} targetSelector - Element to dispatch the event on
 * @param {string} type - Event type, e.g. "dragover", "dragleave"
 * @param {Object} [opts]
 * @param {string} [opts.text] - Text payload, set as "Text"
 * @param {string} [opts.relatedTarget] - Selector for the event's relatedTarget, which is what
 *      the legacy `e.fromElement` property reads for drag events
 */
function syntheticDragEvent(browser, targetSelector, type, opts) {
    browser.execute(function(selector, type, opts) {
        const el = document.querySelector(selector),
            dt = new DataTransfer();
        if (opts.text) dt.setData("Text", opts.text);
        el.dispatchEvent(new DragEvent(type, {
            bubbles: true,
            cancelable: true,
            dataTransfer: dt,
            relatedTarget: opts.relatedTarget ? document.querySelector(opts.relatedTarget) : null
        }));
    }, [targetSelector, type, opts || {}]);
}

/** @function
 * Asserts the state of the recipe's dragInProgress flag.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {boolean} expected - The expected value
 */
function dragInProgress(browser, expected) {
    browser.execute(function() {
        return window.app.manager.recipe.dragInProgress;
    }, [], function({value}) {
        browser.expect(value).to.equal(expected);
    });
}

/** @function
 * Asserts the state of the recipe's removeIntent flag.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {boolean} expected - The expected value
 */
function removeIntent(browser, expected) {
    browser.execute(function() {
        return window.app.manager.recipe.removeIntent;
    }, [], function({value}) {
        browser.expect(value).to.equal(expected);
    });
}

/** @function
 * Asserts the operations currently in the recipe, in order.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {Array<string>} opNames - The expected operation titles, top to bottom
 */
function expectRecipeOrder(browser, opNames) {
    browser.execute(function() {
        return Array.from(document.querySelectorAll("#rec-list li.operation .op-title"), el => el.textContent.trim());
    }, [], function({value}) {
        browser.expect(value.join(" | ")).to.equal(opNames.join(" | "));
    });
}

/** @function
 * Asserts the operations currently under a category, in order.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string} catSelector - CSS selector for the category's op list, e.g. "#catFavourites"
 * @param {Array<string>} opNames - The expected operation names, top to bottom
 */
function expectCategoryOps(browser, catSelector, opNames) {
    browser.execute(function(catSelector) {
        return Array.from(document.querySelectorAll(catSelector + " li.operation"), el => el.textContent.trim());
    }, [catSelector], function({value}) {
        browser.expect(value.join(" | ")).to.equal(opNames.join(" | "));
    });
}

/** @function
 * Starts recording uncaught errors and unhandled rejections in the page.
 *
 * @param {Browser} browser - Nightwatch client
 */
function recordPageErrors(browser) {
    browser.execute(function() {
        window.__pageErrors = [];
        window.addEventListener("error", e => window.__pageErrors.push(String(e.message)));
        window.addEventListener("unhandledrejection", e => window.__pageErrors.push(String(e.reason)));
    });
}

/** @function
 * Asserts that nothing has been recorded by recordPageErrors.
 *
 * @param {Browser} browser - Nightwatch client
 */
function expectNoPageErrors(browser) {
    browser.execute(function() {
        return window.__pageErrors || [];
    }, [], function({value}) {
        browser.expect(value.join("; ")).to.equal("");
    });
}

/** @function
 * Removes webpack-dev-server's error overlay if it is showing.
 *
 * `npm run testuidev` serves the app through webpack-dev-server, which throws a full-viewport iframe
 * over the page as soon as anything in the app raises an uncaught error. It swallows every
 * subsequent click, so a test that deliberately provokes an app error has to clear it before the
 * next test runs. The overlay does not exist in the production build `npx grunt testui` serves.
 *
 * @param {Browser} browser - Nightwatch client
 */
function dismissDevServerOverlay(browser) {
    browser.execute(function() {
        const overlay = document.getElementById("webpack-dev-server-client-overlay");
        if (overlay) overlay.remove();
    });
}


module.exports = {
    clear: clear,
    setInput: setInput,
    bake: bake,
    setChrEnc: setChrEnc,
    setEOLSeq: setEOLSeq,
    copy: copy,
    paste: paste,
    loadRecipe: loadRecipe,
    expectOutput: expectOutput,
    expectInput: expectInput,
    uploadFile: uploadFile,
    uploadFolder: uploadFolder,
    cdpAvailable: cdpAvailable,
    pointFor: pointFor,
    nativeDragStart: nativeDragStart,
    nativeDragOver: nativeDragOver,
    nativeDrop: nativeDrop,
    nativeDragCancel: nativeDragCancel,
    nativeDragAndDrop: nativeDragAndDrop,
    expectDragPayload: expectDragPayload,
    setForceFallback: setForceFallback,
    fallbackDragAndDrop: fallbackDragAndDrop,
    makeFile: makeFile,
    sampleFile: sampleFile,
    syntheticDrop: syntheticDrop,
    syntheticDragEvent: syntheticDragEvent,
    dragInProgress: dragInProgress,
    removeIntent: removeIntent,
    expectRecipeOrder: expectRecipeOrder,
    expectCategoryOps: expectCategoryOps,
    recordPageErrors: recordPageErrors,
    expectNoPageErrors: expectNoPageErrors,
    dismissDevServerOverlay: dismissDevServerOverlay
};
