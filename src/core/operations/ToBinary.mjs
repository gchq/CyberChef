/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {BIN_DELIM_OPTIONS} from "../lib/Delim";

/**
 * To Binary operation
 */
class ToBinary extends Operation {

    /**
     * ToBinary constructor
     */
    constructor() {
        super();

        this.name = "To Binary";
        this.module = "Default";
        this.description = "Displays the input data as a binary string.<br><br>e.g. <code>Hi</code> becomes <code>01001000 01101001</code>";
        this.infoURL = "https://wikipedia.org/wiki/Binary_code";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": BIN_DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0] || "Space"),
            padding = 8;
        let output = "";

        for (let i = 0; i < input.length; i++) {
            output += input[i].toString(2).padStart(padding, "0") + delim;
        }

        if (delim.length) {
            return output.slice(0, -delim.length);
        } else {
            return output;
        }
    }

    /**
     * Highlight To Binary
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        const delim = Utils.charRep(args[0] || "Space");
        pos[0].start = pos[0].start * (8 + delim.length);
        pos[0].end = pos[0].end * (8 + delim.length) - delim.length;
        return pos;
    }

    /**
     * Highlight To Binary in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        const delim = Utils.charRep(args[0] || "Space");
        pos[0].start = pos[0].start === 0 ? 0 : Math.floor(pos[0].start / (8 + delim.length));
        pos[0].end = pos[0].end === 0 ? 0 : Math.ceil(pos[0].end / (8 + delim.length));
        return pos;
    }

}

export default ToBinary;
