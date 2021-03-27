/**
 * @author idevlab [idevlab@outlook.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { ALPHABET_OPTIONS, fromBase91 } from "../lib/Base91.mjs";
/**
 * From Base91 operation
 */
class FromBase91 extends Operation {

    /**
     * FromBase91 constructor
     */
    constructor() {
        super();

        this.name = "From Base91";
        this.module = "Default";
        this.description = "BasE91 is an encoding method that uses ASCII characters. Similar to base64, it has the advantage of limiting the size of the encoded data and to be used as a cipher.";
        this.infoURL = "http://base91.sourceforge.net/";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Alphabet",
                type: "editableOption",
                value: ALPHABET_OPTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [alphabet] = args;
        return fromBase91(input, alphabet, "byteArray");
    }
}

export default FromBase91;
