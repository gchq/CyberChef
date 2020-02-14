/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { encode } from "../lib/CipherSaber2.mjs";

/**
 * CipherSaber2 Decrypt operation
 */
class CipherSaber2Decrypt extends Operation {

    /**
     * CipherSaber2Decrypt constructor
     */
    constructor() {
        super();

        this.name = "CipherSaber2 Decrypt";
        this.module = "Crypto";
        this.description = "CipherSaber is a simple symmetric encryption protocol based on the RC4 stream cipher. It gives reasonably strong protection of message confidentiality, yet it's designed to be simple enough that even novice programmers can memorize the algorithm and implement it from scratch.";
        this.infoURL = "https://wikipedia.org/wiki/CipherSaber";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Key",
                type: "string",
                value: ""
            },
            {
                name: "Rounds",
                type: "number",
                value: 20
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        input = new Uint8Array(input);
        const result = [];

        const tempIVP = input.slice(0, 10);
        input = input.slice(10);
        return new Uint8Array(result.concat(encode(tempIVP, args, input))).buffer;
    }

}

export default CipherSaber2Decrypt;
