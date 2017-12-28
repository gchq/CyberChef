/**
 * Waiter to handle events related to highlighting in CyberChef.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {App} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
const HighlighterWaiter = function(app, manager) {
    this.app = app;
    this.manager = manager;

    this.mouseButtonDown = false;
    this.mouseTarget = null;
};


/**
 * HighlighterWaiter data type enum for the input.
 * @readonly
 * @enum
 */
HighlighterWaiter.INPUT  = 0;
/**
 * HighlighterWaiter data type enum for the output.
 * @readonly
 * @enum
 */
HighlighterWaiter.OUTPUT = 1;


/**
 * Determines if the current text selection is running backwards or forwards.
 * StackOverflow answer id: 12652116
 *
 * @private
 * @returns {boolean}
 */
HighlighterWaiter.prototype._isSelectionBackwards = function() {
    let backwards = false,
        sel = window.getSelection();

    if (!sel.isCollapsed) {
        const range = document.createRange();
        range.setStart(sel.anchorNode, sel.anchorOffset);
        range.setEnd(sel.focusNode, sel.focusOffset);
        backwards = range.collapsed;
        range.detach();
    }
    return backwards;
};


/**
 * Calculates the text offset of a position in an HTML element, ignoring HTML tags.
 *
 * @private
 * @param {element} node - The parent HTML node.
 * @param {number} offset - The offset since the last HTML element.
 * @returns {number}
 */
HighlighterWaiter.prototype._getOutputHtmlOffset = function(node, offset) {
    const sel = window.getSelection();
    const range = document.createRange();

    range.selectNodeContents(document.getElementById("output-html"));
    range.setEnd(node, offset);
    sel.removeAllRanges();
    sel.addRange(range);

    return sel.toString().length;
};


/**
 * Gets the current selection offsets in the output HTML, ignoring HTML tags.
 *
 * @private
 * @returns {Object} pos
 * @returns {number} pos.start
 * @returns {number} pos.end
 */
HighlighterWaiter.prototype._getOutputHtmlSelectionOffsets = function() {
    const sel = window.getSelection();
    let range,
        start = 0,
        end = 0,
        backwards = false;

    if (sel.rangeCount) {
        range = sel.getRangeAt(sel.rangeCount - 1);
        backwards = this._isSelectionBackwards();
        start = this._getOutputHtmlOffset(range.startContainer, range.startOffset);
        end = this._getOutputHtmlOffset(range.endContainer, range.endOffset);
        sel.removeAllRanges();
        sel.addRange(range);

        if (backwards) {
            // If selecting backwards, reverse the start and end offsets for the selection to
            // prevent deselecting as the drag continues.
            sel.collapseToEnd();
            sel.extend(sel.anchorNode, range.startOffset);
        }
    }

    return {
        start: start,
        end: end
    };
};


