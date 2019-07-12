/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import MarkdownIt from "markdown-it";

/**
 * Render Markdown operation
 */
class RenderMarkdown extends Operation {

    /**
     * RenderMarkdown constructor
     */
    constructor() {
        super();

        this.name = "Render Markdown";
        this.module = "Default";
        this.description = "Renders Markdown as HTML.";
        this.infoURL = "https://wikipedia.org/wiki/Markdown";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                name: "Autoconvert URLs to links",
                type: "boolean",
                value: false
            },
            {
                name: "Convert \\n to &lt;br&gt;",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const [convertLinks, convertNewLine] = args,
            md = new MarkdownIt({
                breaks: convertNewLine,
                linkify: convertLinks
            }),
            rendered = md.render(input);

        return `<div style="font-family: var(--primary-font-family)">${rendered}</div>`;
    }

}

export default RenderMarkdown;
