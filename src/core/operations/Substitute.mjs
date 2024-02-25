/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Substitute operation
 */
class Substitute extends Operation {
    /**
     * Substitute constructor
     */
    constructor() {
        super();

        this.name = "Substitute";
        this.module = "Default";
        this.description =
            "A substitution cipher allowing you to specify bytes to replace with other byte values. This can be used to create Caesar ciphers but is more powerful as any byte value can be substituted, not just letters, and the substitution values need not be in order.<br><br>Enter the bytes you want to replace in the Plaintext field and the bytes to replace them with in the Ciphertext field.<br><br>Non-printable bytes can be specified using string escape notation. For example, a line feed character can be written as either <code>\\n</code> or <code>\\x0a</code>.<br><br>Byte ranges can be specified using a hyphen. For example, the sequence <code>0123456789</code> can be written as <code>0-9</code>.<br><br>Note that blackslash characters are used to escape special characters, so will need to be escaped themselves if you want to use them on their own (e.g.<code>\\\\</code>).";
        this.infoURL = "https://wikipedia.org/wiki/Substitution_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Plaintext",
                type: "binaryString",
                value: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            },
            {
                name: "Ciphertext",
                type: "binaryString",
                value: "XYZABCDEFGHIJKLMNOPQRSTUVW",
            },
            {
                name: "Ignore case",
                type: "boolean",
                value: false,
            },
        ];
    }

    /**
     * Convert a single character using the dictionary, if ignoreCase is true then
     * check in the dictionary for both upper and lower case versions of the character.
     * In output the input character case is preserved.
     * @param {string} char
     * @param {Object} dict
     * @param {boolean} ignoreCase
     * @returns {string}
     */
    cipherSingleChar(char, dict, ignoreCase) {
        if (!ignoreCase) return dict[char] || char;

        const isUpperCase = char === char.toUpperCase();

        // convert using the dictionary keeping the case of the input character

        if (dict[char] !== undefined) {
            // if the character is in the dictionary return the value with the input case
            return isUpperCase
                ? dict[char].toUpperCase()
                : dict[char].toLowerCase();
        }

        // check for the other case, if it is in the dictionary return the value with the right case
        if (isUpperCase) {
            if (dict[char.toLowerCase()] !== undefined)
                return dict[char.toLowerCase()].toUpperCase();
        } else {
            if (dict[char.toUpperCase()] !== undefined)
                return dict[char.toUpperCase()].toLowerCase();
        }

        return char;
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const plaintext = Utils.expandAlphRange([...args[0]]),
            ciphertext = Utils.expandAlphRange([...args[1]]),
            ignoreCase = args[2];
        let output = "";

        if (plaintext.length !== ciphertext.length) {
            output = "Warning: Plaintext and Ciphertext lengths differ\n\n";
        }

        // create dictionary for conversion
        const dict = {};
        for (
            let i = 0;
            i < Math.min(ciphertext.length, plaintext.length);
            i++
        ) {
            dict[plaintext[i]] = ciphertext[i];
        }

        // map every letter with the conversion function
        for (const character of input) {
            output += this.cipherSingleChar(character, dict, ignoreCase);
        }

        return output;
    }
}

export default Substitute;