/**
 * Handler for input scroll events.
 * Scrolls the highlighter pane to match the input textarea position.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.inputScroll = function(e) {
    const el = e.target;
    document.getElementById("input-highlighter").scrollTop = el.scrollTop;
    document.getElementById("input-highlighter").scrollLeft = el.scrollLeft;
};


/**
 * Handler for output scroll events.
 * Scrolls the highlighter pane to match the output textarea position.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.outputScroll = function(e) {
    const el = e.target;
    document.getElementById("output-highlighter").scrollTop = el.scrollTop;
    document.getElementById("output-highlighter").scrollLeft = el.scrollLeft;
};


/**
 * Handler for input mousedown events.
 * Calculates the current selection info, and highlights the corresponding data in the output.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.inputMousedown = function(e) {
    this.mouseButtonDown = true;
    this.mouseTarget = HighlighterWaiter.INPUT;
    this.removeHighlights();

    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== 0 || end !== 0) {
        document.getElementById("input-selection-info").innerHTML = this.selectionInfo(start, end);
        this.highlightOutput([{start: start, end: end}]);
    }
};


/**
 * Handler for output mousedown events.
 * Calculates the current selection info, and highlights the corresponding data in the input.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.outputMousedown = function(e) {
    this.mouseButtonDown = true;
    this.mouseTarget = HighlighterWaiter.OUTPUT;
    this.removeHighlights();

    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== 0 || end !== 0) {
        document.getElementById("output-selection-info").innerHTML = this.selectionInfo(start, end);
        this.highlightInput([{start: start, end: end}]);
    }
};


/**
 * Handler for output HTML mousedown events.
 * Calculates the current selection info.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.outputHtmlMousedown = function(e) {
    this.mouseButtonDown = true;
    this.mouseTarget = HighlighterWaiter.OUTPUT;

    const sel = this._getOutputHtmlSelectionOffsets();
    if (sel.start !== 0 || sel.end !== 0) {
        document.getElementById("output-selection-info").innerHTML = this.selectionInfo(sel.start, sel.end);
    }
};


/**
 * Handler for input mouseup events.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.inputMouseup = function(e) {
    this.mouseButtonDown = false;
};


/**
 * Handler for output mouseup events.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.outputMouseup = function(e) {
    this.mouseButtonDown = false;
};


/**
 * Handler for output HTML mouseup events.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.outputHtmlMouseup = function(e) {
    this.mouseButtonDown = false;
};


/**
 * Handler for input mousemove events.
 * Calculates the current selection info, and highlights the corresponding data in the output.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.inputMousemove = function(e) {
    // Check that the left mouse button is pressed
    if (!this.mouseButtonDown ||
        e.which !== 1 ||
        this.mouseTarget !== HighlighterWaiter.INPUT)
        return;

    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== 0 || end !== 0) {
        document.getElementById("input-selection-info").innerHTML = this.selectionInfo(start, end);
        this.highlightOutput([{start: start, end: end}]);
    }
};


/**
 * Handler for output mousemove events.
 * Calculates the current selection info, and highlights the corresponding data in the input.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.outputMousemove = function(e) {
    // Check that the left mouse button is pressed
    if (!this.mouseButtonDown ||
        e.which !== 1 ||
        this.mouseTarget !== HighlighterWaiter.OUTPUT)
        return;

    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== 0 || end !== 0) {
        document.getElementById("output-selection-info").innerHTML = this.selectionInfo(start, end);
        this.highlightInput([{start: start, end: end}]);
    }
};


/**
 * Handler for output HTML mousemove events.
 * Calculates the current selection info.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.outputHtmlMousemove = function(e) {
    // Check that the left mouse button is pressed
    if (!this.mouseButtonDown ||
        e.which !== 1 ||
        this.mouseTarget !== HighlighterWaiter.OUTPUT)
        return;

    const sel = this._getOutputHtmlSelectionOffsets();
    if (sel.start !== 0 || sel.end !== 0) {
        document.getElementById("output-selection-info").innerHTML = this.selectionInfo(sel.start, sel.end);
    }
};


/**
 * Given start and end offsets, writes the HTML for the selection info element with the correct
 * padding.
 *
 * @param {number} start - The start offset.
 * @param {number} end - The end offset.
 * @returns {string}
 */
HighlighterWaiter.prototype.selectionInfo = function(start, end) {
    const len = end.toString().length;
    const width = len < 2 ? 2 : len;
    const startStr = start.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
    const endStr = end.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
    const lenStr = (end-start).toString().padStart(width, " ").replace(/ /g, "&nbsp;");

    return "start: " + startStr + "<br>end: " + endStr + "<br>length: " + lenStr;
};


/**
 * Removes highlighting and selection information.
 */
HighlighterWaiter.prototype.removeHighlights = function() {
    document.getElementById("input-highlighter").innerHTML = "";
    document.getElementById("output-highlighter").innerHTML = "";
    document.getElementById("input-selection-info").innerHTML = "";
    document.getElementById("output-selection-info").innerHTML = "";
};


/**
 * Highlights the given offsets in the output.
 * We will only highlight if:
 *     - input hasn't changed since last bake
 *     - last bake was a full bake
 *     - all operations in the recipe support highlighting
 *
 * @param {Object} pos - The position object for the highlight.
 * @param {number} pos.start - The start offset.
 * @param {number} pos.end - The end offset.
 */
