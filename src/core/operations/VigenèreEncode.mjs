/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Vigenère Encode operation
 */
class VigenèreEncode extends Operation {

    /**
     * VigenèreEncode constructor
     */
    constructor() {
        super();

        this.name = "Vigenère Encode";
        this.module = "Ciphers";
        this.description = "The Vigenere cipher is a method of encrypting alphabetic text by using a series of different Caesar ciphers based on the letters of a keyword. It is a simple form of polyalphabetic substitution.";
        this.infoURL = "https://wikipedia.org/wiki/Vigenère_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key",
                "type": "string",
                "value": ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
        const key = args[0].toLowerCase();
        let output = "";
        let fail = 0;
        let keyIndex, msgIndex, chr;

        if (!key) throw new OperationError("No key entered");
        if (!/^[a-zA-Z0-9]+$/.test(key)) throw new OperationError("The key must consist only of letters and numbers");

        for (let i = 0; i < input.length; i++) {
            const currentChar = input[i];
            const lowerChar = currentChar.toLowerCase();

            if (alphabet.indexOf(lowerChar) >= 0) {
                // Get the corresponding character of key for the current letter
                chr = key[(i - fail) % key.length];
                keyIndex = alphabet.indexOf(chr);
                msgIndex = alphabet.indexOf(lowerChar);
                const encodedChar = alphabet[(keyIndex + msgIndex) % alphabet.length];

                // Preserve case for letters
                output += currentChar === lowerChar ? encodedChar : encodedChar.toUpperCase();
            } else {
                output += currentChar; // Keep non-alphabetic characters as is
                fail++;
            }
        }

        return output;
    }

    /**
     * Highlight Vigenère Encode
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        return pos;
    }

    /**
     * Highlight Vigenère Encode in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        return pos;
    }
}

export default VigenèreEncode;