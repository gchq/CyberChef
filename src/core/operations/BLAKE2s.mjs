/**
 * @author h [h]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import blakejs from "blakejs";

/**
 * BLAKE2s Operation
 */
class BLAKE2s extends Operation {

    /**
     * BLAKE2s constructor
     */
    constructor() {
        super();

        this.name = "BLAKE2s";
        this.module = "Hashing";
        this.description = "Performs BLAKE2s hashing on the input. Returns the output HEX encoded.";
        this.infoURL = "https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Size",
                "type": "option",
                "value": ["256", "160", "128"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string} The input having been hashed with BLAKE2s, HEX encoded.
     */
    run(input, args) {
        const [outSize] = args;
        return blakejs.blake2sHex(input, null, outSize / 8);
    }

}

export default BLAKE2s;
