/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 *
 * In order to render whitespace characters as control character pictures in the output, even
 * when they are the designated line separator, CyberChef sometimes chooses to represent them
 * internally using the Unicode Private Use Area (https://en.wikipedia.org/wiki/Private_Use_Areas).
 * See `Utils.escapeWhitespace()` for an example of this.
 *
 * The `renderSpecialChar()` function understands that it should display these characters as
 * control pictures. When copying data from the Output, we need to replace these PUA characters
 * with their original values, so we override the DOM "copy" event and modify the copied data
 * if required. This handler is based closely on the built-in CodeMirror handler and defers to the
 * built-in handler if PUA characters are not present in the copied data, in order to minimise the
 * impact of breaking changes.
 */

import {EditorView} from "@codemirror/view";

/**
 * Copies the currently selected text from the state doc.
 * Based on the built-in implementation with a few unrequired bits taken out:
 * https://github.com/codemirror/view/blob/7d9c3e54396242d17b3164a0e244dcc234ee50ee/src/input.ts#L604
 *
 * @param {EditorState} state
 * @returns {Object}
 */
function copiedRange(state) {
    const content = [];
    let linewise = false;
    for (const range of state.selection.ranges) if (!range.empty) {
        content.push(state.sliceDoc(range.from, range.to));
    }
    if (!content.length) {
        // Nothing selected, do a line-wise copy
        let upto = -1;
        for (const {from} of state.selection.ranges) {
            const line = state.doc.lineAt(from);
            if (line.number > upto) {
                content.push(line.text);
            }
            upto = line.number;
        }
        linewise = true;
    }

    return {text: content.join(state.lineBreak), linewise};
}

/**
 * Regex to match characters in the Private Use Area of the Unicode table.
 */
const PUARegex = new RegExp("[\ue000-\uf8ff]");
const PUARegexG = new RegExp("[\ue000-\uf8ff]", "g");
/**
 * Regex tto match Unicode Control Pictures.
 */
const CPRegex = new RegExp("[\u2400-\u243f]");
const CPRegexG = new RegExp("[\u2400-\u243f]", "g");

/**
 * Overrides the DOM "copy" handler in the CodeMirror editor in order to return the original
 * values of control characters that have been represented in the Unicode Private Use Area for
 * visual purposes.
 * Based on the built-in copy handler with some modifications:
 * https://github.com/codemirror/view/blob/7d9c3e54396242d17b3164a0e244dcc234ee50ee/src/input.ts#L629
 *
 * This handler will defer to the built-in version if no PUA characters are present.
 *
 * @returns {Extension}
 */
export function copyOverride() {
    return EditorView.domEventHandlers({
        copy(event, view) {
            const {text, linewise} = copiedRange(view.state);
            if (!text && !linewise) return;

            // If there are no PUA chars in the copied text, return false and allow the built-in
            // copy handler to fire
            if (!PUARegex.test(text)) return false;

            // If PUA chars are detected, modify them back to their original values and copy that instead
            const rawText = text.replace(PUARegexG, function(c) {
                return String.fromCharCode(c.charCodeAt(0) - 0xe000);
            });

            event.preventDefault();
            event.clipboardData.clearData();
            event.clipboardData.setData("text/plain", rawText);

            // Returning true prevents CodeMirror default handlers from firing
            return true;
        }
    });
}


/**
 * Handler for copy events in output-html decorations. If there are control pictures present,
 * this handler will convert them back to their raw form before copying. If there are no
 * control pictures present, it will do nothing and defer to the default browser handler.
 *
 * @param {ClipboardEvent} event
 * @returns {boolean}
 */
export function htmlCopyOverride(event) {
    const text = window.getSelection().toString();
    if (!text) return;

    // If there are no control picture chars in the copied text, return false and allow the built-in
    // copy handler to fire
    if (!CPRegex.test(text)) return false;

    // If control picture chars are detected, modify them back to their original values and copy that instead
    const rawText = text.replace(CPRegexG, function(c) {
        return String.fromCharCode(c.charCodeAt(0) - 0x2400);
    });

    event.preventDefault();
    event.clipboardData.clearData();
    event.clipboardData.setData("text/plain", rawText);

    return true;
}
