/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import * as HillCipher from "../lib/HillCipher.mjs";

/**
 * Hill Cipher Encode operation
 */
class HillCipherEncode extends Operation {

    /**
     * HillCipherEncode constructor
     */
    constructor() {
        super();

        this.name = "Hill Cipher Encode";
        this.module = "Crypto";
        this.description = "The Hill cipher is a polygraphic substitution cipher based on linear algebra. Invented by Lester S. Hill in 1929, it was the first polygraphic cipher in which it was practical (though barely) to operate on more than three symbols at once.";
        this.infoURL = "https://wikipedia.org/wiki/Hill_cipher";
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

        let key = args[0].toLowerCase();
        input = input.toLowerCase();

        // The algorithm has to have a non-empty input and a non-empty key.
        if (input.length === 0 || key.length === 0)
            return "";

        // Remove spaces from input.
        while (input.indexOf(" ") !== -1)
            input = input.replace(" ", "");

        while (key.indexOf(" ") !== -1)
            key = key.replace(" ", "");

        return HillCipher.encode(input, key);
    }

}

export default HillCipherEncode;
