/**
 * A Status bar extension for CodeMirror
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import {showPanel} from "@codemirror/view";

/**
 * Counts the stats of a document
 * @param {element} el
 * @param {Text} doc
 */
function updateStats(el, doc) {
    const length = el.querySelector("#stats-length-value"),
        lines = el.querySelector("#stats-lines-value");
    length.textContent = doc.length;
    lines.textContent = doc.lines;
}

/**
 * Gets the current selection info
 * @param {element} el
 * @param {EditorState} state
 * @param {boolean} selectionSet
 */
function updateSelection(el, state, selectionSet) {
    const selLen = state.selection && state.selection.main ?
        state.selection.main.to - state.selection.main.from :
        0;

    const selInfo = el.querySelector("#sel-info"),
        curOffsetInfo = el.querySelector("#cur-offset-info");

    if (!selectionSet) {
        selInfo.style.display = "none";
        curOffsetInfo.style.display = "none";
        return;
    }

    if (selLen > 0) { // Range
        const start = el.querySelector("#sel-start-value"),
            end = el.querySelector("#sel-end-value"),
            length = el.querySelector("#sel-length-value");

        selInfo.style.display = "inline-block";
        curOffsetInfo.style.display = "none";

        start.textContent = state.selection.main.from;
        end.textContent = state.selection.main.to;
        length.textContent = state.selection.main.to - state.selection.main.from;
    } else { // Position
        const offset = el.querySelector("#cur-offset-value");

        selInfo.style.display = "none";
        curOffsetInfo.style.display = "inline-block";

        offset.textContent = state.selection.main.from;
    }
}

/**
 * Gets the current character encoding of the document
 * @param {element} el
 * @param {EditorState} state
 */
function updateCharEnc(el, state) {
    // const charenc = el.querySelector("#char-enc-value");
    // TODO
    // charenc.textContent = "TODO";
}

/**
 * Returns what the current EOL separator is set to
 * @param {element} el
 * @param {EditorState} state
 */
function updateEOL(el, state) {
    const eolLookup = {
        "\u000a": "LF",
        "\u000b": "VT",
        "\u000c": "FF",
        "\u000d": "CR",
        "\u000d\u000a": "CRLF",
        "\u0085": "NEL",
        "\u2028": "LS",
        "\u2029": "PS"
    };

    const val = el.querySelector("#eol-value");
    val.textContent = eolLookup[state.lineBreak];
}

/**
 * Builds the Left-hand-side widgets
 * @returns {string}
 */
function constructLHS() {
    return `<span data-toggle="tooltip" title="Input length">
            <i class="material-icons">abc</i>
            <span id="stats-length-value"></span>
        </span>
        <span data-toggle="tooltip" title="Number of lines">
            <i class="material-icons">sort</i>
            <span id="stats-lines-value"></span>
        </span>

        <span id="sel-info" data-toggle="tooltip" title="Selection">
            <i class="material-icons">highlight_alt</i>
            <span id="sel-start-value"></span>\u279E<span id="sel-end-value"></span>
            (<span id="sel-length-value"></span> selected)
        </span>
        <span id="cur-offset-info" data-toggle="tooltip" title="Cursor offset">
            <i class="material-icons">location_on</i>
            <span id="cur-offset-value"></span>
        </span>`;
}

/**
 * Builds the Right-hand-side widgets
 * Event listener set up in Manager
 * @returns {string}
 */
function constructRHS() {
    return `<span data-toggle="tooltip" title="Input character encoding">
        <i class="material-icons">language</i>
        <span id="char-enc-value">UTF-16</span>
    </span>

    <div class="cm-status-bar-select eol-select">
        <span class="cm-status-bar-select-btn" data-toggle="tooltip" data-placement="bottom" title="End of line sequence">
            <i class="material-icons">keyboard_return</i> <span id="eol-value"></span>
        </span>
        <div class="cm-status-bar-select-content">
            <a href="#" data-val="LF">Line Feed, U+000A</a>
            <a href="#" data-val="VT">Vertical Tab, U+000B</a>
            <a href="#" data-val="FF">Form Feed, U+000C</a>
            <a href="#" data-val="CR">Carriage Return, U+000D</a>
            <a href="#" data-val="CRLF">CR+LF, U+000D U+000A</a>
            <!-- <a href="#" data-val="NL">Next Line, U+0085</a> This causes problems. -->
            <a href="#" data-val="LS">Line Separator, U+2028</a>
            <a href="#" data-val="PS">Paragraph Separator, U+2029</a>
        </div>
    </div>`;
}

/**
 * A panel constructor building a panel that re-counts the stats every time the document changes.
 * @param {EditorView} view
 * @returns {Panel}
 */
function wordCountPanel(view) {
    const dom = document.createElement("div");
    const lhs = document.createElement("div");
    const rhs = document.createElement("div");

    dom.className = "cm-status-bar";
    lhs.innerHTML = constructLHS();
    rhs.innerHTML = constructRHS();

    dom.appendChild(lhs);
    dom.appendChild(rhs);

    updateEOL(rhs, view.state);
    updateCharEnc(rhs, view.state);
    updateStats(lhs, view.state.doc);
    updateSelection(lhs, view.state, false);

    return {
        dom,
        update(update) {
            updateEOL(rhs, update.state);
            updateSelection(lhs, update.state, update.selectionSet);
            updateCharEnc(rhs, update.state);
            if (update.docChanged) {
                updateStats(lhs, update.state.doc);
            }
        }
    };
}

/**
 * A function that build the extension that enables the panel in an editor.
 * @returns {Extension}
 */
export function statusBar() {
    return showPanel.of(wordCountPanel);
}
