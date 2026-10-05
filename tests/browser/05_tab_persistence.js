/**
 * Tests for tab state preservation when switching between input/output tabs.
 * Ensures that editor content is correctly retained when switching tabs,
 * particularly after the setState()-based tab switching refactor.
 *
 * @author Kerre00 [kerre00@hotmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

const utils = require("./browserUtils.js");

module.exports = {
    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl)
            .useCss()
            .waitForElementNotPresent("#preloader", 10000)
            .click("#auto-bake-label");
    },

    "Tab switch: content is preserved": browser => {
        utils.clear(browser);

        // Set input and bake in tab 1
        browser
            .click("#input-text .cm-content")
            .sendKeys("#input-text .cm-content", "Content for tab one")
            .pause(100);
        utils.bake(browser);

        // Create tab 2
        browser
            .click("#btn-new-tab")
            .waitForElementVisible("#input-tabs li:nth-of-type(2).active-input-tab")
            .pause(100);

        // Set input and bake in tab 2
        browser
            .click("#input-text .cm-content")
            .sendKeys("#input-text .cm-content", "Content for tab two")
            .pause(100);
        utils.bake(browser);

        // Switch back to tab 1, verify input and output
        browser
            .click("#input-tabs li:nth-of-type(1)")
            .waitForElementVisible("#input-tabs li:nth-of-type(1).active-input-tab")
            .pause(300);
        utils.expectInput(browser, "Content for tab one");
        utils.expectOutput(browser, "Content for tab one");

        // Switch to tab 2, verify input and output
        browser
            .click("#input-tabs li:nth-of-type(2)")
            .waitForElementVisible("#input-tabs li:nth-of-type(2).active-input-tab")
            .pause(300);
        utils.expectInput(browser, "Content for tab two");
        utils.expectOutput(browser, "Content for tab two");
    },

    "Tab switch: scroll position is preserved": browser => {
        utils.clear(browser);

        // Generate enough lines to make the editor scrollable
        const lines = Array.from({length: 100}, (_, i) => `Line ${i + 1}`).join("\n");
        browser.execute(text => {
            window.app.setInput(text);
        }, [lines]);
        browser.pause(300);

        // Scroll the input editor down
        browser.execute(() => {
            const scroller = window.app.manager.input.inputEditorView.scrollDOM;
            scroller.scrollTop = 500;
        });
        browser.pause(300);

        // Verify scroll position is 500 before switching
        browser.execute(() => {
            return window.app.manager.input.inputEditorView.scrollDOM.scrollTop;
        }, [], ({value}) => {
            browser.assert.ok(Math.abs(value - 500) <= 20, `Scroll position should be ~500 before switching, got ${value}`);
        });

        // Create tab 2 (this saves tab 1's scroll via changeTab)
        browser
            .click("#btn-new-tab")
            .waitForElementVisible("#input-tabs li:nth-of-type(2).active-input-tab")
            .pause(300);

        // Switch back to tab 1
        browser
            .click("#input-tabs li:nth-of-type(1)")
            .waitForElementVisible("#input-tabs li:nth-of-type(1).active-input-tab")
            .pause(500);

        // Verify scroll position is restored
        browser.execute(() => {
            return window.app.manager.input.inputEditorView.scrollDOM.scrollTop;
        }, [], ({value}) => {
            browser.assert.ok(Math.abs(value - 500) <= 20, `Scroll position should be restored to ~500, got ${value}`);
        });
    },

    "Tab switch: text selection is preserved": browser => {
        utils.clear(browser);

        // Type content in tab 1
        browser
            .click("#input-text .cm-content")
            .sendKeys("#input-text .cm-content", "Hello World Selection Test")
            .pause(100);

        // Create a selection (select characters 6-11, i.e. "World")
        browser.execute(() => {
            const view = window.app.manager.input.inputEditorView;
            view.dispatch({
                selection: {anchor: 6, head: 11}
            });
        });
        browser.pause(100);

        // Verify the selection is set
        browser.execute(() => {
            const sel = window.app.manager.input.inputEditorView.state.selection.main;
            return {anchor: sel.anchor, head: sel.head};
        }, [], ({value}) => {
            browser.assert.strictEqual(value.anchor, 6, "Selection anchor should be 6");
            browser.assert.strictEqual(value.head, 11, "Selection head should be 11");
        });

        // Create tab 2
        browser
            .click("#btn-new-tab")
            .waitForElementVisible("#input-tabs li:nth-of-type(2).active-input-tab")
            .pause(300);

        // Switch back to tab 1
        browser
            .click("#input-tabs li:nth-of-type(1)")
            .waitForElementVisible("#input-tabs li:nth-of-type(1).active-input-tab")
            .pause(300);

        // Verify the selection is restored
        browser.execute(() => {
            const sel = window.app.manager.input.inputEditorView.state.selection.main;
            return {anchor: sel.anchor, head: sel.head};
        }, [], ({value}) => {
            browser.assert.strictEqual(value.anchor, 6, "Selection anchor should be preserved as 6");
            browser.assert.strictEqual(value.head, 11, "Selection head should be preserved as 11");
        });
    },

    "Tab switch: undo history is preserved per tab": browser => {
        utils.clear(browser);

        // Type initial content in tab 1
        browser
            .click("#input-text .cm-content")
            .sendKeys("#input-text .cm-content", "First")
            .pause(600);

        // Type more content (separate undo step — 600ms pause ensures CodeMirror closes the undo group)
        browser
            .sendKeys("#input-text .cm-content", " Second")
            .pause(200);

        utils.expectInput(browser, "First Second");

        // Undo the second word via Ctrl+Z
        browser
            .perform(function() {
                const actions = this.actions({async: true});
                return actions
                    .keyDown("\uE009") // CONTROL
                    .sendKeys("z")
                    .keyUp("\uE009");
            })
            .pause(200);

        // Create tab 2 with different content
        browser
            .click("#btn-new-tab")
            .waitForElementVisible("#input-tabs li:nth-of-type(2).active-input-tab")
            .pause(100);
        browser
            .click("#input-text .cm-content")
            .sendKeys("#input-text .cm-content", "Tab two only")
            .pause(200);

        // Switch back to tab 1
        browser
            .click("#input-tabs li:nth-of-type(1)")
            .waitForElementVisible("#input-tabs li:nth-of-type(1).active-input-tab")
            .pause(300);

        // Verify tab 1 still has the undone state ("First" remains, "Second" removed)
        browser.execute(() => {
            return window.app.manager.input.inputEditorView.state.doc.toString();
        }, [], ({value}) => {
            browser.assert.ok(
                value.includes("First") && !value.includes("Second"),
                `Tab 1 should have "First" but not "Second", got: "${value}"`
            );
        });

        // Redo on tab 1 to verify redo history is also intact
        browser
            .perform(function() {
                const actions = this.actions({async: true});
                return actions
                    .keyDown("\uE009") // CONTROL
                    .keyDown("\uE008") // SHIFT
                    .sendKeys("z")
                    .keyUp("\uE008")
                    .keyUp("\uE009");
            })
            .pause(200);

        // Verify redo brought back "Second"
        browser.execute(() => {
            return window.app.manager.input.inputEditorView.state.doc.toString();
        }, [], ({value}) => {
            browser.assert.ok(
                value.includes("Second"),
                `Tab 1 redo should restore "Second", got: "${value}"`
            );
        });

        // Switch to tab 2, verify it's untouched
        browser
            .click("#input-tabs li:nth-of-type(2)")
            .waitForElementVisible("#input-tabs li:nth-of-type(2).active-input-tab")
            .pause(300);

        utils.expectInput(browser, "Tab two only");
    },

    "Tab switch: stress test across 4 tabs non-sequentially": browser => {
        utils.clear(browser);

        // Helper function to setup a tab
        const setupTab = (tabNum, isLast = false) => {
            // Set base content (scrollable)
            const lines = Array.from({length: 40}, (_, i) => `Tab${tabNum}-Line${i + 1}`).join("\n");
            browser.execute(text => {
                window.app.setInput(text);
            }, [lines]);
            browser.pause(600);

            // Append text for undo boundary
            browser
                .click("#input-text .cm-content")
                .sendKeys("#input-text .cm-content", `\nAPPENDED-${tabNum}`)
                .pause(200);

            // Undo the appended text
            browser
                .perform(function() {
                    const actions = this.actions({async: true});
                    return actions
                        .keyDown("\uE009")
                        .sendKeys("z")
                        .keyUp("\uE009");
                })
                .pause(200);

            // Set unique scroll and selection per tab
            browser.execute((num) => {
                const view = window.app.manager.input.inputEditorView;
                view.scrollDOM.scrollTop = num * 100;
                view.dispatch({selection: {anchor: num * 5, head: num * 10}});
            }, [tabNum]);
            browser.pause(200);

            // Create new tab if not the last one
            if (!isLast) {
                browser
                    .click("#btn-new-tab")
                    .waitForElementVisible(`#input-tabs li:nth-of-type(${tabNum + 1}).active-input-tab`)
                    .pause(200);
            }
        };

        // Helper function to verify a tab
        const verifyTab = (tabNum) => {
            browser
                .click(`#input-tabs li:nth-of-type(${tabNum})`)
                .waitForElementVisible(`#input-tabs li:nth-of-type(${tabNum}).active-input-tab`)
                .pause(400);

            browser.execute(() => {
                const view = window.app.manager.input.inputEditorView;
                const sel = view.state.selection.main;
                return {
                    doc: view.state.doc.toString(),
                    scrollTop: view.scrollDOM.scrollTop,
                    anchor: sel.anchor,
                    head: sel.head
                };
            }, [], ({value}) => {
                const expectedScroll = tabNum * 100;
                browser.assert.ok(value.doc.includes(`Tab${tabNum}-Line`), `Tab ${tabNum}: Should have correct base content`);
                browser.assert.ok(!value.doc.includes(`APPENDED-${tabNum}`), `Tab ${tabNum}: Undo state should persist (no APPENDED)`);
                browser.assert.ok(Math.abs(value.scrollTop - expectedScroll) <= 20, `Tab ${tabNum}: Scroll should be restored (expected ~${expectedScroll}, got ${value.scrollTop})`);
                browser.assert.strictEqual(value.anchor, tabNum * 5, `Tab ${tabNum}: Selection anchor should be ${tabNum * 5}`);
                browser.assert.strictEqual(value.head, tabNum * 10, `Tab ${tabNum}: Selection head should be ${tabNum * 10}`);
            });
        };

        // 1. Setup tabs 1 through 4
        setupTab(1);
        setupTab(2);
        setupTab(3);
        setupTab(4, true);

        // 2. Jump around non-sequentially to ensure background caches don't overwrite each other
        verifyTab(2);
        verifyTab(4);
        verifyTab(1);
        verifyTab(3);

        // 3. Do a final redo on Tab 3 to prove full state is still entirely active
        browser
            .perform(function() {
                const actions = this.actions({async: true});
                return actions
                    .keyDown("\uE009")
                    .keyDown("\uE008")
                    .sendKeys("z")
                    .keyUp("\uE008")
                    .keyUp("\uE009");
            })
            .pause(200);

        browser.execute(() => {
            return window.app.manager.input.inputEditorView.state.doc.toString();
        }, [], ({value}) => {
            browser.assert.ok(value.includes("APPENDED-3"), "Tab 3: redo should restore APPENDED-3 after jumping through all tabs");
        });
    },

    "Tab switch: ghost scroll bug on active tab": browser => {
        utils.clear(browser);

        // 1. Generate scrollable content in tab 1
        const lines = Array.from({length: 80}, (_, i) => `Line ${i + 1}`).join("\n");
        browser
            .click("#input-text .cm-content")
            .sendKeys("#input-text .cm-content", lines)
            .pause(100);

        // 2. Scroll to 200
        browser.execute(() => {
            const view = window.app.manager.input.inputEditorView;
            view.scrollDOM.scrollTop = 200;
        }).pause(100);

        // 3. Switch to Tab 2 and back to save the 200 scroll snapshot
        browser
            .click("#btn-new-tab")
            .waitForElementVisible("#input-tabs li:nth-of-type(2).active-input-tab")
            .pause(100)
            .click("#input-tabs li:nth-of-type(1)")
            .waitForElementVisible("#input-tabs li:nth-of-type(1).active-input-tab")
            .pause(100);

        // 4. Manually scroll to 800 (away from the snapshot)
        browser.execute(() => {
            const view = window.app.manager.input.inputEditorView;
            view.scrollDOM.scrollTop = 800;
        }).pause(100);

        // 5. Trigger a system update (setInput) while the tab is active
        browser.execute(() => {
            window.app.manager.input.setInput(window.app.manager.input.inputEditorView.state.doc.toString());
        }).pause(100);

        // 6. Verify the scroll stayed at 800 and did not snap back to 200
        browser.execute(() => {
            return window.app.manager.input.inputEditorView.scrollDOM.scrollTop;
        }, [], ({value}) => {
            browser.assert.ok(value > 700, `Scroll should remain near 800, got snapped back to: ${value}`);
        });
    },

    after: browser => {
        browser.end();
    }
};
