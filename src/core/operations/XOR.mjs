/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import { bitOp, xor, add, BITWISE_OP_DELIMS } from "../lib/BitwiseOp";

/**
 * XOR operation
 */
class XOR extends Operation {

    /**
     * XOR constructor
     */
    constructor() {
        super();

        this.name = "XOR";
        this.module = "Default";
        this.description = "XOR the input with the given key.<br>e.g. <code>fe023da5</code><br><br><strong>Options</strong><br><u>Null preserving:</u> If the current byte is 0x00 or the same as the key, skip it.<br><br><u>Scheme:</u><ul><li>Standard - key is unchanged after each round</li><li>Input differential - key is set to the value of the previous unprocessed byte</li><li>Output differential - key is set to the value of the previous processed byte</li><li>Cascade - key is set to the input byte shifted by one</li></ul>";
        this.infoURL = "https://wikipedia.org/wiki/XOR";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": BITWISE_OP_DELIMS
            },
            {
                "name": "Scheme",
                "type": "option",
                "value": ["Standard", "Input differential", "Output differential", "Cascade", "Rolling", "Rolling (cumulative)", "Rolling (cumulative self)"]
            },
            {
                "name": "Null preserving",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const key = Utils.convertToByteArray(args[0].string || "", args[0].option),
            [, scheme, nullPreserving] = args;

        if (scheme.startsWith("Rolling") && key.length) {
            const inp = input.chunks(key.length);
            let runningIndex = 0;
            let runningKey = key;
            let xorred = null;
            return inp.reduce((result, current, index) => {
                runningIndex += index;
                switch (scheme) {
                    case "Rolling":  // key = key + index
                        return result.concat(bitOp(current, key.map(x => add(x, index)), xor, nullPreserving, scheme));
                    case "Rolling (cumulative)":  // key = key + index + previous indices
                        return result.concat(bitOp(current, key.map(x => add(x, runningIndex)), xor, nullPreserving, scheme));
                    case "Rolling (cumulative self)": // key = key XOR previous chunk
                        xorred = bitOp(current, runningKey, xor, nullPreserving, scheme);
                        runningKey = bitOp(runningKey, current, xor, nullPreserving, scheme);
                        return result.concat(xorred);
                }
            }, Utils.strToByteArray(""));
        }

        return bitOp(input, key, xor, nullPreserving, scheme);
    }

    /**
     * Highlight XOR
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
     * Highlight XOR in reverse
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

export default XOR;
