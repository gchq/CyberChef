/**
 * @author Cynser
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import cptable from "../vendor/js-codepage/cptable.js";
import {IO_FORMAT} from "../lib/ChrEnc";

/**
 * Text Encoding Brute Force operation
 */
class TextEncodingBruteForce extends Operation {

    /**
     * TextEncodingBruteForce constructor
     */
    constructor() {
        super();

        this.name = "Text Encoding Brute Force";
        this.module = "CharEnc";
        this.description = "Enumerate all possible text encodings for input.";
        this.infoURL = "https://wikipedia.org/wiki/Character_encoding";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Mode",
                type: "option",
                value: ["Encode", "Decode"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const output = [],
            charSets = Object.keys(IO_FORMAT),
            mode = args[0];

        for (let i = 0; i < charSets.length; i++) {
            let currentEncoding = charSets[i] + ": ";

            try {
                if (mode === "Decode") {
                    currentEncoding += cptable.utils.decode(IO_FORMAT[charSets[i]], input);
                } else {
                    currentEncoding += cptable.utils.encode(IO_FORMAT[charSets[i]], input);
                }
            } catch (err) {
                currentEncoding += "Could not decode.";
            }

            output.push(Utils.printable(currentEncoding, true));
        }

        return output.join("\n");
    }

}

export default TextEncodingBruteForce;
