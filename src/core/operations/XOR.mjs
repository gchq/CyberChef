/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { bitOp, xor, add, BITWISE_OP_DELIMS } from "../lib/BitwiseOp.mjs";

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
        this.description =
            "XOR the input with the given key.<br>e.g. <code>fe023da5</code><br><br><strong>Options</strong><br><u>Null preserving:</u> If the current byte is 0x00 or the same as the key, skip it.<br><br><u>Scheme:</u><ul><li>Standard - key is unchanged after each round</li><li>Input differential - key is set to the value of the previous unprocessed byte</li><li>Output differential - key is set to the value of the previous processed byte</li><li>Cascade - key is set to the input byte shifted by one</li><li>Rolling - key is set to the value of itself added with the current position in the bytes</li>Rolling cumulative - key is set to the value of itself added with a cumulative addition of the position in the bytes<li></li><li>Rolling cumulative (self) - key is set to the value of itself XOR'd with the previous chunk of bytes (where the chunk size is equal to key size)</li></ul>";
        this.infoURL = "https://wikipedia.org/wiki/XOR";
        this.inputType = "ArrayBuffer";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: BITWISE_OP_DELIMS,
            },
            {
                name: "Scheme",
                type: "option",
                value: [
                    "Standard",
                    "Input differential",
                    "Output differential",
                    "Cascade",
                    "Rolling",
                    "Rolling cumulative",
                    "Rolling cumulative (self)",
                ],
            },
            {
                name: "Null preserving",
                type: "boolean",
                value: false,
            },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        input = new Uint8Array(input);
        const key = Utils.convertToByteArray(
                args[0].string || "",
                args[0].option
            ),
            [, scheme, nullPreserving] = args;

        if (scheme.startsWith("Rolling") && key.length) {
            const inputChunks = Utils.chunked(input, key.length);
            let runningIndex = 0;
            let runningKey = key;
            let xorred = null;
            return inputChunks.reduce((result, current, index) => {
                runningIndex += index;
                switch (scheme) {
                    // key = key + index
                    case "Rolling":
                        return result.concat(
                            bitOp(
                                current,
                                key.map((x) => add(x, index)),
                                xor,
                                nullPreserving,
                                scheme
                            )
                        );

                    // key = key + index + previous
                    case "Rolling cumulative":
                        return result.concat(
                            bitOp(
                                current,
                                key.map((x) => add(x, runningIndex)),
                                xor,
                                nullPreserving,
                                scheme
                            )
                        );

                    // key = key XOR previous chunk
                    case "Rolling cumulative (self)":
                        // Xor this chunk
                        xorred = bitOp(
                            current,
                            runningKey,
                            xor,
                            nullPreserving,
                            scheme
                        );

                        // Update the running key for next part of loop
                        runningKey = bitOp(
                            runningKey,
                            current,
                            xor,
                            nullPreserving,
                            scheme
                        );

                        // Return the result with the newest xor'd chunk
                        return result.concat(xorred);
                }
            }, Utils.strToByteArray("")); // Start our reduction with an empty byte array
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
