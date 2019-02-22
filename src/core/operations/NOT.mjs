/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import { bitOp, not } from "../lib/BitwiseOp";

/**
 * NOT operation
 */
class NOT extends Operation {

    /**
     * NOT constructor
     */
    constructor() {
        super();

        this.name = "NOT";
        this.module = "Default";
        this.description = "Returns the inverse of each byte.";
        this.infoURL = "https://wikipedia.org/wiki/Bitwise_operation#NOT";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        return bitOp(input, null, not);
    }

    /**
     * Highlight NOT
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
     * Highlight NOT in reverse
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

export default NOT;
