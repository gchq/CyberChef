/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import crypto from "crypto";
import { encode } from "../lib/CipherSaber2.mjs";

/**
 * CipherSaber2 operation
 */
class CipherSaber2 extends Operation {

    /**
     * CipherSaber2 constructor
     */
    constructor() {
        super();

        this.name = "CipherSaber2 Encrypt";
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

        // Assign into initialisation vector based on cipher mode.
        const tempIVP = crypto.randomBytes(10);
        for (let m = 0; m < 10; m++)
            result.push(tempIVP[m]);

        return new Uint8Array(result.concat(encode(tempIVP, args, input))).buffer;
    }

}

export default CipherSaber2;
