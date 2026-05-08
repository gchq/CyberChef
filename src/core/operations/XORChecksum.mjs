/**
 * @author Thomas Weißschuh [thomas@t-8ch.de]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { toHex } from "../lib/Hex.mjs";

/**
 * XOR Checksum operation
 */
class XORChecksum extends Operation {

    /**
     * XORChecksum constructor
     */
    constructor() {
        super();

        this.name = "XOR Checksum";
        this.module = "Crypto";
        this.description = "XOR Checksum splits the input into blocks of a configurable size and performs the XOR operation on these blocks.";
        this.infoURL = "https://wikipedia.org/wiki/XOR";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Blocksize",
                type: "number",
                value: 4
            },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const blocksize = args[0];
        input = new Uint8Array(input);

        const res = Array(blocksize);
        res.fill(0);

        for (const chunk of Utils.chunked(input, blocksize)) {
            for (let i = 0; i < blocksize; i++) {
                res[i] ^= chunk[i];
            }
        }

        return toHex(res, "");
    }
}

export default XORChecksum;
