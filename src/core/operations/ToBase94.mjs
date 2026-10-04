/**
 * @author sganson@trustedsecurity.com]
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {toBase94} from "../lib/Base94.mjs";

/**
 * To Base64 operation
 */
class ToBase94 extends Operation {

    /**
     * ToBase94 constructor
     */
    constructor() {
        super();

        this.name = "To Base94";
        this.module = "Default";
        this.description = "Base94 is a notation for encoding arbitrary byte data using a restricted set of symbols and is found primarily in the finance/ATM technology space.<br/><br/>This operation encodes raw data into an ASCII Base94 string.<br/><br/>e.g. <code>[48, 65, 6c, 6c, 6f, 20, 57, 6f, 72, 6c, 64, 21]</code> becomes <code>@Z<[+/- >5$@3z&T!Qh*|F.q+ZWIz&#J<[+][[4+trr# </code><br/><br/>This is a no frills, no soft toilet paper implementation.  It's ArrayBuffer in, string out.<br/><br/>By default, input length is expected to by a multiple of 4.  Unchecking 'Strict length' will pad non mod 4 length input with zero(es).";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Strict length",
                type: "boolean",
                value: true
            }
        ];

    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [strictLength] = args;
        return toBase94(input, strictLength);
    }

    /**
     * Highlight to Base94
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        pos[0].start = Math.floor(pos[0].start / 4 * 5);
        pos[0].end = Math.ceil(pos[0].end / 4 * 5);
        return pos;
    }

    /**
     * Highlight from Base94
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        pos[0].start = Math.ceil(pos[0].start / 5 * 4);
        pos[0].end = Math.floor(pos[0].end / 5 * 4);
        return pos;
    }
}

export default ToBase94;
