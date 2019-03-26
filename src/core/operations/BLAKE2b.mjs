/**
 * @author h345983745
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import blakejs from "blakejs";

/**
 * BLAKE2b operation
 */
class BLAKE2b extends Operation {

    /**
     * BLAKE2b constructor
     */
    constructor() {
        super();

        this.name = "BLAKE2b";
        this.module = "Hashing";
        this.description = "Performs BLAKE2b hashing on the input. Returns the output HEX encoded.";
        this.infoURL = "https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Size",
                "type": "option",
                "value": ["512", "384", "256", "160", "128"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string} The input having been hashed with BLAKE2b, HEX encoded.
     */
    run(input, args) {
        const [outSize] = args;
        return blakejs.blake2bHex(input, null, outSize / 8);
    }

}

export default BLAKE2b;
