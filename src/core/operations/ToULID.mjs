/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { encodeULID } from "../lib/ULID.mjs";

/**
 * To ULID operation.
 */
class ToULID extends Operation {
    /**
     * ToULID constructor.
     */
    constructor() {
        super();
        this.name = "To ULID";
        this.module = "Default";
        this.description = "Encodes exactly 16 bytes as a 26-character ULID using Crockford Base32. The first six bytes are a Unix timestamp in milliseconds; the remaining ten bytes contain randomness. Both parts use network byte order. Unlike ordinary Base32, ULID places its two padding bits at the start.";
        this.infoURL = "https://github.com/ulid/spec";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return encodeULID(input);
    }
}

export default ToULID;
