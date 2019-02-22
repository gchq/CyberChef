/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import {runHash} from "../lib/Hash";

/**
 * RIPEMD operation
 */
class RIPEMD extends Operation {

    /**
     * RIPEMD constructor
     */
    constructor() {
        super();

        this.name = "RIPEMD";
        this.module = "Crypto";
        this.description = "RIPEMD (RACE Integrity Primitives Evaluation Message Digest) is a family of cryptographic hash functions developed in Leuven, Belgium, by Hans Dobbertin, Antoon Bosselaers and Bart Preneel at the COSIC research group at the Katholieke Universiteit Leuven, and first published in 1996.<br><br>RIPEMD was based upon the design principles used in MD4, and is similar in performance to the more popular SHA-1.<br><br>";
        this.infoURL = "https://wikipedia.org/wiki/RIPEMD";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Size",
                "type": "option",
                "value": ["320", "256", "160", "128"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const size = args[0];
        return runHash("ripemd" + size, input);
    }

}

export default RIPEMD;
