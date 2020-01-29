/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import * as HillCipher from "../lib/HillCipher.mjs";

/**
 * Hill Cipher Decode operation
 */
class HillCipherDecode extends Operation {

    /**
     * HillCipherDecode constructor
     */
    constructor() {
        super();

        this.name = "Hill Cipher Decode";
        this.module = "Crypto";
        this.description = "";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Key",
                type: "string",
                value: ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = args[0].toLowerCase();
        input = input.toLowerCase();
        if (input.length === 0 || key.length === 0)
            return "";

        while (input.indexOf(" ") !== -1)
            input = input.replace(" ", "");

        return HillCipher.decode(input, key);
    }

}

export default HillCipherDecode;
