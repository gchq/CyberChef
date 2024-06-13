/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { affineDecrypt, affineDecryptInverse, AFFINE_ALPHABETS } from "../lib/Ciphers.mjs";

/**
 * Affine Cipher Decode operation
 */
class AffineCipherDecode extends Operation {

    /**
     * AffineCipherDecode constructor
     */
    constructor() {
        super();

        this.name = "Affine Cipher Decode";
        this.module = "Ciphers";
        this.description = "The Affine cipher is a type of monoalphabetic substitution cipher. To decrypt, each letter in an alphabet is mapped to its numeric equivalent, decrypted by a mathematical function, and converted back to a letter.";
        this.infoURL = "https://wikipedia.org/wiki/Affine_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "a",
                "type": "number",
                "value": 1
            },
            {
                "name": "b",
                "type": "number",
                "value": 0
            },
            {
                "name": "Alphabet",
                "type": "editableOption",
                "value": AFFINE_ALPHABETS
            },
            {
                "name": "Use modular inverse values",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @throws {OperationError} if a or b values are invalid
     */
    run(input, args) {
        const a = args[0], b = args[1], alphabet = args[2], useInverse = args[3];
        if (useInverse) return affineDecryptInverse(input, a, b, alphabet);
        else return affineDecrypt(input, a, b, alphabet);
    }

    /**
     * Highlight Affine Cipher Decode
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
     * Highlight Affine Cipher Decode in reverse
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

export default AffineCipherDecode;
