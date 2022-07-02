/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import {showPanel} from "@codemirror/view";

/**
 * A Status bar extension for CodeMirror
 */
class StatusBarPanel {

    /**
     * StatusBarPanel constructor
     * @param {Object} opts
     */
    constructor(opts) {
        this.label = opts.label;
        this.bakeStats = opts.bakeStats ? opts.bakeStats : null;
        this.eolHandler = opts.eolHandler;

        this.dom = this.buildDOM();
    }

    /**
     * Builds the status bar DOM tree
     * @returns {DOMNode}
     */
    buildDOM() {
        const dom = document.createElement("div");
        const lhs = document.createElement("div");
        const rhs = document.createElement("div");

        dom.className = "cm-status-bar";
        lhs.innerHTML = this.constructLHS();
        rhs.innerHTML = this.constructRHS();

        dom.appendChild(lhs);
        dom.appendChild(rhs);

        // Event listeners
        dom.addEventListener("click", this.eolSelectClick.bind(this), false);

        return dom;
    }

    /**
     * Handler for EOL Select clicks
     * Sets the line separator
     * @param {Event} e
     */
    eolSelectClick(e) {
        e.preventDefault();

        const eolLookup = {
            "LF": "\u000a",
            "VT": "\u000b",
            "FF": "\u000c",
            "CR": "\u000d",
            "CRLF": "\u000d\u000a",
            "NEL": "\u0085",
            "LS": "\u2028",
            "PS": "\u2029"
        };
        const eolval = eolLookup[e.target.getAttribute("data-val")];

        // Call relevant EOL change handler
        this.eolHandler(eolval);
    }

    /**
     * Counts the stats of a document
     * @param {Text} doc
     */
    updateStats(doc) {
        const length = this.dom.querySelector(".stats-length-value"),
            lines = this.dom.querySelector(".stats-lines-value");
        length.textContent = doc.length;
        lines.textContent = doc.lines;
    }

    /**
     * Gets the current selection info
     * @param {EditorState} state
     * @param {boolean} selectionSet
     */
    updateSelection(state, selectionSet) {
        const selLen = state.selection && state.selection.main ?
            state.selection.main.to - state.selection.main.from :
            0;

        const selInfo = this.dom.querySelector(".sel-info"),
            curOffsetInfo = this.dom.querySelector(".cur-offset-info");

        if (!selectionSet) {
            selInfo.style.display = "none";
            curOffsetInfo.style.display = "none";
            return;
        }

        if (selLen > 0) { // Range
            const start = this.dom.querySelector(".sel-start-value"),
                end = this.dom.querySelector(".sel-end-value"),
                length = this.dom.querySelector(".sel-length-value");

            selInfo.style.display = "inline-block";
            curOffsetInfo.style.display = "none";

            start.textContent = state.selection.main.from;
            end.textContent = state.selection.main.to;
            length.textContent = state.selection.main.to - state.selection.main.from;
        } else { // Position
            const offset = this.dom.querySelector(".cur-offset-value");

            selInfo.style.display = "none";
            curOffsetInfo.style.display = "inline-block";

            offset.textContent = state.selection.main.from;
        }
    }

    /**
     * Gets the current character encoding of the document
     * @param {EditorState} state
     */
    updateCharEnc(state) {
        // const charenc = this.dom.querySelector("#char-enc-value");
        // TODO
        // charenc.textContent = "TODO";
    }

    /**
     * Returns what the current EOL separator is set to
     * @param {EditorState} state
     */
    updateEOL(state) {
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

        const val = this.dom.querySelector(".eol-value");
        val.textContent = eolLookup[state.lineBreak];
    }

    /**
     * Sets the latest bake duration
     */
    updateBakeStats() {
        const bakingTime = this.dom.querySelector(".baking-time-value");
        const bakingTimeInfo = this.dom.querySelector(".baking-time-info");

        if (this.label === "Output" &&
            this.bakeStats &&
            typeof this.bakeStats.duration === "number" &&
            this.bakeStats.duration >= 0) {
            bakingTimeInfo.style.display = "inline-block";
            bakingTime.textContent = this.bakeStats.duration;
        } else {
            bakingTimeInfo.style.display = "none";
        }
    }

    /**
     * Builds the Left-hand-side widgets
     * @returns {string}
     */
    constructLHS() {
        return `
            <span data-toggle="tooltip" title="${this.label} length">
                <i class="material-icons">abc</i>
                <span class="stats-length-value"></span>
            </span>
            <span data-toggle="tooltip" title="Number of lines">
                <i class="material-icons">sort</i>
                <span class="stats-lines-value"></span>
            </span>

            <span class="sel-info" data-toggle="tooltip" title="Main selection">
                <i class="material-icons">highlight_alt</i>
                <span class="sel-start-value"></span>\u279E<span class="sel-end-value"></span>
                (<span class="sel-length-value"></span> selected)
            </span>
            <span class="cur-offset-info" data-toggle="tooltip" title="Cursor offset">
                <i class="material-icons">location_on</i>
                <span class="cur-offset-value"></span>
            </span>`;
    }

    /**
     * Builds the Right-hand-side widgets
     * Event listener set up in Manager
     * @returns {string}
     */
    constructRHS() {
        return `
            <span class="baking-time-info" style="display: none" data-toggle="tooltip" title="Baking time">
                <i class="material-icons">schedule</i>
                <span class="baking-time-value"></span>ms
            </span>

            <span data-toggle="tooltip" title="${this.label} character encoding">
                <i class="material-icons">language</i>
                <span class="char-enc-value">UTF-16</span>
            </span>

            <div class="cm-status-bar-select eol-select">
                <span class="cm-status-bar-select-btn" data-toggle="tooltip" data-placement="left" title="End of line sequence">
                    <i class="material-icons">keyboard_return</i> <span class="eol-value"></span>
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

}

/**
 * A panel constructor factory building a panel that re-counts the stats every time the document changes.
 * @param {Object} opts
 * @returns {Function<PanelConstructor>}
 */
function makePanel(opts) {
    const sbPanel = new StatusBarPanel(opts);

    return (view) => {
        sbPanel.updateEOL(view.state);
        sbPanel.updateCharEnc(view.state);
        sbPanel.updateBakeStats();
        sbPanel.updateStats(view.state.doc);
        sbPanel.updateSelection(view.state, false);

        return {
            "dom": sbPanel.dom,
            update(update) {
                sbPanel.updateEOL(update.state);
                sbPanel.updateSelection(update.state, update.selectionSet);
                sbPanel.updateCharEnc(update.state);
                sbPanel.updateBakeStats();
                if (update.docChanged) {
                    sbPanel.updateStats(update.state.doc);
                }
            }
        };
    };
}

/**
 * A function that build the extension that enables the panel in an editor.
 * @param {Object} opts
 * @returns {Extension}
 */
export function statusBar(opts) {
    const panelMaker = makePanel(opts);
    return showPanel.of(panelMaker);
}
