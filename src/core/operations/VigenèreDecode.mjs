/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Vigenère Decode operation
 */
class VigenèreDecode extends Operation {

    /**
     * VigenèreDecode constructor
     */
    constructor() {
        super();

        this.name = "Vigenère Decode";
        this.module = "Ciphers";
        this.description = "The Vigenere cipher is a method of encrypting alphabetic text by using a series of different Caesar ciphers based on the letters of a keyword. It is a simple form of polyalphabetic substitution.";
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
        const alphabet = "abcdefghijklmnopqrstuvwxyz",
            key = args[0].toLowerCase();
        let output = "",
            fail = 0,
            keyIndex,
            msgIndex,
            chr;

        if (!key) return "No key entered";
        if (!/^[a-zA-Z]+$/.test(key)) return "The key must consist only of letters";

        for (let i = 0; i < input.length; i++) {
            if (alphabet.indexOf(input[i]) >= 0) {
                chr = key[(i - fail) % key.length];
                keyIndex = alphabet.indexOf(chr);
                msgIndex = alphabet.indexOf(input[i]);
                // Subtract indexes from each other, add 26 just in case the value is negative,
                // modulo to remove if neccessary
                output += alphabet[(msgIndex - keyIndex + alphabet.length) % 26];
            } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
                chr = key[(i - fail) % key.length].toLowerCase();
                keyIndex = alphabet.indexOf(chr);
                msgIndex = alphabet.indexOf(input[i].toLowerCase());
                output += alphabet[(msgIndex + alphabet.length - keyIndex) % 26].toUpperCase();
            } else {
                output += input[i];
                fail++;
            }
        }

        return output;
    }

    /**
     * Highlight Vigenère Decode
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
     * Highlight Vigenère Decode in reverse
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

export default VigenèreDecode;
