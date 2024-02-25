/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { runHash } from "../lib/Hash.mjs";

/**
 * Snefru operation
 */
class Snefru extends Operation {
    /**
     * Snefru constructor
     */
    constructor() {
        super();

        this.name = "Snefru";
        this.module = "Crypto";
        this.description
            = "Snefru is a cryptographic hash function invented by Ralph Merkle in 1990 while working at Xerox PARC. The function supports 128-bit and 256-bit output. It was named after the Egyptian Pharaoh Sneferu, continuing the tradition of the Khufu and Khafre block ciphers.<br><br>The original design of Snefru was shown to be insecure by Eli Biham and Adi Shamir who were able to use differential cryptanalysis to find hash collisions. The design was then modified by increasing the number of iterations of the main pass of the algorithm from two to eight.";
        this.infoURL = "https://wikipedia.org/wiki/Snefru";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Size",
                type: "number",
                value: 128,
                min: 32,
                max: 480,
                step: 32
            },
            {
                name: "Rounds",
                type: "option",
                value: ["8", "4", "2"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return runHash("snefru", input, {
            length: args[0],
            rounds: args[1]
        });
    }
}

export default Snefru;
