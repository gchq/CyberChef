/**
 * @author Daniel Acsinte [daniel.acsinte@fort.ro]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Render Mermaid operation
 */
class RenderMermaid extends Operation {

    /**
     * RenderMermaid constructor
     */
    constructor() {
        super();

        this.name = "Render Mermaid";
        this.module = "Default";
        this.description = "Renders Mermaid diagram syntax (flowcharts, sequence diagrams, class diagrams, Gantt charts, etc.) as an image. Use the buttons below the diagram to export it as SVG, PNG or JPEG.<br><br>Diagrams are drawn by the browser, so this operation has no effect in the Node API.";
        this.infoURL = "https://mermaid.js.org/intro/syntax-reference.html";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [];
    }

    /**
     * The diagram is rendered on the main thread (src/web/utils/mermaid.mjs) because Mermaid needs a
     * DOM, which the worker does not have. The source is stored in an attribute so the output pane's
     * control character escaping does not alter it.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        if (!input.trim()) return "";
        return `<div class="mermaid-diagram" data-source="${Utils.escapeHtml(input)}" style="background: #fff; padding: 10px"></div>`;
    }

}

export default RenderMermaid;
