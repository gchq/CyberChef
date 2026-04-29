/**
 * @author xumptex [xumptex@outlook.fr]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { blake3 } from "hashes-grs/blake3";
import { bytesToHex } from "hashes-grs/utils";
/**
 * BLAKE3 operation
 */
class BLAKE3 extends Operation {

    /**
     * BLAKE3 constructor
     */
    constructor() {
        super();

        this.name = "BLAKE3";
        this.module = "Hashing";
        this.description = "Hashes the input using BLAKE3 (UTF-8 encoded), with an optional key (also UTF-8), and outputs the result in hexadecimal format.";
        this.infoURL = "https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE3";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Size (bytes)",
                "type": "number"
            }, {
                "name": "Key",
                "type": "string",
                "value": ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = args[1];
        const size = args[0];
        const opts = { dkLen: size };
        if (key !== "") {
            const keyBytes = new Uint8Array(Utils.strToArrayBuffer(key));
            if (keyBytes.length !== 32) {
                throw new OperationError("The key must be exactly 32 bytes long");
            }
            opts.key = keyBytes;
        }
        return bytesToHex(blake3(input, opts));
    }

}

export default BLAKE3;
