/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {runHash} from "../lib/Hash.mjs";

/**
 * Whirlpool operation
 */
class Whirlpool extends Operation {

    /**
     * Whirlpool constructor
     */
    constructor() {
        super();

        this.name = "Whirlpool";
        this.module = "Crypto";
        this.description = "Whirlpool is a cryptographic hash function designed by Vincent Rijmen (co-creator of AES) and Paulo S. L. M. Barreto, who first described it in 2000.<br><br>Several variants exist:<ul><li>Whirlpool-0 is the original version released in 2000.</li><li>Whirlpool-T is the first revision, released in 2001, improving the generation of the s-box.</li><li>Whirlpool is the latest revision, released in 2003, fixing a flaw in the diffusion matrix.</li></ul>";
        this.infoURL = "https://wikipedia.org/wiki/Whirlpool_(cryptography)";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Variant",
                "type": "option",
                "value": ["Whirlpool", "Whirlpool-T", "Whirlpool-0"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const variant = args[0].toLowerCase();
        return runHash(variant, input);
    }

}

export default Whirlpool;
