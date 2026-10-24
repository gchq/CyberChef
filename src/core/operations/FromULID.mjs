/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { decodeULID } from "../lib/ULID.mjs";

/**
 * From ULID operation.
 */
class FromULID extends Operation {
    /**
     * FromULID constructor.
     */
    constructor() {
        super();
        this.name = "From ULID";
        this.module = "Default";
        this.description = "Decodes a 26-character ULID to 16 bytes. The first six bytes contain the Unix timestamp in milliseconds and the remaining ten contain randomness, in network byte order. Accepts lower-case letters and surrounding whitespace. Invalid characters and values above the 128-bit maximum are rejected.";
        this.infoURL = "https://github.com/ulid/spec";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        return decodeULID(input);
    }
}

export default FromULID;
