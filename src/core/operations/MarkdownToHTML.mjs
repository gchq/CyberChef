/**
 * @author yilmaz08
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

/**
 * Render Markdown operation
 */
class MarkdownToHTML extends Operation {

    /**
     * MarkdownToHTML constructor
     */
    constructor() {
        super();

        this.name = "Convert Markdown to HTML";
        this.module = "Code";
        this.description = "Converts input Markdown as plain HTML.";
        this.infoURL = "https://wikipedia.org/wiki/Markdown";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Autoconvert URLs to links",
                type: "boolean",
                value: false
            },
            {
                name: "Enable syntax highlighting",
                type: "boolean",
                value: true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const [convertLinks, enableHighlighting] = args,
            md = new MarkdownIt({
                linkify: convertLinks,
                html: false,
                highlight: function(str, lang) {
                    if (lang && hljs.getLanguage(lang) && enableHighlighting) {
                        try {
                            return hljs.highlight(lang, str).value;
                        } catch (__) {}
                    }

                    return "";
                }
            }),
            rendered = md.render(input);

        return rendered;
    }

}

export default MarkdownToHTML;
