/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import crypto from "crypto";

/**
 * Generate UUID operation
 */
class GenerateUUID extends Operation {
    /**
     * GenerateUUID constructor
     */
    constructor() {
        super();

        this.name = "Generate UUID";
        this.module = "Crypto";
        this.description
            = "Generates an RFC 4122 version 4 compliant Universally Unique Identifier (UUID), also known as a Globally Unique Identifier (GUID).<br><br>A version 4 UUID relies on random numbers, in this case generated using <code>window.crypto</code> if available and falling back to <code>Math.random</code> if not.";
        this.infoURL = "https://wikipedia.org/wiki/Universally_unique_identifier";
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
        const buf = new Uint32Array(4).map(() => {
            return crypto.randomBytes(4).readUInt32BE(0, true);
        });
        let i = 0;
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (buf[i >> 3] >> ((i % 8) * 4)) & 0xf,
                v = c === "x" ? r : (r & 0x3) | 0x8;
            i++;
            return v.toString(16);
        });
    }
}

export default GenerateUUID;
