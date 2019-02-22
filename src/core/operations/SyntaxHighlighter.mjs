/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import hljs from "highlight.js";

/**
 * Syntax highlighter operation
 */
class SyntaxHighlighter extends Operation {

    /**
     * SyntaxHighlighter constructor
     */
    constructor() {
        super();

        this.name = "Syntax highlighter";
        this.module = "Code";
        this.description = "Adds syntax highlighting to a range of source code languages. Note that this will not indent the code. Use one of the 'Beautify' operations for that.";
        this.infoURL = "https://wikipedia.org/wiki/Syntax_highlighting";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                "name": "Language",
                "type": "option",
                "value": ["auto detect"].concat(hljs.listLanguages())
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const language = args[0];

        if (language === "auto detect") {
            return hljs.highlightAuto(input).value;
        }

        return hljs.highlight(language, input, true).value;
    }

    /**
     * Highlight Syntax highlighter
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        return pos;
    }

    /**
     * Highlight Syntax highlighter in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        return pos;
    }

}

export default SyntaxHighlighter;