HighlighterWaiter.prototype.highlightOutput = function(pos) {
    if (!this.app.autoBake_ || this.app.baking) return false;
    this.manager.worker.highlight(this.app.getRecipeConfig(), "forward", pos);
};


/**
 * Highlights the given offsets in the input.
 * We will only highlight if:
 *     - input hasn't changed since last bake
 *     - last bake was a full bake
 *     - all operations in the recipe support highlighting
 *
 * @param {Object} pos - The position object for the highlight.
 * @param {number} pos.start - The start offset.
 * @param {number} pos.end - The end offset.
 */
HighlighterWaiter.prototype.highlightInput = function(pos) {
    if (!this.app.autoBake_ || this.app.baking) return false;
    this.manager.worker.highlight(this.app.getRecipeConfig(), "reverse", pos);
};


/**
 * Displays highlight offsets sent back from the Chef.
 *
 * @param {Object} pos - The position object for the highlight.
 * @param {number} pos.start - The start offset.
 * @param {number} pos.end - The end offset.
 * @param {string} direction
 */
HighlighterWaiter.prototype.displayHighlights = function(pos, direction) {
    if (!pos) return;

    const io = direction === "forward" ? "output" : "input";

    document.getElementById(io + "-selection-info").innerHTML = this.selectionInfo(pos[0].start, pos[0].end);
    this.highlight(
        document.getElementById(io + "-text"),
        document.getElementById(io + "-highlighter"),
        pos);
};


/**
 * Adds the relevant HTML to the specified highlight element such that highlighting appears
 * underneath the correct offset.
 *
 * @param {element} textarea - The input or output textarea.
 * @param {element} highlighter - The input or output highlighter element.
 * @param {Object} pos - The position object for the highlight.
 * @param {number} pos.start - The start offset.
 * @param {number} pos.end - The end offset.
 */
HighlighterWaiter.prototype.highlight = function(textarea, highlighter, pos) {
    if (!this.app.options.showHighlighter) return false;
    if (!this.app.options.attemptHighlight) return false;

    // Check if there is a carriage return in the output dish as this will not
    // be displayed by the HTML textarea and will mess up highlighting offsets.
    if (this.manager.output.containsCR()) return false;

    const startPlaceholder = "[startHighlight]";
    const startPlaceholderRegex = /\[startHighlight\]/g;
    const endPlaceholder = "[endHighlight]";
    const endPlaceholderRegex = /\[endHighlight\]/g;
    let text = textarea.value;

    // Put placeholders in position
    // If there's only one value, select that
    // If there are multiple, ignore the first one and select all others
    if (pos.length === 1) {
        if (pos[0].end < pos[0].start) return;
        text = text.slice(0, pos[0].start) +
            startPlaceholder + text.slice(pos[0].start, pos[0].end) + endPlaceholder +
            text.slice(pos[0].end, text.length);
    } else {
        // O(n^2) - Can anyone improve this without overwriting placeholders?
        let result = "",
            endPlaced = true;

        for (let i = 0; i < text.length; i++) {
            for (let j = 1; j < pos.length; j++) {
                if (pos[j].end < pos[j].start) continue;
                if (pos[j].start === i) {
                    result += startPlaceholder;
                    endPlaced = false;
                }
                if (pos[j].end === i) {
                    result += endPlaceholder;
                    endPlaced = true;
                }
            }
            result += text[i];
        }
        if (!endPlaced) result += endPlaceholder;
        text = result;
    }

    const cssClass = "hl1";
    //if (colour) cssClass += "-"+colour;

    // Remove HTML tags
    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "&#10;")
        // Convert placeholders to tags
        .replace(startPlaceholderRegex, "<span class=\""+cssClass+"\">")
        .replace(endPlaceholderRegex, "</span>") + "&nbsp;";

    // Adjust width to allow for scrollbars
    highlighter.style.width = textarea.clientWidth + "px";
    highlighter.innerHTML = text;
    highlighter.scrollTop = textarea.scrollTop;
    highlighter.scrollLeft = textarea.scrollLeft;
};

export default HighlighterWaiter;
