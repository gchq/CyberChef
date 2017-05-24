/**
 * Waiter to handle events related to highlighting in CyberChef.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {HTMLApp} app - The main view object for CyberChef.
 */
var HighlighterWaiter = function(app) {
    this.app = app;
    
    this.mouse_button_down = false;
    this.mouse_target = null;
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
HighlighterWaiter.prototype._is_selection_backwards = function() {
    var backwards = false,
        sel = window.getSelection();
        
    if (!sel.isCollapsed) {
        var range = document.createRange();
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
HighlighterWaiter.prototype._get_output_html_offset = function(node, offset) {
    var sel = window.getSelection(),
        range = document.createRange();
        
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
HighlighterWaiter.prototype._get_output_html_selection_offsets = function() {
    var sel = window.getSelection(),
        range,
        start = 0,
        end = 0,
        backwards = false;
    
    if (sel.rangeCount) {
        range = sel.getRangeAt(sel.rangeCount - 1);
        backwards = this._is_selection_backwards();
        start = this._get_output_html_offset(range.startContainer, range.startOffset);
        end = this._get_output_html_offset(range.endContainer, range.endOffset);
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
HighlighterWaiter.prototype.input_scroll = function(e) {
    var el = e.target;
    document.getElementById("input-highlighter").scrollTop = el.scrollTop;
    document.getElementById("input-highlighter").scrollLeft = el.scrollLeft;
};


/**
 * Handler for output scroll events.
 * Scrolls the highlighter pane to match the output textarea position.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.output_scroll = function(e) {
    var el = e.target;
    document.getElementById("output-highlighter").scrollTop = el.scrollTop;
    document.getElementById("output-highlighter").scrollLeft = el.scrollLeft;
};


/**
 * Handler for input mousedown events.
 * Calculates the current selection info, and highlights the corresponding data in the output.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.input_mousedown = function(e) {
    this.mouse_button_down = true;
    this.mouse_target = HighlighterWaiter.INPUT;
    this.remove_highlights();
    
    var el = e.target,
        start = el.selectionStart,
        end = el.selectionEnd;
    
    if (start !== 0 || end !== 0) {
        document.getElementById("input-selection-info").innerHTML = this.selection_info(start, end);
        this.highlight_output([{start: start, end: end}]);
    }
};


/**
 * Handler for output mousedown events.
 * Calculates the current selection info, and highlights the corresponding data in the input.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.output_mousedown = function(e) {
    this.mouse_button_down = true;
    this.mouse_target = HighlighterWaiter.OUTPUT;
    this.remove_highlights();
    
    var el = e.target,
        start = el.selectionStart,
        end = el.selectionEnd;
    
    if (start !== 0 || end !== 0) {
        document.getElementById("output-selection-info").innerHTML = this.selection_info(start, end);
        this.highlight_input([{start: start, end: end}]);
    }
};


/**
 * Handler for output HTML mousedown events.
 * Calculates the current selection info.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.output_html_mousedown = function(e) {
    this.mouse_button_down = true;
    this.mouse_target = HighlighterWaiter.OUTPUT;
    
    var sel = this._get_output_html_selection_offsets();
    if (sel.start !== 0 || sel.end !== 0) {
        document.getElementById("output-selection-info").innerHTML = this.selection_info(sel.start, sel.end);
    }
};


/**
 * Handler for input mouseup events.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.input_mouseup = function(e) {
    this.mouse_button_down = false;
};


/**
 * Handler for output mouseup events.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.output_mouseup = function(e) {
    this.mouse_button_down = false;
};


/**
 * Handler for output HTML mouseup events.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.output_html_mouseup = function(e) {
    this.mouse_button_down = false;
};


/**
 * Handler for input mousemove events.
 * Calculates the current selection info, and highlights the corresponding data in the output.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.input_mousemove = function(e) {
    // Check that the left mouse button is pressed
    if (!this.mouse_button_down ||
        e.which != 1 ||
        this.mouse_target != HighlighterWaiter.INPUT)
        return;
    
    var el = e.target,
        start = el.selectionStart,
        end = el.selectionEnd;

    if (start !== 0 || end !== 0) {
        document.getElementById("input-selection-info").innerHTML = this.selection_info(start, end);
        this.highlight_output([{start: start, end: end}]);
    }
};


/**
 * Handler for output mousemove events.
 * Calculates the current selection info, and highlights the corresponding data in the input.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.output_mousemove = function(e) {
    // Check that the left mouse button is pressed
    if (!this.mouse_button_down ||
        e.which != 1 ||
        this.mouse_target != HighlighterWaiter.OUTPUT)
        return;
    
    var el = e.target,
        start = el.selectionStart,
        end = el.selectionEnd;
    
    if (start !== 0 || end !== 0) {
        document.getElementById("output-selection-info").innerHTML = this.selection_info(start, end);
        this.highlight_input([{start: start, end: end}]);
    }
};


/**
 * Handler for output HTML mousemove events.
 * Calculates the current selection info.
 *
 * @param {event} e
 */
HighlighterWaiter.prototype.output_html_mousemove = function(e) {
    // Check that the left mouse button is pressed
    if (!this.mouse_button_down ||
        e.which != 1 ||
        this.mouse_target != HighlighterWaiter.OUTPUT)
        return;
    
    var sel = this._get_output_html_selection_offsets();
    if (sel.start !== 0 || sel.end !== 0) {
        document.getElementById("output-selection-info").innerHTML = this.selection_info(sel.start, sel.end);
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
HighlighterWaiter.prototype.selection_info = function(start, end) {
    var width = end.toString().length;
    width = width < 2 ? 2 : width;
    var start_str = Utils.pad(start.toString(), width, " ").replace(/ /g, "&nbsp;"),
        end_str   = Utils.pad(end.toString(), width, " ").replace(/ /g, "&nbsp;"),
        len_str   = Utils.pad((end-start).toString(), width, " ").replace(/ /g, "&nbsp;");
        
    return "start: " + start_str + "<br>end: " + end_str + "<br>length: " + len_str;
};


/**
 * Removes highlighting and selection information.
 */
HighlighterWaiter.prototype.remove_highlights = function() {
    document.getElementById("input-highlighter").innerHTML = "";
    document.getElementById("output-highlighter").innerHTML = "";
    document.getElementById("input-selection-info").innerHTML = "";
    document.getElementById("output-selection-info").innerHTML = "";
};


/**
 * Generates a list of all the highlight functions assigned to operations in the recipe, if the 
 * entire recipe supports highlighting.
 *
 * @returns {Object[]} highlights
 * @returns {function} highlights[].f
 * @returns {function} highlights[].b
 * @returns {Object[]} highlights[].args
 */
HighlighterWaiter.prototype.generate_highlight_list = function() {
    var recipe_config = this.app.get_recipe_config(),
        highlights = [];
    
    for (var i = 0; i < recipe_config.length; i++) {
        if (recipe_config[i].disabled) continue;
        
        // If any breakpoints are set, do not attempt to highlight
        if (recipe_config[i].breakpoint) return false;
        
        var op = this.app.operations[recipe_config[i].op];
        
        // If any of the operations do not support highlighting, fail immediately.
        if (op.highlight === false || op.highlight === undefined) return false;
        
        highlights.push({
            f: op.highlight,
            b: op.highlight_reverse,
            args: recipe_config[i].args
        });
    }
    
    return highlights;
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
HighlighterWaiter.prototype.highlight_output = function(pos) {
    var highlights = this.generate_highlight_list();

    if (!highlights || !this.app.auto_bake_) {
        return false;
    }

    for (var i = 0; i < highlights.length; i++) {
        // Remove multiple highlights before processing again
        pos = [pos[0]];
        
        if (typeof highlights[i].f == "function") {
            pos = highlights[i].f(pos, highlights[i].args);
        }
    }
    
    document.getElementById("output-selection-info").innerHTML = this.selection_info(pos[0].start, pos[0].end);
    this.highlight(
        document.getElementById("output-text"),
        document.getElementById("output-highlighter"),
        pos);
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
HighlighterWaiter.prototype.highlight_input = function(pos) {
    var highlights = this.generate_highlight_list();
    
    if (!highlights || !this.app.auto_bake_) {
        return false;
    }

    for (var i = 0; i < highlights.length; i++) {
        // Remove multiple highlights before processing again
        pos = [pos[0]];
        
        if (typeof highlights[i].b == "function") {
            pos = highlights[i].b(pos, highlights[i].args);
        }
    }
    
    document.getElementById("input-selection-info").innerHTML = this.selection_info(pos[0].start, pos[0].end);
    this.highlight(
        document.getElementById("input-text"),
        document.getElementById("input-highlighter"),
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
    if (!this.app.options.show_highlighter) return false;
    if (!this.app.options.attempt_highlight) return false;
    
    // Check if there is a carriage return in the output dish as this will not
    // be displayed by the HTML textarea and will mess up highlighting offsets.
    if (!this.app.dish_str || this.app.dish_str.indexOf("\r") >= 0) return false;
    
    var start_placeholder = "[start_highlight]",
        start_placeholder_regex = /\[start_highlight\]/g,
        end_placeholder = "[end_highlight]",
        end_placeholder_regex = /\[end_highlight\]/g,
        text = textarea.value;
    
    // Put placeholders in position
    // If there's only one value, select that
    // If there are multiple, ignore the first one and select all others
    if (pos.length == 1) {
        if (pos[0].end < pos[0].start) return;
        text = text.slice(0, pos[0].start) +
            start_placeholder + text.slice(pos[0].start, pos[0].end) + end_placeholder +
            text.slice(pos[0].end, text.length);
    } else {
        // O(n^2) - Can anyone improve this without overwriting placeholders?
        var result = "",
            end_placed = true;
            
        for (var i = 0; i < text.length; i++) {
            for (var j = 1; j < pos.length; j++) {
                if (pos[j].end < pos[j].start) continue;
                if (pos[j].start == i) {
                    result += start_placeholder;
                    end_placed = false;
                }
                if (pos[j].end == i) {
                    result += end_placeholder;
                    end_placed = true;
                }
            }
            result += text[i];
        }
        if (!end_placed) result += end_placeholder;
        text = result;
    }
    
    var css_class = "hl1";
    //if (colour) css_class += "-"+colour;
    
    // Remove HTML tags
    text = text.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "&#10;")
                // Convert placeholders to tags
                .replace(start_placeholder_regex, "<span class=\""+css_class+"\">")
                .replace(end_placeholder_regex, "</span>") + "&nbsp;";
    
    // Adjust width to allow for scrollbars
    highlighter.style.width = textarea.clientWidth + "px";
    highlighter.innerHTML = text;
    highlighter.scrollTop = textarea.scrollTop;
    highlighter.scrollLeft = textarea.scrollLeft;
};
