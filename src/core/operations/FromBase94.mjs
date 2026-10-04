/**
 * @author sganson@trustedsecurity.com]
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {fromBase94} from "../lib/Base94.mjs";

/**
 * From Base94 operation
 */
class FromBase94 extends Operation {

    /**
     * FromBase94 constructor
     */
    constructor() {
        super();

        this.name = "From Base94";
        this.module = "Default";
        this.description = "Base94 is a notation for encoding arbitrary byte data using a restricted set of symbols and is found primarily in the finance/ATM technology space.<br/><br/>This operation decodes an ASCII Base94 string returning a byteArray.<br/><br/>e.g. <code>@Z<[+/- >5$@3z&T!Qh*|F.q+ZWIz&#J<[+][[4+trr# </code> becomes <code>[48, 65, 6c, 6c, 6f, 20, 57, 6f, 72, 6c, 64, 21]</code><br/><br/>This is a no frills, no soft toilet paper implementation.  It's string in, byteArray out.<br/><br/>By default, input length is expected to by a multiple of 5.  Unchecking 'Strict length' will pad non mod 5 length input with space(s).<br/><br/>Base94 encoded content is expected to be in ASCII range '0x20 thru 0x7e'.  Leaving 'Remove Invalid Chars' unchecked will enforce this.";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Strict length",
                type: "boolean",
                value: true
            },
            {
                name: "Remove Invalid Chars",
                type: "boolean",
                value: false
            }
        ];

    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {

        const [strictLength, removeInvalidChars] = args;

        return fromBase94(input, strictLength, removeInvalidChars);

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
        pos[0].start = Math.ceil(pos[0].start / 4 * 5);
        pos[0].end = Math.floor(pos[0].end / 4 * 5);
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
        pos[0].start = Math.floor(pos[0].start / 5 * 4);
        pos[0].end = Math.ceil(pos[0].end / 5 * 4);
        return pos;
    }
}

export default FromBase94;
