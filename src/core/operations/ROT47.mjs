/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Default argument for ROT47 operation
 */
const ROT47_AMOUNT = 47;


/**
 * ROT47 operation.
 */
class ROT47 extends Operation {

    /**
     * ROT47 constructor
     */
    constructor() {
        super();

        this.name = "ROT47";
        this.module = "Default";
        this.description = "A slightly more complex variation of a caesar cipher, which includes ASCII characters from 33 '!' to 126 '~'. Default rotation: 47.";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Amount",
                type: "number",
                value: ROT47_AMOUNT
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const output = input;
        let amount = args[0],
            chr;

        if (amount) {
            if (amount < 0) {
                amount = 94 - (Math.abs(amount) % 94);
            }

            for (let i = 0; i < input.length; i++) {
                chr = input[i];
                if (chr >= 33 && chr <= 126) {
                    chr = (chr - 33 + amount) % 94;
                    output[i] = chr + 33;
                }
            }
        }
        return output;
    }

    /**
     * Highlight ROT47
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
     * Highlight ROT47 in reverse
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

export default ROT47;
