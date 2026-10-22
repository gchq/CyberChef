/**
 * @author MarekConto
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Beaufort Cipher operation
 */
class BeaufortCipher extends Operation {

    /**
     * BeaufortCipher constructor
     */
    constructor() {
        super();

        this.name = "Beaufort Cipher";
        this.module = "Ciphers";
        this.description = "The classical Beaufort cipher subtracts each plaintext letter from the corresponding letter of a repeating key, modulo 26. The same operation encodes and decodes.<br><br>Only A-Z and a-z are transformed. Case and all other characters are preserved; non-alphabet characters do not advance the key. This is not Variant Beaufort, which subtracts the key from the plaintext.";
        this.infoURL = "https://wikipedia.org/wiki/Beaufort_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Key",
                type: "string",
                value: "",
                allowEmpty: false,
                hint: "Letters A-Z only (case-insensitive)."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = args[0];
        if (typeof key !== "string" || /[^A-Za-z]/.test(key)) {
            throw new OperationError("The key must consist only of letters A-Z.");
        }

        const normalisedKey = key.toUpperCase();
        let keyIndex = 0;

        return input.replace(/[A-Za-z]/g, chr => {
            const base = chr >= "a" ? 97 : 65,
                keyLetter = normalisedKey.charCodeAt(keyIndex++ % normalisedKey.length) - 65,
                inputLetter = chr.charCodeAt(0) - base;

            return String.fromCharCode((keyLetter - inputLetter + 26) % 26 + base);
        });
    }

    /**
     * Highlight Beaufort Cipher
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
     * Highlight Beaufort Cipher in reverse
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

export default BeaufortCipher;
