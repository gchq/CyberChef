/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import {runHash} from "../lib/Hash";

/**
 * SHA0 operation
 */
class SHA0 extends Operation {

    /**
     * SHA0 constructor
     */
    constructor() {
        super();

        this.name = "SHA0";
        this.module = "Crypto";
        this.description = "SHA-0 is a retronym applied to the original version of the 160-bit hash function published in 1993 under the name 'SHA'. It was withdrawn shortly after publication due to an undisclosed 'significant flaw' and replaced by the slightly revised version SHA-1.";
        this.infoURL = "https://wikipedia.org/wiki/SHA-1#SHA-0";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return runHash("sha0", input);
    }

}

export default SHA0;
