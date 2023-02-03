/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import {showPanel} from "@codemirror/view";
import {CHR_ENC_SIMPLE_LOOKUP, CHR_ENC_SIMPLE_REVERSE_LOOKUP} from "../../core/lib/ChrEnc.mjs";

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
        this.timing = opts.timing;
        this.tabNumGetter = opts.tabNumGetter;
        this.eolHandler = opts.eolHandler;
        this.chrEncHandler = opts.chrEncHandler;
        this.chrEncGetter = opts.chrEncGetter;
        this.htmlOutput = opts.htmlOutput;

        this.eolVal = null;
        this.chrEncVal = null;

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
        dom.querySelectorAll(".cm-status-bar-select-btn").forEach(
            el => el.addEventListener("click", this.showDropUp.bind(this), false)
        );
        dom.querySelector(".eol-select").addEventListener("click", this.eolSelectClick.bind(this), false);
        dom.querySelector(".chr-enc-select").addEventListener("click", this.chrEncSelectClick.bind(this), false);
        dom.querySelector(".cm-status-bar-filter-input").addEventListener("keyup", this.chrEncFilter.bind(this), false);

        return dom;
    }

    /**
     * Handler for dropup clicks
     * Shows/Hides the dropup
     * @param {Event} e
     */
    showDropUp(e) {
        const el = e.target
            .closest(".cm-status-bar-select")
            .querySelector(".cm-status-bar-select-content");
        const btn = e.target.closest(".cm-status-bar-select-btn");

        if (btn.classList.contains("disabled")) return;

        el.classList.add("show");

        // Focus the filter input if present
        const filter = el.querySelector(".cm-status-bar-filter-input");
        if (filter) filter.focus();

        // Set up a listener to close the menu if the user clicks outside of it
        hideOnClickOutside(el, e);
    }

    /**
     * Handler for EOL Select clicks
     * Sets the line separator
     * @param {Event} e
     */
    eolSelectClick(e) {
        // preventDefault is required to stop the URL being modified and popState being triggered
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

        if (eolval === undefined) return;

        // Call relevant EOL change handler
        this.eolHandler(eolval);
        hideElement(e.target.closest(".cm-status-bar-select-content"));
    }

    /**
     * Handler for Chr Enc Select clicks
     * Sets the character encoding
     * @param {Event} e
     */
    chrEncSelectClick(e) {
        // preventDefault is required to stop the URL being modified and popState being triggered
        e.preventDefault();

        const chrEncVal = parseInt(e.target.getAttribute("data-val"), 10);

        if (isNaN(chrEncVal)) return;

        this.chrEncHandler(chrEncVal);
        this.updateCharEnc(chrEncVal);
        hideElement(e.target.closest(".cm-status-bar-select-content"));
    }

    /**
     * Handler for Chr Enc keyup events
     * Filters the list of selectable character encodings
     * @param {Event} e
     */
    chrEncFilter(e) {
        const input = e.target;
        const filter = input.value.toLowerCase();
        const div = input.closest(".cm-status-bar-select-content");
        const a = div.getElementsByTagName("a");
        for (let i = 0; i < a.length; i++) {
            const txtValue = a[i].textContent || a[i].innerText;
            if (txtValue.toLowerCase().includes(filter)) {
                a[i].style.display = "block";
            } else {
                a[i].style.display = "none";
            }
        }
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
        const selLen = state?.selection?.main ?
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
     * Sets the current EOL separator in the status bar
     * @param {EditorState} state
     */
    updateEOL(state) {
        if (state.lineBreak === this.eolVal) return;

        const eolLookup = {
            "\u000a": ["LF", "Line Feed"],
            "\u000b": ["VT", "Vertical Tab"],
            "\u000c": ["FF", "Form Feed"],
            "\u000d": ["CR", "Carriage Return"],
            "\u000d\u000a": ["CRLF", "Carriage Return + Line Feed"],
            "\u0085": ["NEL", "Next Line"],
            "\u2028": ["LS", "Line Separator"],
            "\u2029": ["PS", "Paragraph Separator"]
        };

        const val = this.dom.querySelector(".eol-value");
        const button = val.closest(".cm-status-bar-select-btn");
        const eolName = eolLookup[state.lineBreak];
        val.textContent = eolName[0];
        button.setAttribute("title", `End of line sequence:<br>${eolName[1]}`);
        button.setAttribute("data-original-title", `End of line sequence:<br>${eolName[1]}`);
        this.eolVal = state.lineBreak;
    }


    /**
     * Sets the current character encoding of the document
     */
    updateCharEnc() {
        const chrEncVal = this.chrEncGetter();
        if (chrEncVal === this.chrEncVal) return;

        const name = CHR_ENC_SIMPLE_REVERSE_LOOKUP[chrEncVal] ? CHR_ENC_SIMPLE_REVERSE_LOOKUP[chrEncVal] : "Raw Bytes";

        const val = this.dom.querySelector(".chr-enc-value");
        const button = val.closest(".cm-status-bar-select-btn");
        val.textContent = name;
        button.setAttribute("title", `${this.label} character encoding:<br>${name}`);
        button.setAttribute("data-original-title", `${this.label} character encoding:<br>${name}`);
        this.chrEncVal = chrEncVal;
    }

    /**
     * Sets the latest timing info
     */
    updateTiming() {
        if (!this.timing) return;

        const bakingTime = this.dom.querySelector(".baking-time-value");
        const bakingTimeInfo = this.dom.querySelector(".baking-time-info");

        if (this.label === "Output" && this.timing) {
            bakingTimeInfo.style.display = "inline-block";
            bakingTime.textContent = this.timing.duration(this.tabNumGetter());

            const info = this.timing.printStages(this.tabNumGetter()).replace(/\n/g, "<br>");
            bakingTimeInfo.setAttribute("title", info);
            bakingTimeInfo.setAttribute("data-original-title", info);
        } else {
            bakingTimeInfo.style.display = "none";
        }
    }

    /**
     * Updates the sizing of elements that need to fit correctly
     * @param {EditorView} view
     */
    updateSizing(view) {
        const viewHeight = view.contentDOM.parentNode.clientHeight;
        this.dom.querySelectorAll(".cm-status-bar-select-scroll").forEach(
            el => {
                el.style.maxHeight = (viewHeight - 50) + "px";
            }
        );
    }

    /**
     * Checks whether there is HTML output requiring some widgets to be disabled
     */
    monitorHTMLOutput() {
        if (!this.htmlOutput?.changed) return;

        if (this.htmlOutput?.html === "") {
            // Enable all controls
            this.dom.querySelectorAll(".disabled").forEach(el => {
                el.classList.remove("disabled");
            });
        } else {
            // Disable chrenc, length, selection etc.
            this.dom.querySelectorAll(".cm-status-bar-select-btn").forEach(el => {
                el.classList.add("disabled");
            });

            this.dom.querySelector(".stats-length-value").parentNode.classList.add("disabled");
            this.dom.querySelector(".stats-lines-value").parentNode.classList.add("disabled");
            this.dom.querySelector(".sel-info").classList.add("disabled");
            this.dom.querySelector(".cur-offset-info").classList.add("disabled");
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
     *
     * @returns {string}
     */
    constructRHS() {
        const chrEncOptions = Object.keys(CHR_ENC_SIMPLE_LOOKUP).map(name =>
            `<a href="#" draggable="false" data-val="${CHR_ENC_SIMPLE_LOOKUP[name]}">${name}</a>`
        ).join("");

        return `
            <span class="baking-time-info" style="display: none" data-toggle="tooltip" data-html="true" title="Baking time">
                <i class="material-icons">schedule</i>
                <span class="baking-time-value"></span>ms
            </span>

            <div class="cm-status-bar-select chr-enc-select">
                <span class="cm-status-bar-select-btn" data-toggle="tooltip" data-html="true" data-placement="left" title="${this.label} character encoding">
                    <i class="material-icons">text_fields</i> <span class="chr-enc-value">Raw Bytes</span>
                </span>
                <div class="cm-status-bar-select-content">
                    <div class="cm-status-bar-select-scroll no-select">
                        <a href="#" draggable="false" data-val="0">Raw Bytes</a>
                        ${chrEncOptions}
                    </div>
                    <div class="input-group cm-status-bar-filter-search">
                        <div class="input-group-prepend">
                            <span class="input-group-text">
                                <i class="material-icons">search</i>
                            </span>
                        </div>
                        <input type="text" class="form-control cm-status-bar-filter-input" placeholder="Filter...">
                    </div>
                </div>
            </div>

            <div class="cm-status-bar-select eol-select">
                <span class="cm-status-bar-select-btn" data-toggle="tooltip" data-html="true" data-placement="left" title="End of line sequence">
                    <i class="material-icons">keyboard_return</i> <span class="eol-value"></span>
                </span>
                <div class="cm-status-bar-select-content no-select">
                    <a href="#" draggable="false" data-val="LF">Line Feed, U+000A</a>
                    <a href="#" draggable="false" data-val="VT">Vertical Tab, U+000B</a>
                    <a href="#" draggable="false" data-val="FF">Form Feed, U+000C</a>
                    <a href="#" draggable="false" data-val="CR">Carriage Return, U+000D</a>
                    <a href="#" draggable="false" data-val="CRLF">CR+LF, U+000D U+000A</a>
                    <!-- <a href="#" draggable="false" data-val="NL">Next Line, U+0085</a> This causes problems. -->
                    <a href="#" draggable="false" data-val="LS">Line Separator, U+2028</a>
                    <a href="#" draggable="false" data-val="PS">Paragraph Separator, U+2029</a>
                </div>
            </div>`;
    }

}

const elementsWithListeners = {};

/**
 * Hides the provided element when a click is made outside of it
 * @param {Element} element
 * @param {Event} instantiatingEvent
 */
function hideOnClickOutside(element, instantiatingEvent) {
    /**
     * Handler for document click events
     * Closes element if click is outside it.
     * @param {Event} event
     */
    const outsideClickListener = event => {
        // Don't trigger if we're clicking inside the element, or if the element
        // is not visible, or if this is the same click event that opened it.
        if (!element.contains(event.target) &&
            event.timeStamp !== instantiatingEvent.timeStamp) {
            hideElement(element);
        }
    };

    if (!Object.prototype.hasOwnProperty.call(elementsWithListeners, element)) {
        elementsWithListeners[element] = outsideClickListener;
        document.addEventListener("click", elementsWithListeners[element], false);
    }
}

/**
 * Hides the specified element and removes the click listener for it
 * @param {Element} element
 */
function hideElement(element) {
    element.classList.remove("show");
    document.removeEventListener("click", elementsWithListeners[element], false);
    delete elementsWithListeners[element];
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
        sbPanel.updateCharEnc();
        sbPanel.updateTiming();
        sbPanel.updateStats(view.state.doc);
        sbPanel.updateSelection(view.state, false);
        sbPanel.monitorHTMLOutput();

        return {
            "dom": sbPanel.dom,
            update(update) {
                sbPanel.updateEOL(update.state);
                sbPanel.updateCharEnc();
                sbPanel.updateSelection(update.state, update.selectionSet);
                sbPanel.updateTiming();
                sbPanel.monitorHTMLOutput();
                if (update.geometryChanged) {
                    sbPanel.updateSizing(update.view);
                }
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
