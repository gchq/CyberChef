/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import { bitOp, or, BITWISE_OP_DELIMS } from "../lib/BitwiseOp";

/**
 * OR operation
 */
class OR extends Operation {

    /**
     * OR constructor
     */
    constructor() {
        super();

        this.name = "OR";
        this.module = "Default";
        this.description = "OR the input with the given key.<br>e.g. <code>fe023da5</code>";
        this.infoURL = "https://wikipedia.org/wiki/Bitwise_operation#OR";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": BITWISE_OP_DELIMS
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const key = Utils.convertToByteArray(args[0].string || "", args[0].option);

        return bitOp(input, key, or);
    }

    /**
     * Highlight OR
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
     * Highlight OR in reverse
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

export default OR;
