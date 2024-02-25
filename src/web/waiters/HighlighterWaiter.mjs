/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { EditorSelection } from "@codemirror/state";
import { chrEncWidth } from "../../core/lib/ChrEnc.mjs";

/**
 * Waiter to handle events related to highlighting in CyberChef.
 */
class HighlighterWaiter {
    /**
     * HighlighterWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;

        this.currentSelectionRanges = [];
    }

    /**
     * Handler for selection change events in the input and output
     *
     * Highlights the given offsets in the input or output.
     * We will only highlight if:
     *     - input hasn't changed since last bake
     *     - last bake was a full bake
     *     - all operations in the recipe support highlighting
     *
     * @param {string} io
     * @param {ViewUpdate} e
     */
    selectionChange(io, e) {
        // Confirm we are not currently baking
        if (!this.app.autoBake_ || this.app.baking) return false;

        // Confirm this was a user-generated event to prevent looping
        // from setting the selection in this class
        if (!e.transactions[0].isUserEvent("select")) return false;

        this.currentSelectionRanges = [];

        // Confirm some non-empty ranges are set
        const selectionRanges = e.state.selection.ranges;

        // Adjust offsets based on the width of the character set
        const inputCharacterWidth = chrEncWidth(this.manager.input.getChrEnc());
        const outputCharacterWidth = chrEncWidth(this.manager.output.getChrEnc());
        let ratio = 1;
        if (inputCharacterWidth !== outputCharacterWidth && inputCharacterWidth !== 0 && outputCharacterWidth !== 0) {
            ratio
                = io === "input"
                    ? inputCharacterWidth / outputCharacterWidth
                    : outputCharacterWidth / inputCharacterWidth;
        }

        // Loop through ranges and send request for output offsets for each one
        const direction = io === "input" ? "forward" : "reverse";
        for (const range of selectionRanges) {
            const pos = [
                {
                    start: Math.floor(range.from * ratio),
                    end: Math.floor(range.to * ratio)
                }
            ];
            this.manager.worker.highlight(this.app.getRecipeConfig(), direction, pos);
        }
    }

    /**
     * Displays highlight offsets sent back from the Chef.
     *
     * @param {Object[]} pos - The position object for the highlight.
     * @param {number} pos.start - The start offset.
     * @param {number} pos.end - The end offset.
     * @param {string} direction
     */
    displayHighlights(pos, direction) {
        if (!pos) return;
        if (this.manager.tabs.getActiveTab("input") !== this.manager.tabs.getActiveTab("output")) return;

        const io = direction === "forward" ? "output" : "input";
        this.highlight(io, pos);
    }

    /**
     * Sends selection updates to the relevant EditorView.
     *
     * @param {string} io - The input or output
     * @param {Object[]} ranges - An array of position objects to highlight
     * @param {number} ranges.start - The start offset
     * @param {number} ranges.end - The end offset
     */
    async highlight(io, ranges) {
        if (!this.app.options.showHighlighter) return false;
        if (!this.app.options.attemptHighlight) return false;
        if (!ranges || !ranges.length) return false;

        const view = io === "input" ? this.manager.input.inputEditorView : this.manager.output.outputEditorView;

        // Add new SelectionRanges to existing ones
        for (const range of ranges) {
            if (typeof range.start !== "number" || typeof range.end !== "number") continue;
            const selection
                = range.end <= range.start
                    ? EditorSelection.cursor(range.start)
                    : EditorSelection.range(range.start, range.end);

            this.currentSelectionRanges.push(selection);
        }

        // Set selection
        if (this.currentSelectionRanges.length) {
            try {
                view.dispatch({
                    selection: EditorSelection.create(this.currentSelectionRanges),
                    scrollIntoView: true
                });
            } catch (err) {
                // Ignore Range Errors
                if (!err.toString().startsWith("RangeError")) {
                    log.error(err);
                }
            }
        }
    }
}

export default HighlighterWaiter;
