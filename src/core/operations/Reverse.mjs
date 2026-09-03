/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import {collectGraphemes} from "unicode-segmenter/grapheme";

/**
 * Splits a string into Unicode grapheme clusters.
 *
 * @param {string} input
 * @returns {string[]}
 */
function splitGraphemes(input) {
    if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
        const segmenter = new Intl.Segmenter(undefined, {granularity: "grapheme"});
        return Array.from(segmenter.segment(input), ({segment}) => segment);
    }

    return collectGraphemes(input);
}

/**
 * Reverse operation
 */
class Reverse extends Operation {

    /**
     * Reverse constructor
     */
    constructor() {
        super();

        this.name = "Reverse";
        this.module = "Default";
        this.description = "Reverses the input string. In Character mode, a character is a Unicode grapheme cluster, such as a base character with combining marks or an emoji joined with zero-width joiners.";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "By",
                "type": "option",
                "value": ["Byte", "Character", "Line"],
                "defaultIndex": 1
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        let i;
        if (args[0] === "Line") {
            const lines = [];
            let line = [],
                result = [];
            for (i = 0; i < input.length; i++) {
                if (input[i] === 0x0a) {
                    lines.push(line);
                    line = [];
                } else {
                    line.push(input[i]);
                }
            }
            lines.push(line);
            lines.reverse();
            for (i = 0; i < lines.length; i++) {
                result = result.concat(lines[i]);
                result.push(0x0a);
            }
            return result.slice(0, input.length);
        } else if (args[0] === "Character") {
            const inputString = Utils.byteArrayToUtf8(input),
                graphemes = splitGraphemes(inputString);
            return Utils.strToUtf8ByteArray(graphemes.reverse().join(""));
        } else {
            return input.reverse();
        }
    }

}

export default Reverse;
