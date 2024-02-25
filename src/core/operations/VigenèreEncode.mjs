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
        this.description =
            "The Vigenere cipher is a method of encrypting alphabetic text by using a series of different Caesar ciphers based on the letters of a keyword. It is a simple form of polyalphabetic substitution.";
        this.infoURL = "https://wikipedia.org/wiki/Vigenère_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Key",
                type: "string",
                value: "",
            },
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

        if (!key) throw new OperationError("No key entered");
        if (!/^[a-zA-Z]+$/.test(key))
            throw new OperationError("The key must consist only of letters");

        for (let i = 0; i < input.length; i++) {
            if (alphabet.indexOf(input[i]) >= 0) {
                // Get the corresponding character of key for the current letter, accounting
                // for chars not in alphabet
                chr = key[(i - fail) % key.length];
                // Get the location in the vigenere square of the key char
                keyIndex = alphabet.indexOf(chr);
                // Get the location in the vigenere square of the message char
                msgIndex = alphabet.indexOf(input[i]);
                // Get the encoded letter by finding the sum of indexes modulo 26 and finding
                // the letter corresponding to that
                output += alphabet[(keyIndex + msgIndex) % 26];
            } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
                chr = key[(i - fail) % key.length].toLowerCase();
                keyIndex = alphabet.indexOf(chr);
                msgIndex = alphabet.indexOf(input[i].toLowerCase());
                output += alphabet[(keyIndex + msgIndex) % 26].toUpperCase();
            } else {
                output += input[i];
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
