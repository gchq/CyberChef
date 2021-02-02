/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {runHash} from "../lib/Hash.mjs";

/**
 * SHA1 operation
 */
class SHA1 extends Operation {

    /**
     * SHA1 constructor
     */
    constructor() {
        super();

        this.name = "SHA1";
        this.module = "Crypto";
        this.description = "The SHA (Secure Hash Algorithm) hash functions were designed by the NSA. SHA-1 is the most established of the existing SHA hash functions and it is used in a variety of security applications and protocols.<br><br>However, SHA-1's collision resistance has been weakening as new attacks are discovered or improved. The message digest algorithm consists, by default, of 80 rounds.";
        this.infoURL = "https://wikipedia.org/wiki/SHA-1";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Rounds",
                type: "number",
                value: 80,
                min: 16
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return runHash("sha1", input, {rounds: args[0]});
    }

}

export default SHA1;
