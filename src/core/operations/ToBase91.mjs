/**
 * @author idevlab [idevlab@outlook.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { ALPHABET_OPTIONS, toBase91 } from "../lib/Base91.mjs";
/**
 * To Base91 operation
 */
class ToBase91 extends Operation {

    /**
     * ToBase91 constructor
     */
    constructor() {
        super();

        this.name = "To Base91";
        this.module = "Default";
        this.description = "BasE91 is an encoding method that uses ASCII characters. Similar to base64, it has the advantage of limiting the size of the encoded data and to be used as a cipher.";
        this.infoURL = "http://base91.sourceforge.net/";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Alphabet",
                type: "editableOption",
                value: ALPHABET_OPTIONS
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const alphabet = args[0];
        return toBase91(input, alphabet);
    }
}

export default ToBase91;
