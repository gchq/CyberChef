/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {BIN_DELIM_OPTIONS} from "../lib/Delim";

/**
 * From Binary operation
 */
class FromBinary extends Operation {

    /**
     * FromBinary constructor
     */
    constructor() {
        super();

        this.name = "From Binary";
        this.module = "Default";
        this.description = "Converts a binary string back into its raw form.<br><br>e.g. <code>01001000 01101001</code> becomes <code>Hi</code>";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": BIN_DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const delimRegex = Utils.regexRep(args[0] || "Space");
        input = input.replace(delimRegex, "");

        const output = [];
        const byteLen = 8;
        for (let i = 0; i < input.length; i += byteLen) {
            output.push(parseInt(input.substr(i, byteLen), 2));
        }
        return output;
    }

    /**
     * Highlight From Binary
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        const delim = Utils.charRep(args[0] || "Space");
        pos[0].start = pos[0].start === 0 ? 0 : Math.floor(pos[0].start / (8 + delim.length));
        pos[0].end = pos[0].end === 0 ? 0 : Math.ceil(pos[0].end / (8 + delim.length));
        return pos;
    }

    /**
     * Highlight From Binary in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        const delim = Utils.charRep(args[0] || "Space");
        pos[0].start = pos[0].start * (8 + delim.length);
        pos[0].end = pos[0].end * (8 + delim.length) - delim.length;
        return pos;
    }

}

export default FromBinary;
