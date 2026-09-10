/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { randomBytes } from "crypto";
import { encodeULID } from "../lib/ULID.mjs";

/**
 * Generate ULID operation.
 */
class GenerateULID extends Operation {
    /**
     * GenerateULID constructor.
     */
    constructor() {
        super();
        this.name = "Generate ULID";
        this.module = "Crypto";
        this.description = "Generates a Universally Unique Lexicographically Sortable Identifier (ULID) from the current Unix time in milliseconds and 80 cryptographically random bits. Input is ignored. Identifiers generated within the same millisecond do not have a guaranteed order. Use From ULID to inspect its 16-byte representation.";
        this.infoURL = "https://github.com/ulid/spec";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let timestamp = Date.now();
        if (!Number.isSafeInteger(timestamp) || timestamp < 0 || timestamp > 281474976710655) {
            throw new OperationError("ULID timestamp must fit in 48 unsigned bits.");
        }
        const bytes = new Uint8Array(16);
        bytes.set(randomBytes(10), 6);
        for (let i = 5; i >= 0; i--) {
            bytes[i] = timestamp % 256;
            timestamp = Math.floor(timestamp / 256);
        }
        return encodeULID(bytes);
    }
}

export default GenerateULID;
