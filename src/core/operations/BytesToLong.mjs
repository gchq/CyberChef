/**
 * @author clubby789 [github.com/clubby789]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Bytes to Long Operation
 */
class BytesToLong extends Operation {

    /**
     * LongToBytes constructor
     */
    constructor() {
        super();

        this.name = "Bytes to Long";
        this.module = "Default";
        this.description = "Converts an array of bytes to a long integer. <br><br>e.g. <code>Hello</code> becomes <code>310939249775</code>";
        this.inputType = "string";
        this.outputType = "string";
    }

    /**
     * @param {string} input
     * @returns {string}
     */
    run(input, args) {
        const bytes = [];
        let charCode;

        for (let i = 0; i < input.length; ++i) {
            charCode = input.charCodeAt(i);
            bytes.unshift(charCode & 0xFF);
        }

        let value = 0n;
        for (let i = bytes.length - 1; i >= 0; i--) {
            value = (value * 256n) + BigInt(bytes[i]);
        }

        return value.toString();
    }

}

export default BytesToLong;
