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
        if (input.length === 0 || key.length === 0)
            return "";

        while (input.indexOf(" ") !== -1)
            input = input.replace(" ", "");

        while (key.indexOf(" ") !== -1)
            key = key.replace(" ", "");


        return HillCipher.decode(input, key);
    }

}

export default HillCipherDecode;
