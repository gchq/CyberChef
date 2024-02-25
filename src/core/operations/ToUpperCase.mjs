/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * To Upper case operation
 */
class ToUpperCase extends Operation {
    /**
     * ToUpperCase constructor
     */
    constructor() {
        super();

        this.name = "To Upper case";
        this.module = "Default";
        this.description
            = "Converts the input string to upper case, optionally limiting scope to only the first character in each word, sentence or paragraph.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Scope",
                "type": "option",
                "value": ["All", "Word", "Sentence", "Paragraph"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!args || args.length === 0) {
            throw new OperationError("No capitalization scope was provided.");
        }

        const scope = args[0];

        if (scope === "All") {
            return input.toUpperCase();
        }

        const scopeRegex = {
            "Word": /(\b\w)/gi,
            "Sentence": /(?:\.|^)\s*(\b\w)/gi,
            "Paragraph": /(?:\n|^)\s*(\b\w)/gi
        }[scope];

        if (scopeRegex === undefined) {
            throw new OperationError("Unrecognized capitalization scope");
        }

        // Use the regex to capitalize the input
        return input.replace(scopeRegex, function (m) {
            return m.toUpperCase();
        });
    }

    /**
     * Highlight To Upper case
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
     * Highlight To Upper case in reverse
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

export default ToUpperCase;
