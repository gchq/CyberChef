/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Bit shift right operation
 */
class BitShiftRight extends Operation {

    /**
     * BitShiftRight constructor
     */
    constructor() {
        super();

        this.name = "Bit shift right";
        this.module = "Default";
        this.description = "Shifts the bits in each byte towards the right by the specified amount.<br><br><i>Logical shifts</i> replace the leftmost bits with zeros.<br><i>Arithmetic shifts</i> preserve the most significant bit (MSB) of the original byte keeping the sign the same (positive or negative).";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Amount",
                "type": "number",
                "value": 1
            },
            {
                "name": "Type",
                "type": "option",
                "value": ["Logical shift", "Arithmetic shift"]
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const amount = args[0],
            type = args[1],
            mask = type === "Logical shift" ? 0 : 0x80;

        return input.map(b => {
            return (b >>> amount) ^ (b & mask);
        });
    }

    /**
     * Highlight Bit shift right
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
     * Highlight Bit shift right in reverse
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

export default BitShiftRight;
